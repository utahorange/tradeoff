import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        <div className="app" data-theme="dark">
            <h1 className="login-title" style={{ textAlign: 'center', fontSize: '64px', fontWeight: 'bold', marginBottom: '2rem', marginTop: '1rem', color: 'white', letterSpacing: '1px' }}>Login</h1>
            <div className="container" style={{ boxShadow: '0 0 24px 2px #222', background: '#222', borderRadius: '16px', maxWidth: '420px' }}>
                {/* Divider */}
                {/* <div className="divider"><span>Or</span></div> */}
                <form onSubmit={onSubmit}>
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={onChange}
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={onChange}
                        required
                    />
                    <div className="remember" style={{ margin: '8px 0 0 0' }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            style={{ accentColor: '#a259e6' }}
                        />
                        <p style={{ color: 'white', fontWeight: 500, marginLeft: '8px' }}>Remember Me</p>
                    </div>
                    <button type="submit">Log In</button>
                </form>
                {message && <p className="message" style={{ color: message.includes('success') ? '#10b981' : '#ef4444' }}>{message}</p>}
                <div className="create" style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem', marginTop: '1rem', cursor: 'pointer' }} onClick={() => navigate('/register')}>
                    Create Account
                </div>
            </div>
            {/* Dark Theme Toggle */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>Dark Theme</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '48px', height: '28px', borderRadius: '16px', background: '#222', border: '2px solid #a259e6', display: 'flex', alignItems: 'center', justifyContent: rememberMe ? 'flex-end' : 'flex-start', padding: '2px', transition: 'all 0.3s' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: rememberMe ? '#a259e6' : '#fff', transition: 'all 0.3s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
