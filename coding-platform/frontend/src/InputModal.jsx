import React, { useState } from "react";

function InputModal({ visible, onClose, onSubmit, darkMode }) {
  const [tempInput, setTempInput] = useState("");

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
            }}
            tabIndex={0}
            aria-label="Cancel input"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(tempInput);
              onClose();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSubmit(tempInput);
                onClose();
              }
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
            tabIndex={0}
            aria-label="Submit input"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputModal;