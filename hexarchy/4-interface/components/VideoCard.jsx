// Video Card Component
import React from 'react';
import { formatDuration, formatViews, formatDate } from '../utils/formatters.js';

export const VideoCard = ({ video, onVideoClick, onAuthorClick }) => {
  return (
    <div className="video-card" onClick={() => onVideoClick(video.id)}>
      <div className="video-thumbnail">
        <img src={video.thumbnailUrl || '/assets/default-thumbnail.jpg'} alt={video.title} />
        {video.duration && (
          <span className="duration">{formatDuration(video.duration)}</span>
        )}
      </div>

      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>

        <div className="video-author" onClick={(e) => {
          e.stopPropagation();
          onAuthorClick(video.author.id);
        }}>
          <img src={video.author.avatar || '/assets/default-avatar.jpg'} alt={video.author.username} className="author-avatar" />
          <span className="author-name">{video.author.username}</span>
        </div>

        <div className="video-meta">
          <span className="views">{formatViews(video.views)} views</span>
          <span className="separator">•</span>
          <span className="date">{formatDate(video.createdAt)}</span>
        </div>

        <div className="video-stats">
          <span className="likes">👍 {video.likes}</span>
          <span className="comments">💬 {video.commentCount}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
