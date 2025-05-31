import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PortfolioGraph from './PortfolioGraph';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/holdings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setHoldings(res.data.holdings);
        const balanceRes = await axios.get('http://localhost:8080/api/balance', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBalance(balanceRes.data.balance);
      } catch (err) {
        console.error('Error fetching holdings:', err);
        setError('Failed to fetch holdings');
      } finally {
        setLoading(false);
      }
    };
    fetchHoldings();
  }, []);

  return (
    <div className="dashboard-root">
      {/* Main Content */}
      <main className="dashboard-main">
        <h2 style={{ marginBottom: 16 }}>Your Stock Holdings</h2>
        <h2>Your Balance: ${balance.toFixed(2)}</h2>
        {/* Holdings Cards Scroll */}
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : holdings.length === 0 ? (
          <div className="dashboard-holdings-scroll">
            <div className="dashboard-holding-card">
              <div className="holding-symbol">No Stocks Yet</div>
              <div className="holding-quantity">Start investing by buying your first stock!</div>
            </div>
          </div>
        ) : (
          <div className="dashboard-holdings-scroll">
            {holdings.map((h) => (
              <div
                className="dashboard-holding-card"
                key={h._id}
                onClick={() => navigate(`/stock/${h.stockSymbol}`)}
              >
                <div className="holding-symbol">{h.stockSymbol}</div>
                <div className="holding-quantity">Qty: {h.stockQuantity}</div>
              </div>
            ))}
          </div>
        )}
        {/* Portfolio Value Over Time Graph - Centered and Large */}
        <div className="dashboard-portfolio-graph-center">
          <PortfolioGraph hasHoldings={holdings.length > 0} />
        </div>
      </main>
      {/* Right Sidebar */}
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

export default Home;