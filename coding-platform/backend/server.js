const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/coding-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
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

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: "Authentication required" });

  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Register Endpoint
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

// Login Endpoint
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

// Save Code Endpoint
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

// History Endpoint
app.get("/history", authenticateToken, async (req, res) => {
  try {
    const snippets = await Snippet.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Profile Endpoint
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

// Run Code Endpoint (Unchanged, accessible without authentication)
app.post("/run", async (req, res) => {
  const { code, language, input } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
  }

  try {
    if (language === "javascript") {
      const filePath = path.join(__dirname, "temp.js");
      fs.writeFileSync(filePath, code);

      const command = input
        ? `echo ${JSON.stringify(input)} | node ${filePath}`
        : `node ${filePath}`;

      const startTime = Date.now();

      exec(command, (error, stdout, stderr) => {
        const endTime = Date.now();
        const timeTaken = endTime - startTime;

        if (error) {
          fs.unlinkSync(filePath);
          return res.json({ output: stderr || error.message });
        }

        const finalOutput = `${stdout.trim()}\nExecution Time: ${timeTaken} ms`;
        fs.unlinkSync(filePath);
        res.json({ output: finalOutput });
      });
    } else if (language === "java") {
      const javaFile = path.join(__dirname, "Main.java");
      const classFile = path.join(__dirname, "Main.class");

      fs.writeFileSync(javaFile, code);

      exec(`javac ${javaFile}`, (compileErr, _, compileStderr) => {
        if (compileErr) {
          fs.unlinkSync(javaFile);
          return res.json({ output: compileStderr || compileErr.message });
        }

        const command = input
          ? `echo ${JSON.stringify(input)} | java -cp ${__dirname} Main`
          : `java -cp ${__dirname} Main`;

        const startTime = Date.now();

        exec(command, (runErr, stdout, stderr) => {
          const endTime = Date.now();
          const timeTaken = endTime - startTime;

          if (runErr) {
            fs.unlinkSync(javaFile);
            fs.unlinkSync(classFile);
            return res.json({ output: stderr || runErr.message });
          }

          const finalOutput = `${stdout.trim()}\nExecution Time: ${timeTaken} ms`;
          fs.unlinkSync(javaFile);
          fs.unlinkSync(classFile);
          res.json({ output: finalOutput });
        });
      });
    } else {
      res.status(400).json({ error: "Unsupported language." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});