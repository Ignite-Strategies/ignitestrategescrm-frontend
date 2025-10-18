import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://eventscrm-backend.vercel.app";

export default function RecruitGoogle() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [formData, setFormData] = useState({
    campaignName: "",
    keywords: "",
    targetLocation: "",
    dailyBudget: "",
    adHeadline: "",
    adDescription: ""
  });

  useEffect(() => {
    // Listen for postMessage from OAuth popup
    const handleMessage = (event) => {
      console.log('📨 Received OAuth message:', event.data);
      
      if (event.data.type === 'GOOGLE_ADS_AUTH_SUCCESS') {
        console.log('✅ Google Ads connected!', event.data.tokens);
        setAccountInfo(event.data.tokens);
        setIsConnected(true);
        
        // TODO: Save tokens to backend
        saveGoogleAdsConnection(event.data.tokens);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectGoogleAds = () => {
    console.log('🔗 Opening Google Ads OAuth popup...');
    
    // Open popup (will use real OAuth URL in production)
    const popup = window.open(
      `${API_BASE_URL}/auth/popup`,  // Backend serves the popup
      'googleAdsAuth',
      'width=500,height=650,left=400,top=100'
    );
    
    if (!popup) {
      alert('Popup blocked! Please allow popups for this site.');
    }
  };

  const saveGoogleAdsConnection = async (tokens) => {
    try {
      // TODO: POST to backend to save tokens
      console.log('💾 Saving tokens to backend...', tokens);
      // await fetch(`${API_BASE_URL}/api/googleads/save-connection`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ tokens, orgId })
      // });
    } catch (error) {
      console.error('Error saving connection:', error);
    }
  };

  const templates = [
    {
      name: "Event Awareness",
      keywords: "fitness community near me, workout groups, fitness events",
      headline: "Join Our Next Event - Transform Your Life",
      description: "Connect with like-minded people. Build lasting habits. Show up and change your story.",
      location: "Local area",
      budget: "$10-20/day"
    },
    {
      name: "New Member Recruitment",
      keywords: "join fitness group, community workout, accountability partner",
      headline: "Find Your Crew - Weekly Workouts & Community",
      description: "More than a workout. It's a brotherhood/sisterhood. First event free.",
      location: "Local area",
      budget: "$15-25/day"
    },
    {
      name: "Challenge Launch",
      keywords: "30 day fitness challenge, workout challenge near me",
      headline: "30-Day Challenge Starts Monday - Are You In?",
      description: "Commit to showing up. Build discipline. Transform with your crew.",
      location: "Local area",
      budget: "$20-30/day"
    }
  ];

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      campaignName: template.name,
      keywords: template.keywords,
      adHeadline: template.headline,
      adDescription: template.description,
      targetLocation: template.location,
      dailyBudget: template.budget
    });
  };

  const handleCopyToClipboard = () => {
    const copyText = `Campaign: ${formData.campaignName}\n\nKeywords: ${formData.keywords}\n\nHeadline: ${formData.adHeadline}\n\nDescription: ${formData.adDescription}\n\nLocation: ${formData.targetLocation}\nBudget: ${formData.dailyBudget}`;
    navigator.clipboard.writeText(copyText);
    alert("Campaign details copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/recruit")}
          className="mb-6 text-green-600 hover:text-green-800 flex items-center gap-2 font-medium"
        >
          ← Back to Recruit
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔍</div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Google Ads Campaign</h1>
                <p className="text-slate-600 mt-2">
                  Get discovered by new prospects searching for what you offer
                </p>
              </div>
            </div>
            
            {/* Connection Status */}
            {!isConnected ? (
              <button
                onClick={handleConnectGoogleAds}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                🔗 Connect Google Ads
              </button>
            ) : (
              <div className="flex items-center gap-3 px-6 py-3 bg-green-100 text-green-700 rounded-lg">
                <span className="text-xl">✓</span>
                <div className="text-left">
                  <div className="font-semibold text-sm">Connected</div>
                  <div className="text-xs">{accountInfo?.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Show connection prompt if not connected */}
        {!isConnected && (
          <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-8 mb-8 text-center border-2 border-dashed border-green-300">
            <div className="text-5xl mb-4">🔌</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Connect Your Google Ads Account
            </h2>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
              To create and manage campaigns, you'll need to connect your Google Ads account. This is a one-time setup.
            </p>
            <button
              onClick={handleConnectGoogleAds}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              🔗 Connect Google Ads Account
            </button>
            <p className="text-xs text-slate-500 mt-4">
              Demo mode: Use name@gmail.com / hardcodedpw
            </p>
          </div>
        )}

        {/* Campaign Builder (only show if connected) */}
        {isConnected && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Templates Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">📋 Campaign Templates</h2>
              <p className="text-sm text-slate-600 mb-6">
                Click a template to auto-fill your campaign details →
              </p>
              
              <div className="space-y-4">
                {templates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-400 transition-all"
                  >
                    <h3 className="font-semibold text-slate-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{template.headline}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {template.budget}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {template.location}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>💡</span>
                <span>Google Ads Tips</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span><strong>Start small:</strong> $10-20/day is enough to test</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span><strong>Local targeting:</strong> Focus on your immediate area</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span><strong>Clear CTA:</strong> Make it obvious what action to take</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span><strong>Track everything:</strong> Use UTM parameters</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">✏️ Campaign Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  placeholder="e.g., Event Awareness"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Keywords (comma separated)
                </label>
                <textarea
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., fitness community near me, workout groups, fitness events"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ad Headline (30 characters max)
                </label>
                <input
                  type="text"
                  value={formData.adHeadline}
                  onChange={(e) => setFormData({ ...formData, adHeadline: e.target.value })}
                  placeholder="e.g., Join Our Next Event"
                  maxLength={30}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.adHeadline.length}/30 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ad Description (90 characters max)
                </label>
                <textarea
                  value={formData.adDescription}
                  onChange={(e) => setFormData({ ...formData, adDescription: e.target.value })}
                  placeholder="e.g., Connect with like-minded people. Build lasting habits."
                  maxLength={90}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.adDescription.length}/90 characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Location
                  </label>
                  <input
                    type="text"
                    value={formData.targetLocation}
                    onChange={(e) => setFormData({ ...formData, targetLocation: e.target.value })}
                    placeholder="e.g., Austin, TX"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Daily Budget
                  </label>
                  <input
                    type="text"
                    value={formData.dailyBudget}
                    onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
                    placeholder="e.g., $15/day"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.adHeadline && formData.adDescription && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-500 mb-2">PREVIEW</h3>
                  <div className="bg-white p-4 rounded border border-green-200">
                    <div className="text-xs text-green-600 mb-1">Ad · yourwebsite.com</div>
                    <div className="text-blue-600 font-semibold text-lg mb-1">{formData.adHeadline}</div>
                    <div className="text-sm text-slate-700">{formData.adDescription}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCopyToClipboard}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  📋 Copy Campaign Details
                </button>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Next Steps:</strong> Copy these details and paste them into Google Ads when creating your campaign. Full automation coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* AI Placeholder */}
        {isConnected && (
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-dashed border-purple-300">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🪄</div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                AI Campaign Optimizer (Coming Soon)
              </h3>
              <p className="text-sm text-slate-700">
                Let AI suggest keywords, optimize ad copy, and automatically create campaigns in Google Ads.
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

