// Navigation Component
import React from 'react';
import { Link } from 'react-router-dom';

export const Navigation = ({ currentUser, onLogout, onSearch }) => {
  return (
    <nav className="navigation">
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          🦉 HOOTNER
        </Link>

        <div className="nav-search">
          <input
            type="search"
            placeholder="Search videos..."
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
      </div>

      <div className="nav-right">
        {currentUser ? (
          <>
            <Link to="/upload" className="nav-link">
              📤 Upload
            </Link>
            <Link to="/notifications" className="nav-link">
              🔔 Notifications
            </Link>
            <div className="nav-user">
              <img src={currentUser.avatar || '/assets/default-avatar.jpg'} alt={currentUser.username} className="nav-avatar" />
              <div className="user-menu">
                <Link to={`/profile/${currentUser.id}`}>Profile</Link>
                <Link to="/settings">Settings</Link>
                <Link to="/my-videos">My Videos</Link>
                <Link to="/playlists">Playlists</Link>
                <button onClick={onLogout}>Logout</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn-register">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
