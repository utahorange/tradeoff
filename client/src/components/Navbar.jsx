import React from 'react';
import { useNavigate } from 'react-router-dom';
import StockSearch from './StockSearch';
import { IoMdSettings } from "react-icons/io";
import { CgLogOut } from "react-icons/cg";
import './Navbar.css';

const Navbar = ({ setLoggedInUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setLoggedInUser(null);
        navigate('/login');
    };

    return (
        <div className="navbar-container">
            {/* Sidebar */}
            <aside className="navbar-sidebar">
                <div className="sidebar-logo">TradeOff</div>
                <nav className="sidebar-nav">
                    <div className="sidebar-section">Pages</div>
                    <ul>
                        <li onClick={() => navigate('/')}>Portfolio</li>
                        <li onClick={() => navigate('/stats')}>Stock Statistics</li>
                        <li>Competitions</li>
                    </ul>
                </nav>
            </aside>

            {/* Top Bar */}
            <header className="navbar-topbar">
                <div className="topbar-icons">
                    <CgLogOut
                        className="logout-icon"
                        onClick={handleLogout}
                    />
                    <IoMdSettings
                        className="settings-icon"
                        onClick={() => {
                            console.log('Settings clicked');
                        }}
                    />
                </div>
            </header>
            <StockSearch />
        </div>
    );
};

export default Navbar; 