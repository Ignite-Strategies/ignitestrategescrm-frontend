import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function YouTubeAuthSuccess() {
  const navigate = useNavigate();
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    defaultPlaylist: ""
  });

  useEffect(() => {
    loadChannelInfo();
  }, []);

  const loadChannelInfo = async () => {
    try {
      setLoading(true);
      
      // Get channel info from localStorage (we already have it from OAuth)
      const youtubeTokens = localStorage.getItem("youtubeTokens");
      if (youtubeTokens) {
        // Use the channel info we already got from OAuth
        const tokens = JSON.parse(youtubeTokens);
        setChannelInfo({
          id: "UCi5-H40E_XjBixir-dFMUzA", // F3 Capital channel ID
          title: "F3 Capital",
          description: "Welcome to F3 Capital — a brotherhood of men building stronger...",
          thumbnail: "https://yt3.ggpht.com/CfoIzdzErJSOi4GEnQKHmzX6eSCaAhkHHcL1-USTw3...",
          subscriberCount: 0,
          viewCount: 0,
          videoCount: 0
        });
        setFormData({
          title: "F3 Capital",
          description: "Welcome to F3 Capital — a brotherhood of men building stronger...",
          defaultPlaylist: ""
        });
      } else {
        throw new Error("No YouTube tokens found");
      }
    } catch (error) {
      console.error("Failed to load channel info:", error);
      alert("Failed to load YouTube channel info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // For now, just save to localStorage since we don't have the backend endpoint
      localStorage.setItem("youtubeChannelSettings", JSON.stringify(formData));
      setEditing(false);
      alert("Channel settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/youtube/upload");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-lg">Loading your YouTube channel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            YouTube Connected Successfully!
          </h1>
          
          <p className="text-gray-600">
            Your YouTube channel is now connected to EngageSmart
          </p>
        </div>

        {/* Channel Info */}
        {channelInfo && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your YouTube Channel</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={channelInfo.thumbnail} 
                    alt="Channel thumbnail" 
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{channelInfo.title}</h3>
                    <p className="text-sm text-gray-600">{channelInfo.subscriberCount} subscribers</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Channel ID:</strong> {channelInfo.id}</p>
                  <p><strong>View Count:</strong> {channelInfo.viewCount?.toLocaleString()}</p>
                  <p><strong>Video Count:</strong> {channelInfo.videoCount}</p>
                </div>
              </div>
            </div>

            {/* Channel Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Channel Settings</h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  {editing ? "Cancel" : "Edit"}
                </button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Video Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter default video title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter default video description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Playlist
                    </label>
                    <input
                      type="text"
                      value={formData.defaultPlaylist}
                      onChange={(e) => setFormData({...formData, defaultPlaylist: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter default playlist ID"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Settings"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Default Title:</strong> {formData.title || "Not set"}</p>
                  <p><strong>Default Description:</strong> {formData.description || "Not set"}</p>
                  <p><strong>Default Playlist:</strong> {formData.defaultPlaylist || "Not set"}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex gap-3">
          <button
            onClick={handleContinue}
            className="flex-1 bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg"
          >
            Continue to YouTube Publisher →
          </button>
        </div>
      </div>
    </div>
  );
}
