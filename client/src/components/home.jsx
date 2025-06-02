import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PortfolioGraph from './PortfolioGraph';
import StockSearch from './StockSearch';
import './Dashboard.css';
import { IoMdSunny } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import { useNavigate } from 'react-router-dom';

const Home = ({setLoggedInUser}) => {
    const navigate = useNavigate();
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [balance, setBalance] = useState(0);
    
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setLoggedInUser(null);
    };

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
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-logo">TradeOff</div>
          <nav className="sidebar-nav">
            <div className="sidebar-section">Pages</div>
            <ul>
              <li onClick={() => navigate('/')}>Portfolio</li>
              <li onClick={() => navigate('/stats')}>Stock Statistics</li>
              <li onClick={() => navigate('/competitions')}>Competitions</li>
              <li onClick={() => navigate('/friends')}>Friends</li>
            </ul>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="dashboard-main">
          {/* Top Bar */}
          <header className="dashboard-topbar">
            <div className="search-container">
              <StockSearch />
            </div>
            <div className="dashboard-topbar-icons">
              <CgLogOut 
                className="logout-icon" 
                onClick={handleLogout}
              />
              <FaUserCircle 
                className="profile-icon" 
                onClick={() => {
                  navigate('/profile');
                }}
              />
            </div>
          </header>
          <div className="dashboard-summary">
            <div className="balance-section">
              <h2>My Stock Holdings</h2>
            </div>
            <div className="holdings-section">
              <h2>Balance: ${balance.toFixed(2)}</h2>
            </div>
          </div>
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