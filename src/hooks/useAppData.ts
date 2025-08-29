import { useState, useEffect } from 'react';
import { User, FriendRequest } from '../types';
import { apiService } from '../services/api';

export const useAppData = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const usersData = await apiService.getAllUsers();
      console.log('Users loaded:', usersData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const requests = await apiService.getFriendRequests();
      console.log('Friend requests loaded:', requests);
      setFriendRequests(requests);
    } catch (err) {
      console.error('Failed to load friend requests:', err);
    }
  };

  const loadFriends = async () => {
    try {
      const friendsData = await apiService.getFriends();
      console.log('Friends loaded:', friendsData);
      setFriends(friendsData);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await apiService.getCurrentUser();
      console.log('Current user loaded:', user);
      
      if (user) {
        setCurrentUser(user);
        
        await Promise.all([
          loadUsers(),
          loadFriendRequests(),
          loadFriends()
        ]);
      } else {
        await loadUsers();
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load data from server.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (toUserId: string) => {
    if (!currentUser) {
      console.error('No current user');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Sending friend request from', currentUser.id, 'to', toUserId, 'type:', typeof toUserId);
      
      const newRequest = await apiService.sendFriendRequest(toUserId);
      console.log('Friend request created:', newRequest);
      
      setFriendRequests(prev => [...prev, newRequest]);
    } catch (err) {
      console.error('Failed to send friend request:', err);
      setError('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accepted' | 'declined') => {
    try {
      setLoading(true);
      console.log('Handling friend request:', requestId, 'action:', action);
      
      await apiService.updateFriendRequest(requestId, action);
      
      const [newFriends, newRequests] = await Promise.all([
        apiService.getFriends(),
        apiService.getFriendRequests()
      ]);
      
      console.log('Updated friends:', newFriends);
      console.log('Updated requests:', newRequests);
      
      setFriends(newFriends);
      setFriendRequests(newRequests);
      
    } catch (err) {
      console.error('Failed to update friend request:', err);
      setError('Failed to update friend request');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setCurrentUser(null);
      setFriendRequests([]);
      setFriends([]);
    } catch (err) {
      console.error('Failed to logout:', err);
      setCurrentUser(null);
      setFriendRequests([]);
      setFriends([]);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return {
    currentUser,
    users,
    friendRequests,
    friends,
    loading,
    error,
    setCurrentUser,
    setError,
    loadInitialData,
    sendFriendRequest,
    handleFriendRequest,
    logout
  };
};
