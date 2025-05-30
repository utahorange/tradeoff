import React, { useState, useEffect } from 'react';
import { FaSearch, FaInfoCircle, FaUser, FaCalendarAlt, FaUsers, FaDollarSign, FaTrophy, FaChartLine } from 'react-icons/fa';
import './Competitions.css';

const Competitions = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('leaderboard');
  
  // Mock data for leaderboard
  const [leaderboardData, setLeaderboardData] = useState([
    { rank: 1, username: 'PaperMaster', accountValue: '$352,542,491.00', todayChange: '+$60,644,904.00 (+20.78%)', overallChange: '+$252,542,491.00 (+251.54%)', isCurrentUser: false },
    { rank: 2, username: 'StockWhisperer', accountValue: '$302,942,320.00', todayChange: '+$45,441,348.00 (+17.65%)', overallChange: '+$202,942,320.00 (+202.94%)', isCurrentUser: false },
    { rank: 3, username: 'eBullish', accountValue: '$274,924,919.00', todayChange: '+$40,386,784.00 (+17.21%)', overallChange: '+$174,924,919.00 (+174.92%)', isCurrentUser: true },
    { rank: 4, username: 'TradeGenius', accountValue: '$245,103,142.00', todayChange: '+$36,765,471.30 (+17.65%)', overallChange: '+$145,103,142.00 (+145.10%)', isCurrentUser: false },
    { rank: 5, username: 'MarketMaster', accountValue: '$215,502,401.00', todayChange: '+$32,325,360.15 (+17.65%)', overallChange: '+$115,502,401.00 (+115.50%)', isCurrentUser: false }
  ]);
  
  // Mock data for my games
  const [myGames, setMyGames] = useState([
    { id: 1, name: 'Beginners', host: 'FinWhiz', details: 'Learn to trade with no pressure', startDate: 'June 11, 2023', endDate: 'No End', players: 1057, startingCash: '$10,000.00', joined: true },
    { id: 2, name: 'Investopedia Game 2024 Q2', host: 'Investopedia', details: 'Official quarterly trading competition', startDate: 'March 29, 2023', endDate: 'No End', players: 843, startingCash: '$100,000.00', joined: true },
    { id: 3, name: 'Investopedia Game 2024 No End', host: 'Investopedia', details: 'Practice your skills indefinitely', startDate: 'February 16, 2023', endDate: 'No End', players: 219, startingCash: '$100,000.00', joined: true },
    { id: 4, name: 'Investopedia Game 2023 No End', host: 'Investopedia', details: 'Last year\'s ongoing competition', startDate: 'December 12, 2022', endDate: 'No End', players: 185, startingCash: '$100,000.00', joined: true },
    { id: 5, name: 'Investopedia Game 2022 No End', host: 'GoldRush', details: 'Archived competition for reference', startDate: 'December 20, 2021', endDate: 'No End', players: 132, startingCash: '$100,000.00', joined: true }
  ]);
  
  // Mock data for available games to join
  const [availableGames, setAvailableGames] = useState([
    { id: 6, name: 'FINM24-SEC3', host: 'FinMaster', details: 'Advanced trading strategies', startDate: 'February 21, 2023', endDate: 'June 21, 2023', players: 3, startingCash: '$1,000,000.00', joined: false, locked: true },
    { id: 7, name: 'Crypto Masters 2024', host: 'CryptoKing', details: 'Cryptocurrency trading competition', startDate: 'April 15, 2024', endDate: 'July 15, 2024', players: 42, startingCash: '$500,000.00', joined: false, locked: false },
    { id: 8, name: 'Stock Market Champions', host: 'WallStreetPro', details: 'Compete with the best traders', startDate: 'May 1, 2024', endDate: 'August 1, 2024', players: 78, startingCash: '$250,000.00', joined: false, locked: false },
    { id: 9, name: 'Day Trader Challenge', host: 'TradingGuru', details: 'Short-term trading competition', startDate: 'June 1, 2024', endDate: 'June 30, 2024', players: 35, startingCash: '$100,000.00', joined: false, locked: false }
  ]);
  
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for create game form
  const [createGameForm, setCreateGameForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    initialCash: 100000,
    visibility: 'public'
  });
  
  // Filter available games based on search term
  const filteredGames = availableGames.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.details.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCreateGameForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleCreateGame = (e) => {
    e.preventDefault();
    // Here you would typically send this data to your backend
    console.log('Creating new game:', createGameForm);
    alert('Game created successfully!');
    // Reset form
    setCreateGameForm({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      initialCash: 100000,
      visibility: 'public'
    });
    // Switch to My Games tab
    setActiveTab('myGames');
  };
  
  // Handle joining a game
  const handleJoinGame = (gameId) => {
    // Here you would typically send a request to join the game
    console.log('Joining game with ID:', gameId);
    
    // Update the available games list
    setAvailableGames(prev => 
      prev.map(game => 
        game.id === gameId ? { ...game, joined: true } : game
      )
    );
    
    // Add the game to my games
    const gameToAdd = availableGames.find(game => game.id === gameId);
    if (gameToAdd) {
      setMyGames(prev => [...prev, { ...gameToAdd, joined: true }]);
    }
    
    alert('Successfully joined the game!');
  };
  
  return (
    <div className="competitions-container">
      <div className="competitions-content">
        <div className="competitions-card">
          {/* Header with navigation tabs */}
          <div className="competitions-header">
            <h1>Competitions</h1>
            <div className="competitions-tabs">
              <div 
                className={`competitions-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                Leaderboard
              </div>
              <div 
                className={`competitions-tab ${activeTab === 'myGames' ? 'active' : ''}`}
                onClick={() => setActiveTab('myGames')}
              >
                My Games
              </div>
              <div 
                className={`competitions-tab ${activeTab === 'joinGame' ? 'active' : ''}`}
                onClick={() => setActiveTab('joinGame')}
              >
                Join Game
              </div>
              <div 
                className={`competitions-tab ${activeTab === 'createGame' ? 'active' : ''}`}
                onClick={() => setActiveTab('createGame')}
              >
                Create Game
              </div>
            </div>
          </div>
          
          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="competitions-body">
              <div className="overflow-x-auto">
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
                      <tr key={user.rank} className={user.isCurrentUser ? 'current-user' : ''}>
                        <td>
                          {user.rank}
                        </td>
                        <td>
                          {user.username} {user.isCurrentUser && <span>(You)</span>}
                        </td>
                        <td>
                          {user.accountValue}
                        </td>
                        <td className="positive">
                          {user.todayChange}
                        </td>
                        <td className="positive">
                          {user.overallChange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <button className="button-secondary">
                  View All Records →
                </button>
              </div>
            </div>
          )}
          
          {/* My Games Tab */}
          {activeTab === 'myGames' && (
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
                      <button className="button-secondary">
                        Details
                      </button>
                    </div>
                    <div className="game-card-details">
                      <div className="game-detail">
                        <span className="game-detail-label"><FaCalendarAlt className="mr-1" /> Start Date</span>
                        <span className="game-detail-value">{game.startDate}</span>
                      </div>
                      <div className="game-detail">
                        <span className="game-detail-label"><FaCalendarAlt className="mr-1" /> End Date</span>
                        <span className="game-detail-value">{game.endDate}</span>
                      </div>
                      <div className="game-detail">
                        <span className="game-detail-label"><FaUsers className="mr-1" /> # of Players</span>
                        <span className="game-detail-value">{game.players.toLocaleString()}</span>
                      </div>
                      <div className="game-detail">
                        <span className="game-detail-label"><FaDollarSign className="mr-1" /> Starting Cash</span>
                        <span className="game-detail-value">{game.startingCash}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Join Game Tab */}
          {activeTab === 'joinGame' && (
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
                        <td>
                          {game.startDate}
                        </td>
                        <td>
                          {game.endDate}
                        </td>
                        <td>
                          {game.players}
                        </td>
                        <td>
                          {game.startingCash}
                        </td>
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
          {activeTab === 'createGame' && (
            <div className="competitions-body">
              <form onSubmit={handleCreateGame}>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="name" className="form-label">Game Name</label>
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
                    <label htmlFor="visibility" className="form-label">Visibility</label>
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
                    <label htmlFor="description" className="form-label">Description</label>
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
                    <label htmlFor="startDate" className="form-label">Start Date</label>
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
                    <label htmlFor="endDate" className="form-label">End Date (leave empty for no end date)</label>
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
                    <label htmlFor="initialCash" className="form-label">Initial Cash Amount ($)</label>
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
                    onClick={() => setActiveTab('myGames')}
                    className="button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button-primary"
                  >
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