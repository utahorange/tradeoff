import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StockSearch.css';

const StockSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [growthFilter, setGrowthFilter] = useState('any'); // 'any', 'growing', 'shrinking'
    const [priceRangeFilter, setPriceRangeFilter] = useState('any'); // 'any', 'under10', '10to50', '50to100', 'over100'
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchStocks = async () => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            try {
                console.log('Fetching search results for:', searchTerm);
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No authentication token found');
                    setSearchResults([]);
                    return;
                }

                const response = await fetch(`http://localhost:8080/api/stocks/search?query=${encodeURIComponent(searchTerm)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Received search results:', data);

                if (!Array.isArray(data)) {
                    console.error('Invalid response format:', data);
                    setSearchResults([]);
                    return;
                }

                // Filter out invalid symbols and fetch quotes only for valid ones
                const validStocks = data.filter(stock =>
                    stock.symbol &&
                    !stock.symbol.includes('.') &&
                    stock.type === 'Common Stock'
                );

                // Fetch quotes for each valid stock
                const stocksWithQuotes = await Promise.all(
                    validStocks.map(async (stock) => {
                        try {
                            const quoteResponse = await fetch(`http://localhost:8080/api/quote/${stock.symbol}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });

                            if (!quoteResponse.ok) {
                                return stock;
                            }

                            const quoteData = await quoteResponse.json();
                            return {
                                ...stock,
                                quote: {
                                    c: quoteData.currentPrice || 0,
                                    d: quoteData.priceChange || 0,
                                    dp: parseFloat(quoteData.percentChange || 0)
                                }
                            };
                        } catch (error) {
                            return stock;
                        }
                    })
                );

                // Add back the invalid stocks without quotes
                const allStocks = [
                    ...stocksWithQuotes,
                    ...data.filter(stock =>
                        !stock.symbol ||
                        stock.symbol.includes('.') ||
                        stock.type !== 'Common Stock'
                    )
                ];

                setSearchResults(allStocks);
                setIsDropdownVisible(true);
            } catch (error) {
                console.error('Error searching stocks:', error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchStocks, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleStockClick = (symbol) => {
        navigate(`/stock/${symbol}`);
        setIsDropdownVisible(false);
        setSearchTerm('');
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const formatChange = (change) => {
        if (change === undefined || change === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            signDisplay: 'always',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(change);
    };

    const formatPercentChange = (percent) => {
        if (percent === undefined || percent === null) return 'N/A';
        return percent.toFixed(2);
    };

    const filteredResults = searchResults.filter(stock => {
        // Growth filter
        if (growthFilter !== 'any') {
            if (!stock.quote) return false;
            if (growthFilter === 'growing' && stock.quote.d <= 0) return false;
            if (growthFilter === 'shrinking' && stock.quote.d >= 0) return false;
        }

        // Price range filter
        if (priceRangeFilter !== 'any' && stock.quote) {
            const price = stock.quote.c;
            switch (priceRangeFilter) {
                case 'under10':
                    if (price >= 10) return false;
                    break;
                case '10to50':
                    if (price < 10 || price >= 50) return false;
                    break;
                case '50to100':
                    if (price < 50 || price >= 100) return false;
                    break;
                case 'over100':
                    if (price < 100) return false;
                    break;
            }
        }

        return true;
    });

    return (
        <div className="stock-search-container" ref={dropdownRef}>
            <div className="search-form">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search stocks..."
                    className="search-input"
                />
                {loading && <div className="loading-indicator">Searching...</div>}
            </div>

            <div className="filter-container">
                <select
                    value={growthFilter}
                    onChange={(e) => setGrowthFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="any">Any Growth</option>
                    <option value="growing">Growing</option>
                    <option value="shrinking">Shrinking</option>
                </select>
                <select
                    value={priceRangeFilter}
                    onChange={(e) => setPriceRangeFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="any">Any Price</option>
                    <option value="under10">Under $10</option>
                    <option value="10to50">$10 - $50</option>
                    <option value="50to100">$50 - $100</option>
                    <option value="over100">Over $100</option>
                </select>
            </div>

            {isDropdownVisible && filteredResults.length > 0 && (
                <div className="search-results">
                    {filteredResults.map((stock) => (
                        <div
                            key={stock.symbol}
                            className="stock-result-item"
                            onClick={() => handleStockClick(stock.symbol)}
                        >
                            <div className="stock-info">
                                <div className="stock-symbol">{stock.symbol}</div>
                                <div className="stock-name">{stock.description}</div>
                            </div>
                            {stock.quote ? (
                                <div className="stock-price-info">
                                    <div className="stock-price">
                                        {formatPrice(stock.quote.c)}
                                    </div>
                                    <div className={`stock-change ${stock.quote.d >= 0 ? 'positive' : 'negative'}`}>
                                        <span className="mr-1">
                                            {stock.quote.d >= 0 ? '↑' : '↓'}
                                        </span>
                                        {formatChange(stock.quote.d)} ({formatPercentChange(stock.quote.dp)}%)
                                    </div>
                                </div>
                            ) : (
                                <div className="stock-price-info">
                                    <div className="stock-price">N/A</div>
                                    <div className="stock-change">No price data</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StockSearch; 