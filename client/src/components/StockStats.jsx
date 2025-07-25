import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StockStats.css';
import { CgLogOut } from "react-icons/cg";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useParams } from 'react-router-dom';
import StockSearch from './StockSearch';
import Navbar from './Navbar';

const StockStats = ({ setLoggedInUser }) => {
    const navigate = useNavigate();
    const { username } = useParams();
    const [portfolioData, setPortfolioData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setLoggedInUser(null);
    };

    useEffect(() => {
        let isMounted = true;
        
        const fetchPortfolioData = async () => {
            if (!isMounted) return;
            
            try {
                const token = localStorage.getItem('token');
                const currentUsername = localStorage.getItem('username');
                
                // If no username in URL or if username matches current user, use current-value endpoint
                const endpoint = (!username || username === currentUsername)
                    ? 'http://localhost:8080/api/portfolio/current-value'
                    : `http://localhost:8080/api/portfolio/${username}/current-value`;
                
                const response = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (isMounted) {
                    setPortfolioData(response.data);
                    setViewingUser(username || currentUsername);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Failed to fetch portfolio data');
                    setLoading(false);
                }
            }
        };

        fetchPortfolioData();
        
        // Refresh data every 5 minutes if viewing own portfolio
        let interval;
        if (!username || username === localStorage.getItem('username')) {
            interval = setInterval(fetchPortfolioData, 300000);
        }
        
        return () => {
            isMounted = false;
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [username]);

    const displayData = portfolioData || {
        totalValue: 0,
        cashBalance: 0,
        holdings: []
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading portfolio data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="dashboard-root">
            <Navbar />
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="search-container">
                        <StockSearch />
                    </div>
                    <div className="dashboard-topbar-icons">
                        <CgLogOut 
                            className="logout-icon" 
                            onClick={handleLogout}
                        />
                        <div className="user-profile-container" onClick={() => {navigate('/profile');}}>
                            <FaUserCircle className="profile-icon"/>
                            <h2 className="username">{localStorage.getItem('username')}</h2>
                        </div>
                    </div>
                </header>
                <div className="portfolio-summary">
                    <h2>{viewingUser === localStorage.getItem('username') ? 'My Portfolio Summary' : `${viewingUser}'s Portfolio Summary`}</h2>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3>Total Value</h3>
                            <p className="value">${displayData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="summary-card">
                            <h3>Cash Balance</h3>
                            <p className="value">${displayData.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
                <h2>Your Holdings</h2>
                <div className="holdings-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Shares</th>
                                <th>Avg. Cost</th>
                                <th>Current Price</th>
                                <th>Total Value</th>
                                <th>Total Return</th>
                                <th>Return %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData.holdings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-portfolio-message">
                                        Your portfolio is empty. Start investing by buying some stocks!
                                    </td>
                                </tr>
                            ) : (
                                displayData.holdings.map((holding) => (
                                    <tr key={holding.symbol}>
                                        <td className="symbol">{holding.symbol}</td>
                                        <td>{holding.quantity}</td>
                                        <td>${holding.purchasePrice.toFixed(2)}</td>
                                        <td>${holding.currentPrice.toFixed(2)}</td>
                                        <td>${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className={holding.change >= 0 ? 'positive' : 'negative'}>
                                            ${((holding.currentPrice - holding.purchasePrice) * holding.quantity).toFixed(2)}
                                        </td>
                                        <td className={holding.change >= 0 ? 'positive' : 'negative'}>
                                            {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <>
                    <h2>Portfolio Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Return</h3>
                            <p className={displayData.totalValue - displayData.cashBalance >= 0 ? 'positive' : 'negative'}>
                                ${(displayData.totalValue - displayData.cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Return %</h3>
                            <p className={displayData.totalValue - displayData.cashBalance >= 0 ? 'positive' : 'negative'}>
                                {((displayData.totalValue - displayData.cashBalance) / displayData.cashBalance * 100).toFixed(2)}%
                            </p>
                        </div>
                        <div className="stat-card">
                            <h3>Number of Positions</h3>
                            <p className={displayData.holdings.length > 0 ? 'positive' : 'negative'}>
                                {displayData.holdings.length}
                            </p>
                        </div>
                    </div>
                </>
            </main>
        </div>
    );
};

export default StockStats; 