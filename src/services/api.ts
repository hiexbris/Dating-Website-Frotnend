import { User, FriendRequest } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const apiService = {
  // User operations
  async getCurrentUser(): Promise<User | null> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include'
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  },

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  },

  async signUp(userData: { name: string; description: string; photo: string }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sign up');
    }
    
    return await response.json();
  },

  async signIn(name: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sign in');
    }
    
    return await response.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  },

  // Friend request operations
  async getFriendRequests(): Promise<FriendRequest[]> {
    const response = await fetch(`${API_BASE_URL}/friend-requests`, {
      credentials: 'include'
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  },

  async sendFriendRequest(toUserId: string): Promise<FriendRequest> {
    console.log('API: Sending friend request to:', toUserId, 'type:', typeof toUserId);
    
    const requestBody = { to: toUserId };
    console.log('API: Request body:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/friend-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });
    
    console.log('API: Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API: Error response:', errorText);
      throw new Error(`Failed to send friend request: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API: Success response:', result);
    return result;
  },

  async updateFriendRequest(requestId: string, status: 'accepted' | 'declined'): Promise<FriendRequest> {
    const response = await fetch(`${API_BASE_URL}/friend-requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update friend request');
    }
    
    return await response.json();
  },

  // Friends operations
  async getFriends(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/friends`, {
      credentials: 'include'
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  }
};
