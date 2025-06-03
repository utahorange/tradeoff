import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaInfoCircle,
  FaUser,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";
import axios from "axios";
import Navbar from "./Navbar";
import "./Competitions.css";
import { useNavigate } from "react-router-dom";

const Competitions = () => {
  console.log("Competitions component mounting");
  // State for active tab
  const [activeTab, setActiveTab] = useState("leaderboard");

  // State for data
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);

  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for search term
  const [searchTerm, setSearchTerm] = useState("");

  // State for selected competition (for leaderboard)
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);

  // State for create game form
  const [createGameForm, setCreateGameForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    initialCash: 100000,
    visibility: "public",
  });

  const navigate = useNavigate();

  // Fetch data when component mounts or active tab changes
  useEffect(() => {
    console.log("Competitions useEffect running");
    const fetchData = async () => {
      console.log("fetchData starting");
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        console.log("Token exists:", !!token);
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch data based on active tab
        if (activeTab === "leaderboard") {
          // If we have a selected competition, fetch its leaderboard
          if (selectedCompetitionId) {
            const response = await axios.get(
              `/api/competitions/${selectedCompetitionId}/leaderboard`,
              config
            );
            console.log("Leaderboard response:", response.data);
            // Ensure leaderboardData is always an array
            setLeaderboardData(
              Array.isArray(response.data) ? response.data : []
            );
          } else {
            // If no competition is selected, fetch my games first to get a competition ID
            const myGamesResponse = await axios.get(
              "/api/competitions/my-games",
              config
            );
            console.log("My games response:", myGamesResponse.data);
            if (myGamesResponse.data && myGamesResponse.data.length > 0) {
              const firstCompetition = myGamesResponse.data[0];
              setSelectedCompetitionId(firstCompetition.id);
              const leaderboardResponse = await axios.get(
                `/api/competitions/${firstCompetition.id}/leaderboard`,
                config
              );
              console.log(
                "Leaderboard response for first competition:",
                leaderboardResponse.data
              );
              // Ensure leaderboardData is always an array
              setLeaderboardData(
                Array.isArray(leaderboardResponse.data)
                  ? leaderboardResponse.data
                  : []
              );
            } else {
              // If user hasn't joined any competitions, set empty leaderboard
              setLeaderboardData([]);
            }
          }
        } else if (activeTab === "myGames") {
          const response = await axios.get(
            "/api/competitions/my-games",
            config
          );
          console.log("My games response:", response.data);
          setMyGames(Array.isArray(response.data) ? response.data : []);
        } else if (activeTab === "joinGame") {
          const response = await axios.get(
            "/api/competitions/available",
            config
          );
          console.log("Available games response:", response.data);
          setAvailableGames(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
        // Set empty arrays for all data states on error
        setLeaderboardData([]);
        setMyGames([]);
        setAvailableGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedCompetitionId]);

  // Filter available games based on search term
  const filteredGames = availableGames.filter(
    (game) =>
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCreateGameForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleCreateGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Use relative URL instead of hardcoded localhost
      const response = await axios.post(
        "/api/competitions",
        createGameForm,
        config
      );

      // Reset form
      setCreateGameForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        initialCash: 100000,
        visibility: "public",
      });

      // Switch to My Games tab to see the new competition
      setActiveTab("myGames");

      // Show success message
      alert("Competition created successfully!");
    } catch (err) {
      console.error("Error creating competition:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        // Optionally redirect to login page or clear token
        localStorage.removeItem("token");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create competition. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle joining a game
  const handleJoinGame = async (gameId) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Send request to join competition using relative URL
      await axios.post(`/api/competitions/${gameId}/join`, {}, config);

      // Refresh available games list using relative URL
      const availableResponse = await axios.get(
        "/api/competitions/available",
        config
      );
      setAvailableGames(availableResponse.data);

      // Refresh my games list using relative URL
      const myGamesResponse = await axios.get(
        "/api/competitions/my-games",
        config
      );
      setMyGames(myGamesResponse.data);

      // Show success message
      alert("Successfully joined the competition!");
    } catch (err) {
      console.error("Error joining competition:", err);
      setError(
        err.response?.data?.message ||
          "Failed to join competition. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="competitions-container">
      <Navbar />
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="competitions-content">
        <div className="competitions-card">
          {/* Header with navigation tabs and back button */}
          <div className="competitions-header">
            <button
              className="back-button"
              onClick={() => navigate("/competitions")}
            >
              ← Back to Competitions
            </button>
            <h1>Competitions</h1>
            <div style={{ width: 160 }} /> {/* Spacer for alignment */}
          </div>
          <div className="competitions-tabs">
            <div
              className={`competitions-tab ${
                activeTab === "leaderboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard
            </div>
            <div
              className={`competitions-tab ${
                activeTab === "myGames" ? "active" : ""
              }`}
              onClick={() => setActiveTab("myGames")}
            >
              My Games
            </div>
            <div
              className={`competitions-tab ${
                activeTab === "joinGame" ? "active" : ""
              }`}
              onClick={() => setActiveTab("joinGame")}
            >
              Join Game
            </div>
            <div
              className={`competitions-tab ${
                activeTab === "createGame" ? "active" : ""
              }`}
              onClick={() => setActiveTab("createGame")}
            >
              Create Game
            </div>
          </div>

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="competitions-body">
              <div className="overflow-x-auto">
                {Array.isArray(leaderboardData) &&
                leaderboardData.length > 0 ? (
                  <table className="leaderboard-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Account Value</th>
                        <th>Today's Change</th>
                        <th>Overall Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((user) => (
                        <tr
                          key={user.rank}
                          className={user.isCurrentUser ? "current-user" : ""}
                        >
                          <td>{user.rank}</td>
                          <td>
                            {user.username}{" "}
                            {user.isCurrentUser && <span>(You)</span>}
                          </td>
                          <td>{user.accountValue}</td>
                          <td className="positive">{user.todayChange}</td>
                          <td className="positive">{user.overallChange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>
                      No leaderboard data available. Join a competition to get
                      started!
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-right">
                <button className="button-secondary">View All Records →</button>
              </div>
            </div>
          )}

          {/* My Games Tab */}
          {activeTab === "myGames" && (
            <div className="competitions-body">
              <div className="my-games-list">
                {myGames.map((game) => (
                  <div key={game.id} className="game-card">
                    <div className="game-card-header">
                      <div>
                        <h3 className="game-card-title">{game.name}</h3>
                        <p className="game-card-host">by {game.host}</p>
                        <p className="mt-2">{game.details}</p>
                      </div>
                      <button
                        className="button-secondary"
                        onClick={() => navigate(`/competitions/${game.id}`)}
                      >
                        Details
                      </button>
                    </div>
                    <div className="game-card-details">
                      <div className="game-detail">
                        <span className="game-detail-label">
                          <FaCalendarAlt className="mr-1" /> Start Date
                        </span>
                        <span className="game-detail-value">
                          {game.startDate}
                        </span>
                      </div>
                      <div className="game-detail">
                        <span className="game-detail-label">
                          <FaCalendarAlt className="mr-1" /> End Date
                        </span>
                        <span className="game-detail-value">
                          {game.endDate}
                        </span>
                      </div>
                      <div className="game-detail">
                        <span className="game-detail-label">
                          <FaUsers className="mr-1" /> # of Players
                        </span>
                        <span className="game-detail-value">
                          {game.players}
                        </span>
                      </div>
                      <div className="game-detail">
                        <span className="game-detail-label">
                          <FaDollarSign className="mr-1" /> Starting Cash
                        </span>
                        <span className="game-detail-value">
                          {game.startingCash}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Join Game Tab */}
          {activeTab === "joinGame" && (
            <div className="competitions-body">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search for a game name or creator"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="search-icon">
                  <FaSearch />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Game Name</th>
                      <th>Details</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th># of Players</th>
                      <th>Starting Cash</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGames.map((game) => (
                      <tr key={game.id}>
                        <td>
                          <div className="flex items-center">
                            {game.locked && <span className="mr-2">🔒</span>}
                            <div>{game.name}</div>
                          </div>
                          <div className="game-card-host">by {game.host}</div>
                        </td>
                        <td>
                          <button className="button-secondary">Details</button>
                        </td>
                        <td>{game.startDate}</td>
                        <td>{game.endDate}</td>
                        <td>{game.players}</td>
                        <td>{game.startingCash}</td>
                        <td className="text-right">
                          {game.joined ? (
                            <span className="joined">Joined</span>
                          ) : game.locked ? (
                            <button
                              className="join-button"
                              disabled
                              title="This game is locked"
                            >
                              Join
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinGame(game.id)}
                              className="join-button"
                            >
                              Join
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredGames.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-message">
                    <h3>No Games Found</h3>
                    <p>No games found matching your search criteria.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Create Game Tab */}
          {activeTab === "createGame" && (
            <div className="competitions-body">
              <form onSubmit={handleCreateGame}>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="name" className="form-label">
                      Game Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={createGameForm.name}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="visibility" className="form-label">
                      Visibility
                    </label>
                    <select
                      id="visibility"
                      name="visibility"
                      value={createGameForm.visibility}
                      onChange={handleFormChange}
                      className="form-select"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="form-field full-width">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      value={createGameForm.description}
                      onChange={handleFormChange}
                      className="form-textarea"
                    ></textarea>
                  </div>

                  <div className="form-field">
                    <label htmlFor="startDate" className="form-label">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      required
                      value={createGameForm.startDate}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="endDate" className="form-label">
                      End Date (leave empty for no end date)
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={createGameForm.endDate}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="initialCash" className="form-label">
                      Initial Cash Amount ($)
                    </label>
                    <input
                      type="number"
                      id="initialCash"
                      name="initialCash"
                      required
                      min="1000"
                      value={createGameForm.initialCash}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setActiveTab("myGames")}
                    className="button-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    Create Competition
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Competitions;
