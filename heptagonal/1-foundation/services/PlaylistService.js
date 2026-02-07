// Playlist Service
import PlaylistRepository from '../repositories/PlaylistRepository.js';
import VideoRepository from '../repositories/VideoRepository.js';

export class PlaylistService {
  constructor() {
    this.repository = new PlaylistRepository();
    this.videoRepository = new VideoRepository();
  }

  async createPlaylist(playlistData, userId) {
    return await this.repository.create({
      ...playlistData,
      userId
    });
  }

  async getPlaylistById(id) {
    return await this.repository.findById(id);
  }

  async getPlaylistsByUser(userId, limit = 100) {
    return await this.repository.findByUser(userId, limit);
  }

  async getPublicPlaylists(limit = 100) {
    return await this.repository.findPublic(limit);
  }

  async updatePlaylist(id, updates, userId) {
    const playlist = await this.repository.findById(id);

    if (!playlist || playlist.userId !== userId) {
      throw new Error('Cannot edit this playlist');
    }

    return await this.repository.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async deletePlaylist(id, userId) {
    const playlist = await this.repository.findById(id);

    if (!playlist || playlist.userId !== userId) {
      throw new Error('Cannot delete this playlist');
    }

    return await this.repository.delete(id);
  }

  async addVideo(playlistId, videoId, userId) {
    const playlist = await this.repository.findById(playlistId);

    if (!playlist || playlist.userId !== userId) {
      throw new Error('Cannot edit this playlist');
    }

    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    return await this.repository.addVideo(playlistId, videoId, video.duration);
  }

  async removeVideo(playlistId, videoId, userId) {
    const playlist = await this.repository.findById(playlistId);

    if (!playlist || playlist.userId !== userId) {
      throw new Error('Cannot edit this playlist');
    }

    const video = await this.videoRepository.findById(videoId);
    const duration = video?.duration || 0;

    return await this.repository.removeVideo(playlistId, videoId, duration);
  }

  async reorderVideos(playlistId, newOrder, userId) {
    const playlist = await this.repository.findById(playlistId);

    if (!playlist || playlist.userId !== userId) {
      throw new Error('Cannot edit this playlist');
    }

    return await this.repository.update(playlistId, {
      videoIds: newOrder,
      updatedAt: new Date().toISOString()
    });
  }
}

export default PlaylistService;
