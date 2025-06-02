import React, { useEffect, useState } from "react";
import axios from "axios";
import PortfolioGraph from "./PortfolioGraph";
import { IoMdSettings, IoMdSunny } from "react-icons/io";
import StockSearch from "./StockSearch";
import Navbar from "./Navbar";
import "./Home.css";
import { FaUserCircle } from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import { useNavigate } from 'react-router-dom';

const Home = ({setLoggedInUser}) => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setLoggedInUser(null);
  };

  useEffect(() => {
      const fetchData = async () => {
          try {
              const token = localStorage.getItem('token');
              const [holdingsRes, balanceRes, friendRequestsRes, friendsRes] = await Promise.all([
                  axios.get('http://localhost:8080/api/holdings', {
                      headers: { Authorization: `Bearer ${token}` }
                  }),
                  axios.get('http://localhost:8080/api/balance', {
                      headers: { Authorization: `Bearer ${token}` }
                  }),
                  axios.get('http://localhost:8080/api/friends/requests', {
                      headers: { Authorization: `Bearer ${token}` }
                  }),
                  axios.get('http://localhost:8080/api/friends', {
                      headers: { Authorization: `Bearer ${token}` }
                  })
              ]);
              
              setHoldings(holdingsRes.data.holdings);
              setBalance(balanceRes.data.balance);
              setFriendRequests(friendRequestsRes.data.requests || []);
              setFriends(friendsRes.data.friends || []);
          } catch (err) {
              console.error('Error fetching data:', err);
              setError('Failed to fetch data');
          } finally {
              setLoading(false);
          }
      };
      fetchData();
    }, []);

    return (
      <div className="dashboard-root">
        <Navbar />
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
              <h2 className="username">{localStorage.getItem('username')}</h2>
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
          <h4>Friend Requests</h4>
          <ul>
            {friendRequests.length === 0 ? (
              <li className="text-muted">No pending friend requests</li>
            ) : (
              friendRequests.map((request) => (
                <li key={request._id}>
                  {request.sender.username} wants to be friends
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rightbar-section">
          <h4>Friends</h4>
          <ul>
            {friends.length === 0 ? (
              <li className="text-muted">No friends added yet</li>
            ) : (
              friends.map((friend) => (
                <li key={friend._id}>{friend.username}</li>
              ))
            )}
          </ul>
        </div>
      </aside>
      </div>
    );
};

export default Home;