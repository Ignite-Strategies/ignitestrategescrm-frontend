import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function MetaOAuth() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting to Meta...");
  const [error, setError] = useState("");

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      setStatus("Processing Meta authorization...");
      
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
      const response = await api.post('/api/meta/oauth', { code });
      
      if (response.data.success) {
        // Store tokens
        localStorage.setItem("metaTokens", JSON.stringify(response.data.tokens));
        
        setStatus("Meta connected successfully!");
        setTimeout(() => {
          navigate("/engage/social");
        }, 2000);
      } else {
        throw new Error(response.data.error || "Failed to connect Meta");
      }
      
    } catch (error) {
      console.error("Meta OAuth error:", error);
      setError(error.message);
      setStatus("Connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* Meta Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Meta Connection
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
                onClick={() => navigate("/engage/social")}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span>{status}</span>
              </div>
              
              <p className="text-sm text-gray-500">
                Please wait while we connect your Meta accounts...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
