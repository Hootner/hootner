// User Profile Component
import React from 'react';
import { formatNumber } from '../utils/formatters.js';

export const UserProfile = ({ user, isOwnProfile, onFollow, onUnfollow, onEdit }) => {
  return (
    <div className="user-profile">
      <div className="profile-header">
        <img src={user.avatar || '/assets/default-avatar.jpg'} alt={user.username} className="profile-avatar" />

        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          {user.displayName && <h2 className="profile-displayname">{user.displayName}</h2>}

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{formatNumber(user.followerCount)}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatNumber(user.followingCount)}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat">
              <span className="stat-value">{formatNumber(user.videos?.length || 0)}</span>
              <span className="stat-label">Videos</span>
            </div>
          </div>

          {user.bio && <p className="profile-bio">{user.bio}</p>}

          <div className="profile-actions">
            {isOwnProfile ? (
              <button onClick={onEdit} className="btn-edit-profile">
                Edit Profile
              </button>
            ) : (
              <button
                onClick={user.isFollowing ? onUnfollow : onFollow}
                className={user.isFollowing ? 'btn-unfollow' : 'btn-follow'}
              >
                {user.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      {user.verified && (
        <span className="verified-badge">✓ Verified</span>
      )}
    </div>
  );
};

export default UserProfile;
