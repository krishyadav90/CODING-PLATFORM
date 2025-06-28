import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import Notification from "./Notification";
import useNotification from "./useNotification";
import InputModal from "./InputModal";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import HistoryModal from "./HistoryModal";
import ProfileModal from "./ProfileModal";
import snippets from "./snippets";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import io from "socket.io-client";
import { ShareIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline"; // Added Heroicons

// Configure Axios baseURL
axios.defaults.baseURL = "http://localhost:5000";

// Initialize Socket.IO client
const socket = io("http://localhost:5000");

function App() {
  // State management
  const [code, setCode] = useState(localStorage.getItem("savedCode") || `console.log("Hello, World!");`);
  const [output, setOutput] = useState("Hello, World!");
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [programInput, setProgramInput] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isCollabModalOpen, setCollabModalOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [collabRoomId, setCollabRoomId] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [saveTitle, setSaveTitle] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shareLink, setShareLink] = useState("");
  const [requestsRemaining, setRequestsRemaining] = useState(null);
  const [isSnippetInserted, setIsSnippetInserted] = useState(false);
  const { notification, showNotification, clearNotification } = useNotification();
  const editorRef = useRef(null);
  const yDocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  // Auto-save code to localStorage, excluding snippet insertions
  useEffect(() => {
    if (!isSnippetInserted && !collabRoomId) {
      const timer = setTimeout(() => {
        localStorage.setItem("savedCode", code);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [code, isSnippetInserted, collabRoomId]);

  // Reset isSnippetInserted after manual code changes
  useEffect(() => {
    if (isSnippetInserted) {
      setIsSnippetInserted(false);
    }
  }, [code]);

  // Fetch user profile
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
          showNotification("Failed to load profile", "error");
        }
      }
    };
    fetchProfile();
  }, [token]);

  // Fetch history
  useEffect(() => {
    if (isHistoryOpen && token) {
      fetchHistory();
    }
  }, [page, isHistoryOpen, token]);

  // Check for shareId or roomId in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get("shareId");
    const roomIdFromUrl = urlParams.get("roomId");

    if (shareId) {
      fetchSharedSnippet(shareId);
    } else if (roomIdFromUrl && token) {
      setRoomId(roomIdFromUrl);
      showNotification("Collaboration room detected. Click 'Collaborate' to join.", "info");
    }
  }, [token]);

  // Initialize Yjs for collaboration
  useEffect(() => {
    if (collabRoomId && editorRef.current && token) {
      const yDoc = new Y.Doc();
      yDocRef.current = yDoc;
      const provider = new WebsocketProvider(`ws://localhost:5000`, collabRoomId, yDoc, {
        connect: true,
        params: { token },
      });
      providerRef.current = provider;

      const yText = yDoc.getText("code");
      const editorModel = editorRef.current.getModel();
      const binding = new MonacoBinding(
        yText,
        editorModel,
        new Set([editorRef.current]),
        provider.awareness
      );
      bindingRef.current = binding;

      // Sync local code state with Yjs document
      yText.observe(() => {
        const yjsCode = yText.toString();
        setCode(yjsCode);
      });

      // Update connected users
      provider.awareness.on("change", () => {
        const users = Array.from(provider.awareness.getStates().values()).map(
          (state) => state.user || { name: "Anonymous" }
        );
        setConnectedUsers(users);
      });

      // Set user awareness
      provider.awareness.setLocalStateField("user", {
        name: user?.username || "Anonymous",
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      });

      socket.emit("join-room", { roomId: collabRoomId, userId: user?.username || "Anonymous" });

      socket.on("init-code", (initCode) => {
        if (!yText.toString()) {
          yText.insert(0, initCode);
        }
        setCode(initCode);
        localStorage.setItem("savedCode", initCode);
      });

      return () => {
        binding.destroy();
        provider.destroy();
        yDoc.destroy();
        socket.off("init-code");
        providerRef.current = null;
        yDocRef.current = null;
        bindingRef.current = null;
      };
    }
  }, [collabRoomId, token, user]);

  // Update user profile
  const onProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Run code
  const runCode = async () => {
    try {
      setOutput("Running...");
      const startTime = performance.now();

      let codeToRun = collabRoomId ? yDocRef.current.getText("code").toString() : code;
      if (language === "javascript") {
        codeToRun = `
          console.time("Execution Time");
          try {
            ${codeToRun}
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

      const remaining = response.headers["ratelimit-remaining"];
      setRequestsRemaining(remaining ? parseInt(remaining) : null);

      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(1);

      let finalOutput = response.data.output;
      if (language !== "javascript") {
        finalOutput += `\nExecution Time: ${timeTaken} ms`;
      }

      setOutput(finalOutput);
    } catch (err) {
      const errorMsg = err.response?.status === 429
        ? "Too many requests. Please try again later."
        : err.response?.data?.error || "Failed to execute code";
      setOutput("Error: " + errorMsg);
      showNotification(errorMsg, "error");
    }
  };

  // Save code
  const saveCode = async () => {
    if (!token) {
      setOutput("Error: Please login to save code");
      showNotification("Please login to save code", "error");
      return;
    }
    if (!saveTitle) {
      setOutput("Error: Please enter a title for the code");
      showNotification("Please enter a title for the code", "error");
      return;
    }
    try {
      const codeToSave = collabRoomId ? yDocRef.current.getText("code").toString() : code;
      const response = await axios.post(
        "/save-code",
        { title: saveTitle, code: codeToSave, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const remaining = response.headers["ratelimit-remaining"];
      setRequestsRemaining(remaining ? parseInt(remaining) : null);

      setOutput("Code saved successfully");
      showNotification("Code saved successfully", "success");
      setSaveTitle("");
      localStorage.setItem("savedCode", codeToSave);
      if (isHistoryOpen) {
        setPage(1);
        fetchHistory();
      }
    } catch (err) {
      const errorMsg = err.response?.status === 429
        ? "Too many requests. Please try again later."
        : err.response?.data?.error || "Failed to save code";
      setOutput("Error: " + errorMsg);
      showNotification(errorMsg, "error");
    }
  };

  // Share code
  const shareCode = async () => {
    if (!token) {
      setOutput("Error: Please login to share code");
      showNotification("Please login to share code", "error");
      return;
    }
    try {
      const codeToShare = collabRoomId ? yDocRef.current.getText("code").toString() : code;
      const response = await axios.post(
        "/share-code",
        { code: codeToShare, language, title: saveTitle || "Shared Code" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const remaining = response.headers["ratelimit-remaining"];
      setRequestsRemaining(remaining ? parseInt(remaining) : null);

      const shareUrl = `${window.location.origin}?shareId=${response.data.shareId}`;
      setShareLink(shareUrl);
      setOutput("Code shared successfully");
      showNotification("Code shared successfully. Link copied to clipboard!", "success");
      navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      const errorMsg = err.response?.status === 429
        ? "Too many requests. Please try again later."
        : err.response?.data?.error || "Failed to share code";
      setOutput("Error: " + errorMsg);
      showNotification(errorMsg, "error");
    }
  };

  // Start collaboration
  const startCollaboration = async () => {
    if (!token) {
      setOutput("Error: Please login to start collaboration");
      showNotification("Please login to start collaboration", "error");
      return;
    }
    if (!saveTitle) {
      setOutput("Error: Please enter a title for the collaboration");
      showNotification("Please enter a title for the collaboration", "error");
      return;
    }
    try {
      const response = await axios.post(
        "/collaborate",
        { title: saveTitle, code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { roomId } = response.data;
      setCollabRoomId(roomId);
      setShareLink(`${window.location.origin}?roomId=${roomId}`);
      setOutput("Collaboration started successfully");
      showNotification("Collaboration started. Share the link with others!", "success");
      navigator.clipboard.writeText(`${window.location.origin}?roomId=${roomId}`);
      setCollabModalOpen(false);
    } catch (err) {
      const errorMsg = err.response?.status === 429
        ? "Too many requests. Please try again later."
        : err.response?.data?.error || "Failed to start collaboration";
      setOutput("Error: " + errorMsg);
      showNotification(errorMsg, "error");
    }
  };

  // Join collaboration
  const joinCollaboration = async () => {
    if (!token) {
      setOutput("Error: Please login to join collaboration");
      showNotification("Please login to join collaboration", "error");
      return;
    }
    if (!roomId) {
      setOutput("Error: Please enter a room ID");
      showNotification("Please enter a room ID", "error");
      return;
    }
    try {
      const response = await axios.post(
        "/collaborate/join",
        { roomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { collaboration } = response.data;
      setCollabRoomId(roomId);
      setLanguage(collaboration.language);
      setSaveTitle(collaboration.title);
      setOutput("Joined collaboration successfully");
      showNotification("Joined collaboration successfully", "success");
      setCollabModalOpen(false);
      setRoomId("");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to join collaboration";
      setOutput("Error: " + errorMsg);
      showNotification(errorMsg, "error");
    }
  };

  // Leave collaboration
  const leaveCollaboration = () => {
    if (providerRef.current) {
      providerRef.current.destroy();
    }
    if (yDocRef.current) {
      const currentCode = yDocRef.current.getText("code").toString();
      setCode(currentCode);
      localStorage.setItem("savedCode", currentCode);
      yDocRef.current.destroy();
    }
    socket.emit("leave-room", { roomId: collabRoomId, userId: user?.username || "Anonymous" });
    socket.off("init-code");
    setCollabRoomId("");
    setConnectedUsers([]);
    setShareLink("");
    setOutput("Left collaboration successfully");
    showNotification("Left collaboration successfully", "success");
  };

  // Fetch shared snippet
  const fetchSharedSnippet = async (shareId) => {
    try {
      const response = await axios.get(`/share/${shareId}`);
      setCode(response.data.code);
      setLanguage(response.data.language);
      setSaveTitle(response.data.title || "Shared Code");
      localStorage.setItem("savedCode", response.data.code);
      setOutput("Loaded shared code");
      showNotification("Shared code loaded successfully", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to load shared code";
      setOutput("Error: " + errorMsg);
      showNotification(errorMsg, "error");
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    if (!token) {
      setOutput("Error: Please login to view history");
      setHistory([]);
      showNotification("Please login to view history", "error");
      return;
    }
    try {
      console.log("Fetching history for page:", page);
      setHistory([]);
      const response = await axios.get(`/history?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("History response:", response.data);
      setHistory(response.data.snippets);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch history error:", err);
      const errorMsg = err.response?.data?.error || "Failed to fetch history";
      setOutput("Error: " + errorMsg);
      setHistory([]);
      showNotification(errorMsg, "error");
    }
  };

  // Delete snippet
  const deleteSnippet = async (snippetId) => {
    if (!token) {
      setOutput("Error: Please login to delete snippets");
      showNotification("Please login to delete snippets", "error");
      return;
    }
    try {
      const response = await axios.delete(`/delete-snippet/${snippetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOutput("Code deleted successfully");
      showNotification("Code deleted successfully", "success");
      setPage(1);
      fetchHistory();
    } catch (err) {
      const errorMsg = err.response?.status === 429
        ? "Too many requests. Please try again later."
        : err.response?.data?.error || "Failed to delete code";
      setOutput(`Error: ${errorMsg}`);
      showNotification(errorMsg, "error");
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (collabRoomId) {
      leaveCollaboration();
    }
    setToken(null);
    setUser(null);
    setHistory([]);
    localStorage.removeItem("token");
    setOutput("Logged out successfully");
    showNotification("Logged out successfully", "success");
  };

  // Handle snippet selection
  const handleSelectSnippet = (snippet) => {
    if (collabRoomId && yDocRef.current) {
      const yText = yDocRef.current.getText("code");
      yText.delete(0, yText.length);
      yText.insert(0, snippet.code);
    } else {
      setCode(snippet.code);
      localStorage.setItem("savedCode", snippet.code);
    }
    setLanguage(snippet.language);
    setHistoryOpen(false);
  };

  // Clear output
  const clearOutput = () => {
    setOutput("");
  };

  // Styling variables
  const backgroundGradient = darkMode
    ? "linear-gradient(135deg, #0a0f1a, #1e2a44, #3b4b6a)"
    : "linear-gradient(135deg, #e0e7ff, #c3dafe)";
  const editorGradient = darkMode
    ? "linear-gradient(145deg, #141c2f, #1f2a44)"
    : "linear-gradient(145deg, #ffffff, #e0e7ff)";
  const outputGradient = darkMode
    ? "linear-gradient(145deg, #0f172a, #1e293b)"
    : "linear-gradient(145deg, #f8fafc, #e2e8f0)";
  const textColor = darkMode ? "#e2e8f0" : "#1e293b";
  const borderColor = darkMode ? "#4b5e8c" : "#93c5fd";
  const buttonGradient = "linear-gradient(90deg, #3b82f6, #a855f7)";
  const buttonHoverGradient = "linear-gradient(90deg, #2563eb, #9333ea)";

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: backgroundGradient,
        color: textColor,
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontWeight: 400,
        letterSpacing: "0.02em",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "hidden",
        padding: "1.5rem",
        boxSizing: "border-box",
        transition: "all 0.3s ease",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Notification message={notification.message} type={notification.type} onClose={clearNotification} />
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: `1px solid ${borderColor}`,
          background: darkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(8px)",
          borderRadius: "8px",
          padding: "0.75rem 1.5rem",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "1.75rem",
            userSelect: "none",
            background: buttonGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          CodeVerse
        </h1>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {requestsRemaining !== null && (
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: 500,
                color: darkMode ? "#ffffff" : "#1e293b",
                background: darkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
                padding: "0.25rem 0.75rem",
                borderRadius: "6px",
                border: `1px solid ${borderColor}`,
              }}
            >
              Requests remaining: {requestsRemaining}
            </span>
          )}
          {collabRoomId && (
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: 500,
                color: darkMode ? "#ffffff" : "#1e293b",
                background: darkMode ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.1)",
                padding: "0.25rem 0.75rem",
                borderRadius: "6px",
                border: `1px solid ${borderColor}`,
              }}
            >
              Room: {collabRoomId} | Users: {connectedUsers.length}
            </span>
          )}
          {token ? (
            <>
              <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                Welcome, {user?.username || "User"}
              </span>
              <button
                onClick={() => setProfileOpen(true)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#fff",
                  background: buttonGradient,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                  transition: "all 0.3s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = buttonHoverGradient;
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = buttonGradient;
                  e.currentTarget.style.transform = "scale(1)";
                }}
                tabIndex={0}
                aria-label="View profile"
              >
                Profile
              </button>
              {collabRoomId && (
                <button
                  onClick={leaveCollaboration}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#fff",
                    background: "linear-gradient(90deg, #ef4444, #dc2626)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                    transition: "all 0.3s ease",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(90deg, #dc2626, #b91c1c)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(90deg, #ef4444, #dc2626)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  tabIndex={0}
                  aria-label="Leave collaboration"
                >
                  Leave Collaboration
                </button>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#fff",
                  background: "linear-gradient(90deg, #ef4444, #dc2626)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                  transition: "all 0.3s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(90deg, #dc2626, #b91c1c)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(90deg, #ef4444, #dc2626)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                tabIndex={0}
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setLoginOpen(true)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#fff",
                  background: buttonGradient,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                  transition: "all 0.3s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = buttonHoverGradient;
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = buttonGradient;
                  e.currentTarget.style.transform = "scale(1)";
                }}
                tabIndex={0}
                aria-label="Login"
              >
                Login
              </button>
              <button
                onClick={() => setRegisterOpen(true)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#fff",
                  background: buttonGradient,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                  transition: "all 0.3s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = buttonHoverGradient;
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = buttonGradient;
                  e.currentTarget.style.transform = "scale(1)";
                }}
                tabIndex={0}
                aria-label="Register"
              >
                Register
              </button>
            </>
          )}
          <select
  value={language}
  onChange={(e) => setLanguage(e.target.value)}
  style={{
    padding: "0.5rem",
    fontSize: "0.95rem",
    fontWeight: 500,
    borderRadius: "8px",
    border: `1px solid ${borderColor}`,
    background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)",
    color: textColor,
    cursor: "pointer",
    backdropFilter: "blur(4px)",
    transition: "all 0.3s ease",
  }}
>
  <option value="javascript">JavaScript</option>
  <option value="java">Java</option>
  <option value="python">Python</option>
  <option value="c">C</option>
  <option value="cpp">C++</option>
  <option value="go">Go</option>
  <option value="ruby">Ruby</option>
  <option value="typescript">TypeScript</option>
  <option value="php">PHP</option>
</select>
          <button
            onClick={runCode}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background: buttonGradient,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = buttonHoverGradient;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = buttonGradient;
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label="Run code"
          >
            Run Code
          </button>
          <button
            onClick={shareCode}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background: buttonGradient,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = buttonHoverGradient;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = buttonGradient;
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label="Share code"
          >
            <ShareIcon style={{ width: "1.2rem", height: "1.2rem" }} />
            Share
          </button>
          <button
            onClick={() => setCollabModalOpen(true)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background: buttonGradient,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = buttonHoverGradient;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = buttonGradient;
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label="Start or join collaboration"
          >
            Collaborate
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "0.3rem",
              fontSize: "1.2rem",
              width: "2rem",
              height: "2rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: darkMode ? "#ffd700" : "#fff",
              background: darkMode
                ? "linear-gradient(90deg, #64748b, #475569)"
                : "linear-gradient(90deg, #93c5fd, #60a5fa)",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              boxShadow: darkMode
                ? "0 4px 15px rgba(100, 116, 139, 0.4)"
                : "0 4px 15px rgba(147, 197, 253, 0.4)",
              transition: "all 0.3s ease",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <SunIcon style={{ width: "1.2rem", height: "1.2rem" }} />
            ) : (
              <MoonIcon style={{ width: "1.2rem", height: "1.2rem" }} />
            )}
          </button>
        </div>
      </header>
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "12px",
            overflow: "hidden",
            border: `1px solid ${borderColor}`,
            background: editorGradient,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(59, 130, 246, 0.1)",
            transition: "all 0.3s ease",
            height: "100%",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1.5rem",
              borderBottom: `1px solid ${borderColor}`,
              background: darkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(8px)",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <label htmlFor="snippet-select" style={{ color: textColor, fontWeight: 500 }}>
              Insert Snippet:
            </label>
            <select
              id="snippet-select"
              onChange={(e) => {
                const val = e.target.value;
                if (val && snippets[val]) {
                  if (collabRoomId && yDocRef.current) {
                    const yText = yDocRef.current.getText("code");
                    yText.delete(0, yText.length);
                    yText.insert(0, snippets[val]);
                  } else {
                    setCode(snippets[val]);
                    setIsSnippetInserted(true);
                  }
                }
                e.target.selectedIndex = 0;
              }}
              style={{
                padding: "0.5rem",
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
                background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)",
                color: textColor,
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 500,
                flexGrow: 1,
                backdropFilter: "blur(4px)",
                transition: "all 0.3s ease",
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Select snippet...
              </option>
              {Object.keys(snippets).map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setPage(1);
                setHistoryOpen(true);
              }}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#fff",
                background: buttonGradient,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                transition: "all 0.3s ease",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = buttonHoverGradient;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = buttonGradient;
                e.currentTarget.style.transform = "scale(1)";
              }}
              tabIndex={0}
              aria-label="View history"
            >
              History
            </button>
          </div>
          <div
            style={{
              padding: "0.75rem 1.5rem",
              borderBottom: `1px solid ${borderColor}`,
              background: darkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <input
              type="text"
              placeholder="Code Title"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
                background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)",
                color: textColor,
                fontSize: "0.95rem",
                flexGrow: 1,
                backdropFilter: "blur(4px)",
                transition: "all 0.3s ease",
              }}
            />
            <button
              onClick={saveCode}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#fff",
                background: buttonGradient,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                transition: "all 0.3s ease",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = buttonHoverGradient;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = buttonGradient;
                e.currentTarget.style.transform = "scale(1)";
              }}
              tabIndex={0}
              aria-label="Save code"
            >
              Save Code
            </button>
          </div>
          {shareLink && (
            <div
              style={{
                padding: "0.75rem 1.5rem",
                borderBottom: `1px solid ${borderColor}`,
                background: darkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <input
                type="text"
                value={shareLink}
                readOnly
                style={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)",
                  color: textColor,
                  fontSize: "0.95rem",
                  flexGrow: "1",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.3s ease",
                  userSelect: "text",
                }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  showNotification("Link copied to clipboard!", "success");
                }}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#fff",
                  background: buttonGradient,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                  transition: "all 0.3s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = buttonHoverGradient;
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = buttonGradient;
                  e.currentTarget.style.transform = "scale(1)";
                }}
                tabIndex={0}
                aria-label="Copy share link"
              >
                Copy Link
              </button>
            </div>
          )}
          <div style={{ flex: "1 1 auto", minHeight: "0" }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language}
              value={code}
              onChange={(value) => !collabRoomId && setCode(value)}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              theme={darkMode ? "vs-dark" : "light"}
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                lineNumbers: "on",
                smoothScrolling: true,
                tabSize: 2,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
          <div
            style={{
              padding: "0.75rem 1.5rem",
              background: darkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(8px)",
              borderTop: `1px solid ${borderColor}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            <span style={{ fontWeight: 500 }}>Program Input:</span>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#fff",
                background: buttonGradient,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                transition: "all 0.3s ease",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = buttonHoverGradient;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = buttonGradient;
                e.currentTarget.style.transform = "scale(1)";
              }}
              tabIndex={0}
              aria-label="Edit program input"
            >
              Edit Input
            </button>
          </div>
        </section>
        <section
          style={{
            borderRadius: "12px",
            padding: "1.5rem",
            background: outputGradient,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(59, 130, 246, 0.1)",
            border: `1px solid ${borderColor}`,
            color: textColor,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "1rem",
            whiteSpace: "pre-wrap",
            overflowY: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: "1.25rem" }}>Output:</h2>
            <button
              onClick={clearOutput}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(90deg, #ef4444, #dc2626)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                transition: "all 0.3s ease",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(90deg, #dc2626, #b91c1c)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(90deg, #ef4444, #dc2626)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              tabIndex={0}
              aria-label="Clear output"
            >
              Clear
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>{output}</div>
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
        showNotification={showNotification}
      />
      <RegisterModal
        visible={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={(newToken) => {
          setToken(newToken);
          localStorage.setItem("token", newToken);
        }}
        darkMode={darkMode}
        showNotification={showNotification}
      />
      <HistoryModal
        visible={isHistoryOpen}
        onClose={() => setHistoryOpen(false)}
        snippets={history}
        darkMode={darkMode}
        onSelectSnippet={handleSelectSnippet}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        onDeleteSnippet={deleteSnippet}
        showNotification={showNotification}
      />
      <ProfileModal
        visible={isProfileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        darkMode={darkMode}
        showNotification={showNotification}
        onProfileUpdate={onProfileUpdate}
      />
      <div
        style={{
          display: isCollabModalOpen ? "flex" : "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: darkMode ? "#1e293b" : "#ffffff",
            padding: "2rem",
            borderRadius: "12px",
            border: `1px solid ${borderColor}`,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
            width: "100%",
            maxWidth: "400px",
            color: textColor,
          }}
        >
          <h2 style={{ margin: "0 0 1.5rem", fontWeight: 600, fontSize: "1.5rem" }}>Collaborate</h2>
          <button
            onClick={startCollaboration}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background: buttonGradient,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
              width: "100%",
              marginBottom: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = buttonHoverGradient;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = buttonGradient;
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label="Start new collaboration"
          >
            Start New Collaboration
          </button>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "8px",
              border: `1px solid ${borderColor}`,
              background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)",
              color: textColor,
              fontSize: "0.95rem",
              width: "100%",
              marginBottom: "1rem",
            }}
          />
          <button
            onClick={joinCollaboration}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background: buttonGradient,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
              width: "100%",
              marginBottom: "1rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = buttonHoverGradient;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = buttonGradient;
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label="Join collaboration"
          >
            Join Collaboration
          </button>
          <button
            onClick={() => setCollabModalOpen(false)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(90deg, #ef4444, #dc2626)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
              transition: "all 0.3s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(90deg, #dc2626, #b91c1c)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(90deg, #ef4444, #dc2626)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label="Close collaboration modal"
          >
            Close
          </button>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 1024px) {
          main {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
          }
          section:nth-child(1) {
            height: 60vh;
          }
          section:nth-child(2) {
            height: auto;
          }
        }
        @media (max-width: 768px) {
          div[style*="height: 100vh"] {
            padding: 1rem;
          }
          header div {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

export default App;