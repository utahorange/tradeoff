    import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Input, Button, Avatar, Badge, message } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import Navbar from './Navbar';
import './Friends.css';

const API_URL = 'http://localhost:8080/api';

const Friends = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFriendRequests();
        loadFriends();
    }, []);

    const loadFriendRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/friends/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFriendRequests(response.data.requests);
        } catch (error) {
            console.error('Load friend requests error:', error.response?.data || error.message);
            message.error('Failed to load friend requests');
        }
    };

    const loadFriends = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/friends`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFriends(response.data.friends);
        } catch (error) {
            console.error('Load friends error:', error.response?.data || error.message);
            message.error('Failed to load friends list');
        }
    };

    const handleSearch = async () => {
        if (searchTerm.length < 2) {
            message.warning('Please enter at least 2 characters');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('You must be logged in to search users');
                return;
            }
            console.log('Making search request with token:', token);
            console.log('Search term:', searchTerm);
            const response = await axios.get(`${API_URL}/users/search`, {
                params: { username: searchTerm },
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Search response:', response.data);
            if (response.data.users && Array.isArray(response.data.users)) {
                setSearchResults(response.data.users);
            } else {
                console.error('Unexpected response format:', response.data);
                message.error('Received invalid response format from server');
            }
        } catch (error) {
            console.error('Search users error:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                message.error('Please log in again');
            } else {
                message.error('Failed to search users: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/friends/request`,
                { receiverId: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success('Friend request sent successfully');
            setSearchResults(searchResults.filter(user => user._id !== userId));
        } catch (error) {
            console.error('Send friend request error:', error.response?.data || error.message);
            message.error('Failed to send friend request');
        }
    };

    const handleRespondToRequest = async (requestId, accept) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/friends/respond`,
                { requestId, accept },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success(`Friend request ${accept ? 'accepted' : 'rejected'}`);
            if (accept) {
                loadFriends();
            }
            loadFriendRequests();
        } catch (error) {
            console.error('Respond to request error:', error.response?.data || error.message);
            message.error('Failed to respond to friend request');
        }
    };

    return (
        <div className="friends-container">
            <Navbar />
            <main className="friends-main">
                <div className="friends-content">
                    <h1 className="friends-title">Friends</h1>
                    
                    {/* Search Section */}
                    <Card title="Find Friends" className="friends-card">
                        <div className="search-container">
                            <Input
                                placeholder="Search users by username"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onPressEnter={handleSearch}
                            />
                            <Button type="primary" onClick={handleSearch} loading={loading}>
                                Search
                            </Button>
                        </div>
                        
                        {searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map(user => (
                                    <div key={user._id} className="friend-item">
                                        <div className="friend-info">
                                            <Avatar icon={<UserOutlined />} />
                                            <span className="friend-username">{user.username}</span>
                                        </div>
                                        <Button type="primary" onClick={() => handleSendRequest(user._id)}>
                                            Add Friend
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchTerm.length >= 2 && searchResults.length === 0 && !loading && (
                            <div className="empty-state">No users found</div>
                        )}
                    </Card>

                    {/* Friend Requests Section */}
                    {friendRequests.length > 0 && (
                        <Card 
                            title={
                                <div className="friend-requests-header">
                                    Friend Requests
                                    <Badge 
                                        count={friendRequests.length} 
                                        style={{ boxShadow: 'none', background: 'none'}}
                                    />
                                </div>
                            } 
                            className="friends-card"
                        >
                            {friendRequests.map(request => (
                                <div key={request._id} className="friend-item">
                                    <div className="friend-info">
                                        <Avatar icon={<UserOutlined />} />
                                        <span className="friend-username">{request.sender.username}</span>
                                    </div>
                                    <div className="friend-actions">
                                        <Button
                                            type="primary"
                                            icon={<CheckOutlined />}
                                            onClick={() => handleRespondToRequest(request._id, true)}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => handleRespondToRequest(request._id, false)}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    )}

                    {/* Friends List Section */}
                    <Card title="My Friends" className="friends-card">
                        {friends.length === 0 ? (
                            <div className="empty-state">You haven't added any friends yet</div>
                        ) : (
                            friends.map(friend => (
                                <div key={friend._id} className="friend-item">
                                    <div className="friend-info">
                                        <Avatar icon={<UserOutlined />} />
                                        <span className="friend-username">{friend.username}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default Friends; 