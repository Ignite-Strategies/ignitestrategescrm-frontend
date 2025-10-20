import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function YouTubeAuthSuccess() {
  const navigate = useNavigate();
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userIntent, setUserIntent] = useState(null);
  const [storyElements, setStoryElements] = useState({
    seniorLeaderMessage: "",
    memberStories: [],
    playlistFocus: ""
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
        // Set up story elements for F3 Capital
        setStoryElements({
          seniorLeaderMessage: "What message do you want to share from leadership?",
          memberStories: ["Member transformation story", "Community impact story"],
          playlistFocus: "What playlist should this content live in?"
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

  const handleIntentSelect = (intent) => {
    setUserIntent(intent);
  };

  const handleStoryPlanning = () => {
    // Save story elements to localStorage
    localStorage.setItem("youtubeStoryElements", JSON.stringify(storyElements));
    navigate("/youtube/upload");
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
      <div className="max-w-4xl mx-auto space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* YouTube Manager Hub Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900">
            YouTube Story Manager
          </h1>
          
          <p className="text-xl text-gray-600">
            Let's build your storytelling plan
          </p>
        </div>

        {/* Channel Connected */}
        {channelInfo && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <img 
                src={channelInfo.thumbnail} 
                alt="Channel thumbnail" 
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{channelInfo.title}</h3>
                <p className="text-gray-600">Connected and ready for storytelling</p>
              </div>
            </div>
          </div>
        )}

        {/* What are you trying to do? */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            What's your storytelling goal?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleIntentSelect('publish')}
              className={`p-6 rounded-xl border-2 transition ${
                userIntent === 'publish' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Publish Content</h3>
                <p className="text-sm text-gray-600">Upload videos to share your message</p>
              </div>
            </button>

            <button
              onClick={() => handleIntentSelect('plan')}
              className={`p-6 rounded-xl border-2 transition ${
                userIntent === 'plan' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Plan Content</h3>
                <p className="text-sm text-gray-600">Build a storytelling strategy first</p>
              </div>
            </button>
          </div>
        </div>

        {/* Story Planning Section */}
        {userIntent && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 text-center">
              Let's build your story plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">🎯 Playlist Focus</h4>
                <p className="text-sm text-blue-700 mb-4">What playlist should this content live in?</p>
                <input
                  type="text"
                  placeholder="e.g., Member Stories, Leadership Messages"
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-3">👑 Senior Leader Message</h4>
                <p className="text-sm text-green-700 mb-4">What message from leadership?</p>
                <textarea
                  placeholder="Share the vision, values, or call to action..."
                  rows={3}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="font-semibold text-purple-900 mb-3">👥 Member Stories</h4>
                <p className="text-sm text-purple-700 mb-4">What member stories to highlight?</p>
                <textarea
                  placeholder="Transformation stories, community impact..."
                  rows={3}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {userIntent === 'publish' && (
            <button
              onClick={handleStoryPlanning}
              className="px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition shadow-lg"
            >
              I'm Ready - Let's Upload! 🚀
            </button>
          )}
          
          {userIntent === 'plan' && (
            <button
              onClick={handleStoryPlanning}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              Build My Story Plan 📋
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
