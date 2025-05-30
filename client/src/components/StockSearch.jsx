import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StockSearch.css';

const StockSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/stocks/search?query=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching stocks:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStockClick = (symbol) => {
        navigate(`/stock/${symbol}`);
    };

    return (
        <div className="stock-search-container">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search stocks..."
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    Search
                </button>
            </form>

            {loading && <div className="loading">Searching...</div>}

            {searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map((stock) => (
                        <div
                            key={stock.symbol}
                            className="stock-result-item"
                            onClick={() => handleStockClick(stock.symbol)}
                        >
                            <div className="stock-symbol">{stock.symbol}</div>
                            <div className="stock-name">{stock.description}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StockSearch; 