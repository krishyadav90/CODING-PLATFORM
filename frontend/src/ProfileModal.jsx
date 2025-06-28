import React, { useState, useRef } from "react";
import axios from "axios";
import { PencilIcon } from "@heroicons/react/24/outline"; // Added for edit button

function ProfileModal({ visible, onClose, user, darkMode, showNotification, onProfileUpdate }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!visible) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        showNotification("Only JPEG and PNG images are allowed", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification("File size must be less than 5MB", "error");
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification("Please select an image to upload", "error");
      return;
    }

    const formData = new FormData();
    formData.append("profilePhoto", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/upload-profile-photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      showNotification("Profile photo uploaded successfully", "success");

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
      setPreviewImage(null);

      // Fetch updated user data
      const profileResponse = await axios.get("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      onProfileUpdate(profileResponse.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to upload profile photo";
      showNotification(errorMsg, "error");
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
        backgroundColor: darkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
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
          alignItems: "center",
          position: "relative", // For positioning the edit button
        }}
      >
        {/* Edit Button in Top-Right */}
        <button
          onClick={triggerFileInput}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "6px",
            backgroundColor: darkMode ? "#3b82f6" : "#60a5fa",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkMode ? "#2563eb" : "#3b82f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = darkMode ? "#3b82f6" : "#60a5fa";
          }}
          tabIndex={0}
          aria-label="Edit profile photo"
        >
          <PencilIcon style={{ width: "1.2rem", height: "1.2rem" }} />
        </button>

        <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Profile</h3>
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            overflow: "hidden",
            marginBottom: "15px",
            border: `2px solid ${darkMode ? "#4b5e8c" : "#93c5fd"}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: darkMode ? "#2d3748" : "#edf2f7",
          }}
        >
          {previewImage || user?.profilePhoto ? (
            <img
              src={previewImage || user.profilePhoto}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "1.5rem", color: darkMode ? "#a0aec0" : "#4a5568" }}>
              No Photo
            </span>
          )}
        </div>
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        {selectedFile && (
          <button
            onClick={handleUpload}
            style={{
              padding: "6px 14px",
              backgroundColor: darkMode ? "#3b82f6" : "#60a5fa",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
              marginBottom: "10px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? "#2563eb" : "#3b82f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? "#3b82f6" : "#60a5fa";
            }}
            tabIndex={0}
            aria-label="Upload profile photo"
          >
            Upload Photo
          </button>
        )}
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