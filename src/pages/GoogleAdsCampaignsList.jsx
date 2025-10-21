import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function GoogleAdsCampaignsList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      
      // Get the Google Ads account ID from localStorage
      const accountId = localStorage.getItem('googleAdsAccountId');
      
      if (!accountId) {
        console.warn('⚠️ No Google Ads account ID found in localStorage');
        setError("No Google Ads account selected.");
        setLoading(false);
        return;
      }
      
      console.log('📊 Loading campaigns for account:', accountId);
      
      // Call hydration endpoint to get real Google Ads data
      const response = await api.get(`/google-ads-hydrate/${accountId}`);
      
      setAccountData(response.data);
      console.log('✅ Campaigns loaded:', response.data);
      setError(""); // Clear error on success
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading campaigns:', error);
      setError(error.response?.data?.details || error.message || 'Failed to load campaigns');
      setLoading(false);
    }
  };

  // Always show the UI - handle loading/error states inline

  const { account, campaigns, totals } = accountData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/googleads/home")}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium transition"
        >
          ← Back to Google Ads Hub
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {loading ? 'Loading...' : account?.name || "Your Campaigns"}
              </h1>
              <p className="text-gray-600">
                {loading ? 'Fetching account data...' : `Customer ID: ${account?.customerId}`}
                {account?.isTestAccount && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                    Test Account
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate("/googleads/create")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
            >
              + Create Campaign
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-900">Connection Issue</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={() => navigate('/settings/integrations')}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-700 font-medium">Loading campaigns...</span>
            </div>
          </div>
        )}

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Campaigns</p>
                <p className="text-2xl font-black text-gray-900">{totals?.campaignCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👁️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Impressions</p>
                <p className="text-2xl font-black text-gray-900">
                  {(totals?.impressions || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🖱️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Clicks</p>
                <p className="text-2xl font-black text-gray-900">
                  {(totals?.clicks || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spend</p>
                <p className="text-2xl font-black text-gray-900">
                  ${(totals?.spend || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Campaigns</h2>
          
          {campaigns && campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'ENABLED' || campaign.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700' 
                            : campaign.status === 'PAUSED'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Type: {campaign.type} • Strategy: {campaign.biddingStrategy}
                      </p>
                      {campaign.startDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {campaign.startDate} {campaign.endDate && `- ${campaign.endDate}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Impressions</p>
                      <p className="text-lg font-bold text-gray-900">
                        {(campaign.metrics?.impressions || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Clicks</p>
                      <p className="text-lg font-bold text-gray-900">
                        {(campaign.metrics?.clicks || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">CTR</p>
                      <p className="text-lg font-bold text-gray-900">
                        {((campaign.metrics?.ctr || 0) * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Spend</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${(campaign.metrics?.cost || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Campaigns Yet</h3>
              <p className="text-gray-600 mb-6">
                {account?.isTestAccount 
                  ? "This is a test account. Create a campaign to see how the data displays!"
                  : "Create your first campaign to start reaching your audience"}
              </p>
              <button
                onClick={() => navigate("/googleads/create")}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
              >
                Create Your First Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

