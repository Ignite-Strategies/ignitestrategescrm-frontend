import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function GoogleAdWordsHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    hydrateGoogleAdsAccount();
  }, []);
  
  const hydrateGoogleAdsAccount = async () => {
    try {
      setLoading(true);
      setError("");
      setNeedsVerification(false);
      
      const orgId = getOrgId();
      
      if (!orgId) {
        setError("No organization found. Please log in again.");
        setLoading(false);
        return;
      }
      
      console.log('📊 PURE HYDRATION - Reading Google Ads account from database (NO API CALLS!)');
      console.log('   orgId:', orgId);
      
      // Get cached account ID if available
      const cachedAccountId = localStorage.getItem('googleAdsAccountId');
      
      // Call PURE hydration endpoint - database only, NO Google API calls!
      const response = await api.get('/google-ads-hydrate/account', {
        params: {
          orgId: orgId,
          accountId: cachedAccountId || undefined
        }
      });
      
      console.log('✅ Account hydrated from database:', response.data);
      
      // Cache the account ID for faster future loads
      if (response.data.account?.id) {
        localStorage.setItem('googleAdsAccountId', response.data.account.id);
      }
      
      setAccountData(response.data);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error hydrating Google Ads account:', error);
      
      if (error.response?.status === 404 || error.response?.data?.needsSetup) {
        // No account found - need to verify/connect
        setError("No Google Ads account connected yet.");
        setNeedsVerification(true);
      } else {
        setError(error.response?.data?.details || error.message || 'Failed to load account data');
      }
      
      setLoading(false);
    }
  };

  const strategyTools = [
    {
      id: "persona",
      title: "Persona Development",
      icon: "🎯",
      description: "Define WHO you're targeting and reverse engineer what they search for",
      gradient: "from-purple-500 to-pink-500",
      route: "/googleads/persona-development",
      benefits: [
        "Identify target demographics & pain points",
        "Discover what they actually search for",
        "Build campaigns that speak to real humans"
      ]
    },
    {
      id: "search",
      title: "Search Analysis",
      icon: "🔍",
      description: "Analyze search trends and competition in your target market",
      gradient: "from-blue-500 to-cyan-500",
      route: "/googleads/search-analysis",
      comingSoon: true,
      benefits: [
        "See what keywords your audience uses",
        "Understand search volume & competition",
        "Find high-intent, low-competition opportunities"
      ]
    },
    {
      id: "budget",
      title: "Budget Analysis",
      icon: "💰",
      description: "Optimize your ad spend for maximum ROI and lead generation",
      gradient: "from-green-500 to-emerald-500",
      route: "/googleads/budget-analysis",
      comingSoon: true,
      benefits: [
        "Calculate cost per lead targets",
        "Set daily budgets based on goals",
        "Maximize impact of every dollar"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Google Ads</h2>
          <p className="text-xs text-gray-600">
            {loading ? 'Loading...' : accountData?.account?.name || 'No account'}
          </p>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => navigate("/googleads/home")}
            className="w-full flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
          >
            <span>🏠</span>
            <span>Overview</span>
          </button>
          
          <button
            onClick={() => navigate("/googleads/campaigns")}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
          >
            <span>📊</span>
            <span>Campaigns</span>
          </button>
          
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 mb-2">Tools</p>
          </div>
          
          <button
            onClick={() => navigate("/googleads/tools")}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
          >
            <span>🛠️</span>
            <span>Strategy Tools</span>
          </button>
          
          <div className="pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={() => navigate("/settings/integrations")}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🚀</div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  {accountData?.account?.name || "Google Ads"}
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  Campaign Builder & Analytics
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Customer ID: {accountData?.account?.customerId}
                  {accountData?.account?.isTestAccount && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                      Test Account
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-bold text-blue-900">{accountData?.totals?.campaignCount || 0}</p>
                <p className="text-xs text-blue-600">Campaigns</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-bold text-green-900">
                  ${(accountData?.totals?.spend || 0).toFixed(2)}
                </p>
                <p className="text-xs text-green-600">Total Spend</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className={`${needsVerification ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border rounded-xl p-6 mb-8`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{needsVerification ? '🔗' : '⚠️'}</span>
              <div className="flex-1">
                <h3 className={`font-bold ${needsVerification ? 'text-blue-900' : 'text-red-900'}`}>
                  {needsVerification ? 'Connect Your Google Ads Account' : 'Error Loading Account'}
                </h3>
                <p className={`text-sm ${needsVerification ? 'text-blue-700' : 'text-red-700'}`}>{error}</p>
                <div className="mt-3 flex gap-3">
                  {needsVerification ? (
                    <>
                      <button
                        onClick={() => navigate('/settings/integrations')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        Connect Google Ads
                      </button>
                      <button
                        onClick={hydrateGoogleAdsAccount}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                      >
                        Retry
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={hydrateGoogleAdsAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => navigate('/settings/integrations')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                      >
                        Go to Settings
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-700 font-medium">Loading Google Ads data...</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create Campaign */}
          <button
            onClick={() => navigate("/googleads/create")}
            className="group bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all text-left hover:scale-[1.02]"
          >
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-3xl font-bold mb-3">Create Campaign</h3>
            <p className="text-white/90 text-lg mb-4">
              Build a new campaign with AI-powered targeting and persona-based strategy
            </p>
            <div className="flex items-center gap-2 text-white font-semibold">
              <span>Get Started</span>
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </button>

          {/* View Campaigns */}
          <button
            onClick={() => navigate("/googleads/campaigns")}
            className="group bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all text-left hover:scale-[1.02]"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-3xl font-bold mb-3">View Campaigns</h3>
            <p className="text-white/90 text-lg mb-4">
              See your active campaigns, performance metrics, and manage existing ads
            </p>
            <div className="flex items-center gap-2 text-white font-semibold">
              <span>View All</span>
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </button>
        </div>
        
        {/* Strategy Tip */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-200">
          <h3 className="font-bold text-violet-900 mb-2 flex items-center gap-2">
            <span>💡</span>
            <span>Pro Tip: Use Strategy Tools First</span>
          </h3>
          <p className="text-violet-800 leading-relaxed">
            Before creating campaigns, check out our <button onClick={() => navigate("/googleads/tools")} className="underline font-semibold hover:text-violet-900">Strategy Tools</button> to define personas, 
            analyze search behavior, and optimize your budget. This ensures you're targeting the right people with the right message.
          </p>
        </div>

        {/* Info Footer */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span>🎓</span>
              <span>Why Reverse Engineering Works</span>
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Most people throw random keywords at Google Ads and hope something sticks. 
              We start with WHO you're trying to reach, identify their pain points, and reverse engineer 
              what they're actually typing into Google when they have that pain. This creates campaigns 
              that speak directly to your ideal audience.
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <span>📊</span>
              <span>The Process</span>
            </h3>
            <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
              <li>Define your target persona (demographics, pain, desire)</li>
              <li>Reverse engineer their search behavior</li>
              <li>AI generates campaign with targeted keywords & copy</li>
              <li>Review, optimize, and launch</li>
            </ol>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

