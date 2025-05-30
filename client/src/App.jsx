// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Home from './components/home';
import Register from './components/register';
import Login from './components/login';

const App = () => {
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        // Check for token in localStorage on mount
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (token && username) {
            setLoggedInUser(username);
        }
    }, []);

    return (
        <Router>
            <div className="App">
                {loggedInUser ? (
                    <>
                        <Routes>
                            <Route path="/*" element={<Home setLoggedInUser={setLoggedInUser} />} />
                        </Routes>
                    </>
                ) : (
                    <>
                        <nav>
                            <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
                        </nav>
                        <Routes>
                            <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser} />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/*" element={<Navigate to="/login" />} />
                        </Routes>
                    </>
                )}
            </div>
        </Router>
    );
};

export default App;