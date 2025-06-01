import React from "react";

function ProfileModal({ visible, onClose, user, darkMode }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
          boxShadow: darkMode ? "0 2px 10px rgba(0,0,0,0.8)" : "0 2px 10px rgba(0,0,0,0.3)",
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
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClose();
            }
          }}
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
          tabIndex={0}
          aria-label="Close profile"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ProfileModal;