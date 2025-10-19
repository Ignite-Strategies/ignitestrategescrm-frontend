import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleAdWordsWelcome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Get user name from localStorage (email is set during signin/signup)
    const email = localStorage.getItem("email") || "there";
    const name = email.includes("@") ? email.split("@")[0] : email;
    setUserName(name);

    // Check if already connected to Google Ads
    const googleAdsTokens = localStorage.getItem("googleAdsTokens");
    if (googleAdsTokens) {
      setIsConnected(true);
    }

    // Listen for OAuth success from popup
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  const handleOAuthMessage = (event) => {
    if (event.data.type === "GOOGLE_ADS_AUTH_SUCCESS") {
      console.log("✅ Google Ads auth received:", event.data.tokens);
      
      // Store tokens
      localStorage.setItem("googleAdsTokens", JSON.stringify(event.data.tokens));
      setIsConnected(true);
      setConnecting(false);

      // Navigate to home after brief success message
      setTimeout(() => {
        navigate("/googleads/home");
      }, 1500);
    }
  };

  const handleGoogleSignIn = () => {
    setConnecting(true);
    
    // Open OAuth popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      "/googleadsignin?return=/googleads/home",
      "Google Ads Sign In",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleContinue = () => {
    navigate("/googleads/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-4xl font-bold mb-2">
            Hey {userName}, welcome to EngageSmart
          </h1>
          <p className="text-xl font-light">Google Ad Creator</p>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              What We Do Different
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              We help you promote events in a way that builds leads to strengthen your member core.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              <strong>No random keyword spam.</strong> We reverse engineer campaigns based on WHO your audience is 
              and WHAT they're actually searching for when they have the pain you solve.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>Strategy-First Approach:</span>
            </h3>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Define personas (demographics, pain points, desires)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Reverse engineer what they search for</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>AI-generated campaigns that actually speak to humans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Budget analysis to maximize every dollar</span>
              </li>
            </ul>
          </div>

          {/* Google Ads Account Notice */}
          <div className="bg-yellow-50 rounded-xl p-6 mb-8 border border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">Google Ads Account Required</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  If you don't have a Google Ads account already, you'll need one. 
                  <a 
                    href="https://ads.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 underline font-semibold hover:text-yellow-900"
                  >
                    Create one here →
                  </a>
                </p>
                <p className="text-xs text-yellow-700">
                  Takes about 5 minutes. You'll need a Google account and payment method.
                </p>
              </div>
            </div>
          </div>

          {/* Auth Section */}
          {!isConnected ? (
            <div className="text-center">
              <p className="text-slate-700 mb-6 font-semibold">
                Ready to get started? Sign in with your Google Ads account:
              </p>
              <button
                onClick={handleGoogleSignIn}
                disabled={connecting}
                className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
              >
                {connecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🔗</span>
                    <span>Sign in with Google Ads</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 mt-4">
                This is a demo OAuth flow for testing purposes
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-6 py-4 mb-6">
                <span className="text-3xl">✅</span>
                <div className="text-left">
                  <p className="font-bold text-green-900">Connected Successfully!</p>
                  <p className="text-sm text-green-700">Your Google Ads account is ready</p>
                </div>
              </div>
              <button
                onClick={handleContinue}
                className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
              >
                Continue to Campaign Builder →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

