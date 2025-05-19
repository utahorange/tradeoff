'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Competition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: number;
  prize: string;
  status: 'active' | 'upcoming' | 'completed';
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  useEffect(() => {
    // In a real app, this would fetch from your backend API
    const fetchCompetitions = async () => {
      try {
        // Mock data - replace with actual API call
        const mockCompetitions: Competition[] = [
          {
            id: '1',
            name: 'Weekly Challenge #5',
            startDate: '2025-05-01',
            endDate: '2025-05-07',
            participants: 42,
            prize: '$500',
            status: 'active',
          },
          {
            id: '2',
            name: 'Monthly Investor',
            startDate: '2025-04-01',
            endDate: '2025-04-30',
            participants: 156,
            prize: '$1,000',
            status: 'completed',
          },
          {
            id: '3',
            name: 'Tech Stock Showdown',
            startDate: '2025-05-15',
            endDate: '2025-05-30',
            participants: 28,
            prize: '$750',
            status: 'upcoming',
          },
          {
            id: '4',
            name: 'Beginner Friendly Challenge',
            startDate: '2025-05-10',
            endDate: '2025-05-17',
            participants: 64,
            prize: '$250',
            status: 'active',
          },
        ];

        // Simulate API delay
        setTimeout(() => {
          setCompetitions(mockCompetitions);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching competitions:', error);
        setIsLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const filteredCompetitions = competitions.filter(comp => comp.status === activeTab);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Trading Competitions</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-700 mb-4">
          Compete with other traders in time-limited competitions. Build your portfolio, make strategic trades, and climb the leaderboard to win prizes!
        </p>
        
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
        </div>
        
        {filteredCompetitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCompetitions.map((competition) => (
              <div key={competition.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{competition.name}</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    competition.status === 'active' ? 'bg-green-100 text-green-800' :
                    competition.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  <span className="font-medium">{competition.participants}</span> participants • Prize: <span className="font-medium">{competition.prize}</span>
                </p>
                <div className="flex justify-end">
                  <Link
                    href={`/competitions/${competition.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {competition.status === 'active' ? 'View Details' :
                     competition.status === 'upcoming' ? 'Join Competition' :
                     'View Results'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No {activeTab} competitions available at the moment.</p>
        )}
      </div>
    </div>
  );
}
