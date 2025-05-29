import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

function InputModal({ visible, onClose, onSubmit, darkMode }) {
  const [tempInput, setTempInput] = useState("");

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: darkMode ? "#1f2a38" : "#fff",
          color: darkMode ? "#e0e0e0" : "#222",
          padding: "20px",
          borderRadius: "8px",
          width: "320px",
          boxShadow: darkMode
            ? "0 2px 10px rgba(0,0,0,0.8)"
            : "0 2px 10px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Enter Program Input</h3>
        <textarea
          rows={6}
          style={{
            width: "100%",
            resize: "vertical",
            padding: "8px",
            borderRadius: "5px",
            border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
            backgroundColor: darkMode ? "#263647" : "#fff",
            color: darkMode ? "#e0e0e0" : "#222",
            fontFamily: "monospace",
            fontSize: "1rem",
            outline: "none",
          }}
          value={tempInput}
          onChange={(e) => setTempInput(e.target.value)}
          placeholder="Enter input here..."
        />
        <div
          style={{
            marginTop: "15px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              backgroundColor: darkMode ? "#444" : "#eee",
              color: darkMode ? "#eee" : "#222",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(tempInput);
              onClose();
            }}
            style={{
              padding: "6px 14px",
              backgroundColor: "#007acc",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginModal({ visible, onClose, onLogin, darkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!visible) return null;

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    try {
      const response = await axios.post("/login", { email, password });
      onLogin(response.data.token);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: darkMode ? "#1f2a38" : "#fff",
          color: darkMode ? "#e0e0e0" : "#222",
          padding: "20px",
          borderRadius: "8px",
          width: "320px",
          boxShadow: darkMode
            ? "0 2px 10px rgba(0,0,0,0.8)"
            : "0 2px 10px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Login</h3>
        {error && <p style={{ color: "red", margin: "0 0 10px" }}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "8px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
            backgroundColor: darkMode ? "#263647" : "#fff",
            color: darkMode ? "#e0e0e0" : "#222",
            outline: "none",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "8px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
            backgroundColor: darkMode ? "#263647" : "#fff",
            color: darkMode ? "#e0e0e0" : "#222",
            outline: "none",
          }}
        />
        <div
          style={{
            marginTop: "15px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              backgroundColor: darkMode ? "#444" : "#eee",
              color: darkMode ? "#eee" : "#222",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            style={{
              padding: "6px 14px",
              backgroundColor: "#007acc",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterModal({ visible, onClose, onRegister, darkMode }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!visible) return null;

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      const response = await axios.post("/register", { username, email, password });
      onRegister(response.data.token);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: darkMode ? "#1f2a38" : "#fff",
          color: darkMode ? "#e0e0e0" : "#222",
          padding: "20px",
          borderRadius: "8px",
          width: "320px",
          boxShadow: darkMode
            ? "0 2px 10px rgba(0,0,0,0.8)"
            : "0 2px 10px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Register</h3>
        {error && <p style={{ color: "red", margin: "0 0 10px" }}>{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "8px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
            backgroundColor: darkMode ? "#263647" : "#fff",
            color: darkMode ? "#e0e0e0" : "#222",
            outline: "none",
          }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "8px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
            backgroundColor: darkMode ? "#263647" : "#fff",
            color: darkMode ? "#e0e0e0" : "#222",
            outline: "none",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "8px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
            backgroundColor: darkMode ? "#263647" : "#fff",
            color: darkMode ? "#e0e0e0" : "#222",
            outline: "none",
          }}
        />
        <div
          style={{
            marginTop: "15px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              backgroundColor: darkMode ? "#444" : "#eee",
              color: darkMode ? "#eee" : "#222",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleRegister}
            style={{
              padding: "6px 14px",
              backgroundColor: "#007acc",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({ visible, onClose, snippets, darkMode, onSelectSnippet }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: darkMode ? "#1f2a38" : "#fff",
          color: darkMode ? "#e0e0e0" : "#222",
          padding: "20px",
          borderRadius: "8px",
          width: "500px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: darkMode
            ? "0 2px 10px rgba(0,0,0,0.8)"
            : "0 2px 10px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Code History</h3>
        {snippets.length === 0 ? (
          <p>No saved snippets.</p>
        ) : (
          snippets.map((snippet) => (
            <div
              key={snippet._id}
              style={{
                padding: "10px",
                border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
                borderRadius: "5px",
                marginBottom: "10px",
                cursor: "pointer",
              }}
              onClick={() => onSelectSnippet(snippet)}
            >
              <strong>{snippet.title}</strong> ({snippet.language})
              <br />
              <small>{new Date(snippet.createdAt).toLocaleString()}</small>
              <pre style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                {snippet.code.substring(0, 100) + (snippet.code.length > 100 ? "..." : "")}
              </pre>
            </div>
          ))
        )}
        <button
          onClick={onClose}
          style={{
            padding: "6px 14px",
            backgroundColor: darkMode ? "#444" : "#eee",
            color: darkMode ? "#eee" : "#222",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "600",
            alignSelf: "flex-end",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ProfileModal({ visible, onClose, user, darkMode }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: darkMode ? "#1f2a38" : "#fff",
          color: darkMode ? "#e0e0e0" : "#222",
          padding: "20px",
          borderRadius: "8px",
          width: "320px",
          boxShadow: darkMode
            ? "0 2px 10px rgba(0,0,0,0.8)"
            : "0 2px 10px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Profile</h3>
        {user ? (
          <>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}
        <button
          onClick={onClose}
          style={{
            padding: "6px 14px",
            backgroundColor: darkMode ? "#444" : "#eee",
            color: darkMode ? "#eee" : "#222",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "600",
            alignSelf: "flex-end",
            marginTop: "15px",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [code, setCode] = useState(`console.log("Hello, World!");`);
  const [output, setOutput] = useState("Hello, World!");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [programInput, setProgramInput] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [saveTitle, setSaveTitle] = useState("");

  const snippets = {
    "Hello World": `console.log("Hello, World!");`,
    Factorial: `
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
console.log(factorial(5));
    `.trim(),
    Fibonacci: `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(7));
    `.trim(),
    Palindrome: `
function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === cleaned.split("").reverse().join("");
}
console.log(isPalindrome("Racecar")); // true
console.log(isPalindrome("Hello"));   // false
  `.trim(),
    Odd: `
function isOdd(num) {
  return num % 2 !== 0;
}
console.log(isOdd(7));  // true
console.log(isOdd(10)); // false
  `.trim(),
    Even: `
function isEven(num) {
  return num % 2 === 0;
}
console.log(isEven(8));  // true
console.log(isEven(13)); // false
  `.trim(),
    Calculator: `
function calculator(a, b, operator) {
  switch(operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : 'Error: Divide by zero';
    default: return 'Invalid operator';
  }
}
console.log(calculator(10, 5, '+')); // 15
console.log(calculator(10, 0, '/')); // Error: Divide by zero
    `.trim(),
    javaSnippet: `
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int number = scanner.nextInt();
        scanner.nextLine(); // consume newline
        String text = scanner.nextLine();
        System.out.println("Number: " + number);
        System.out.println("Text: " + text);
        // Factorial
        int factorial = 1;
        for (int i = 1; i <= number; i++) {
            factorial *= i;
        }
        System.out.println("Factorial: " + factorial);
        // Palindrome check
        String reversed = new StringBuilder(text).reverse().toString();
        System.out.println("Is Palindrome: " + text.equalsIgnoreCase(reversed));
        // Uppercase
        System.out.println("Uppercase: " + text.toUpperCase());
        scanner.close();
    }
}
`.trim(),
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await axios.get("/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (err) {
          console.error("Failed to fetch profile:", err);
          setToken(null);
          localStorage.removeItem("token");
        }
      }
    };
    fetchProfile();
  }, [token]);

  const runCode = async () => {
    try {
      setOutput("Running...");
      const startTime = performance.now();

      let codeToRun = code;
      if (language === "javascript") {
        codeToRun = `
          console.time("Execution Time");
          try {
            ${code}
          } finally {
            console.timeEnd("Execution Time");
          }
        `;
      }

      const response = await axios.post("/run", {
        code: codeToRun,
        language,
        input: programInput,
      });

      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);

      let finalOutput = response.data.output;
      if (language === "java") {
        finalOutput += `\nExecution Time: ${timeTaken} ms`;
      }

      setOutput(finalOutput);
    } catch (error) {
      setOutput("Error: " + (error.message || "Failed to execute code"));
    }
  };

  const saveCode = async () => {
    if (!token) {
      setOutput("Error: Please login to save code");
      return;
    }
    if (!saveTitle) {
      setOutput("Error: Please enter a title for the code");
      return;
    }
    try {
      await axios.post(
        "/save-code",
        { title: saveTitle, code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOutput("Code saved successfully");
      setSaveTitle("");
    } catch (err) {
      setOutput("Error: " + (err.response?.data?.error || "Failed to save code"));
    }
  };

  const fetchHistory = async () => {
    if (!token) {
      setOutput("Error: Please login to view history");
      return;
    }
    try {
      const response = await axios.get("/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
      setHistoryOpen(true);
    } catch (err) {
      setOutput("Error: " + (err.response?.data?.error || "Failed to fetch history"));
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setHistory([]);
    localStorage.removeItem("token");
    setOutput("Logged out successfully");
  };

  const handleSelectSnippet = (snippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setHistoryOpen(false);
  };

  const backgroundGradient = darkMode
    ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
    : "linear-gradient(135deg, #f6d365, #fda085)";
  const editorGradient = darkMode
    ? "linear-gradient(145deg, #1c2833, #263647)"
    : "linear-gradient(145deg, #ffffff, #e2e8f0)";
  const outputGradient = darkMode
    ? "linear-gradient(145deg, #16212b, #2e3a4a)"
    : "linear-gradient(145deg, #fefefe, #cbd5e1)";
  const textColor = darkMode ? "#e0e0e0" : "#222";
  const borderColor = darkMode ? "#444" : "#ccc";
  const buttonBg = "#007acc";
  const buttonHoverBg = "#005f99";

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: backgroundGradient,
        color: textColor,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "1rem 2rem",
        boxSizing: "border-box",
        transition: "background 0.5s ease, color 0.3s ease",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          paddingBottom: "0.5rem",
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontWeight: "600",
            fontSize: "1.5rem",
            userSelect: "none",
          }}
        >
          JS Coding Playground
        </h1>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {token ? (
            <>
              <span style={{ fontWeight: "500" }}>
                Welcome, {user?.username || "User"}
              </span>
              <button
                onClick={() => setProfileOpen(true)}
                style={{
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#fff",
                  backgroundColor: buttonBg,
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxShadow: `0 3px 6px ${buttonBg}80`,
                  transition: "background-color 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = buttonHoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = buttonBg)
                }
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#fff",
                  backgroundColor: "#dc3545",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxShadow: `0 3px 6px #dc354580`,
                  transition: "background-color 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#b02a37")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#dc3545")
                }
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setLoginOpen(true)}
                style={{
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#fff",
                  backgroundColor: buttonBg,
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxShadow: `0 3px 6px ${buttonBg}80`,
                  transition: "background-color 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = buttonHoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = buttonBg)
                }
              >
                Login
              </button>
              <button
                onClick={() => setRegisterOpen(true)}
                style={{
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#fff",
                  backgroundColor: buttonBg,
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxShadow: `0 3px 6px ${buttonBg}80`,
                  transition: "background-color 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = buttonHoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = buttonBg)
                }
              >
                Register
              </button>
            </>
          )}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: "0.3rem 0.6rem",
              fontSize: "0.9rem",
              fontWeight: "500",
              borderRadius: "4px",
              border: `1px solid ${borderColor}`,
              backgroundColor: darkMode ? "#263647" : "#fff",
              color: textColor,
              cursor: "pointer",
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>
          <button
            onClick={runCode}
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "#fff",
              backgroundColor: buttonBg,
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: `0 3px 6px ${buttonBg}80`,
              transition: "background-color 0.25s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = buttonHoverBg)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = buttonBg)
            }
          >
            Run Code
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: darkMode ? "#eee" : "#222",
              backgroundColor: darkMode ? "#333" : "#ddd",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: darkMode ? `0 3px 6px #0008` : `0 3px 6px #aaa`,
              transition: "background-color 0.25s ease, color 0.25s ease",
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          gap: "1.5rem",
          overflow: "hidden",
        }}
      >
        {/* Left: Editor + Input */}
        <section
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            borderRadius: "8px",
            overflow: "hidden",
            border: `1px solid ${borderColor}`,
            background: editorGradient,
            boxShadow: darkMode
              ? "0 4px 15px rgba(0,0,0,0.7)"
              : "0 4px 15px rgba(0,0,0,0.1)",
            transition: "background 0.5s ease",
            height: "100%",
          }}
        >
          {/* Snippet Dropdown + Save Code */}
          <div
            style={{
              padding: "0.6rem 1rem",
              borderBottom: `1px solid ${borderColor}`,
              backgroundColor: darkMode ? "#1f2a38" : "#f9fafb",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <label
              htmlFor="snippet-select"
              style={{ color: textColor, fontWeight: "600", minWidth: "100px" }}
            >
              Insert Snippet:
            </label>
            <select
              id="snippet-select"
              onChange={(e) => {
                const val = e.target.value;
                if (val && snippets[val]) setCode(snippets[val]);
                e.target.selectedIndex = 0;
              }}
              style={{
                padding: "0.3rem 0.6rem",
                borderRadius: "4px",
                border: `1px solid ${borderColor}`,
                backgroundColor: darkMode ? "#263647" : "#fff",
                color: textColor,
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: "500",
                flexGrow: 1,
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Select snippet...
              </option>
              {Object.keys(snippets).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <button
              onClick={fetchHistory}
              style={{
                padding: "0.3rem 0.6rem",
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#fff",
                backgroundColor: buttonBg,
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                boxShadow: `0 3px 6px ${buttonBg}80`,
                transition: "background-color 0.25s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = buttonHoverBg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = buttonBg)
              }
            >
              History
            </button>
          </div>
          <div
            style={{
              padding: "0.6rem 1rem",
              borderBottom: `1px solid ${borderColor}`,
              backgroundColor: darkMode ? "#1f2a38" : "#f9fafb",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <input
              type="text"
              placeholder="Code Title"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              style={{
                padding: "0.3rem 0.6rem",
                borderRadius: "4px",
                border: `1px solid ${borderColor}`,
                backgroundColor: darkMode ? "#263647" : "#fff",
                color: textColor,
                fontSize: "0.95rem",
                flexGrow: 1,
              }}
            />
            <button
              onClick={saveCode}
              style={{
                padding: "0.3rem 0.6rem",
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#fff",
                backgroundColor: buttonBg,
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                boxShadow: `0 3px 6px ${buttonBg}80`,
                transition: "background-color 0.25s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = buttonHoverBg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = buttonBg)
              }
            >
              Save Code
            </button>
          </div>
          {/* Monaco Editor */}
          <Editor
            height="100%"
            defaultLanguage="javascript"
            language={language}
            value={code}
            onChange={(value) => setCode(value)}
            theme={darkMode ? "vs-dark" : "light"}
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              fontFamily:
                "Consolas, 'Courier New', monospace, 'Fira Code', 'JetBrains Mono'",
              fontLigatures: true,
              lineNumbers: "on",
              smoothScrolling: true,
              tabSize: 2,
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
          {/* Program Input */}
          <div
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: darkMode ? "#1f2a38" : "#f9fafb",
              borderTop: `1px solid ${borderColor}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            <span>Program Input:</span>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                cursor: "pointer",
                padding: "0.2rem 0.5rem",
                borderRadius: "5px",
                backgroundColor: buttonBg,
                border: "none",
                color: "#fff",
                fontWeight: "600",
                fontSize: "0.85rem",
                userSelect: "none",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
            >
              Edit Input
            </button>
          </div>
        </section>

        {/* Right: Output Console */}
        <section
          style={{
            flex: 1,
            borderRadius: "8px",
            padding: "1rem",
            background: outputGradient,
            boxShadow: darkMode
              ? "0 4px 15px rgba(0,0,0,0.7)"
              : "0 4px 15px rgba(0,0,0,0.1)",
            border: `1px solid ${borderColor}`,
            color: darkMode ? "#eee" : "#222",
            fontFamily: "monospace",
            fontSize: "1rem",
            whiteSpace: "pre-wrap",
            overflowY: "auto",
            height: "100%",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.8rem" }}>Output:</h2>
          {output}
        </section>
      </main>

      <InputModal
        visible={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={setProgramInput}
        darkMode={darkMode}
      />
      <LoginModal
        visible={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={(newToken) => {
          setToken(newToken);
          localStorage.setItem("token", newToken);
        }}
        darkMode={darkMode}
      />
      <RegisterModal
        visible={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={(newToken) => {
          setToken(newToken);
          localStorage.setItem("token", newToken);
        }}
        darkMode={darkMode}
      />
      <HistoryModal
        visible={isHistoryOpen}
        onClose={() => setHistoryOpen(false)}
        snippets={history}
        darkMode={darkMode}
        onSelectSnippet={handleSelectSnippet}
      />
      <ProfileModal
        visible={isProfileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        darkMode={darkMode}
      />
    </div>
  );
}