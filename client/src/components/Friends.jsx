import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Input, Button, Avatar, Badge, message } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import './Dashboard.css';

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
        <div className="dashboard-root">
            <aside className="dashboard-sidebar">
                <div className="sidebar-logo">TradeOff</div>
                <nav className="sidebar-nav">
                    <div className="sidebar-section">Pages</div>
                    <ul>
                        <li onClick={() => navigate('/')}>Portfolio</li>
                        <li onClick={() => navigate('/stats')}>Stock Statistics</li>
                        <li className="active">Friends</li>
                        <li>Competitions</li>
                    </ul>
                </nav>
            </aside>
            <main className="dashboard-main">
                <div className="p-6 max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6 text-white">Friends</h1>
                    
                    {/* Search Section */}
                    <Card title="Find Friends" className="mb-6" style={{ background: '#23262f', borderColor: '#353945' }}>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search users by username"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onPressEnter={handleSearch}
                                style={{ background: '#181a20', borderColor: '#353945', color: '#fff' }}
                            />
                            <Button type="primary" onClick={handleSearch} loading={loading}>
                                Search
                            </Button>
                        </div>
                        
                        {searchResults.length > 0 && (
                            <div className="mt-4">
                                {searchResults.map(user => (
                                    <div key={user._id} className="flex items-center justify-between p-2 border-b border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Avatar icon={<UserOutlined />} />
                                            <span className="text-white">{user.username}</span>
                                        </div>
                                        <Button type="primary" onClick={() => handleSendRequest(user._id)}>
                                            Add Friend
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchTerm.length >= 2 && searchResults.length === 0 && !loading && (
                            <p className="text-center text-gray-400 mt-4">No users found</p>
                        )}
                    </Card>

                    {/* Friend Requests Section */}
                    {friendRequests.length > 0 && (
                        <Card 
                            title={
                                <div className="flex items-center gap-2 text-white">
                                    Friend Requests
                                    <Badge count={friendRequests.length} style={{ backgroundColor: '#52c41a' }} />
                                </div>
                            } 
                            className="mb-6"
                            style={{ background: '#23262f', borderColor: '#353945' }}
                        >
                            {friendRequests.map(request => (
                                <div key={request._id} className="flex items-center justify-between p-2 border-b border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Avatar icon={<UserOutlined />} />
                                        <span className="text-white">{request.sender.username}</span>
                                    </div>
                                    <div className="flex gap-2">
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
                    <Card 
                        title={<span className="text-white">My Friends ({friends.length})</span>}
                        style={{ background: '#23262f', borderColor: '#353945' }}
                    >
                        {friends.length === 0 ? (
                            <p className="text-center text-gray-400">You haven't added any friends yet</p>
                        ) : (
                            friends.map(friend => (
                                <div key={friend._id} className="flex items-center gap-2 p-2 border-b border-gray-700">
                                    <Avatar icon={<UserOutlined />} />
                                    <span className="text-white">{friend.username}</span>
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