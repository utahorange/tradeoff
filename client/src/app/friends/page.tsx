'use client';

import { useState, useEffect } from 'react';
import { friendService, User, FriendRequest } from '../services/friendService';
import { Card, Input, Button, Avatar, Badge, message } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ChangeEvent } from 'react';

export default function FriendsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFriendRequests();
        loadFriends();
    }, []);

    const loadFriendRequests = async () => {
        try {
            const requests = await friendService.getPendingRequests();
            setFriendRequests(requests);
        } catch (error) {
            message.error('Failed to load friend requests');
        }
    };

    const loadFriends = async () => {
        try {
            const friendsList = await friendService.getFriends();
            setFriends(friendsList);
        } catch (error) {
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
            const results = await friendService.searchUsers(searchTerm);
            setSearchResults(results);
        } catch (error) {
            message.error('Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (userId: string) => {
        try {
            await friendService.sendFriendRequest(userId);
            message.success('Friend request sent successfully');
            setSearchResults(searchResults.filter(user => user._id !== userId));
        } catch (error) {
            message.error('Failed to send friend request');
        }
    };

    const handleRespondToRequest = async (requestId: string, accept: boolean) => {
        try {
            await friendService.respondToRequest(requestId, accept);
            message.success(`Friend request ${accept ? 'accepted' : 'rejected'}`);
            if (accept) {
                loadFriends();
            }
            loadFriendRequests();
        } catch (error) {
            message.error('Failed to respond to friend request');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Friends</h1>
            
            {/* Search Section */}
            <Card title="Find Friends" className="mb-6">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search users by username"
                        value={searchTerm}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Button type="primary" onClick={handleSearch} loading={loading}>
                        Search
                    </Button>
                </div>
                
                {searchResults.length > 0 && (
                    <div className="mt-4">
                        {searchResults.map(user => (
                            <div key={user._id} className="flex items-center justify-between p-2 border-b">
                                <div className="flex items-center gap-2">
                                    <Avatar icon={<UserOutlined />} />
                                    <span>{user.username}</span>
                                </div>
                                <Button type="primary" onClick={() => handleSendRequest(user._id)}>
                                    Add Friend
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Friend Requests Section */}
            {friendRequests.length > 0 && (
                <Card title={
                    <div className="flex items-center gap-2">
                        Friend Requests
                        <Badge count={friendRequests.length} style={{ backgroundColor: '#52c41a' }} />
                    </div>
                } className="mb-6">
                    {friendRequests.map(request => (
                        <div key={request._id} className="flex items-center justify-between p-2 border-b">
                            <div className="flex items-center gap-2">
                                <Avatar icon={<UserOutlined />} />
                                <span>{request.sender.username}</span>
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
            <Card title={`My Friends (${friends.length})`}>
                {friends.length === 0 ? (
                    <p className="text-center text-gray-500">You haven't added any friends yet</p>
                ) : (
                    friends.map(friend => (
                        <div key={friend._id} className="flex items-center gap-2 p-2 border-b">
                            <Avatar icon={<UserOutlined />} />
                            <span>{friend.username}</span>
                        </div>
                    ))
                )}
            </Card>
        </div>
    );
} 