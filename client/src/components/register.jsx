import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/register', formData);
            setMessage('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500); // Redirect after 1.5s
        } catch (err) {
            setMessage(
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Registration failed. Please try again.'
            );
        }
    };

    return (
        <div className="auth-form">
            <h2>Register</h2>
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={formData.username}
                    onChange={onChange}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    required
                />
                <button type="submit">Register</button>
            </form>
            <p className={`message ${message.includes('successful') ? 'success-message' : 'error-message'}`}>
                {message}
            </p>
        </div>
    );
};

export default Register;
