import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function GoogleAdWordsHome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || localStorage.getItem("email") || "there";
    setUserName(name.split("@")[0]);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/recruit")}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium transition"
        >
          ← Back to Recruit Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🚀</div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  Google Ads Campaign Builder
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  Welcome back, {userName}! Let's build campaigns that convert.
                </p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-xs text-green-700 font-semibold">Google Ads</p>
                <p className="text-xs text-green-600">Connected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Section */}
        <div className="mb-8">
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
          <div className="grid md:grid-cols-3 gap-6 mb-8">
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
        </div>

        {/* Choose Your Path */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Ready to Build Your Campaign?
            </h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Choose how you want to create your Google Ads campaign
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Builder Path */}
            <button
              onClick={() => navigate("/recruit/google/create")}
              className="group bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all text-left hover:shadow-lg"
            >
              <div className="text-5xl mb-4">🛠️</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Use the Builder</h3>
              <p className="text-slate-600 mb-4">
                Step-by-step guided process with helpful tips and AI suggestions along the way
              </p>
              <div className="text-purple-600 font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                <span>Start Building</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Quick Path */}
            <button
              onClick={() => navigate("/recruit/google/create")}
              className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border-2 border-slate-200 hover:border-slate-400 transition-all text-left hover:shadow-lg"
            >
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Just Let Me Launch</h3>
              <p className="text-slate-600 mb-4">
                I know what I want. Take me straight to the campaign builder without the guidance
              </p>
              <div className="text-slate-600 font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                <span>Quick Launch</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>
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
  );
}

