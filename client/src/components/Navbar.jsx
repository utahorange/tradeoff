import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    return (
        <aside className="dashboard-sidebar">
            <div 
                className="sidebar-logo"
                onClick={() => navigate('/')}
            >
                TradeOff
            </div>
            <nav className="sidebar-nav">
                <div className="sidebar-section">Pages</div>
                <ul>
                    <li 
                        className={isActivePath('/') ? 'active' : ''} 
                        onClick={() => navigate('/')}
                    >
                        Portfolio
                    </li>
                    <li 
                        className={isActivePath('/stats') ? 'active' : ''} 
                        onClick={() => navigate('/stats')}
                    >
                        Stock Statistics
                    </li>
                    <li 
                        className={isActivePath('/competitions') ? 'active' : ''} 
                        onClick={() => navigate('/competitions')}
                    >
                        Competitions
                    </li>
                    <li 
                        className={isActivePath('/friends') ? 'active' : ''} 
                        onClick={() => navigate('/friends')}
                    >
                        Friends
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Navbar; 