import { useState } from "react";
import { signInWithGoogle, signOutUser } from "../lib/googleAuth";

export default function TestAuth() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    setResult("Starting test...");
    
    try {
      // Clear everything first
      await clearAllGoogleAuth();
      setResult("Cleared auth state");
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to sign in
      const authResult = await signInWithGoogle();
      setResult(`SUCCESS: ${JSON.stringify(authResult, null, 2)}`);
    } catch (error) {
      setResult(`ERROR: ${error.message}`);
      console.error("Test auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkGoogleAPI = () => {
    const info = {
      gapi: !!window.gapi,
      auth2: !!window.gapi?.auth2,
      authInstance: !!window.gapi?.auth2?.getAuthInstance(),
      clientId: import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    };
    setResult(`Google API Status: ${JSON.stringify(info, null, 2)}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Google Auth Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testAuth}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Google Auth"}
          </button>
          
          <button
            onClick={checkGoogleAPI}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Check Google API Status
          </button>
          
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Nuclear Reset
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {result || "No result yet"}
          </pre>
        </div>
      </div>
    </div>
  );
}
