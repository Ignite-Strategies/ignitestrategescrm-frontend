import { useNavigate } from "react-router-dom";

export default function RecruitGoogle() {
  const navigate = useNavigate();

  const tools = [
    {
      title: "Demo Google Ads Flow",
      icon: "🎬",
      description: "See the complete OAuth and campaign creation flow",
      route: "/demo/googleads",
      badge: "Demo",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Google Ads Setup",
      icon: "🚀",
      description: "Connect your Google Ads account and create campaigns",
      route: "/googleads/welcome",
      badge: "Start Here",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Manual Campaign Builder",
      icon: "✏️",
      description: "Build campaigns from scratch with templates",
      route: "/recruit/google/manual",
      badge: "Coming Soon",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Manage Connections",
      icon: "🔗",
      description: "Connect or manage your Google Ads accounts",
      route: "/recruit/google/accounts",
      badge: "Coming Soon",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-5xl mx-auto">
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
              <h1 className="text-4xl font-bold text-slate-900">Google Ads</h1>
              <p className="text-slate-600 mt-2">
                Create campaigns to reach new prospects
              </p>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="grid md:grid-cols-1 gap-6">
          {tools.map((tool, index) => (
            <button
              key={index}
              onClick={() => tool.badge === "Coming Soon" ? null : navigate(tool.route)}
              disabled={tool.badge === "Coming Soon"}
              className={`group relative bg-gradient-to-r ${tool.gradient} text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left overflow-hidden ${tool.badge === "Coming Soon" ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {tool.badge && (
                <span className={`absolute top-4 right-4 px-3 py-1 ${tool.badge === "Recommended" ? 'bg-yellow-400 text-yellow-900' : 'bg-white/30 text-white'} rounded-full text-xs font-bold`}>
                  {tool.badge}
                </span>
              )}
              
              <div className="flex items-start gap-4">
                <div className="text-6xl">{tool.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{tool.title}</h3>
                  <p className="text-white/90 text-lg">{tool.description}</p>
                </div>
                <div className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How It Works:</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Create personas in Persona Builder (who you're targeting)</li>
            <li>Use AI Campaign Creator to generate campaigns from personas</li>
            <li>Review, edit, and copy campaign details</li>
            <li>Paste into Google Ads Manager</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
