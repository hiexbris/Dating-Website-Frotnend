import React, { useState } from 'react';
import { Heart, X } from 'lucide-react';
import { User, FriendRequest } from '../types';

interface DiscoverProps {
  users: User[];
  currentUser: User;
  friends: string[];
  friendRequests: FriendRequest[];
  onSendFriendRequest: (userId: string) => void;
  loading: boolean;
}

export const Discover: React.FC<DiscoverProps> = ({
  users,
  currentUser,
  friends,
  friendRequests,
  onSendFriendRequest,
  loading
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const availableUsers = users.filter(user => {
    // Exclude current user
    if (user.id === currentUser?.id) return false;
    
    // Exclude friends
    if (friends.includes(user.id)) return false;
    
    // Exclude users we already sent requests to (any status)
    const alreadySentRequest = friendRequests.some(req => 
      String(req.from) === String(currentUser?.id) && 
      String(req.to) === String(user.id)
    );
    if (alreadySentRequest) return false;
    
    // Exclude users who sent us requests (to avoid duplicate requests)
    const receivedRequest = friendRequests.some(req => 
      String(req.from) === String(user.id) && 
      String(req.to) === String(currentUser?.id)
    );
    if (receivedRequest) return false;
    
    return true;
  });

  console.log('Current user:', currentUser?.id);
  console.log('All users:', users.map(u => ({ id: u.id, name: u.name })));
  console.log('Friends:', friends);
  console.log('Friend requests:', friendRequests);
  console.log('Available users after filtering:', availableUsers.map(u => ({ id: u.id, name: u.name })));

  const handleLike = async () => {
    if (availableUsers[currentIndex]) {
      console.log('Sending friend request to:', availableUsers[currentIndex]);
      await onSendFriendRequest(availableUsers[currentIndex].id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  if (availableUsers.length === 0 || currentIndex >= availableUsers.length) {
    return (
      <div className="discover-container">
        <div className="empty-state">
          <Heart className="empty-icon" />
          <h3>No more profiles to show</h3>
          <p>Check back later for new matches!</p>
        </div>
      </div>
    );
  }

  const currentProfile = availableUsers[currentIndex];

  return (
    <div className="discover-container">
      <div className="profile-card">
        <div className="profile-image-container">
          <img
            src={currentProfile.photo}
            alt={currentProfile.name}
            className="profile-image"
          />
          <div className="profile-overlay">
            <div className="profile-info">
              <h3>{currentProfile.name}</h3>
              {currentProfile.age && (
                <p>{currentProfile.age} years old</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-content">
          <p className="profile-description">
            {currentProfile.description}
          </p>
          
          <div className="profile-actions">
            <button
              onClick={handlePass}
              className="action-btn pass-btn"
              disabled={loading}
            >
              <X className="action-icon" />
              Pass
            </button>
            <button
              onClick={handleLike}
              className="action-btn like-btn"
              disabled={loading}
            >
              <Heart className="action-icon" />
              {loading ? 'Sending...' : 'Like'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
