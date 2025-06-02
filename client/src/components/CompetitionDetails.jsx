import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PortfolioGraph from "./PortfolioGraph";

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
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get current userId from localStorage (assume it's stored after login)
  let currentUserId = null;
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    currentUserId = user?.id || user?._id || null;
  } catch {}

  useEffect(() => {
    const fetchSnapshots = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `/api/competitions/${competitionId}/snapshots`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Assign a color to each user
        const colored = res.data.map((u, idx) => ({
          ...u,
          color: palette[idx % palette.length],
        }));
        setUsersData(colored);
      } catch (err) {
        setError("Failed to fetch competition snapshots");
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshots();
  }, [competitionId]);

  if (loading) return <div className="portfolio-graph card">Loading...</div>;
  if (error)
    return (
      <div className="portfolio-graph card" style={{ color: "red" }}>
        {error}
      </div>
    );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <button
        onClick={() => navigate("/competitions")}
        className="button-secondary"
        style={{ marginBottom: 16 }}
      >
        ← Back to Competitions
      </button>
      <h2 style={{ color: "#f1f1f1", marginBottom: 24 }}>
        Competition Portfolio Graph
      </h2>
      <PortfolioGraph usersData={usersData} currentUserId={currentUserId} />
    </div>
  );
};

export default CompetitionDetails;
