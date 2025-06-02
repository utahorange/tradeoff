import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './UserProfile.css';
import Navbar from './Navbar';
import StockSearch from './StockSearch';
import { CgLogOut } from "react-icons/cg";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ setLoggedInUser }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfilePicture();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setLoggedInUser(null);
    };

    const fetchProfilePicture = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/profile-picture', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });
            const imageUrl = URL.createObjectURL(response.data);
            setProfilePicture(imageUrl);
        } catch (err) {
            console.error('Error fetching profile picture:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/profile-picture/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Profile picture updated successfully');
            fetchProfilePicture(); // Refresh the profile picture
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading profile picture');
        }
    };

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
            <Navbar />
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="search-container">
                        <StockSearch />
                    </div>
                    <div className="dashboard-topbar-icons">
                        <CgLogOut className="logout-icon" onClick={handleLogout} />
                        <FaUserCircle className="profile-icon" onClick={() => navigate('/profile')} />
                    </div>
                </header>

                <div className="profile-content">
                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}

                    <div className="profile-grid">
                        {/* Profile Picture Section */}
                        <div className="profile-card">
                            <h3>Profile Picture</h3>
                            <div className="profile-picture-container">
                                {loading ? (
                                    <div className="profile-picture-loading">Loading...</div>
                                ) : profilePicture ? (
                                    <img 
                                        src={profilePicture} 
                                        alt="Profile" 
                                        className="profile-picture"
                                    />
                                ) : (
                                    <FaUserCircle className="profile-icon" style={{ width: '100%', height: '100%' }} />
                                )}
                            </div>
                            <div className="profile-picture-upload">
                                <label htmlFor="profile-picture-input" className="upload-button">
                                    Upload New Picture
                                </label>
                                <input
                                    id="profile-picture-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Password Change Section */}
                        <div className="profile-card">
                            <h3>Change Password</h3>
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
                </div>
            </main>
        </div>
    );
};

export default UserProfile;
