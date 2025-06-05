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
  FaUserCircle,
} from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import axios from "axios";
import Navbar from "./Navbar";
import StockSearch from "./StockSearch";
import "./Competitions.css";
import "./Home.css"; // Import Home.css for dashboard styles
import { useNavigate } from "react-router-dom";

// Create an axios instance with baseURL
const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

const Competitions = ({ setLoggedInUser }) => {
  console.log("Competitions component mounting");
  // State for active tab
  const [activeTab, setActiveTab] = useState("myGames");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setLoggedInUser(null);
  };

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

  // Get current username from localStorage (fallback to empty string)
  const currentUsername = localStorage.getItem("username") || "";

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
            const response = await api.get(
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
            const myGamesResponse = await api.get(
              "/api/competitions/my-games",
              config
            );
            console.log("My games response:", myGamesResponse.data);
            if (myGamesResponse.data && myGamesResponse.data.length > 0) {
              const firstCompetition = myGamesResponse.data[0];
              setSelectedCompetitionId(firstCompetition.id);
              const leaderboardResponse = await api.get(
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
          const response = await api.get("/api/competitions/my-games", config);
          console.log("My games response:", response.data);
          setMyGames(Array.isArray(response.data) ? response.data : []);
        } else if (activeTab === "joinGame") {
          const response = await api.get("/api/competitions/available", config);
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

    // Validation: End date must not be before today
    if (createGameForm.endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(createGameForm.endDate);
      end.setHours(0, 0, 0, 0);
      if (end < today) {
        setLoading(false);
        setError("End date cannot be before today.");
        return;
      }
    }
    // Validation: Start date cannot be after today
    if (createGameForm.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(createGameForm.startDate);
      start.setHours(0, 0, 0, 0);
      if (start > today) {
        setLoading(false);
        setError("Start date cannot be after today.");
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token ? "exists" : "missing");

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
      console.log("Request config:", config);
      console.log("Request data:", createGameForm);

      // Use the api instance with baseURL
      console.log("Making POST request to /api/competitions");
      const response = await api.post(
        "/api/competitions",
        createGameForm,
        config
      );
      console.log("Response received:", response.data);

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
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
      });

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

      await api.post(`/api/competitions/${gameId}/join`, {}, config);

      const availableResponse = await api.get(
        "/api/competitions/available",
        config
      );
      setAvailableGames(availableResponse.data);

      const myGamesResponse = await api.get(
        "/api/competitions/my-games",
        config
      );
      setMyGames(myGamesResponse.data);

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

  // Add handleLeaveGame function after handleJoinGame
  const handleLeaveGame = async (gameId) => {
    console.log("Attempting to leave game with id:", gameId); // Debug log
    if (
      !window.confirm(
        "Are you sure you want to leave this competition? This action cannot be undone."
      )
    ) {
      return;
    }

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

      await api.post(`/api/competitions/${gameId}/leave`, {}, config);

      // Refresh my games list
      const myGamesResponse = await api.get(
        "/api/competitions/my-games",
        config
      );
      setMyGames(myGamesResponse.data);

      alert("Successfully left the competition!");
    } catch (err) {
      console.error("Error leaving competition:", err);
      setError(
        err.response?.data?.message ||
          "Failed to leave competition. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Add handleDeleteGame function after handleLeaveGame
  const handleDeleteGame = async (gameId) => {
    console.log("[DELETE GAME] Starting delete process for gameId:", gameId);
    console.log("[DELETE GAME] Current user:", currentUsername);
    console.log(
      "[DELETE GAME] Game to delete:",
      myGames.find((g) => g.id === gameId)
    );

    if (
      !window.confirm(
        "Are you sure you want to delete this competition? This action cannot be undone and will remove the competition for all participants."
      )
    ) {
      return;
    }

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

      console.log(
        "[DELETE GAME] Making DELETE request to:",
        `/api/competitions/${gameId}`
      );

      const response = await api.delete(`/api/competitions/${gameId}`, config);
      console.log("[DELETE GAME] Response:", response);

      // Refresh my games list
      const myGamesResponse = await api.get(
        "/api/competitions/my-games",
        config
      );
      setMyGames(myGamesResponse.data);

      alert("Successfully deleted the competition!");
    } catch (err) {
      console.error("[DELETE GAME] Error:", err);
      console.error("[DELETE GAME] Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        gameId: gameId,
      });
      setError(
        err.response?.data?.message ||
          "Failed to delete competition. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper: is competition ended
  const isCompetitionEnded = (competition) => {
    if (!competition.endDate) return false;
    // Accept both string and Date
    const end = new Date(competition.endDate);
    const now = new Date();
    // Only compare date part (ignore time)
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return end < now;
  };

  // My Games: only not ended
  const myGamesOngoing = myGames.filter((game) => !isCompetitionEnded(game));
  // Past Games: only ended
  const myGamesPast = myGames.filter((game) => isCompetitionEnded(game));

  // Modify the competition card rendering
  const renderCompetitionCard = (competition) => {
    const hasEnded = isCompetitionEnded(competition);
    return (
      <div
        className={`competition-card ${hasEnded ? "ended" : ""}`}
        key={competition._id}
      >
        <div className="competition-card-header">
          <h3>{competition.name}</h3>
          {hasEnded && <span className="ended-badge">Ended</span>}
        </div>
        <div className="competition-card-details">
          <p>
            <FaUser /> Host: {competition.host}
          </p>
          <p>
            <FaCalendarAlt /> Start:{" "}
            {new Date(competition.startDate).toLocaleDateString()}
          </p>
          <p>
            <FaCalendarAlt /> End:{" "}
            {competition.endDate
              ? new Date(competition.endDate).toLocaleDateString()
              : "No end date"}
          </p>
          <p>
            <FaUsers /> Players: {competition.players}
          </p>
          <p>
            <FaDollarSign /> Starting Cash: $
            {competition.startingCash.toLocaleString()}
          </p>
          <p>
            <FaInfoCircle /> {competition.details}
          </p>
        </div>
        <div className="competition-card-actions">
          {activeTab === "myGames" ? (
            <>
              <button
                onClick={() => navigate(`/competitions/${competition._id}`)}
                className="button-primary"
              >
                View Details
              </button>
              {!hasEnded && (
                <button
                  onClick={() => handleLeaveGame(competition._id)}
                  className="button-secondary"
                >
                  Leave Game
                </button>
              )}
            </>
          ) : activeTab === "joinGame" ? (
            <button
              onClick={() => handleJoinGame(competition._id)}
              className="button-primary"
              disabled={hasEnded}
            >
              {hasEnded ? "Competition Ended" : "Join Game"}
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-root">
      <Navbar />
      <main className="dashboard-main" style={{ overflow: 'auto' }}>
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

        <div className="competitions-content" style={{ marginLeft: 0, height: 'auto', flex: 'none' }}>
                      <div className="competitions-card" style={{ overflow: 'visible', height: 'auto' }}>
            {/* Header with navigation tabs and back button */}
            <div className="competitions-header">
              <h1>Competitions</h1>
              <div style={{ width: 160 }} /> {/* Spacer for alignment */}
            </div>
            <div className="competitions-tabs">
              {/* <div
              className={`competitions-tab ${
                activeTab === "leaderboard" ? "active" : ""
              }`}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard
            </div> */}
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
                  activeTab === "pastGames" ? "active" : ""
                }`}
                onClick={() => setActiveTab("pastGames")}
              >
                Past Games
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

            {/* My Games Tab */}
            {activeTab === "myGames" && (
              <div className="competitions-body">
                <div className="my-games-list">
                  {myGamesOngoing.map((game) => (
                    <div key={game.id} className="game-card">
                      <div className="game-card-header">
                        <div>
                          <h3 className="game-card-title">{game.name}</h3>
                          <p className="game-card-host">by {game.host}</p>
                          <p className="mt-2">{game.details}</p>
                        </div>
                        <div className="game-card-actions">
                          <button
                            className="button-secondary"
                            onClick={() => navigate(`/competitions/${game.id}`)}
                          >
                            Details
                          </button>
                          {game.host === currentUsername && (
                            <button
                              className="button-danger"
                              onClick={() => handleDeleteGame(game.id)}
                            >
                              Delete
                            </button>
                          )}
                          <button
                            className="button-danger"
                            onClick={() => handleLeaveGame(game.id)}
                          >
                            Leave
                          </button>
                        </div>
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
                  {myGamesOngoing.length === 0 && (
                    <div className="empty-state">
                      <p>No ongoing games. Join or create a new game!</p>
                    </div>
                  )}
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
                            <button className="button-secondary">
                              Details
                            </button>
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

            {/* Past Games Tab */}
            {activeTab === "pastGames" && (
              <div className="competitions-body">
                <div className="my-games-list">
                  {myGamesPast.map((game) => (
                    <div key={game.id} className="game-card ended">
                      <div className="game-card-header">
                        <div>
                          <h3 className="game-card-title">
                            {game.name}{" "}
                            <span className="ended-badge">Ended</span>
                          </h3>
                          <p className="game-card-host">by {game.host}</p>
                          <p className="mt-2">{game.details}</p>
                        </div>
                        <div className="game-card-actions">
                          <button
                            className="button-secondary"
                            onClick={() => navigate(`/competitions/${game.id}`)}
                          >
                            Details
                          </button>
                        </div>
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
                  {myGamesPast.length === 0 && (
                    <div className="empty-state">
                      <p>No past games yet.</p>
                    </div>
                  )}
                </div>
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
      </main>
    </div>
  );
};

export default Competitions;
