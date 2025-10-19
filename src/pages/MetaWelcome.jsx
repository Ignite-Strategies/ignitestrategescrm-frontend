import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MetaWelcome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Get user name from localStorage
    const email = localStorage.getItem("email") || "there";
    const name = email.includes("@") ? email.split("@")[0] : email;
    setUserName(name);

    // Check if already connected to Meta
    const metaTokens = localStorage.getItem("metaTokens");
    if (metaTokens) {
      setIsConnected(true);
    }
  }, []);

  const handleConnectMeta = async () => {
    setConnecting(true);
    try {
      // Redirect to backend OAuth flow
      window.location.href = '/api/auth/meta';
    } catch (error) {
      console.error("Meta connection failed:", error);
      alert("Failed to connect to Meta. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleContinue = () => {
    navigate("/engage/social");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* Meta Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold mb-2">
            Hey {userName}, welcome to EngageSmart
          </h1>
          <p className="text-xl font-light">Meta Social Manager</p>
        </div>

        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            Connect your Facebook and Instagram accounts to start posting and engaging with your community.
          </p>
          
          <p className="text-gray-600">
            We'll help you manage your social media presence across Facebook and Instagram from one place.
          </p>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Meta Connected!</span>
              </div>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              Continue to Social Media Manager →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleConnectMeta}
              disabled={connecting}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {connecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Connect Meta Accounts
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-500">
              We'll need permission to post to your Facebook and Instagram accounts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
