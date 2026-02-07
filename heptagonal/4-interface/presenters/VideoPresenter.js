// Video Presenter
import { VideoViewModel } from '../viewmodels/VideoViewModel.js';

export class VideoPresenter {
  constructor(videoService) {
    this.videoService = videoService;
  }

  // Present video details
  async presentVideo(videoId, currentUser) {
    const video = await this.videoService.getVideoById(videoId);
    if (!video) return null;

    const viewModel = new VideoViewModel(video);

    // Increment views
    await this.videoService.incrementViews(videoId);
    viewModel.incrementViews();

    return {
      ...viewModel,
      canEdit: viewModel.canBeEditedBy(currentUser?.id),
      canDelete: viewModel.canBeDeletedBy(currentUser?.id, currentUser?.role)
    };
  }

  // Present video list
  async presentVideoList(filters = {}, currentUser) {
    const videos = await this.videoService.getVideos(filters);
    return videos.map(video => new VideoViewModel(video));
  }

  // Present trending videos
  async presentTrendingVideos(limit = 10) {
    const videos = await this.videoService.getTrendingVideos(limit);
    return videos.map(video => new VideoViewModel(video));
  }

  // Present user's videos
  async presentUserVideos(userId, currentUser) {
    const videos = await this.videoService.getUserVideos(userId);
    return videos.map(video => {
      const viewModel = new VideoViewModel(video);
      return {
        ...viewModel,
        canEdit: viewModel.canBeEditedBy(currentUser?.id),
        canDelete: viewModel.canBeDeletedBy(currentUser?.id, currentUser?.role)
      };
    });
  }

  // Present video upload form data
  presentUploadForm(currentUser) {
    return {
      userId: currentUser.id,
      categories: ['Education', 'Entertainment', 'Gaming', 'Music', 'News', 'Sports', 'Technology'],
      maxFileSize: 500 * 1024 * 1024, // 500MB
      acceptedFormats: ['.mp4', '.mov', '.avi', '.mkv']
    };
  }
}

export default VideoPresenter;
