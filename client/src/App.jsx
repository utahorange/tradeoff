// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Home from './components/home';
import Register from './components/register';
import Login from './components/login';
import StockStats from './components/StockStats';
import UserProfile from './components/UserProfile';
import { FaUserCircle } from 'react-icons/fa';
import StockDetail from './components/StockDetail';
import Friends from './components/Friends';
import Competitions from './components/competitions.jsx';

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
                        <nav className="main-nav">
                            <div className="nav-links">
                                <Link to="/">Home</Link>
                                <Link to="/stats">Portfolio Stats</Link>
                                <Link to="/friends">Friends</Link>
                                <Link to="/profile" className="profile-link">
                                    <FaUserCircle size={24} />
                                </Link>
                                <Link to="/competitions">Competitions</Link>
                            </div>
                        </nav>
                        <Routes>
                            <Route path="/" element={<Home setLoggedInUser={setLoggedInUser} />} />
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/stats" element={<StockStats setLoggedInUser={setLoggedInUser}/>} />
                            <Route path="/stock/:symbol" element={<StockDetail />} />
                            <Route path="/friends" element={<Friends />} />
                            <Route path="/stats" element={<StockStats />} />
                            <Route path="/competitions" element={<Competitions />} />
                            <Route path="/*" element={<Navigate to="/" />} />
                        </Routes>
                    </>
                ) : (
                    <Routes>
                        <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/*" element={<Navigate to="/login" />} />
                    </Routes>
                )}
            </div>
        </Router>
    );
};

export default App;