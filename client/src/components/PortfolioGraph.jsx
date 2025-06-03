// ... existing imports ...
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
import './PortfolioGraph.css';

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

const PortfolioGraph = ({ hasHoldings }) => {
    const [timeframe, setTimeframe] = useState('1W');
    const [portfolioData, setPortfolioData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPortfolioHistory = async () => {
            if (!hasHoldings) {
                setLoading(false);
                return;
            }
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
    }, [timeframe, hasHoldings]);

    if (!hasHoldings) {
        return (
            <div className="portfolio-graph card">
                <div className="empty-state-message">
                    <h3>No Portfolio Data</h3>
                    <p>Start investing to see your portfolio performance over time!</p>
                </div>
            </div>
        );
    }

    if (loading) return <div className="portfolio-graph card">Loading...</div>;
    if (error) return <div className="portfolio-graph card" style={{ color: 'red' }}>{error}</div>;

    const chartData = {
        labels: portfolioData.map(snapshot =>
            new Date(snapshot.timestamp).toLocaleDateString()
        ),
        datasets: [
            {
                label: 'Portfolio Value',
                data: portfolioData.map(snapshot => snapshot.totalValue),
                borderColor: 'rgba(66,153,225,1)', // blue
                backgroundColor: 'rgba(66,153,225,0.10)', // subtle fill
                pointBackgroundColor: 'rgba(66,153,225,1)',
                pointBorderColor: '#23262f',
                tension: 0, // smooth curve
                fill: true,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: {
                tension: 0 // This removes the curve fitting and makes straight lines
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#fff'
                }
            },
            title: {
                display: true,
                text: `Portfolio Value Over Time (${timeframe})`,
                color: '#fff',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    color: '#fff',
                    callback: function(value) {
                        return '$' + value.toLocaleString();
                    }
                },
                grid: {
                    color: '#444'
                }
            },
            x: {
                ticks: {
                    color: '#fff'
                },
                grid: {
                    color: '#444'
                }
            }
        }
    };

    return (
        <div className="portfolio-graph card">
            <div className="portfolio-graph-header">
                <h3>Portfolio Value Over Time</h3>
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
            </div>
            <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default PortfolioGraph;