import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StockStats.css';
import { IoMdSettings } from "react-icons/io";
import { CgLogOut } from "react-icons/cg";
import { useNavigate } from 'react-router-dom';

const StockStats = ({ setLoggedInUser }) => {
    const [portfolioData, setPortfolioData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setLoggedInUser(null);
    };

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/portfolio/current-value', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log(response.data)
                setPortfolioData(response.data);
                console.log(portfolioData)
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch portfolio data');
                setLoading(false);
            }
        };

        fetchPortfolioData();
        // Refresh data every 5 minutes
        const interval = setInterval(fetchPortfolioData, 300000);
        return () => clearInterval(interval);
    }, []);

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

    if (!portfolioData || !portfolioData.holdings.length) {
        return (
            <div className="empty-portfolio">
                <h2>Your Portfolio is Empty</h2>
                <p>Start investing by buying some stocks!</p>
            </div>
        );
    }

    return (
        <div className="dashboard-root">
            <aside className="dashboard-sidebar">
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
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <input className="dashboard-search" placeholder="Search..." />
                    <div className="dashboard-topbar-icons">
                        <CgLogOut className="logout-icon" onClick={handleLogout} />
                        <IoMdSettings className="settings-icon" />
                    </div>
                </header>
                <div className="portfolio-summary">
                    <h2>Portfolio Summary</h2>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3>Total Value</h3>
                            <p className="value">${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="summary-card">
                            <h3>Cash Balance</h3>
                            <p className="value">${portfolioData.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                            {portfolioData.holdings.map((holding) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="portfolio-stats">
                    <h2>Portfolio Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Return</h3>
                            <p className={portfolioData.totalValue - portfolioData.cashBalance >= 0 ? 'positive' : 'negative'}>
                                ${(portfolioData.totalValue - portfolioData.cashBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Return %</h3>
                            <p className={portfolioData.totalValue - portfolioData.cashBalance >= 0 ? 'positive' : 'negative'}>
                                {((portfolioData.totalValue - portfolioData.cashBalance) / portfolioData.cashBalance * 100).toFixed(2)}%
                            </p>
                        </div>
                        <div className="stat-card">
                            <h3>Number of Positions</h3>
                            <p className={portfolioData.holdings.length > 0 ? 'positive' : 'negative'}>
                                {portfolioData.holdings.length}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <aside className="dashboard-rightbar">
                <div className="rightbar-section">
                    <h4>Notifications</h4>
                    <ul>
                        <li>You have a new friend request</li>
                        <li>New user registered</li>
                        <li>Random Notification</li>
                    </ul>
                </div>
                <div className="rightbar-section">
                    <h4>Friends</h4>
                    <ul>
                        <li>Spandaddy</li>
                        <li>JZ Washington</li>
                        <li>teshy</li>
                        <li>taiGoat</li>
                        <li>deSchlong</li>
                    </ul>
                </div>
            </aside>
        </div>
    );
};

export default StockStats; 