import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DemoGoogleAds() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1=connect, 2=connected, 3=campaign
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    console.log('🔗 Simulating popup OAuth...');
    setCurrentStep(2);
    
    // Simulate popup delay
    setTimeout(() => {
      setIsConnected(true);
      setCurrentStep(3);
    }, 2000);
  };

  const handleContinue = () => {
    navigate('/recruit/google/create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/recruit")}
          className="mb-6 text-green-600 hover:text-green-800 flex items-center gap-2 font-medium"
        >
          ← Back to Recruit
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🔍</div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Google Ads Demo</h1>
              <p className="text-slate-600 mt-2">
                Simulate the OAuth popup flow for video demonstration
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Connect */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🔗</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Connect Your Google Ads Account
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              In the real app, this would open a popup window for Google OAuth authentication.
              For this demo, we'll simulate that process.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-900 mb-3">🎬 Demo Mode</h3>
              <p className="text-sm text-blue-800">
                This simulates the popup OAuth flow. In production, users would:
              </p>
              <ol className="text-sm text-blue-800 mt-3 list-decimal list-inside text-left">
                <li>Click "Connect Google Ads"</li>
                <li>Popup opens with Google OAuth</li>
                <li>User signs in with their Google account</li>
                <li>Grants permissions for Google Ads access</li>
                <li>Popup closes and returns tokens</li>
              </ol>
            </div>

            <button
              onClick={handleConnect}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              🔗 Simulate Connect Google Ads
            </button>
          </div>
        )}

        {/* Step 2: Connecting */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6 animate-pulse">⏳</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Connecting to Google Ads...
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Simulating OAuth popup and token exchange...
            </p>
            
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}

        {/* Step 3: Connected */}
        {currentStep === 3 && isConnected && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Successfully Connected!
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Your Google Ads account is now connected and ready to create campaigns.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 mb-8 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">🎉 Connection Details</h3>
              <div className="text-sm text-green-800 space-y-2">
                <div><strong>Email:</strong> demo@gmail.com</div>
                <div><strong>Customer ID:</strong> 123-456-7890</div>
                <div><strong>Access Token:</strong> fake_access_token_xyz123</div>
                <div><strong>Status:</strong> Active</div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleContinue}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                🪄 Continue to Campaign Creator
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                🎬 <strong>Demo Note:</strong> In production, these tokens would be securely stored and used to make API calls to Google Ads.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
