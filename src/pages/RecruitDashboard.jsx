import { useNavigate } from "react-router-dom";

export default function RecruitDashboard() {
  const navigate = useNavigate();

  const recruitTools = [
    {
      title: "Google Ads",
      icon: "🔍",
      description: "Create awareness campaigns with templates and AI generation",
      route: "/demo/googleads",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Facebook / Instagram",
      icon: "📱",
      description: "Social media campaigns with templates and targeting tips",
      route: "/recruit/facebook",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Eventbrite",
      icon: "🎟️",
      description: "Sync public events and pull attendees into your CRM",
      route: "/recruit/eventbrite",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-green-600 hover:text-green-800 flex items-center gap-2 font-medium"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🚀</div>
          <h1 className="text-5xl font-black text-slate-900 mb-3">Recruit New Members</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Grow your reach and bring new people into the journey. Choose your channel below.
          </p>
        </div>

        {/* Recruitment Channels */}
        <div className="grid md:grid-cols-3 gap-6">
          {recruitTools.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => navigate(tool.route)}
              className={`bg-gradient-to-br ${tool.gradient} text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group`}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{tool.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{tool.title}</h3>
              <p className="text-white/90 text-sm mb-4">{tool.description}</p>
              <div className="flex items-center gap-2 text-white/70 group-hover:text-white">
                <span className="text-sm font-medium">Open Tool</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-10 bg-white rounded-xl p-6 shadow-md border border-green-200">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>How Recruitment Works</span>
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">1.</span>
              <span><strong>Choose a channel:</strong> Google Ads for search intent, Facebook for awareness, Eventbrite for public events</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">2.</span>
              <span><strong>Use templates:</strong> Pre-built campaigns based on best practices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">3.</span>
              <span><strong>Track results:</strong> New signups automatically enter your pipeline</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">4.</span>
              <span><strong>Move them to Engage:</strong> Once they activate (attend event, join community), switch to engagement tools</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

