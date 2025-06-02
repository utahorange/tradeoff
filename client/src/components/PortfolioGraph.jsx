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

  if (loading) {
    return (
      <div className="portfolio-graph card">
        <div className="loading-spinner"></div>
        <p>Loading portfolio data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-graph card" style={{ color: "red" }}>
        {error}
      </div>
    );
  }

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

  // Prepare data for chart
  let chartData;
  if (usersData) {
    // Competition mode - multiple users
    chartData = {
      labels:
        usersData[0]?.snapshots.map((s) =>
          new Date(s.date).toLocaleDateString()
        ) || [],
      datasets: usersData.map((user) => ({
        label: user.username + (user.isCurrentUser ? " (You)" : ""),
        data: user.snapshots.map((s) => s.value),
        borderColor: user.color,
        backgroundColor: user.color + "20", // Add transparency
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0, // Hide points for cleaner look
        pointHoverRadius: 4,
      })),
    };
  } else {
    // Individual portfolio mode
    chartData = {
      labels: portfolioData.map((s) => new Date(s.date).toLocaleDateString()),
      datasets: [
        {
          label: "Portfolio Value",
          data: portfolioData.map((s) => s.value),
          borderColor: "#4ade80",
          backgroundColor: "#4ade8020",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#a0aec0",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(35, 38, 47, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#353945",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#2a2e39",
        },
        ticks: {
          color: "#a0aec0",
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: {
          color: "#2a2e39",
        },
        ticks: {
          color: "#a0aec0",
          callback: function (value) {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumSignificantDigits: 3,
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <div className="portfolio-graph-container">
      {!usersData && (
        <div className="timeframe-selector">
          <button
            className={timeframe === "1W" ? "active" : ""}
            onClick={() => setTimeframe("1W")}
          >
            1W
          </button>
          <button
            className={timeframe === "1M" ? "active" : ""}
            onClick={() => setTimeframe("1M")}
          >
            1M
          </button>
          <button
            className={timeframe === "3M" ? "active" : ""}
            onClick={() => setTimeframe("3M")}
          >
            3M
          </button>
          <button
            className={timeframe === "1Y" ? "active" : ""}
            onClick={() => setTimeframe("1Y")}
          >
            1Y
          </button>
          <button
            className={timeframe === "ALL" ? "active" : ""}
            onClick={() => setTimeframe("ALL")}
          >
            ALL
          </button>
        </div>
      )}
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PortfolioGraph;
