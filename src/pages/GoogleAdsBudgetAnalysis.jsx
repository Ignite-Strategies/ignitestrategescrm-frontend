import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function GoogleAdsBudgetAnalysis() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState("");
  
  // Budget analysis state
  const [budgetInputs, setBudgetInputs] = useState({
    totalBudget: 1500,
    campaignDays: 30,
    targetLeads: 100,
    industry: "events"
  });
  
  const [forecast, setForecast] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, []);
  
  const loadAccountData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const accountId = localStorage.getItem('googleAdsAccountId');
      
      if (!accountId) {
        console.warn('⚠️ No Google Ads account ID found');
        setError("No Google Ads account selected.");
        setLoading(false);
        return;
      }
      
      console.log('📊 Loading Google Ads data for account:', accountId);
      
      const response = await api.get(`/google-ads-hydrate/${accountId}`);
      
      setAccountData(response.data);
      console.log('✅ Google Ads data loaded:', response.data);
      setError("");
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading Google Ads:', error);
      setError(error.response?.data?.details || error.message || 'Failed to load account data');
      setLoading(false);
    }
  };

  const generateBudgetForecast = async () => {
    setAiAnalyzing(true);
    
    try {
      // Simulate AI analysis (replace with actual OpenAI call)
      const mockForecast = {
        estimatedClicks: Math.floor(budgetInputs.dailyBudget * 2.5),
        estimatedImpressions: Math.floor(budgetInputs.dailyBudget * 25),
        estimatedLeads: Math.floor(budgetInputs.dailyBudget * 0.8),
        costPerLead: Math.round(budgetInputs.dailyBudget / (budgetInputs.dailyBudget * 0.8) * 100) / 100,
        totalSpend: budgetInputs.dailyBudget * budgetInputs.campaignDuration,
        recommendations: [
          `With $${budgetInputs.dailyBudget}/day for ${budgetInputs.campaignDuration} days, expect ~${Math.floor(budgetInputs.dailyBudget * 0.8)} leads`,
          `Cost per lead: ~$${Math.round(budgetInputs.dailyBudget / (budgetInputs.dailyBudget * 0.8) * 100) / 100}`,
          `Total investment: $${budgetInputs.dailyBudget * budgetInputs.campaignDuration}`,
          `ROI potential: ${budgetInputs.targetLeads <= Math.floor(budgetInputs.dailyBudget * 0.8 * budgetInputs.campaignDuration) ? 'ACHIEVABLE' : 'NEEDS INCREASE'}`
        ]
      };
      
      setForecast(mockForecast);
    } catch (error) {
      console.error('❌ Error generating forecast:', error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBudgetInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
            onClick={() => navigate("/googleads/hub")}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
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
          
          <button
            onClick={() => navigate("/googleads/budget-analysis")}
            className="w-full flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
          >
            <span>💰</span>
            <span>Budget Analysis</span>
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
          <div className="flex items-center gap-4">
            <div className="text-6xl">💰</div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Budget Analysis</h1>
              <p className="text-slate-600 mt-2 text-lg">
                Optimize your ad spend for maximum ROI and lead generation
              </p>
            </div>
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
              </div>
            </div>
          </div>
        )}

        {/* Budget Input Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget Parameters</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Budget ($)
              </label>
              <input
                type="number"
                value={budgetInputs.dailyBudget}
                onChange={(e) => handleInputChange('dailyBudget', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Duration (days)
              </label>
              <input
                type="number"
                value={budgetInputs.campaignDuration}
                onChange={(e) => handleInputChange('campaignDuration', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="30"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Leads
              </label>
              <input
                type="number"
                value={budgetInputs.targetLeads}
                onChange={(e) => handleInputChange('targetLeads', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={budgetInputs.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="events">Events</option>
                <option value="fitness">Fitness</option>
                <option value="business">Business</option>
                <option value="nonprofit">Nonprofit</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={generateBudgetForecast}
              disabled={aiAnalyzing}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-3"
            >
              {aiAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Analyzing Budget...</span>
                </>
              ) : (
                <>
                  <span>🔮</span>
                  <span>Generate Forecast</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Forecast Results */}
        {forecast && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget Forecast</h2>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="text-2xl font-bold text-blue-900">{forecast.estimatedClicks}</div>
                <div className="text-sm text-blue-600">Estimated Clicks</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="text-2xl font-bold text-green-900">{forecast.estimatedLeads}</div>
                <div className="text-sm text-green-600">Estimated Leads</div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="text-2xl font-bold text-purple-900">${forecast.costPerLead}</div>
                <div className="text-sm text-purple-600">Cost Per Lead</div>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <div className="text-2xl font-bold text-orange-900">${forecast.totalSpend}</div>
                <div className="text-sm text-orange-600">Total Spend</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
              <h3 className="font-bold text-violet-900 mb-4 flex items-center gap-2">
                <span>💡</span>
                <span>AI Recommendations</span>
              </h3>
              <ul className="space-y-2">
                {forecast.recommendations.map((rec, index) => (
                  <li key={index} className="text-violet-800 flex items-start gap-2">
                    <span className="text-violet-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Historical Data */}
        {accountData && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historical Performance</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-2xl font-bold text-gray-900">${(accountData.totals?.spend || 0).toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Historical Spend</div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-2xl font-bold text-gray-900">{accountData.totals?.campaignCount || 0}</div>
                <div className="text-sm text-gray-600">Active Campaigns</div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-2xl font-bold text-gray-900">
                  {accountData.totals?.spend && accountData.totals?.campaignCount 
                    ? `$${Math.round(accountData.totals.spend / accountData.totals.campaignCount * 100) / 100}`
                    : '$0'
                  }
                </div>
                <div className="text-sm text-gray-600">Avg Spend Per Campaign</div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
