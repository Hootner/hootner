// Playlist Repository
import { BaseRepository } from './BaseRepository.js';
import { Playlist } from '../models/Playlist.js';

export class PlaylistRepository extends BaseRepository {
  constructor() {
    super(process.env.PLAYLISTS_TABLE || 'Playlists');
  }

  async create(playlistData) {
    const playlist = new Playlist({
      id: `playlist-${Date.now()}`,
      ...playlistData
    });
    await super.create(playlist);
    return playlist;
  }

  async findById(id) {
    const data = await super.findById(id);
    return data ? new Playlist(data) : null;
  }

  async findByUser(userId, limit = 100) {
    const results = await this.query(
      'userId = :userId',
      { ':userId': userId },
      { IndexName: 'UserIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Playlist(data));
  }

  async findPublic(limit = 100) {
    const results = await this.query(
      'visibility = :visibility',
      { ':visibility': 'public' },
      { IndexName: 'VisibilityIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Playlist(data));
  }

  async addVideo(playlistId, videoId, duration = 0) {
    const playlist = await this.findById(playlistId);
    if (playlist) {
      playlist.addVideo(videoId, duration);
      return await this.update(playlistId, {
        videoIds: playlist.videoIds,
        videoCount: playlist.videoCount,
        totalDuration: playlist.totalDuration,
        updatedAt: playlist.updatedAt
      });
    }
    return null;
  }

  async removeVideo(playlistId, videoId, duration = 0) {
    const playlist = await this.findById(playlistId);
    if (playlist) {
      playlist.removeVideo(videoId, duration);
      return await this.update(playlistId, {
        videoIds: playlist.videoIds,
        videoCount: playlist.videoCount,
        totalDuration: playlist.totalDuration,
        updatedAt: playlist.updatedAt
      });
    }
    return null;
  }
}

export default PlaylistRepository;
