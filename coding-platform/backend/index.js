const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/coding-platform")
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

// Original /run Endpoint (Accessible without authentication)
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

  const supportedLanguages = ["java", "javascript", "python"];
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
        output: "Error: Java code must contain 'public class Main'."
      });
    }

    fs.writeFileSync(fileName, code);

    const compileCmd = `javac ${fileName}`;
    const runCmd = `java ${className} < ${inputFileName}`;

    exec(compileCmd, { timeout: 5000 }, (compileErr, stdout, stderr) => {
      if (compileErr) {
        safeDelete(fileName);
        return res.json({
          output: compileErr.killed
            ? "Error: Compilation timed out."
            : "Compilation Error:\n" + stderr
        });
      }

      exec(runCmd, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
        safeDelete(fileName);
        safeDelete(`${className}.class`);
        safeDelete(inputFileName);

        if (runErr) {
          return res.json({
            output: runErr.killed
              ? "Error: Execution timed out."
              : "Runtime Error:\n" + runStderr
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
          output: err.killed
            ? "Error: Execution timed out."
            : "Runtime Error:\n" + stderr
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
          output: err.killed
            ? "Error: Execution timed out."
            : "Runtime Error:\n" + stderr
        });
      }

      return res.json({ output: stdout });
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});