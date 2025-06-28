import React, { useState } from "react";
import axios from 'axios';

function RegisterModal({ visible, onClose, onRegister, darkMode, showNotification }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!visible) return null;

    const handleRegister = async () => {
        console.log('handleRegister called:', { username, email, password });
        if (!username || !email || !password) {
            showNotification('All fields are required', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showNotification('Invalid email format', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        try {
            const response = await axios.post('/register', { username, email, password });
            onRegister(response.data.token);
            showNotification('Registered successfully', 'success');
            setUsername('');
            setEmail('');
            setPassword('');
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Registration failed';
            showNotification(errorMsg, 'error');
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                animation: 'fadeIn 0.3s ease-out',
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: darkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(12px)',
                    color: darkMode ? '#e2e8f0' : '#1e293b',
                    padding: '24px',
                    borderRadius: '16px',
                    width: 'min(360px, 90vw)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${darkMode ? '#4b5e8c' : '#93c5fd'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'scaleIn 0.3s ease-out',
                }}
            >
                <h3 style={{ margin: '0 0 16px', fontWeight: 600, fontSize: '1.5rem' }}>Register</h3>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        padding: '12px',
                        marginBottom: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${darkMode ? '#4b5e8c' : '#93c5fd'}`,
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                        color: darkMode ? '#e2e8f0' : '#1e293b',
                        outline: 'none',
                        fontSize: '0.95rem',
                        transition: 'border-color 0.3s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = darkMode ? '#3b82f6' : '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = darkMode ? '#4b5e8c' : '#93c5fd')}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        padding: '12px',
                        marginBottom: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${darkMode ? '#4b5e8c' : '#93c5fd'}`,
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                        color: darkMode ? '#e2e8f0' : '#1e293b',
                        outline: 'none',
                        fontSize: '0.95rem',
                        transition: 'border-color 0.3s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = darkMode ? '#3b82f6' : '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = darkMode ? '#4b5e8c' : '#93c5fd')}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        padding: '12px',
                        marginBottom: '16px',
                        borderRadius: '8px',
                        border: `1px solid ${darkMode ? '#4b5e8c' : '#93c5fd'}`,
                        background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                        color: darkMode ? '#e2e8f0' : '#1e293b',
                        outline: 'none',
                        fontSize: '0.95rem',
                        transition: 'border-color 0.3s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = darkMode ? '#3b82f6' : '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = darkMode ? '#4b5e8c' : '#93c5fd')}
                />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: darkMode ? '#e2e8f0' : '#1e293b',
                            background: darkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(203, 213, 225, 0.5)',
                            border: `1px solid ${darkMode ? '#4b5e8c' : '#93c5fd'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(203, 213, 225, 0.8)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = darkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(203, 213, 225, 0.5)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        tabIndex={0}
                        aria-label="Cancel registration"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRegister}
                        style={{
                            padding: '10px 20px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: '#fff',
                            background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #9333ea)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6, #a855f7)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        tabIndex={0}
                        aria-label="Register"
                    >
                        Register
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

export default RegisterModal;
