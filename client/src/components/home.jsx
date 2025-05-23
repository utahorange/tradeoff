import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHoldings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8080 /api/holdings', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setHoldings(res.data.holdings);
            } catch (err) {
                setError('Failed to fetch holdings');
            } finally {
                setLoading(false);
            }
        };
        fetchHoldings();
    }, []);

    return (
        <div>
            <h1>Home</h1>
            <h2>Your Stock Holdings</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : holdings.length === 0 ? (
                <p>You do not own any stocks yet.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Stock Symbol</th>
                            <th>Quantity</th>
                            <th>Date Bought</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holdings.map((h) => (
                            <tr key={h._id}>
                                <td>{h.stockSymbol}</td>
                                <td>{h.stockQuantity}</td>
                                <td>{new Date(h.boughtAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Home;
