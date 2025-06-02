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

  useEffect(() => {
    const fetchCompetitionData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
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

    fetchCompetitionData();
  }, [competitionId]);

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
