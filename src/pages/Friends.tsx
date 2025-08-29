import React from 'react';
import { MessageCircle, Users, X, Check } from 'lucide-react';
import { User, FriendRequest } from '../types';

interface FriendsProps {
  users: User[];
  currentUser: User;
  friendRequests: FriendRequest[];
  friends: string[];
  onHandleFriendRequest: (requestId: string, action: 'accepted' | 'declined') => void;
  loading: boolean;
}

export const Friends: React.FC<FriendsProps> = ({
  users,
  currentUser,
  friendRequests,
  friends,
  onHandleFriendRequest,
  loading
}) => {
  const pendingRequests = friendRequests.filter(req => {
    return String(req.to) === String(currentUser?.id) && req.status === 'pending';
  });

  const userFriends = users.filter(user => {
    const userIdStr = String(user.id);
    return friends.some(friendId => String(friendId) === userIdStr);
  });

  return (
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
                      onClick={() => onHandleFriendRequest(request.id, 'declined')}
                      className="request-btn decline-btn"
                      disabled={loading}
                    >
                      <X className="request-icon" />
                      Decline
                    </button>
                    <button
                      onClick={() => onHandleFriendRequest(request.id, 'accepted')}
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
  );
};
