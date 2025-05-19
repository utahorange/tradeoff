'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserProfile, getUserCompetitions, UserProfile, CompetitionRecord } from '../services/userService';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real app, you would get the userId from authentication context
        const userId = 'current-user-id';
        
        // Fetch user profile and competition data in parallel
        const [profileData, competitionsData] = await Promise.all([
          getUserProfile(userId),
          getUserCompetitions(userId)
        ]);
        
        setProfile(profileData);
        setCompetitions(competitionsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      {profile && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
              {profile.username.charAt(0)}
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-semibold">{profile.username}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500">Member since {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Account Balance</h3>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">${profile.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500">Available for trading</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Competition History</h3>
        
        {competitions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {competitions.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{comp.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(comp.startDate).toLocaleDateString()} - {new Date(comp.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">#{comp.rank}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${comp.performance > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {comp.performance > 0 ? '+' : ''}{comp.performance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">You haven't participated in any competitions yet.</p>
        )}
        
        <div className="mt-6">
          <Link href="/competitions" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Join a Competition
          </Link>
        </div>
      </div>
    </div>
  );
}
