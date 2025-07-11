import React, { useEffect, useState } from "react";
import axios from "axios";
import PortfolioGraph from "./PortfolioGraph";
import { IoMdSettings, IoMdSunny } from "react-icons/io";
import StockSearch from "./StockSearch";
import Navbar from "./Navbar";
import "./Home.css";
import { FaUserCircle } from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const Home = ({ setLoggedInUser }) => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setLoggedInUser(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [holdingsRes, balanceRes, portfolioRes, friendRequestsRes, friendsRes, portfolioHistoryRes] =
          await Promise.all([
            axios.get("http://localhost:8080/api/holdings", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8080/api/balance", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8080/api/portfolio/current-value", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8080/api/friends/requests", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8080/api/friends", {
                      headers: { Authorization: `Bearer ${token}` }
                  }),
                  axios.get('http://localhost:8080/api/portfolio/history?timeframe=ALL', {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setHoldings(holdingsRes.data.holdings);
        setBalance(balanceRes.data.balance);
        const stockValue = portfolioRes.data.totalValue - portfolioRes.data.cashBalance;
        setPortfolioValue(stockValue);
        setTotalValue(stockValue + balanceRes.data.balance);
        setFriendRequests(friendRequestsRes.data.requests || []);
        setFriends(friendsRes.data.friends || []);
              
              // Format portfolio history for PortfolioGraph
              const currentUsername = localStorage.getItem('username');
              if (portfolioHistoryRes.data.snapshots && portfolioHistoryRes.data.snapshots.length > 0) {
                setPortfolioHistory([{
                  username: currentUsername,
                  isCurrentUser: true,
                  color: "#4ade80",
                  snapshots: portfolioHistoryRes.data.snapshots.map(snapshot => ({
                    date: snapshot.timestamp,
                    value: snapshot.totalValue
                  }))
                }]);
              } else {
                setPortfolioHistory([]);
              }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
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
            <CgLogOut className="logout-icon" onClick={handleLogout} />
            <div
              className="user-profile-container"
              onClick={() => {
                navigate("/profile");
              }}
            >
              <FaUserCircle className="profile-icon" />
              <h2 className="username">{localStorage.getItem("username")}</h2>
            </div>
          </div>
        </header>
        <div className="dashboard-summary">
          <div className="portfolio-overview">
            <h2>Portfolio Overview</h2>
            <div className="balance-cards">
              <div className="balance-card">
                <h3>Total Portfolio Value</h3>
                <p className="value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="balance-card">
                <h3>Stock Holdings Value</h3>
                <p className="value">${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="balance-card">
                <h3>Cash Balance</h3>
                <p className="value">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
          <div className="holdings-container">
            <h2>My Stock Holdings</h2>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : holdings.length === 0 ? (
              <div className="dashboard-holdings-scroll">
                <div className="dashboard-holding-card">
                  <div className="holding-symbol">No Stocks Yet</div>
                  <div className="holding-quantity">
                    Start investing by buying your first stock!
                  </div>
                </div>
              </div>
            ) : (
              <div className="dashboard-holdings-scroll">
                {Object.entries(
                  holdings.reduce((acc, h) => {
                    acc[h.stockSymbol] =
                      (acc[h.stockSymbol] || 0) + h.stockQuantity;
                    return acc;
                  }, {})
                ).map(([symbol, quantity]) => (
                  <div
                    className="dashboard-holding-card"
                    key={symbol}
                    onClick={() => navigate(`/stock/${symbol}`)}
                  >
                    <div className="holding-symbol">{symbol}</div>
                    <div className="holding-quantity">Qty: {quantity}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Portfolio Value Over Time Graph - Centered and Large */}
        <div className="dashboard-portfolio-graph-center">
          <PortfolioGraph usersData={portfolioHistory} />
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
                <li
                  key={friend._id}
                  className="friend-link"
                  onClick={() => navigate(`/stats/${friend.username}`)}
                  style={{ cursor: "pointer" }}
                >
                  {friend.username}
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Home;
