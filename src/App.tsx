import React, { useState, useEffect } from 'react';
import { Heart, User, MessageCircle, X, Check, Upload, Users, Sparkles } from 'lucide-react';
import './App.css';

interface User {
  id: string;
  name: string;
  description: string;
  photo: string;
  age?: number;
}

interface FriendRequest {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'declined';
}

// API service functions
const API_BASE_URL = 'http://localhost:3001/api';

const apiService = {
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
    const response = await fetch(`${API_BASE_URL}/friend-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ to: toUserId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send friend request');
    }
    
    return await response.json();
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
      return await response.json(); // Returns array of user IDs
    }
    return [];
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'auth' | 'main'>('auth');
  const [mainTab, setMainTab] = useState<'discover' | 'friends'>('discover');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: ''
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is already authenticated
      const user = await apiService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setCurrentView('main');
        
        // Load user-specific data
        await Promise.all([
          loadUsers(),
          loadFriendRequests(),
          loadFriends()
        ]);
      } else {
        // Load users for discovery even when not authenticated
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

  const loadUsers = async () => {
    try {
      const usersData = await apiService.getAllUsers();
      console.log('Raw users data from backend:', usersData);
      console.log('Sample user object:', usersData[0]);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const requests = await apiService.getFriendRequests();
      setFriendRequests(requests);
    } catch (err) {
      console.error('Failed to load friend requests:', err);
    }
  };

  const loadFriends = async () => {
    try {
      console.log('Loading friends...');
      const friendsData = await apiService.getFriends();
      console.log('Friends data received:', friendsData);
      setFriends(friendsData);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (authMode === 'signup' && !formData.description)) return;

    try {
      setLoading(true);
      setError(null);

      let user: User;
      if (authMode === 'signup') {
        user = await apiService.signUp({
          name: formData.name,
          description: formData.description,
          photo: formData.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=500'
        });
      } else {
        user = await apiService.signIn(formData.name);
      }
      
      setCurrentUser(user);
      setCurrentView('main');
      setFormData({ name: '', description: '', photo: '' });
      
      // Load user-specific data
      await Promise.all([
        loadUsers(),
        loadFriendRequests(),
        loadFriends()
      ]);
    } catch (err) {
      console.error('Authentication failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      if (authMode === 'signin') {
        alert('User not found. Please sign up first.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, photo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const sendFriendRequest = async (toUserId: string) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const newRequest = await apiService.sendFriendRequest(toUserId);
      setFriendRequests(prev => [...prev, newRequest]);
      
      // Move to next user
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error('Failed to send friend request:', err);
      setError('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accepted' | 'declined') => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request || !currentUser) return;

    try {
      setLoading(true);
      console.log(`${action} friend request:`, requestId);
      
      const updatedRequest = await apiService.updateFriendRequest(requestId, action);
      console.log('Updated request:', updatedRequest);
      
      // Immediately reload both friends and friend requests from backend
      const [newFriends, newRequests] = await Promise.all([
        apiService.getFriends(),
        apiService.getFriendRequests()
      ]);
      
      console.log('New friends data:', newFriends);
      console.log('New requests data:', newRequests);
      
      // Update state directly
      setFriends(newFriends);
      setFriendRequests(newRequests);
      
      console.log('State updated after', action);
      
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
      setCurrentView('auth');
      setFormData({ name: '', description: '', photo: '' });
      setFriendRequests([]);
      setFriends([]);
    } catch (err) {
      console.error('Failed to logout:', err);
      // Force logout locally even if API call fails
      setCurrentUser(null);
      setCurrentView('auth');
      setFormData({ name: '', description: '', photo: '' });
      setFriendRequests([]);
      setFriends([]);
    }
  };

  const availableUsers = users.filter(user => 
    user.id !== currentUser?.id && 
    !friends.includes(user.id) &&
    !friendRequests.some(req => req.from === currentUser?.id && req.to === user.id)
  );

  const pendingRequests = friendRequests.filter(req => {
    return String(req.to) === String(currentUser?.id) && req.status === 'pending';
  });

  const userFriends = users.filter(user => {
    const userIdStr = String(user.id);
    const isIncluded = friends.some(friendId => String(friendId) === userIdStr);
    console.log(`Checking user ${user.name} (ID: ${userIdStr}) against friends [${friends.join(', ')}] - Match: ${isIncluded}`);
    return isIncluded;
  });

  console.log('Current friends IDs:', friends);
  console.log('Available users:', users.map(u => ({ id: u.id, name: u.name })));
  console.log('Filtered user friends:', userFriends);

  // Add this debug logging to see what's happening with the friends state
  useEffect(() => {
    console.log('Friends state updated:', friends);
    console.log('Users available:', users.length);
    if (users.length > 0 && friends.length > 0) {
      console.log('Detailed user check:');
      users.forEach(user => {
        const match = friends.includes(String(user.id)) || friends.includes(user.id);
        console.log(`User ${user.name} (ID: ${user.id}, type: ${typeof user.id}) - Friends include this ID: ${match}`);
      });
    }
  }, [friends, users]);

  if (loading) {
    return (
      <div className="loading-container">
        <Heart className="loading-icon" />
        <p>Loading...</p>
      </div>
    );
  }

  if (currentView === 'auth') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <Heart className="logo-icon" />
              <h1>LoveConnect</h1>
            </div>
            <p className="tagline">Find your perfect match</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="auth-toggle">
            <button
              onClick={() => setAuthMode('signup')}
              className={`auth-toggle-btn ${authMode === 'signup' ? 'active' : ''}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setAuthMode('signin')}
              className={`auth-toggle-btn ${authMode === 'signin' ? 'active' : ''}`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                required
              />
            </div>

            {authMode === 'signup' && (
              <>
                <div className="form-group">
                  <label>Photo</label>
                  <div className="photo-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="photo-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="photo-upload" className="upload-btn">
                      <Upload className="upload-icon" />
                      Upload Photo
                    </label>
                    {formData.photo && (
                      <img
                        src={formData.photo}
                        alt="Preview"
                        className="photo-preview"
                      />
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="main-content">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Header */}
        <header className="header">
          <div className="header-logo">
            <Heart className="header-icon" />
            <h1>LoveConnect</h1>
          </div>
          <div className="header-user">
            <span>Hi, {currentUser?.name}!</span>
            <button onClick={logout} className="logout-btn" disabled={loading}>
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>

        {/* Navigation */}
        <div className="nav-container">
          <div className="nav-tabs">
            <button
              onClick={() => setMainTab('discover')}
              className={`nav-tab ${mainTab === 'discover' ? 'active' : ''}`}
            >
              <Sparkles className="nav-icon" />
              Discover
            </button>
            <button
              onClick={() => setMainTab('friends')}
              className={`nav-tab ${mainTab === 'friends' ? 'active' : ''}`}
            >
              <Users className="nav-icon" />
              Friends
              {(pendingRequests.length > 0 || userFriends.length > 0) && (
                <span className="notification-badge">
                  {pendingRequests.length + userFriends.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {mainTab === 'discover' && (
          <div className="discover-container">
            {availableUsers.length > 0 && currentIndex < availableUsers.length ? (
              <div className="profile-card">
                <div className="profile-image-container">
                  <img
                    src={availableUsers[currentIndex].photo}
                    alt={availableUsers[currentIndex].name}
                    className="profile-image"
                  />
                  <div className="profile-overlay">
                    <div className="profile-info">
                      <h3>{availableUsers[currentIndex].name}</h3>
                      {availableUsers[currentIndex].age && (
                        <p>{availableUsers[currentIndex].age} years old</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="profile-content">
                  <p className="profile-description">
                    {availableUsers[currentIndex].description}
                  </p>
                  
                  <div className="profile-actions">
                    <button
                      onClick={() => setCurrentIndex(prev => prev + 1)}
                      className="action-btn pass-btn"
                      disabled={loading}
                    >
                      <X className="action-icon" />
                      Pass
                    </button>
                    <button
                      onClick={() => sendFriendRequest(availableUsers[currentIndex].id)}
                      className="action-btn like-btn"
                      disabled={loading}
                    >
                      <Heart className="action-icon" />
                      {loading ? 'Sending...' : 'Like'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <Heart className="empty-icon" />
                <h3>No more profiles to show</h3>
                <p>Check back later for new matches!</p>
              </div>
            )}
          </div>
        )}

        {mainTab === 'friends' && (
          <div className="friends-container">
            {/* Pending Requests */}
            {pendingRequests.length > 0 ? (
              <div className="section">
                <h2 className="section-title">
                  <MessageCircle className="section-icon" />
                  Friend Requests ({pendingRequests.length})
                </h2>
                <div className="requests-grid">
                  {pendingRequests.map((request) => {
                    const requestUser = users.find(u => String(u.id) === String(request.from));
                    if (!requestUser) return null;
                    
                    return (
                      <div key={request.id} className="request-card">
                        <div className="request-info">
                          <img
                            src={requestUser.photo}
                            alt={requestUser.name}
                            className="request-avatar"
                          />
                          <div className="request-details">
                            <h3>{requestUser.name}</h3>
                            <p>{requestUser.description}</p>
                          </div>
                        </div>
                        <div className="request-actions">
                          <button
                            onClick={() => handleFriendRequest(request.id, 'declined')}
                            className="request-btn decline-btn"
                            disabled={loading}
                          >
                            <X className="request-icon" />
                            Decline
                          </button>
                          <button
                            onClick={() => handleFriendRequest(request.id, 'accepted')}
                            className="request-btn accept-btn"
                            disabled={loading}
                          >
                            <Check className="request-icon" />
                            Accept
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="section">
                <h2 className="section-title">
                  <MessageCircle className="section-icon" />
                  Friend Requests (0)
                </h2>
                <p>No pending friend requests.</p>
              </div>
            )}

            {/* Friends List */}
            <div className="section">
              <h2 className="section-title">
                <Users className="section-icon" />
                Your Friends ({userFriends.length})
              </h2>
              {userFriends.length > 0 ? (
                <div className="friends-grid">
                  {userFriends.map((friend) => (
                    <div key={friend.id} className="friend-card">
                      <img
                        src={friend.photo}
                        alt={friend.name}
                        className="friend-avatar"
                      />
                      <h3>{friend.name}</h3>
                      <p>{friend.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Users className="empty-icon" />
                  <h3>No friends yet</h3>
                  <p>Start swiping to make connections!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;