import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function EngageHub() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const engageCoreOptions = [
    {
      title: "Email Your Crew",
      description: "Open pre-built email UX for your members",
      icon: "✉️",
      route: "/engage/email",
      preview: "Sample: Weekly update to engaged members"
    },
    {
      title: "YouTube Publisher",
      description: "Upload and publish videos to your YouTube channel",
      icon: "🎬",
      route: "/youtube/welcome",
      preview: "Use video to tell your story"
    },
    {
      title: "Video Stories",
      description: "Create and share member transformation stories",
      icon: "🎥",
      route: "/engage/story",
      preview: "Showcase member journeys"
    },
    {
      title: "Social Media Manager",
      description: "Post to Instagram, Facebook, and other social platforms",
      icon: "📱",
      route: "/engage/social",
      preview: "Cross-platform social posting"
    }
  ];

  const recruitPublicOptions = [
    {
      title: "Google Ads",
      description: "Create awareness campaign; collect campaign name + keywords",
      icon: "🔍",
      route: "/recruit/google",
      preview: "Get discovered by new prospects"
    },
    {
      title: "Facebook / Instagram",
      description: "Create social campaign; collect caption + image upload",
      icon: "📱",
      route: "/recruit/facebook",
      preview: "Social media growth campaigns"
    },
    {
      title: "Eventbrite Event",
      description: "Pull event data from Eventbrite API and show in-app",
      icon: "🎟️",
      route: "/recruit/eventbrite",
      preview: "Sync your public events"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            🎯 Engagement Hub
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Choose how you want to engage today — strengthen your core or grow your reach.
          </p>
          
          {/* Org Member Journey Pipeline Stages */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
              Org Member Journey Pipeline
            </h3>
            <div className="flex justify-between items-center text-xs">
              <div className="flex-1 text-center">
                <div className="text-2xl mb-1">👀</div>
                <div className="font-semibold text-slate-800">Unaware</div>
                <div className="text-slate-500">Discovery</div>
              </div>
              <div className="text-slate-300 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="text-2xl mb-1">🤔</div>
                <div className="font-semibold text-slate-800">Curious</div>
                <div className="text-slate-500">Interest</div>
              </div>
              <div className="text-slate-300 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="font-semibold text-slate-800">Activated</div>
                <div className="text-slate-500">Action</div>
              </div>
              <div className="text-slate-300 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="font-semibold text-slate-800">Engaged</div>
                <div className="text-slate-500">Connection</div>
              </div>
              <div className="text-slate-300 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="text-2xl mb-1">👑</div>
                <div className="font-semibold text-slate-800">Champion</div>
                <div className="text-slate-500">Ownership</div>
              </div>
              <div className="text-slate-300 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="text-2xl mb-1">💤</div>
                <div className="font-semibold text-slate-800">Alumni</div>
                <div className="text-slate-500">Legacy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Engage Core Card */}
          <div
            className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
            onMouseEnter={() => setHoveredCard("core")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Engage Core
              </h2>
              <p className="text-slate-600">
                Strengthen relationships with existing members
              </p>
            </div>

            <div className="space-y-4">
              {engageCoreOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(option.route)}
                  className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200 hover:border-blue-400 group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {option.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600">
                        {option.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {option.description}
                      </p>
                      <div className="text-xs text-blue-600 italic">
                        {option.preview}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recruit Public Card */}
          <div
            className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
            onMouseEnter={() => setHoveredCard("recruit")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Recruit Public
              </h2>
              <p className="text-slate-600">
                Grow your reach and attract new members
              </p>
            </div>

            <div className="space-y-4">
              {recruitPublicOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(option.route)}
                  className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-200 hover:border-green-400 group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {option.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-green-600">
                        {option.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {option.description}
                      </p>
                      <div className="text-xs text-green-600 italic">
                        {option.preview}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI-Ready Placeholders */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-dashed border-purple-300">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🪄</div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                AI-Powered Features Coming Soon
              </h3>
              <p className="text-sm text-slate-700">
                Auto-generate campaigns, suggest email copy, and optimize engagement with AI assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

