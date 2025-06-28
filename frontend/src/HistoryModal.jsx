import React from "react";

function HistoryModal({
  visible,
  onClose,
  snippets,
  darkMode,
  onSelectSnippet,
  page,
  setPage,
  totalPages,
  onDeleteSnippet,
  showNotification,
}) {
  if (!visible) return null;

  console.log("HistoryModal Render:", { page, totalPages, snippetCount: snippets?.length || 0, snippets });

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
          background: darkMode ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(12px)",
          color: darkMode ? "#e2e8f0" : "#1e293b",
          padding: "24px",
          borderRadius: "16px",
          width: "min(560px, 90vw)",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
          border: `1px solid ${darkMode ? "#4b5e8c" : "#93c5fd"}`,
          display: "flex",
          flexDirection: "column",
          animation: "scaleIn 0.3s ease-out",
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontWeight: 600, fontSize: "1.5rem" }}>Code History</h3>

        {!snippets || snippets.length === 0 ? (
          <p
            style={{
              padding: "12px",
              background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)",
              borderRadius: "8px",
              color: darkMode ? "#e2e8f0" : "#1e293b",
              textAlign: "center",
              fontSize: "0.95rem",
            }}
          >
            No saved snippets. Save a snippet to view it here.
          </p>
        ) : (
          snippets.map((snippet) => (
            <div
              key={snippet._id}
              style={{
                padding: "12px",
                border: `1px solid ${darkMode ? "#4b5e8c" : "#93c5fd"}`,
                borderRadius: "8px",
                marginBottom: "12px",
                cursor: "pointer",
                position: "relative",
                background: darkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onClick={() => onSelectSnippet(snippet)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(59, 130, 246, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectSnippet(snippet);
                }
              }}
              role="button"
              aria-label={`Select snippet ${snippet.title}`}
            >
              <strong style={{ color: darkMode ? "#e2e8f0" : "#1e293b", fontWeight: 600 }}>
                {snippet.title}
              </strong>{" "}
              ({snippet.language})
              <br />
              <small style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                {new Date(snippet.createdAt).toLocaleString()}
              </small>
              <pre
                style={{
                  margin: "8px 0",
                  fontSize: "0.9rem",
                  color: darkMode ? "#cbd5e1" : "#475569",
                  whiteSpace: "pre-wrap",
                }}
              >
                {snippet.code.substring(0, 100) + (snippet.code.length > 100 ? "..." : "")}
              </pre>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSnippet(snippet._id);
                }}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  padding: "6px 12px",
                  background: "linear-gradient(90deg, #ef4444, #dc2626)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                  transition: "all 0.3s ease",
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
                aria-label={`Delete snippet ${snippet.title}`}
              >
                Delete
              </button>
            </div>
          ))
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              style={{
                padding: "10px 20px",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#fff",
                background: page === 1
                  ? (darkMode ? "rgba(51, 65, 85, 0.5)" : "rgba(203, 213, 225, 0.5)")
                  : "linear-gradient(90deg, #3b82f6, #a855f7)",
                border: "none",
                borderRadius: "8px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                boxShadow: page !== 1 ? "0 4px 15px rgba(59, 130, 246, 0.4)" : "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (page !== 1) {
                  e.currentTarget.style.background = "linear-gradient(90deg, #2563eb, #9333ea)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== 1) {
                  e.currentTarget.style.background = "linear-gradient(90deg, #3b82f6, #a855f7)";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
              tabIndex={0}
              aria-label="Previous page"
            >
              Previous
            </button>

            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages}
              style={{
                padding: "10px 20px",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#fff",
                background: page >= totalPages
                  ? (darkMode ? "rgba(51, 65, 85, 0.5)" : "rgba(203, 213, 225, 0.5)")
                  : "linear-gradient(90deg, #3b82f6, #a855f7)",
                border: "none",
                borderRadius: "8px",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                boxShadow: page < totalPages ? "0 4px 15px rgba(59, 130, 246, 0.4)" : "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (page < totalPages) {
                  e.currentTarget.style.background = "linear-gradient(90deg, #2563eb, #9333ea)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (page < totalPages) {
                  e.currentTarget.style.background = "linear-gradient(90deg, #3b82f6, #a855f7)";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
              tabIndex={0}
              aria-label="Next page"
            >
              Next
            </button>
          </div>

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
              e.currentTarget.style.background = darkMode ? "rgba(51, 65, 85, 0.8)" : "rgba(203, 213, 225, 0.8)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? "rgba(51, 65, 85, 0.5)" : "rgba(203, 213, 225, 0.5)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            tabIndex={0}
            aria-label="Close history"
          >
            Close
          </button>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default HistoryModal;
