// Types for our user data
export interface UserProfile {
  username: string;
  balance: number;
  email: string;
  joinDate: string;
}

export interface CompetitionRecord {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  rank: number;
  performance: number;
}

// Base URL for API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetch user profile data
 * @param userId The ID of the user to fetch
 * @returns Promise with user profile data
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  // In a real application, this would make an actual API call
  // For now, we'll return mock data
  
  // Mock implementation - replace with actual API call when backend is ready
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        username: 'JohnDoe',
        balance: 10000.75,
        email: 'john@example.com',
        joinDate: '2025-01-15',
      });
    }, 500);
  });
  
  // Real implementation would be:
  // const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  // if (!response.ok) {
  //   throw new Error('Failed to fetch user profile');
  // }
  // return response.json();
}

/**
 * Fetch user competition records
 * @param userId The ID of the user to fetch competitions for
 * @returns Promise with competition records
 */
export async function getUserCompetitions(userId: string): Promise<CompetitionRecord[]> {
  // Mock implementation - replace with actual API call when backend is ready
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: 'Weekly Challenge #5',
          startDate: '2025-05-01',
          endDate: '2025-05-07',
          rank: 3,
          performance: 7.2,
        },
        {
          id: '2',
          name: 'Monthly Investor',
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          rank: 12,
          performance: 4.8,
        },
      ]);
    }, 500);
  });
  
  // Real implementation would be:
  // const response = await fetch(`${API_BASE_URL}/users/${userId}/competitions`);
  // if (!response.ok) {
  //   throw new Error('Failed to fetch user competitions');
  // }
  // return response.json();
}
