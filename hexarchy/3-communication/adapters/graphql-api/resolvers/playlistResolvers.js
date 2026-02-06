const Playlist = require('../models/Playlist')

module.exports = {
  Query: {
    playlists: async (_, { userId, limit = 20 }) => {
      const query = userId ? { userId } : { visibility: 'PUBLIC' }
      return Playlist.find(query).limit(limit).populate('userId').populate('videos')
    },

    playlist: async (_, { id }) => {
      return Playlist.findById(id).populate('userId').populate('videos')
    },

    myPlaylists: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated')
      return Playlist.find({ userId: user.id }).populate('videos')
    },
  },

  Mutation: {
    createPlaylist: async (_, { input }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      const playlist = new Playlist({ ...input, userId: user.id })
      return playlist.save()
    },

    updatePlaylist: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      const playlist = await Playlist.findOne({ _id: id, userId: user.id })
      if (!playlist) throw new Error('Playlist not found')
      Object.assign(playlist, input)
      return playlist.save()
    },

    deletePlaylist: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      const result = await Playlist.deleteOne({ _id: id, userId: user.id })
      return result.deletedCount > 0
    },

    addVideoToPlaylist: async (_, { playlistId, videoId }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      const playlist = await Playlist.findOne({ _id: playlistId, userId: user.id })
      if (!playlist) throw new Error('Playlist not found')
      if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId)
        await playlist.save()
      }
      return playlist.populate('videos')
    },

    removeVideoFromPlaylist: async (_, { playlistId, videoId }, { user }) => {
      if (!user) throw new Error('Not authenticated')
      const playlist = await Playlist.findOne({ _id: playlistId, userId: user.id })
      if (!playlist) throw new Error('Playlist not found')
      playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId)
      await playlist.save()
      return playlist.populate('videos')
    },
  },
}
