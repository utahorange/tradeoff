import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StockDetail.css';
import StockSearch from './StockSearch';
import { CgLogOut } from "react-icons/cg";
import { FaUserCircle } from "react-icons/fa";
import Navbar from './Navbar';

const StockDetail = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [buyError, setBuyError] = useState('');
    const [buySuccess, setBuySuccess] = useState('');
    const [userHoldings, setUserHoldings] = useState(0);
    const [sellQuantity, setSellQuantity] = useState(1);
    const [sellError, setSellError] = useState('');
    const [sellSuccess, setSellSuccess] = useState('');

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log(`http://localhost:8080/api/${symbol}`);
                const response = await axios.get(`http://localhost:8080/api/stocks/${symbol}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setStockData(response.data);
            } catch (err) {
                console.error('Error fetching stock data:', err);
                setError('Failed to fetch stock data');
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, [symbol]);

    useEffect(() => {
        const fetchUserHoldings = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/holdings', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const holdings = response.data.holdings;
                const stockHolding = holdings.reduce((total, holding) => {
                    if (holding.stockSymbol === symbol) {
                        return total + holding.stockQuantity;
                    }
                    return total;
                }, 0);
                setUserHoldings(stockHolding);
            } catch (err) {
                console.error('Error fetching holdings:', err);
            }
        };

        fetchUserHoldings();
    }, [symbol]);

    const handleBuyStock = async (e) => {
        e.preventDefault();
        setBuyError('');
        setBuySuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/holdings', {
                stockSymbol: symbol,
                stockPrice: stockData.price,
                stockQuantity: quantity,
                action: 'buy'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setBuySuccess('Successfully bought stocks!');
            //reroute to the home page
            navigate('/');
            setQuantity(1);
        } catch (err) {
            console.error('Error buying stock:', err);
            setBuyError(err.response?.data?.message || 'Failed to buy stock');
        }
    };

    const handleSellStock = async (e) => {
        e.preventDefault();
        setSellError('');
        setSellSuccess('');

        if (sellQuantity > userHoldings) {
            setSellError(`Insufficient shares. You only have ${userHoldings} shares available.`);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/holdings', {
                stockSymbol: symbol,
                stockPrice: stockData.price,
                stockQuantity: sellQuantity,
                action: 'sell'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSellSuccess('Successfully sold stocks!');
            navigate('/');
            setSellQuantity(1);
        } catch (err) {
            console.error('Error selling stock:', err);
            setSellError(err.response?.data?.message || 'Failed to sell stock');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        // You'll need to pass setLoggedInUser as a prop if you want to implement logout here
    };

    if (loading) {
        return (
            <div className="dashboard-root">
                <Navbar />
                <main className="dashboard-main">
                    <header className="dashboard-topbar">
                        <div className="search-container">
                            <StockSearch />
                        </div>
                        <div className="dashboard-topbar-icons">
                            <CgLogOut className="logout-icon" onClick={handleLogout} />
                            <FaUserCircle className="profile-icon" onClick={() => navigate('/profile')} />
                        </div>
                    </header>
                    <div className="loading">Loading stock data...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-root">
                <Navbar />
                <main className="dashboard-main">
                    <header className="dashboard-topbar">
                        <div className="search-container">
                            <StockSearch />
                        </div>
                        <div className="dashboard-topbar-icons">
                            <CgLogOut className="logout-icon" onClick={handleLogout} />
                            <FaUserCircle className="profile-icon" onClick={() => navigate('/profile')} />
                        </div>
                    </header>
                    <div className="error">{error}</div>
                </main>
            </div>
        );
    }

    if (!stockData) {
        return (
            <div className="dashboard-root">
                <Navbar />
                <main className="dashboard-main">
                    <header className="dashboard-topbar">
                        <div className="search-container">
                            <StockSearch />
                        </div>
                        <div className="dashboard-topbar-icons">
                            <CgLogOut className="logout-icon" onClick={handleLogout} />
                            <FaUserCircle className="profile-icon" onClick={() => navigate('/profile')} />
                        </div>
                    </header>
                    <div className="error">No data available for this stock</div>
                </main>
            </div>
        );
    }

    const totalCost = (stockData.price * quantity).toFixed(2);

    return (
        <div className="dashboard-root">
            <Navbar />
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="search-container">
                        <StockSearch />
                    </div>
                    <div className="dashboard-topbar-icons">
                        <CgLogOut className="logout-icon" onClick={handleLogout} />
                        <FaUserCircle className="profile-icon" onClick={() => navigate('/profile')} />
                    </div>
                </header>
                <div className="stock-content">
                    <div className="stock-header">
                        <h1>{stockData.symbol}</h1>
                        <h2>{stockData.description}</h2>
                    </div>

                    <div className="stock-price-section">
                        <div className="current-price">
                            <span className="price-label">Current Price</span>
                            <span className="price-value">${stockData.price.toFixed(2)}</span>
                        </div>
                        <div className="price-change">
                            <span className={`change-value ${stockData.change >= 0 ? 'positive' : 'negative'}`}>
                                {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)}%
                            </span>
                        </div>
                    </div>

                    <div className="stock-details-grid">
                        <div className="detail-card">
                            <h3>Market Cap</h3>
                            <p>${stockData.marketCap.toLocaleString()}</p>
                        </div>
                        <div className="detail-card">
                            <h3>Volume</h3>
                            <p>{stockData.volume.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="trading-sections">
                        <div className="buy-stock-section">
                            <h3>Buy {stockData.symbol}</h3>
                            <form onSubmit={handleBuyStock}>
                                <div className="form-group">
                                    <label htmlFor="buyQuantity">Quantity:</label>
                                    <input
                                        type="number"
                                        id="buyQuantity"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setQuantity('');
                                            } else {
                                                const num = parseInt(val);
                                                if (!isNaN(num)) {
                                                    setQuantity(num);
                                                }
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (quantity === '' || quantity < 1) {
                                                setQuantity(1);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="total-cost">
                                    Total Cost: ${(stockData.price * quantity).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </div>
                                {buyError && <div className="error-message">{buyError}</div>}
                                {buySuccess && <div className="success-message">{buySuccess}</div>}
                                <button type="submit" className="buy-button">Buy Stock</button>
                            </form>
                        </div>

                        <div className="sell-stock-section">
                            <h3>Sell {stockData.symbol}</h3>
                            <form onSubmit={handleSellStock}>
                                <div className="form-group">
                                    <label htmlFor="sellQuantity">Quantity (Own: {userHoldings}):</label>
                                    <input
                                        type="number"
                                        id="sellQuantity"
                                        min="1"
                                        max={userHoldings}
                                        value={sellQuantity}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '') {
                                                setSellQuantity('');
                                            } else {
                                                const num = parseInt(val);
                                                if (!isNaN(num)) {
                                                    setSellQuantity(num);
                                                }
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (sellQuantity === '' || sellQuantity < 1) {
                                                setSellQuantity(1);
                                            }
                                        }}
                                        disabled={userHoldings === 0}
                                    />
                                </div>
                                <div className="total-value">
                                    Total Value: ${(stockData.price * sellQuantity).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </div>
                                {sellError && <div className="error-message">{sellError}</div>}
                                {sellSuccess && <div className="success-message">{sellSuccess}</div>}
                                <button 
                                    type="submit" 
                                    className="sell-button"
                                    disabled={userHoldings === 0}
                                >
                                    {userHoldings === 0 ? 'No Shares to Sell' : 'Sell Stock'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StockDetail; 