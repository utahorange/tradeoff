import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface User {
    _id: string;
    username: string;
}

export interface FriendRequest {
    _id: string;
    sender: User;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export const friendService = {
    searchUsers: async (username: string): Promise<User[]> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/users/search`, {
            params: { username },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.users;
    },

    sendFriendRequest: async (receiverId: string): Promise<void> => {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/friends/request`, 
            { receiverId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    },

    getPendingRequests: async (): Promise<FriendRequest[]> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/friends/requests`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.requests;
    },

    respondToRequest: async (requestId: string, accept: boolean): Promise<void> => {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/friends/respond`,
            { requestId, accept },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    },

    getFriends: async (): Promise<User[]> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/friends`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.friends;
    }
}; 