import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PortfolioGraph from "./PortfolioGraph";
import Navbar from "./Navbar";
import "./CompetitionDetails.css";

const palette = [
  "#4299e1",
  "#f56565",
  "#48bb78",
  "#ed8936",
  "#9f7aea",
  "#ecc94b",
  "#38b2ac",
  "#a0aec0",
  "#f6ad55",
  "#fc8181",
];

const CompetitionDetails = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const [competitionData, setCompetitionData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [tradeError, setTradeError] = useState("");
  const [tradeSuccess, setTradeSuccess] = useState("");
  const [buySymbol, setBuySymbol] = useState("");
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buyPrice, setBuyPrice] = useState("");
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState("");

  useEffect(() => {
    const fetchCompetitionData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        console.log("Token for snapshots fetch:", token);
        if (!token) {
          setError("Authentication required. Please log in again.");
          setLoading(false);
          return;
        }
        // Fetch competition details
        const competitionRes = await axios.get(
          `/api/competitions/${competitionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCompetitionData(competitionRes.data);

        // Fetch competition snapshots
        const snapshotsRes = await axios.get(
          `/api/competitions/${competitionId}/snapshots`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Process snapshots data
        const processedData = snapshotsRes.data.map((user, idx) => ({
          ...user,
          color: palette[idx % palette.length],
          // Ensure snapshots are sorted by date
          snapshots: user.snapshots.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          ),
        }));

        setUsersData(processedData);
      } catch (err) {
        console.error("Error fetching competition data:", err);
        setError("Failed to fetch competition data");
      } finally {
        setLoading(false);
      }
    };

    const fetchPortfolio = async () => {
      setPortfolioLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `/api/competitions/${competitionId}/portfolio`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPortfolio(res.data);
      } catch (err) {
        setPortfolio(null);
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchCompetitionData();
    fetchPortfolio();
  }, [competitionId]);

  // Buy handler
  const handleBuy = async (e) => {
    e.preventDefault();
    setTradeError("");
    setTradeSuccess("");
    try {
      const token = localStorage.getItem("token");
      // Fetch current price from backend
      const priceRes = await axios.get(`/api/quote/${buySymbol}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const price = priceRes.data.currentPrice;
      await axios.post(
        `/api/competitions/${competitionId}/buy`,
        {
          symbol: buySymbol,
          quantity: Number(buyQuantity),
          price: Number(price),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTradeSuccess("Stock bought successfully!");
      setBuySymbol("");
      setBuyQuantity(1);
      // Refresh portfolio
      const res = await axios.get(
        `/api/competitions/${competitionId}/portfolio`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPortfolio(res.data);
    } catch (err) {
      setTradeError(err.response?.data?.message || "Failed to buy stock");
    }
  };

  // Sell handler
  const handleSell = async (e) => {
    e.preventDefault();
    setTradeError("");
    setTradeSuccess("");
    try {
      const token = localStorage.getItem("token");
      // Fetch current price from backend
      const priceRes = await axios.get(`api/quote/${sellSymbol}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const price = priceRes.data.currentPrice;
      await axios.post(
        `/api/competitions/${competitionId}/sell`,
        {
          symbol: sellSymbol,
          quantity: Number(sellQuantity),
          price: Number(price),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTradeSuccess("Stock sold successfully!");
      setSellSymbol("");
      setSellQuantity(1);
      // Refresh portfolio
      const res = await axios.get(
        `/api/competitions/${competitionId}/portfolio`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPortfolio(res.data);
    } catch (err) {
      setTradeError(err.response?.data?.message || "Failed to sell stock");
    }
  };

  if (loading) {
    return (
      <div className="competition-details-container">
        <Navbar />
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading competition data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="competition-details-container">
        <Navbar />
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate("/competitions")}>
            Back to Competitions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="competition-details-container">
      <Navbar />
      <div className="competition-details-content">
        <div className="competition-header">
          <button
            onClick={() => navigate("/competitions")}
            className="button-secondary"
          >
            ← Back to Competitions
          </button>
          <h1>{competitionData?.name || "Competition Details"}</h1>
          <div className="competition-info">
            <div className="info-item">
              <span className="label">Start Date:</span>
              <span className="value">{competitionData?.startDate}</span>
            </div>
            <div className="info-item">
              <span className="label">End Date:</span>
              <span className="value">
                {competitionData?.endDate || "No end date"}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Starting Cash:</span>
              <span className="value">
                ${competitionData?.initialCash?.toLocaleString()}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Players:</span>
              <span className="value">{usersData.length}</span>
            </div>
          </div>
        </div>

        <div className="competition-portfolio-section">
          <h2>Your Competition Portfolio</h2>
          {portfolioLoading ? (
            <div>Loading portfolio...</div>
          ) : portfolio ? (
            <>
              <div>
                Cash Balance: ${portfolio.cashBalance?.toLocaleString()}
              </div>
              <div>Stocks:</div>
              <ul>
                {portfolio.stocks.length === 0 ? (
                  <li>No stocks yet.</li>
                ) : (
                  portfolio.stocks.map((s) => (
                    <li key={s.symbol}>
                      {s.symbol}: {s.quantity} shares @ ${s.purchasePrice}
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <div>No portfolio found for this competition.</div>
          )}
        </div>

        <div className="competition-trade-section">
          <h2>Trade in this Competition</h2>
          {tradeError && <div className="error-message">{tradeError}</div>}
          {tradeSuccess && (
            <div className="success-message">{tradeSuccess}</div>
          )}
          <form onSubmit={handleBuy} style={{ marginBottom: 16 }}>
            <h3>Buy Stock</h3>
            <input
              type="text"
              placeholder="Symbol (e.g. AAPL)"
              value={buySymbol}
              onChange={(e) => setBuySymbol(e.target.value.toUpperCase())}
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={buyQuantity}
              onChange={(e) => setBuyQuantity(e.target.value)}
              required
            />
            <button type="submit" className="button-secondary">
              Buy
            </button>
          </form>
          <form onSubmit={handleSell}>
            <h3>Sell Stock</h3>
            <input
              type="text"
              placeholder="Symbol (e.g. AAPL)"
              value={sellSymbol}
              onChange={(e) => setSellSymbol(e.target.value.toUpperCase())}
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={sellQuantity}
              onChange={(e) => setSellQuantity(e.target.value)}
              required
            />
            <button type="submit" className="button-secondary">
              Sell
            </button>
          </form>
        </div>

        <div className="competition-graph-section">
          <h2>Portfolio Performance</h2>
          <p className="graph-description">
            Track the performance of all participants in this competition. Each
            line represents a player's portfolio value over time.
          </p>
          <div className="portfolio-graph-container">
            <PortfolioGraph usersData={usersData} />
          </div>
        </div>

        <div className="competition-leaderboard">
          <h2>Current Rankings</h2>
          <div className="leaderboard-table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Current Value</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {usersData
                  .map((user, index) => {
                    const latestSnapshot =
                      user.snapshots[user.snapshots.length - 1];
                    const initialValue =
                      user.snapshots[0]?.value || competitionData?.initialCash;
                    const currentValue = latestSnapshot?.value || initialValue;
                    const change =
                      ((currentValue - initialValue) / initialValue) * 100;

                    return {
                      rank: index + 1,
                      username: user.username,
                      currentValue,
                      change,
                      isCurrentUser: user.isCurrentUser,
                    };
                  })
                  .sort((a, b) => b.currentValue - a.currentValue)
                  .map((user, index) => (
                    <tr
                      key={user.username}
                      className={user.isCurrentUser ? "current-user" : ""}
                    >
                      <td>{index + 1}</td>
                      <td>
                        {user.username}
                        {user.isCurrentUser && (
                          <span className="you-badge">(You)</span>
                        )}
                      </td>
                      <td>${user.currentValue.toLocaleString()}</td>
                      <td
                        className={user.change >= 0 ? "positive" : "negative"}
                      >
                        {user.change >= 0 ? "+" : ""}
                        {user.change.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetails;
