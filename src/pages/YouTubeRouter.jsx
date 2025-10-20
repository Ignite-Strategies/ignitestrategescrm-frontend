import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function YouTubeRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    checkYouTubeConnection();
  }, []);

  const checkYouTubeConnection = () => {
    // Check for YouTube connection in localStorage
    const youtubeChannelId = localStorage.getItem("youtubeChannelId");
    const youtubeTokens = localStorage.getItem("youtubeTokens");

    if (youtubeChannelId && youtubeTokens) {
      // Connected - go straight to hub
      console.log("✅ YouTube connected - routing to hub");
      navigate("/youtube/hub");
    } else {
      // Not connected - go to welcome/OAuth flow
      console.log("⚠️ YouTube not connected - routing to welcome");
      navigate("/youtube/welcome");
    }
  };

  // Loading state while routing
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <p className="text-white text-lg">Loading YouTube...</p>
      </div>
    </div>
  );
}

