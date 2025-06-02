import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/register', formData);
            navigate('/login'); // Redirect immediately after successful registration
        } catch (err) {
            console.error('Registration error:', err);
        }
    };

    return (
        <div className="auth-wrapper">
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
                <p className="create-account">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
