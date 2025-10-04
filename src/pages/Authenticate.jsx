import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, clearAllGoogleAuth, isSignedIn } from "../lib/googleAuth";

export default function Authenticate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("Starting Google authentication...");
      
      // Sign in with Google (no pre-clearing)
      const result = await signInWithGoogle();
      console.log("Authentication successful:", result);
      
      setSuccess(`Successfully authenticated with ${result.email}!`);
      
      // Wait a moment then redirect
      setTimeout(() => {
        navigate("/compose");
      }, 2000);
      
    } catch (error) {
      console.error("Authentication error:", error);
      setError(`Authentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = () => {
    const signedIn = isSignedIn();
    const token = localStorage.getItem('gmailAccessToken');
    const email = localStorage.getItem('userEmail');
    
    setSuccess(`Auth Status: ${signedIn ? 'SIGNED IN' : 'NOT SIGNED IN'}
Token: ${token ? 'Present' : 'Missing'}
Email: ${email || 'None'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gmail Authentication</h1>
            <p className="text-gray-600">
              Authenticate with Google to send emails
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="text-green-800 text-sm whitespace-pre-wrap">{success}</pre>
              </div>
            )}

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Authenticate with Google
                </>
              )}
            </button>

            <div className="flex gap-3">
              <button
                onClick={checkAuthStatus}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                Check Status
              </button>
              
              <button
                onClick={() => navigate("/compose")}
                className="flex-1 bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition text-sm"
              >
                Go to Compose
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-500 text-sm hover:text-gray-700 underline"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
