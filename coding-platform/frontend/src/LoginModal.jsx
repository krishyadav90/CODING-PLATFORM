import React, { useState } from "react";
import axios from "axios";

function LoginModal({ visible, onClose, onLogin, darkMode, showNotification }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!visible) return null;

  const handleLogin = async () => {
    console.log("handleLogin called", { email, password });
    if (!email || !password) {
      showNotification("Email and password are required", "error");
      return;
    }
    try {
      const response = await axios.post("/login", { email, password });
      onLogin(response.data.token);
      showNotification("Logged in successfully", "success");
      setEmail("");
      setPassword("");
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed";
      showNotification(errorMsg, "error");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease-out",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: darkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(12px)",
          color: darkMode ? "#e2e8f0" : "#1e293b",
          padding: "24px",
          borderRadius: "16px",
          width: "min(360px, 90vw)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
          border: `1px solid ${darkMode ? "#4b5e8c" : "#93c5fd"}`,
          display: "flex",
          flexDirection: "column",
          animation: "scaleIn 0.3s ease-out",
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontWeight: 600, fontSize: "1.5rem" }}>Login</h3>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: `1px solid ${darkMode ? "#4b5e8c" : "#93c5fd"}`,
            background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)",
            color: darkMode ? "#e2e8f0" : "#1e293b",
            outline: "none",
            fontSize: "0.95rem",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = darkMode ? "#3b82f6" : "#2563eb")}
          onBlur={(e) => (e.target.style.borderColor = darkMode ? "#4b5e8c" : "#93c5fd")}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "8px",
            border: `1px solid ${darkMode ? "#4b5e8c" : "#93c5fd"}`,
            background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)",
            color: darkMode ? "#e2e8f0" : "#1e293b",
            outline: "none",
            fontSize: "0.95rem",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = darkMode ? "#3b82f6" : "#2563eb")}
          onBlur={(e) => (e.target.style.borderColor = darkMode ? "#4b5e8c" : "#93c5fd")}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: darkMode ? "#e2e8f0" : "#1e293b",
              background: darkMode ? "rgba(51, 65, 85, 0.5)" : "rgba(203, 213, 225, 0.5)",
              border: `1px solid ${darkMode ? "#4b5e8c" : "#93c5fd"}`,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = darkMode
                ? "rgba(51, 65, 85, 0.8)"
                : "rgba(203, 213, 225, 0.8)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode
                ? "rgba(51, 65, 85, 0.5)"
                : "rgba(203, 213, 225, 0.5)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label="Cancel login"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            style={{
              padding: "10px 20px",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(90deg, #3b82f6, #a855f7)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(90deg, #2563eb, #9333ea)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(90deg, #3b82f6, #a855f7)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label="Login"
          >
            Login
          </button>
        </div>
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default LoginModal;
