const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const Y = require("yjs");
const http = require("http");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust to match your frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Rate Limiting Configuration
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/run", apiLimiter);
app.use("/share-code", apiLimiter);
app.use("/save-code", apiLimiter);
app.use("/collaborate", apiLimiter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/coding-platform")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

// Code Snippet Schema
const snippetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Snippet = mongoose.model("Snippet", snippetSchema);

// Shared Snippet Schema
const sharedSnippetSchema = new mongoose.Schema({
  shareId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
});
sharedSnippetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const SharedSnippet = mongoose.model("SharedSnippet", sharedSnippetSchema);

// Collaboration Schema
const collaborationSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  title: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 1 day expiry
});
collaborationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Collaboration = mongoose.model("Collaboration", collaborationSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentication required" });

  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Collaboration Endpoint: Create a new collaboration room
app.post("/collaborate", authenticateToken, async (req, res) => {
  const { title, code, language } = req.body;
  if (!title || !code || !language) {
    return res.status(400).json({ error: "Title, code, and language are required" });
  }

  try {
    const roomId = uuidv4();
    const collaboration = new Collaboration({
      roomId,
      userIds: [req.user.userId],
      title,
      code,
      language,
    });
    await collaboration.save();
    res.json({ roomId, message: "Collaboration room created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Collaboration Endpoint: Join an existing room
app.post("/collaborate/join", authenticateToken, async (req, res) => {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(400).json({ error: "Room ID is required" });
  }

  try {
    const collaboration = await Collaboration.findOne({ roomId });
    if (!collaboration) {
      return res.status(404).json({ error: "Collaboration room not found" });
    }
    if (!collaboration.userIds.includes(req.user.userId)) {
      collaboration.userIds.push(req.user.userId);
      await collaboration.save();
    }
    res.json({ collaboration });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Socket.IO: Handle real-time collaboration
const documents = new Map(); // Store Yjs documents for each room
io.on("connection", (socket) => {
  socket.on("join-room", async ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    // Initialize Yjs document if not exists
    if (!documents.has(roomId)) {
      const yDoc = new Y.Doc();
      documents.set(roomId, yDoc);

      // Load initial content from MongoDB
      const collaboration = await Collaboration.findOne({ roomId });
      if (collaboration) {
        yDoc.getText("code").insert(0, collaboration.code);
      }
    }

    // Bind Yjs document to socket
    const yDoc = documents.get(roomId);
    socket.emit("init-code", yDoc.getText("code").toString());

    // Sync code updates
    yDoc.on("update", (update) => {
      socket.to(roomId).emit("code-update", Y.encodeStateAsUpdate(yDoc));
    });

    socket.on("code-update", (update) => {
      Y.applyUpdate(yDoc, update);
      socket.to(roomId).emit("code-update", update);
    });

    // Update MongoDB on significant changes
    yDoc.getText("code").observe(async () => {
      const code = yDoc.getText("code").toString();
      await Collaboration.updateOne({ roomId }, { code });
    });

    // Handle user disconnection
    socket.on("disconnect", async () => {
      console.log(`User ${userId} left room ${roomId}`);
      const collaboration = await Collaboration.findOne({ roomId });
      if (collaboration && collaboration.userIds.length === 1) {
        documents.delete(roomId);
        await Collaboration.deleteOne({ roomId });
      }
    });
  });
});

// Register, Login, Save Code, Share Code, History, Profile, Delete Snippet, Run Endpoints
// (Unchanged from original index.js, included for completeness)
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.json({ token, message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your_jwt_secret", {
      expiresIn: "1h",
    });
    res.json({ token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/save-code", authenticateToken, async (req, res) => {
  const { title, code, language } = req.body;
  if (!title || !code || !language) {
    return res.status(400).json({ error: "Title, code, and language are required" });
  }

  try {
    const snippet = new Snippet({
      userId: req.user.userId,
      title,
      code,
      language,
    });
    await snippet.save();
    res.json({ message: "Code saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/share-code", authenticateToken, async (req, res) => {
  const { title, code, language } = req.body;
  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  try {
    const shareId = uuidv4();
    const sharedSnippet = new SharedSnippet({
      shareId,
      userId: req.user.userId,
      title: title || "Shared Code",
      code,
      language,
    });
    await sharedSnippet.save();
    res.json({ shareId, message: "Code shared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/share/:shareId", async (req, res) => {
  const { shareId } = req.params;

  try {
    const sharedSnippet = await SharedSnippet.findOne({ shareId });
    if (!sharedSnippet) {
      return res.status(404).json({ error: "Shared snippet not found" });
    }
    res.json({
      code: sharedSnippet.code,
      language: sharedSnippet.language,
      title: sharedSnippet.title,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/history", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const snippets = await Snippet.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalSnippets = await Snippet.countDocuments({ userId: req.user.userId });

    res.json({
      snippets,
      totalSnippets,
      totalPages: Math.ceil(totalSnippets / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/delete-snippet/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(`Delete request: Snippet ID=${id}, User ID=${req.user.userId}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log(`Invalid snippet ID: ${id}`);
    return res.status(400).json({ error: "Invalid snippet ID" });
  }

  try {
    const snippet = await Snippet.findOne({ _id: id, userId: req.user.userId });
    if (!snippet) {
      console.log(`Snippet not found or unauthorized: ID=${id}, User ID=${req.user.userId}`);
      return res.status(404).json({ error: "Snippet not found or not authorized" });
    }

    await Snippet.deleteOne({ _id: id });
    console.log(`Snippet deleted: ID=${id}`);
    res.json({ message: "Snippet deleted successfully" });
  } catch (err) {
    console.error(`Delete error: ID=${id}, Error=${err.message}, Stack=${err.stack}`);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

function safeDelete(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error("Failed to delete file:", filePath, e);
  }
}

app.post("/run", (req, res) => {
  const { code, language, input } = req.body;

  if (!code) return res.json({ output: "Error: No code provided" });

  const supportedLanguages = ["java", "javascript", "python", "c", "cpp"];
  if (!supportedLanguages.includes(language)) {
    return res.json({ output: `Error: Only ${supportedLanguages.join(", ")} are supported.` });
  }

  const inputFileName = "input.txt";
  fs.writeFileSync(inputFileName, input || "");

  if (language === "java") {
    const fileName = "Main.java";
    const className = "Main";

    if (!code.includes("public class Main")) {
      return res.json({
        output: "Error: Java code must contain 'public class Main'.",
      });
    }

    fs.writeFileSync(fileName, code);

    const compileCmd = `javac ${fileName}`;
    const runCmd = `java ${className} < ${inputFileName}`;

    exec(compileCmd, { timeout: 5000 }, (compileErr, stdout, stderr) => {
      if (compileErr) {
        safeDelete(fileName);
        return res.json({
          output: compileErr.killed ? "Error: Compilation timed out." : "Compilation Error:\n" + stderr,
        });
      }

      exec(runCmd, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
        safeDelete(fileName);
        safeDelete(`${className}.class`);
        safeDelete(inputFileName);

        if (runErr) {
          return res.json({
            output: runErr.killed ? "Error: Execution timed out." : "Runtime Error:\n" + runStderr,
          });
        }

        return res.json({ output: runStdout });
      });
    });
  } else if (language === "javascript") {
    const fileName = "script.js";
    const wrappedCode = `
      const fs = require('fs');
      const input = fs.readFileSync('${inputFileName}', 'utf8').split('\\n');
      let inputIndex = 0;
      const readline = () => input[inputIndex++];
      ${code}
    `;

    fs.writeFileSync(fileName, wrappedCode);

    const runCmd = `node ${fileName}`;

    exec(runCmd, { timeout: 5000 }, (err, stdout, stderr) => {
      safeDelete(fileName);
      safeDelete(inputFileName);

      if (err) {
        return res.json({
          output: err.killed ? "Error: Execution timed out." : "Runtime Error:\n" + stderr,
        });
      }

      return res.json({ output: stdout });
    });
  } else if (language === "python") {
    const fileName = "script.py";
    fs.writeFileSync(fileName, code);

    const runCmd = `python ${fileName} < ${inputFileName}`;

    exec(runCmd, { timeout: 5000 }, (err, stdout, stderr) => {
      safeDelete(fileName);
      safeDelete(inputFileName);

      if (err) {
        return res.json({
          output: err.killed ? "Error: Execution timed out." : "Runtime Error:\n" + stderr,
        });
      }

      return res.json({ output: stdout });
    });
  } else if (language === "c") {
    const fileName = "script.c";
    const outputFile = "script.exe";
    fs.writeFileSync(fileName, code);
    fs.writeFileSync(inputFileName, input || "");

    const compileCmd = `gcc ${fileName} -o ${outputFile}`;
    const runCmd = `${outputFile} < ${inputFileName}`;

    exec(compileCmd, { timeout: 5000 }, (compileErr, stdout, stderr) => {
      if (compileErr) {
        safeDelete(fileName);
        safeDelete(outputFile);
        safeDelete(inputFileName);
        return res.json({
          output: compileErr.killed ? "Error: Compilation timed out." : "Compilation Error:\n" + stderr,
        });
      }

      exec(runCmd, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
        safeDelete(fileName);
        safeDelete(outputFile);
        safeDelete(inputFileName);

        if (runErr) {
          return res.json({
            output: runErr.killed ? "Error: Execution timed out." : "Runtime Error:\n" + runStderr,
          });
        }

        return res.json({ output: runStdout });
      });
    });
  } else if (language === "cpp") {
    const fileName = "script.cpp";
    const outputFile = "script.exe";
    fs.writeFileSync(fileName, code);
    fs.writeFileSync(inputFileName, input || "");

    const compileCmd = `g++ ${fileName} -o ${outputFile}`;
    const runCmd = `${outputFile} < ${inputFileName}`;

    exec(compileCmd, { timeout: 5000 }, (compileErr, stdout, stderr) => {
      if (compileErr) {
        safeDelete(fileName);
        safeDelete(outputFile);
        safeDelete(inputFileName);
        return res.json({
          output: compileErr.killed ? "Error: Compilation timed out." : "Compilation Error:\n" + stderr,
        });
      }

      exec(runCmd, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
        safeDelete(fileName);
        safeDelete(outputFile);
        safeDelete(inputFileName);

        if (runErr) {
          return res.json({
            output: runErr.killed ? "Error: Execution timed out." : "Runtime Error:\n" + runStderr,
          });
        }

        return res.json({ output: runStdout });
      });
    });
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});