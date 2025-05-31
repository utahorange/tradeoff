// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/home';
import Register from './components/register';
import Login from './components/login';
import StockStats from './components/StockStats';
import StockDetail from './components/StockDetail';
import Navbar from './components/Navbar';
import './App.css';

const PrivateRoute = ({ children, setLoggedInUser }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

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
            <div className="app">
                {loggedInUser && <Navbar setLoggedInUser={setLoggedInUser} />}
                <main className="main-content">
                    {loggedInUser ? (
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/stats" element={<StockStats />} />
                            <Route path="/stock/:symbol" element={<StockDetail />} />
                            <Route path="/*" element={<Navigate to="/" />} />
                        </Routes>
                    ) : (
                        <Routes>
                            <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser} />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/*" element={<Navigate to="/login" />} />
                        </Routes>
                    )}
                </main>
            </div>
        </Router>
    );
};

export default App;