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

  const handleContinue = () => {
    navigate("/youtube/hub");
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
      <div className="max-w-2xl mx-auto text-center space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* Success Header */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900">
            YouTube Connected! 🎉
          </h1>
          
          <p className="text-xl text-gray-600">
            Your YouTube channel is now connected to EngageSmart
          </p>
        </div>

        {/* Channel Info */}
        {channelInfo && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-center gap-4">
              <img 
                src={channelInfo.thumbnail} 
                alt="Channel thumbnail" 
                className="w-16 h-16 rounded-full"
              />
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">{channelInfo.title}</h3>
                <p className="text-gray-600">Ready for storytelling</p>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-red-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-red-700 transition shadow-lg"
        >
          Go to YouTube Hub →
        </button>
      </div>
    </div>
  );
}
