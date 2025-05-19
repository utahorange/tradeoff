'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Competition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: number;
  startingCash: string;
  creator: string;
  status: 'active' | 'upcoming' | 'completed';
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  accountValue: string;
  todaysChange: string;
  todaysChangePercent: number;
  overallChange: string;
  overallChangePercent: number;
  isPositive: boolean;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'my-games' | 'join-game' | 'create-game'>('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In a real app, this would fetch from your backend API
    const fetchData = async () => {
      try {
        // Mock data - replace with actual API call
        const mockCompetitions: Competition[] = [
          {
            id: '1',
            name: 'Weekly Challenge #5',
            startDate: '2025-05-01',
            endDate: '2025-05-07',
            participants: 42,
            startingCash: '$10,000.00',
            creator: 'Tradeoff',
            status: 'active',
          },
          {
            id: '2',
            name: 'Monthly Investor',
            startDate: '2025-04-01',
            endDate: '2025-04-30',
            participants: 156,
            startingCash: '$100,000.00',
            creator: 'Tradeoff',
            status: 'completed',
          },
          {
            id: '3',
            name: 'Tech Stock Showdown',
            startDate: '2025-05-15',
            endDate: '2025-05-30',
            participants: 28,
            startingCash: '$50,000.00',
            creator: 'Tradeoff',
            status: 'upcoming',
          },
          {
            id: '4',
            name: 'Beginner Friendly Challenge',
            startDate: '2025-05-10',
            endDate: 'No End',
            participants: 64,
            startingCash: '$10,000.00',
            creator: 'Tradeoff',
            status: 'active',
          },
        ];

        const mockLeaderboard: LeaderboardEntry[] = [
          {
            rank: 1,
            username: 'tradingpro',
            accountValue: '$105,242,492,602.00',
            todaysChange: '$381,644,904,490.00',
            todaysChangePercent: 3.86,
            overallChange: '105,242,492,602.00%',
            overallChangePercent: 105.24,
            isPositive: true
          },
          {
            rank: 2,
            username: 'investorking',
            accountValue: '$102,362,153,602.00',
            todaysChange: '$377,263,089,650.00',
            todaysChangePercent: 3.75,
            overallChange: '102,362,153,602.00%',
            overallChangePercent: 102.36,
            isPositive: true
          },
          {
            rank: 3,
            username: 'stockguru',
            accountValue: '$92,634,509,814.00',
            todaysChange: '$456,383,326,795.00',
            todaysChangePercent: 5.02,
            overallChange: '92,634,509,714.00%',
            overallChangePercent: 92.63,
            isPositive: true
          },
          {
            rank: 4,
            username: 'wallstreetwhiz',
            accountValue: '$84,185,128,740.00',
            todaysChange: '$376,919,974,586.00',
            todaysChangePercent: 4.49,
            overallChange: '84,185,178,640.00%',
            overallChangePercent: 84.18,
            isPositive: true
          },
          {
            rank: 5,
            username: 'marketmaster',
            accountValue: '$80,580,403,429.00',
            todaysChange: '$406,651,920,040.00',
            todaysChangePercent: 5.15,
            overallChange: '80,580,403,329.00%',
            overallChangePercent: 80.58,
            isPositive: true
          },
        ];

        // Simulate API delay
        setTimeout(() => {
          setCompetitions(mockCompetitions);
          setLeaderboard(mockLeaderboard);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCompetitions = competitions.filter(comp => 
    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comp.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return renderLeaderboard();
      case 'my-games':
        return renderMyGames();
      case 'join-game':
        return renderJoinGame();
      case 'create-game':
        return renderCreateGame();
      default:
        return renderLeaderboard();
    }
  };
  
  const renderLeaderboard = () => {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-3 px-4 font-semibold text-sm text-black">Rank</th>
              <th className="py-3 px-4 font-semibold text-sm text-black">User</th>
              <th className="py-3 px-4 font-semibold text-sm text-black">Account Value</th>
              <th className="py-3 px-4 font-semibold text-sm text-black">Today's Change</th>
              <th className="py-3 px-4 font-semibold text-sm text-black">Overall Change</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.rank} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-black">{entry.rank}</td>
                <td className="py-3 px-4 text-blue-600">{entry.username}</td>
                <td className="py-3 px-4 text-black">{entry.accountValue}</td>
                <td className={`py-3 px-4 ${entry.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.todaysChange} ({entry.todaysChangePercent}%)
                  {entry.isPositive ? ' ↑' : ' ↓'}
                </td>
                <td className={`py-3 px-4 ${entry.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.overallChange}
                  {entry.isPositive ? ' ↑' : ' ↓'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button className="text-blue-600 text-sm hover:underline flex items-center">
            See all Results
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  const renderMyGames = () => {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-3 px-4 font-semibold text-sm text-black">Game Name</th>
              <th className="py-3 px-4 font-semibold text-sm text-black">Start Date</th>
              <th className="py-3 px-4 font-semibold text-sm text-black">End Date</th>
              <th className="py-3 px-4 font-semibold text-sm text-black"># of Players</th>
              <th className="py-3 px-4 font-semibold text-sm text-black">Your Rank</th>
              <th className="py-3 px-4 font-semibold text-sm text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitions.filter(comp => comp.status === 'active').map((competition) => (
              <tr key={competition.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-black">{competition.name}</td>
                <td className="py-3 px-4 text-black">{new Date(competition.startDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-black">{competition.endDate === 'No End' ? 'No End' : new Date(competition.endDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-black">{competition.participants}</td>
                <td className="py-3 px-4 text-black">5 of {competition.participants}</td>
                <td className="py-3 px-4 text-black">
                  <Link
                    href={`/competitions/${competition.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Go to Game
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderJoinGame = () => {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2 text-black">Game Lookup</h3>
          <p className="text-xs text-gray-500 mb-2">Look up game name or creator</p>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a game..."
              className="w-full p-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder:text-gray-500"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-3 px-4 font-semibold text-sm text-black">Game Name</th>
                <th className="py-3 px-4 font-semibold text-sm text-black">Game Info</th>
                <th className="py-3 px-4 font-semibold text-sm text-black">Start Date</th>
                <th className="py-3 px-4 font-semibold text-sm text-black">End Date</th>
                <th className="py-3 px-4 font-semibold text-sm text-black"># of Players</th>
                <th className="py-3 px-4 font-semibold text-sm text-black">Starting Cash</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompetitions.map((competition) => (
                <tr key={competition.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-black">
                    <div className="font-medium text-black">{competition.name}</div>
                    <div className="text-xs text-gray-500">by {competition.creator}</div>
                  </td>
                  <td className="py-3 px-4 text-black">
                    <div className="flex space-x-2">
                      <Link href={`/competitions/${competition.id}`} className="text-blue-600 text-sm hover:underline">
                        Details
                      </Link>
                      <span className="text-gray-300">|</span>
                      <button className="text-blue-600 text-sm hover:underline flex items-center">
                        Join
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">{new Date(competition.startDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-black">{competition.endDate === 'No End' ? 'No End' : new Date(competition.endDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-black">{competition.participants}</td>
                  <td className="py-3 px-4 text-black">{competition.startingCash}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-center mt-4">
            <nav className="inline-flex">
              <button className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                &lt;
              </button>
              <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                1
              </button>
              <button className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                &gt;
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };
  
  const renderCreateGame = () => {
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-black">Create New Competition</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Competition Name</label>
            <input type="text" className="w-full p-2 border rounded-md text-black font-medium placeholder:text-gray-500" placeholder="Enter a name for your competition" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Start Date</label>
              <input type="date" className="w-full p-2 border rounded-md text-black font-medium" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">End Date</label>
              <input type="date" className="w-full p-2 border rounded-md text-black font-medium" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Starting Cash</label>
              <input type="text" className="w-full p-2 border rounded-md text-black font-medium placeholder:text-gray-500" placeholder="$10,000.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Max Participants</label>
              <input type="number" className="w-full p-2 border rounded-md text-black font-medium placeholder:text-gray-500" placeholder="Unlimited" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Competition Rules</label>
            <textarea className="w-full p-2 border rounded-md h-24 text-black font-medium placeholder:text-gray-500" placeholder="Describe the rules for your competition"></textarea>
          </div>
          
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create Competition
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-black">Trading Competitions</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Navigation Tabs - Similar to Investopedia */}
        <div className="bg-gray-100 border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 text-sm font-medium text-black ${activeTab === 'leaderboard' ? 'bg-white border-t-2 border-blue-600' : 'hover:bg-gray-200'}`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('my-games')}
              className={`px-6 py-3 text-sm font-medium text-black ${activeTab === 'my-games' ? 'bg-white border-t-2 border-blue-600' : 'hover:bg-gray-200'}`}
            >
              My Games
            </button>
            <button
              onClick={() => setActiveTab('join-game')}
              className={`px-6 py-3 text-sm font-medium text-black ${activeTab === 'join-game' ? 'bg-white border-t-2 border-blue-600' : 'hover:bg-gray-200'}`}
            >
              Join Game
            </button>
            <button
              onClick={() => setActiveTab('create-game')}
              className={`px-6 py-3 text-sm font-medium text-black ${activeTab === 'create-game' ? 'bg-white border-t-2 border-blue-600' : 'hover:bg-gray-200'}`}
            >
              Create Game
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
