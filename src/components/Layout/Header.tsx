import React from 'react';
import { Heart } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, loading }) => {
  return (
    <header className="header">
      <div className="header-logo">
        <Heart className="header-icon" />
        <h1>DevSoc</h1>
      </div>
      <div className="header-user">
        <span>Hi, {user.name}!</span>
        <button onClick={onLogout} className="logout-btn" disabled={loading}>
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </header>
  );
};
