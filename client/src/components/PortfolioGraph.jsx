// ... existing imports ...
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./PortfolioGraph.css";

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

const PortfolioGraph = ({
  hasHoldings,
  usersData = null,
  currentUserId = null,
}) => {
  const [timeframe, setTimeframe] = useState("1W");
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (usersData) {
      setLoading(false);
      return;
    }
    const fetchPortfolioHistory = async () => {
      if (!hasHoldings) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/api/portfolio/history?timeframe=${timeframe}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPortfolioData(response.data.snapshots);
      } catch (err) {
        console.error("Error fetching portfolio history:", err);
        setError("Failed to fetch portfolio history");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolioHistory();
  }, [timeframe, hasHoldings, usersData]);

  if (usersData && usersData.length === 0) {
    return (
      <div className="portfolio-graph card">
        <div className="empty-state-message">
          <h3>No Competition Data</h3>
          <p>No portfolio snapshots available for this competition.</p>
        </div>
      </div>
    );
  }

  if (!usersData && !hasHoldings) {
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
  if (error)
    return (
      <div className="portfolio-graph card" style={{ color: "red" }}>
        {error}
      </div>
    );

  // Color palette for users (fallback)
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

  // If usersData is provided, plot all users' lines
  let chartData;
  if (usersData) {
    // Find all unique timestamps
    const allTimestamps = Array.from(
      new Set(
        usersData.flatMap((u) =>
          u.snapshots.map((s) => new Date(s.timestamp).toISOString())
        )
      )
    ).sort();
    // Build datasets for each user
    chartData = {
      labels: allTimestamps.map((ts) => new Date(ts).toLocaleDateString()),
      datasets: usersData.map((user, idx) => {
        // Assign color (use user.color if present, else fallback)
        const color = user.color || palette[idx % palette.length];
        // Map each timestamp to the user's value (or null if missing)
        const valueMap = {};
        user.snapshots.forEach((s) => {
          valueMap[new Date(s.timestamp).toISOString()] = s.totalValue;
        });
        return {
          label:
            user.username + (user.userId === currentUserId ? " (You)" : ""),
          data: allTimestamps.map((ts) => valueMap[ts] ?? null),
          borderColor: color,
          backgroundColor: color + "22", // subtle fill
          pointBackgroundColor: color,
          pointBorderColor: "#23262f",
          tension: 0.4,
          fill: false,
          borderWidth: user.userId === currentUserId ? 4 : 2,
        };
      }),
    };
  } else {
    // Single user mode
    chartData = {
      labels: portfolioData.map((snapshot) =>
        new Date(snapshot.timestamp).toLocaleDateString()
      ),
      datasets: [
        {
          label: "Portfolio Value",
          data: portfolioData.map((snapshot) => snapshot.totalValue),
          borderColor: "#4299e1",
          backgroundColor: "#4299e122",
          pointBackgroundColor: "#4299e1",
          pointBorderColor: "#23262f",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          color: "#f1f1f1",
          font: { size: 14, family: "Inter, sans-serif" },
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#23262f",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#4299e1",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "#353945",
        },
        ticks: {
          color: "#b5b5b5",
          font: { family: "Inter, sans-serif" },
        },
      },
      y: {
        grid: {
          color: "#353945",
        },
        ticks: {
          color: "#b5b5b5",
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
          font: { family: "Inter, sans-serif" },
        },
      },
    },
  };

  // Legend for users (if usersData)
  const userLegend = usersData ? (
    <div
      className="user-legend"
      style={{ display: "flex", gap: 16, marginBottom: 8 }}
    >
      {usersData.map((user, idx) => {
        const color = user.color || palette[idx % palette.length];
        return (
          <span
            key={user.userId}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: color,
                display: "inline-block",
                border:
                  user.userId === currentUserId ? "2px solid #fff" : "none",
              }}
            ></span>
            <span style={{ color: "#f1f1f1" }}>
              {user.username}
              {user.userId === currentUserId ? " (You)" : ""}
            </span>
          </span>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="portfolio-graph card">
      <div className="portfolio-graph-header">
        <h3>Portfolio Value Over Time</h3>
        <div className="timeframe-selector">
          {["1D", "1W", "1M", "1Y", "ALL"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={timeframe === tf ? "active" : ""}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      {userLegend}
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PortfolioGraph;
