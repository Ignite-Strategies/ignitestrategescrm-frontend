import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function GmailOAuth() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting Gmail...");
  const [error, setError] = useState("");

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      setStatus("Processing Gmail authorization...");
      
      // Get the authorization code from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      if (!code) {
        throw new Error("No authorization code received");
      }

      // Exchange code for tokens
      setStatus("Exchanging authorization code for tokens...");
      const orgId = getOrgId();
      const adminId = localStorage.getItem('adminId');
      
      const response = await api.post('/gmail-oauth/callback', { 
        code,
        state,
        orgId,
        adminId
      });
      
      if (response.data.success) {
        setStatus("Gmail connected successfully!");
        
        // Show success message and redirect
        localStorage.setItem('gmailConnected', 'true');
        localStorage.setItem('gmailEmail', response.data.email);
        
        setTimeout(() => {
          navigate("/gmail/success", { 
            state: { email: response.data.email } 
          });
        }, 1500);
      } else {
        throw new Error(response.data.error || "Failed to connect Gmail");
      }
      
    } catch (error) {
      console.error("Gmail OAuth error:", error);
      setError(error.message);
      setStatus("Connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* Gmail Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Gmail Connection
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
                onClick={() => navigate("/campaignhome")}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Back to Campaigns
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span>{status}</span>
              </div>
              
              <p className="text-sm text-gray-500">
                Please wait while we connect your Gmail account...
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-xs text-blue-700">
                  🔒 Your Gmail tokens are stored securely and will never expire. You'll only need to do this once!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

