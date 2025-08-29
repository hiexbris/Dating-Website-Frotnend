import React from 'react';
import { Users, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationProps {
  pendingRequestsCount: number;
  friendsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ pendingRequestsCount, friendsCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="nav-container">
      <div className="nav-tabs">
        <button
          onClick={() => navigate('/discover')}
          className={`nav-tab ${location.pathname === '/discover' ? 'active' : ''}`}
        >
          <Sparkles className="nav-icon" />
          Discover
        </button>
        <button
          onClick={() => navigate('/friends')}
          className={`nav-tab ${location.pathname === '/friends' ? 'active' : ''}`}
        >
          <Users className="nav-icon" />
          Friends
          {(pendingRequestsCount > 0 || friendsCount > 0) && (
            <span className="notification-badge">
              {pendingRequestsCount + friendsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
