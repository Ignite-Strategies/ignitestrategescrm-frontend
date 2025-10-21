/**
 * 🧭 Unified Google OAuth Callback Handler (EngageSmart)
 * Single callback component for ALL Google services (Gmail, YouTube, Ads)
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function UnifiedGoogleOAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Connecting to Google...");
  const [error, setError] = useState("");
  const [service, setService] = useState("");

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code || !state) {
        throw new Error("Missing authorization code or state parameter");
      }

      setStatus("Exchanging authorization code for tokens...");
      
      const response = await api.post('/google-oauth/callback', { 
        code, 
        state 
      });

      if (response.data.success) {
        const serviceName = response.data.service.toUpperCase();
        const connectionId = response.data.connectionId;
        
        setService(serviceName);
        setStatus(`${serviceName} connected successfully!`);
        
        // Store connection ID in localStorage for future use
        const storageKey = `googleOAuthConnection_${response.data.service}`;
        localStorage.setItem(storageKey, connectionId);
        console.log(`✅ Stored ${storageKey}: ${connectionId}`);
        
        // Store success message
        localStorage.setItem('redirectMessage', `✅ ${serviceName} connected successfully!`);
        
        // Check if user is authenticated before redirecting
        const firebaseId = localStorage.getItem("firebaseId");
        if (firebaseId) {
          // User is authenticated - redirect to useful page based on service
          setTimeout(() => {
            if (response.data.service === 'gmail') {
              navigate("/send-email"); // Go to send email page for Gmail
            } else if (response.data.service === 'youtube') {
              navigate("/youtube/hub"); // Go to YouTube hub
            } else if (response.data.service === 'ads') {
              navigate("/dashboard"); // Go to dashboard for Google Ads
            } else {
              navigate("/dashboard"); // Default to dashboard
            }
          }, 2000);
        } else {
          // User not authenticated - redirect to signup
          setTimeout(() => {
            navigate("/signup");
          }, 2000);
        }
      } else {
        throw new Error(response.data.error || "Failed to connect service");
      }
    } catch (error) {
      console.error("Unified OAuth callback error:", error);
      setError(error.message);
      setStatus("Connection failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              {error ? (
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {error ? "Connection Failed" : "Connecting to Google"}
            </h2>
            
            <p className="mt-2 text-center text-sm text-gray-600">
              {status}
            </p>
            
            {service && (
              <p className="mt-2 text-center text-sm text-green-600 font-medium">
                Service: {service}
              </p>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            {!error && !service && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}
            
            {error && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    const firebaseId = localStorage.getItem("firebaseId");
                    navigate(firebaseId ? "/settings/integrations" : "/signup");
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to App
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
