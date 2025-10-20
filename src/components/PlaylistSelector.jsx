import { useState, useEffect } from "react";
import { youtubePlaylistService } from "../services/youtubePlaylistService";

export default function PlaylistSelector({ selectedPlaylist, onPlaylistSelect }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const data = await youtubePlaylistService.getPlaylists();
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error("Failed to load playlists:", error);
      // Mock data for now
      setPlaylists([
        {
          id: "PL1",
          title: "Member Stories",
          description: "Transformation stories from our community",
          videoCount: 5
        },
        {
          id: "PL2", 
          title: "Leadership Messages",
          description: "Messages from senior leadership",
          videoCount: 3
        },
        {
          id: "PL3",
          title: "Community Impact",
          description: "Stories of community impact and outreach",
          videoCount: 8
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select Playlist
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Playlist
      </label>
      
      <div className="grid grid-cols-1 gap-3">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => onPlaylistSelect(playlist)}
            className={`p-4 rounded-lg border-2 transition text-left ${
              selectedPlaylist?.id === playlist.id
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{playlist.title}</h3>
                <p className="text-sm text-gray-600">{playlist.description}</p>
                <p className="text-xs text-gray-500">{playlist.videoCount} videos</p>
              </div>
              {selectedPlaylist?.id === playlist.id && (
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
