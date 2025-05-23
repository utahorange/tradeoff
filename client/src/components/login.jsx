import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setLoggedInUser }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.user.username);
            setLoggedInUser(res.data.user.username);
            setMessage('Login successful!');
            navigate('/'); // Redirect to home
        } catch (err) {
            setMessage(
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Login failed. Please try again.'
            );
        }
    };

    return (
        <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
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
                <button type="submit">Login</button>
            </form>
            <p className="message">{message}</p>
        </div>
    );
};

export default Login;
