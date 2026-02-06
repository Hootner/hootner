// Playlist Presenter
import { PlaylistViewModel } from '../viewmodels/PlaylistViewModel.js';

export class PlaylistPresenter {
  constructor(playlistService) {
    this.playlistService = playlistService;
  }

  // Present playlist details
  async presentPlaylist(playlistId, currentUser) {
    const playlist = await this.playlistService.getPlaylistById(playlistId);
    if (!playlist) return null;

    const viewModel = new PlaylistViewModel(playlist);

    // Check viewing permission
    if (!viewModel.canBeViewedBy(currentUser?.id)) {
      throw new Error('This playlist is private');
    }

    return {
      ...viewModel,
      canEdit: viewModel.canBeEditedBy(currentUser?.id),
      canDelete: viewModel.canBeDeletedBy(currentUser?.id, currentUser?.role)
    };
  }

  // Present user's playlists
  async presentUserPlaylists(userId, currentUser) {
    const playlists = await this.playlistService.getUserPlaylists(userId);

    return playlists
      .filter(playlist => {
        const viewModel = new PlaylistViewModel(playlist);
        return viewModel.canBeViewedBy(currentUser?.id);
      })
      .map(playlist => {
        const viewModel = new PlaylistViewModel(playlist);
        return {
          ...viewModel,
          canEdit: viewModel.canBeEditedBy(currentUser?.id),
          canDelete: viewModel.canBeDeletedBy(currentUser?.id, currentUser?.role)
        };
      });
  }

  // Present public playlists
  async presentPublicPlaylists(limit = 20) {
    const playlists = await this.playlistService.getPublicPlaylists(limit);
    return playlists.map(playlist => new PlaylistViewModel(playlist));
  }

  // Present playlist creation form
  presentPlaylistForm(currentUser) {
    return {
      userId: currentUser.id,
      fields: ['title', 'description', 'isPublic'],
      validation: {
        title: { required: true, maxLength: 100 },
        description: { maxLength: 500 }
      },
      defaults: {
        isPublic: true,
        videoIds: []
      }
    };
  }

  // Present playlist for editing
  async presentPlaylistForEdit(playlistId, currentUser) {
    const playlist = await this.playlistService.getPlaylistById(playlistId);
    if (!playlist) return null;

    const viewModel = new PlaylistViewModel(playlist);

    if (!viewModel.canBeEditedBy(currentUser.id)) {
      throw new Error('Unauthorized to edit this playlist');
    }

    return viewModel;
  }
}

export default PlaylistPresenter;
