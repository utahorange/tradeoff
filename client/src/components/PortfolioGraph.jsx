import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const PortfolioGraph = () => {
    const [timeframe, setTimeframe] = useState('1W');
    const [portfolioData, setPortfolioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPortfolioHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/api/portfolio/history?timeframe=${timeframe}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPortfolioData(response.data.snapshots);
            } catch (err) {
                console.error('Error fetching portfolio history:', err);
                setError('Failed to fetch portfolio history');
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolioHistory();
    }, [timeframe]);

    const chartData = {
        labels: portfolioData.map(snapshot => 
            new Date(snapshot.timestamp).toLocaleDateString()
        ),
        datasets: [
            {
                label: 'Portfolio Value',
                data: portfolioData.map(snapshot => snapshot.totalValue),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Portfolio Value Over Time'
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function(value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div className="portfolio-graph">
            <div className="timeframe-selector">
                {['1D', '1W', '1M', '1Y', 'ALL'].map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={timeframe === tf ? 'active' : ''}
                    >
                        {tf}
                    </button>
                ))}
            </div>
            <div className="chart-container">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default PortfolioGraph; 