import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PortfolioGraph from './PortfolioGraph';
import './Dashboard.css';
import { IoMdSettings, IoMdSunny } from "react-icons/io";
import { CgLogOut } from "react-icons/cg";
import { useNavigate } from 'react-router-dom';

const Home = ({setLoggedInUser}) => {
    const navigate = useNavigate();
    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [balance, setBalance] = useState(0);
    
    const handleLogout = () => {
      console.log('Logout clicked');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setLoggedInUser(null);
      navigate('/login');
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
            <div className="sidebar-section">Favorites</div>
            <ul>
              <li>Overview</li>
              <li>Projects</li>
            </ul>
            <div className="sidebar-section">Dashboards</div>
            <ul>
              <li className="active">Default</li>
              <li>eCommerce</li>
              <li>Projects</li>
              <li>Online Courses</li>
            </ul>
            <div className="sidebar-section">Pages</div>
            <ul>
              <li>User Profile</li>
              <li>Account</li>
              <li>Corporate</li>
              <li>Blog</li>
              <li>Social</li>
            </ul>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="dashboard-main">
          {/* Top Bar */}
          <header className="dashboard-topbar">
            <input className="dashboard-search" placeholder="Search..." />
            <div className="dashboard-topbar-icons">
              <CgLogOut 
                className="logout-icon" 
                onClick={handleLogout}
              />
              <IoMdSettings 
                className="settings-icon" 
                onClick={() => {
                  console.log('Settings clicked');
                }}
              />
            </div>
          </header>
          {/* Holdings Heading */}
          <h2 style={{marginBottom: 16}}>Your Stock Holdings</h2>
          <h2>Your Balance: {balance}</h2>
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
                <div className="dashboard-holding-card" key={h._id}>
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