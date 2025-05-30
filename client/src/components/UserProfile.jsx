import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/change-password', {
                currentPassword,
                newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setMessage('Password successfully updated');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating password');
        }
    };

    return (
        <div className="dashboard-root">
            <aside className="dashboard-sidebar">
                <Link to="/" className="sidebar-logo">TradeOff</Link>
                <nav className="sidebar-nav">
                    <div className="sidebar-section">Account</div>
                    <ul>
                        <li className="active">Profile Settings</li>
                        <li>Security</li>
                    </ul>
                </nav>
            </aside>
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <h2>Profile Settings</h2>
                </header>
                <div className="profile-container">
                    <div className="profile-section">
                        {message && <div className="success-message">{message}</div>}
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handlePasswordReset}>
                            <div className="form-group">
                                <label>Current Password:</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password:</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password:</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-btn">Update Password</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;
