// Playlist Card Component
import React from 'react';

export const PlaylistCard = ({ playlist, onPlaylistClick }) => {
  return (
    <div className="playlist-card" onClick={() => onPlaylistClick(playlist.id)}>
      <div className="playlist-thumbnail">
        <img src={playlist.thumbnail || '/assets/default-playlist.jpg'} alt={playlist.title} />
        <div className="playlist-overlay">
          <span className="video-count">{playlist.videoCount} videos</span>
        </div>
      </div>

      <div className="playlist-info">
        <h3 className="playlist-title">{playlist.title}</h3>

        {playlist.description && (
          <p className="playlist-description">{playlist.description}</p>
        )}

        <div className="playlist-meta">
          <span className="creator">{playlist.creator.username}</span>
          <span className="separator">•</span>
          <span className="visibility">{playlist.isPublic ? 'Public' : 'Private'}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;
