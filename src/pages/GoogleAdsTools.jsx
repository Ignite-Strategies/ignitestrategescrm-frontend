import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../lib/api";

export default function GoogleAdsTools() {
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState(null);

  useEffect(() => {
    // Get basic account info from localStorage for sidebar
    const accountId = localStorage.getItem('googleAdsAccountId');
    if (accountId) {
      loadAccountInfo();
    }
  }, []);

  const loadAccountInfo = async () => {
    try {
      const accountId = localStorage.getItem('googleAdsAccountId');
      const response = await api.get(`/google-ads-hydrate/${accountId}`);
      setAccountData(response.data);
    } catch (error) {
      console.error('Error loading account:', error);
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
          <p className="text-xs text-gray-600">{accountData?.account?.name || "Loading..."}</p>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => navigate("/googleads/home")}
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
            className="w-full flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
          >
            <span>🛠️</span>
            <span>Strategy Tools</span>
          </button>
          
          <button
            onClick={() => navigate("/googleads/persona-development")}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm transition ml-4"
          >
            <span>🎯</span>
            <span>Persona Builder</span>
          </button>
          
          <button
            onClick={() => navigate("/googleads/search-analysis")}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-50 rounded-lg text-sm transition ml-4"
          >
            <span>🔍</span>
            <span>Search Analysis</span>
            <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded">Soon</span>
          </button>
          
          <button
            onClick={() => navigate("/googleads/budget-analysis")}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-50 rounded-lg text-sm transition ml-4"
          >
            <span>💰</span>
            <span>Budget Analysis</span>
            <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded">Soon</span>
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
          <h1 className="text-4xl font-black text-gray-900 mb-2">Strategy Tools</h1>
          <p className="text-gray-600 mb-8">Build smarter campaigns with data-driven insights</p>

          {/* Strategy First Section */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-8 border border-violet-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 flex items-center gap-3">
              <span>💡</span>
              <span>Strategy First, Tactics Second</span>
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              To ensure you get the most out of your ad spend, we recommend using our campaign strategy tools below. 
              These help you reverse engineer campaigns based on real human behavior instead of guessing at keywords.
            </p>
          </div>

          {/* Strategy Tool Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {strategyTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => !tool.comingSoon && navigate(tool.route)}
                disabled={tool.comingSoon}
                className={`group relative bg-gradient-to-br ${tool.gradient} rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all text-left ${tool.comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'}`}
              >
                {tool.comingSoon && (
                  <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-xs font-bold">Coming Soon</p>
                  </div>
                )}

                <div className="text-6xl mb-4">{tool.icon}</div>
                
                <h3 className="text-2xl font-bold mb-3">{tool.title}</h3>
                
                <p className="text-white/90 mb-4 leading-relaxed">
                  {tool.description}
                </p>

                <div className="space-y-2 mb-6">
                  {tool.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5">→</span>
                      <span className="text-white/80">{benefit}</span>
                    </div>
                  ))}
                </div>

                {!tool.comingSoon && (
                  <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Get Started</span>
                    <span>→</span>
                  </div>
                )}
              </button>
            ))}
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

