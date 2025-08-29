import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { AuthPage } from './components/Auth/AuthPage';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { Discover } from './pages/Discover';
import { Friends } from './pages/Friends';
import { useAppData } from './hooks/useAppData';
import './App.css';

function App() {
  const {
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
  } = useAppData();

  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    await loadInitialData();
  };

  const pendingRequests = friendRequests.filter(req => 
    String(req.to) === String(currentUser?.id) && req.status === 'pending'
  );

  const userFriends = users.filter(user => 
    friends.some(friendId => String(friendId) === String(user.id))
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Heart className="loading-icon" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthPage 
        onAuthSuccess={handleAuthSuccess}
        onError={setError}
      />
    );
  }

  return (
    <Router>
      <div className="main-container">
        <div className="main-content">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          <Header 
            user={currentUser} 
            onLogout={logout} 
            loading={loading} 
          />

          <Navigation 
            pendingRequestsCount={pendingRequests.length}
            friendsCount={userFriends.length}
          />

          <Routes>
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route 
              path="/discover" 
              element={
                <Discover
                  users={users}
                  currentUser={currentUser}
                  friends={friends}
                  friendRequests={friendRequests}
                  onSendFriendRequest={sendFriendRequest}
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/friends" 
              element={
                <Friends
                  users={users}
                  currentUser={currentUser}
                  friendRequests={friendRequests}
                  friends={friends}
                  onHandleFriendRequest={handleFriendRequest}
                  loading={loading}
                />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;