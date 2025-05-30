import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = ({ setLoggedInUser }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
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
            navigate('/');
        } catch (err) {
            setMessage(
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Login failed. Please try again.'
            );
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={onChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={onChange}
                    required
                />
                <div className="remember">
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="rememberMe">Remember Me</label>
                </div>
                <button type="submit">Log In</button>
            </form>
            {message && (
                <p className={`message ${message.includes('success') ? 'success-message' : 'error-message'}`}>
                    {message}
                </p>
            )}
            <p className="create-account">
                Don't have an account? <Link to="/register">Create Account</Link>
            </p>
            </div>
        </div>
    );
};

export default Login;
