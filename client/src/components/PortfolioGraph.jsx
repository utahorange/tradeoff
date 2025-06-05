// ... existing imports ...
import React from "react";
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

// Helper to get all unique sorted dates from all users' snapshots
function getAllDates(usersData) {
  const dateSet = new Set();
  usersData.forEach((user) => {
    user.snapshots.forEach((snap) => {
      // Use only the date part for x-axis
      dateSet.add(
        new Date(snap.date || snap.timestamp).toISOString().split("T")[0]
      );
    });
  });
  return Array.from(dateSet).sort();
}

// Helper to get value for a user on a given date (or last known value)
function getValueOnDate(snapshots, date) {
  let lastValue = null;
  for (const snap of snapshots) {
    const snapDate = new Date(snap.date || snap.timestamp)
      .toISOString()
      .split("T")[0];
    if (snapDate <= date) {
      lastValue = snap.value || snap.totalValue;
    } else {
      break;
    }
  }
  return lastValue;
}

const PortfolioGraph = ({ usersData }) => {
  if (!usersData || usersData.length === 0) {
    return (
      <div className="portfolio-graph card">
        <div className="empty-state-message">
          <h3>No Portfolio Data</h3>
          <p>Start investing to see your portfolio performance over time!</p>
        </div>
      </div>
    );
  }

  // Get all unique dates across all users
  const allDates = getAllDates(usersData);

  // Build datasets for each user
  const datasets = usersData.map((user) => {
    // For each date, get the user's value (or last known value)
    let lastKnown = null;
    const data = allDates.map((date) => {
      const value = getValueOnDate(user.snapshots, date);
      if (value !== null && value !== undefined) lastKnown = value;
      return lastKnown;
    });
    return {
      label: user.username,
      data,
      borderColor: user.color,
      backgroundColor: user.color + "33", // semi-transparent fill
      pointBackgroundColor: user.color,
      pointBorderColor: "#23262f",
      tension: 0,
      fill: false,
    };
  });

  const chartData = {
    labels: allDates,
    datasets,
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#fff",
        },
      },
      title: {
        display: true,
        text: "Portfolio Value Over Time",
        color: "#fff",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: "#fff",
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
        },
        grid: {
          color: "#444",
        },
      },
      x: {
        ticks: {
          color: "#fff",
        },
        grid: {
          color: "#444",
        },
      },
    },
  };

  return (
    <div className="portfolio-graph card">
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PortfolioGraph;
