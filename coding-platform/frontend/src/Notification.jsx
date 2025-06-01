import React, { useEffect } from "react";

function Notification({ message, type, onClose }) {
  console.log("Notification render:", { message, type });

  useEffect(() => {
    if (message) {
      console.log("Setting notification timeout");
      const timer = setTimeout(onClose, 3000);
      return () => {
        console.log("Clearing notification timeout");
        clearTimeout(timer);
      };
    }
  }, [message, onClose]);

  if (!message) {
    console.log("Notification not rendered: no message");
    return null;
  }

  const bgColor = type === "success" ? "rgba(34, 197, 94, 0.2)" : type === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)";
  const borderColor = type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#3b82f6";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: bgColor,
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
        border: `1px solid ${borderColor}`,
        backdropFilter: "blur(10px)",
        zIndex: 2000,
        fontSize: "0.95rem",
        maxWidth: "320px",
        animation: "slideIn 0.4s ease-out, fadeOut 0.4s ease-in 2.6s forwards",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
      role="alert"
      aria-live="assertive"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontSize: "1.2rem",
          fontWeight: 600,
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        aria-label="Close notification"
        tabIndex={0}
      >
        ×
      </button>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          width: "100%",
          background: borderColor,
          animation: "progress 3s linear forwards",
        }}
      />
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          to { opacity: 0; }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0; }
        }
      `}</style>
    </div>
  );
}

export default Notification;