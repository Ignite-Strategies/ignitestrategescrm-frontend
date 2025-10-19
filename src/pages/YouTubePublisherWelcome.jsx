import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function YouTubePublisherWelcome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Get user name from localStorage
    const email = localStorage.getItem("email") || "there";
    const name = email.includes("@") ? email.split("@")[0] : email;
    setUserName(name);

    // Check if already connected to YouTube
    const youtubeTokens = localStorage.getItem("youtubeTokens");
    if (youtubeTokens) {
      setIsConnected(true);
    }
  }, []);

  const handleConnectYouTube = async () => {
    setConnecting(true);
    try {
      // Redirect to backend OAuth flow
      window.location.href = '/api/auth/youtube';
    } catch (error) {
      console.error("YouTube connection failed:", error);
      alert("Failed to connect to YouTube. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleContinue = () => {
    navigate("/youtube/upload");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* YouTube Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold mb-2">
            Hey {userName}, welcome to EngageSmart
          </h1>
          <p className="text-xl font-light">YouTube Publisher</p>
        </div>

        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            Got a message you want to hit your audience? We'll help you publish and push that video to your supporters.
          </p>
          
          <p className="text-gray-600">
            Connect your YouTube channel to start uploading member story videos and building your community.
          </p>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">YouTube Connected!</span>
              </div>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg"
            >
              Continue to YouTube Publisher →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleConnectYouTube}
              disabled={connecting}
              className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {connecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Connect YouTube Channel
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-500">
              We'll need permission to upload videos to your YouTube channel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
