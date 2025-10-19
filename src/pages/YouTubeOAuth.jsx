import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function YouTubeOAuth() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting to YouTube...");
  const [error, setError] = useState("");

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      setStatus("Processing YouTube authorization...");
      
      // Get the authorization code from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      if (!code) {
        throw new Error("No authorization code received");
      }

      // Exchange code for tokens
      setStatus("Exchanging authorization code for tokens...");
      const response = await api.post('/youtube/oauth', { code });
      
      if (response.data.success) {
        // Store tokens
        localStorage.setItem("youtubeTokens", JSON.stringify(response.data.tokens));
        
        setStatus("YouTube connected successfully!");
        setTimeout(() => {
          navigate("/youtube/success");
        }, 2000);
      } else {
        throw new Error(response.data.error || "Failed to connect YouTube");
      }
      
    } catch (error) {
      console.error("YouTube OAuth error:", error);
      setError(error.message);
      setStatus("Connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* YouTube Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            YouTube Connection
          </h1>
          
          {error ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-red-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-semibold">Connection Failed</span>
                </div>
                <p className="text-sm text-red-600 mt-2">{error}</p>
              </div>
              
              <button
                onClick={() => navigate("/youtube/welcome")}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                <span>{status}</span>
              </div>
              
              <p className="text-sm text-gray-500">
                Please wait while we connect your YouTube channel...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
