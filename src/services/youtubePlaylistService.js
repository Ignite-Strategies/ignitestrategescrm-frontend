import api from '../lib/api';

export const youtubePlaylistService = {
  // Get playlists from YouTube API
  async getPlaylists() {
    try {
      const response = await api.get('/youtube/playlists');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      throw error;
    }
  },

  // Create a new playlist
  async createPlaylist(playlistData) {
    try {
      const response = await api.post('/youtube/playlists', playlistData);
      return response.data;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  },

  // Update playlist
  async updatePlaylist(playlistId, playlistData) {
    try {
      const response = await api.patch(`/youtube/playlists/${playlistId}`, playlistData);
      return response.data;
    } catch (error) {
      console.error('Failed to update playlist:', error);
      throw error;
    }
  },

  // Delete playlist
  async deletePlaylist(playlistId) {
    try {
      const response = await api.delete(`/youtube/playlists/${playlistId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      throw error;
    }
  },

  // Get playlist videos
  async getPlaylistVideos(playlistId) {
    try {
      const response = await api.get(`/youtube/playlists/${playlistId}/videos`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch playlist videos:', error);
      throw error;
    }
  },

  // Add video to playlist
  async addVideoToPlaylist(playlistId, videoId) {
    try {
      const response = await api.post(`/youtube/playlists/${playlistId}/videos`, { videoId });
      return response.data;
    } catch (error) {
      console.error('Failed to add video to playlist:', error);
      throw error;
    }
  }
};
