import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getOrgId } from "../lib/org";
import api from "../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://eventscrm-backend.vercel.app";

export default function EngageDashboard() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const containerId = localStorage.getItem('containerId');
  const [pipelineData, setPipelineData] = useState({
    unaware: 12,
    curious: 8,
    activated: 15,
    engaged: 23,
    champion: 7,
    alumni: 3
  });
  const [totalMembers, setTotalMembers] = useState(68);
  const [loading, setLoading] = useState(false);

  // Hardcoded data for now - no API calls

  const stages = [
    { key: "unaware", emoji: "👀", label: "Unaware", desc: "Never heard of you", count: pipelineData.unaware },
    { key: "curious", emoji: "🤔", label: "Curious", desc: "Considering participation", count: pipelineData.curious },
    { key: "activated", emoji: "⚡", label: "Activated", desc: "Took first action", count: pipelineData.activated },
    { key: "engaged", emoji: "🔥", label: "Engaged", desc: "Participating repeatedly", count: pipelineData.engaged },
    { key: "champion", emoji: "👑", label: "Champion", desc: "Leading & multiplying", count: pipelineData.champion },
    { key: "alumni", emoji: "💤", label: "Alumni", desc: "Dormant but connected", count: pipelineData.alumni }
  ];

  const engageTools = [
    {
      title: "Email Your Crew",
      icon: "✉️",
      description: "Pre-built email templates for weekly check-ins and member updates",
      route: "/engage/email",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "YouTube Publisher",
      icon: "🎬",
      description: "Upload and publish videos to your YouTube channel",
      route: "/youtube/welcome",
      gradient: "from-red-500 to-red-700"
    },
    {
      title: "Social Media Manager",
      icon: "📱",
      description: "Post to Instagram, Facebook, and other social platforms",
      route: "/engage/social",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🧠</div>
          <h1 className="text-5xl font-black text-slate-900 mb-3">Engage Your Members</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See where your members are in the journey, then use the tools below to move them forward.
          </p>
        </div>

        {/* Member Journey Pipeline - REAL DATA */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            Where Your Members Are Right Now
          </h2>
          <p className="text-center text-slate-600 mb-8 text-sm">
            {loading ? 'Loading...' : `Total: ${totalMembers} members across all stages`}
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-slate-600">Loading your member pipeline...</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-6 gap-4">
              {stages.map((stage) => (
                <div
                  key={stage.key}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all border-2 border-slate-200 hover:border-indigo-300 cursor-pointer"
                >
                  <div className="text-4xl mb-3">{stage.emoji}</div>
                  <div className="font-bold text-slate-900 text-sm mb-1">{stage.label}</div>
                  <div className="text-2xl font-black text-indigo-600 mb-2">{stage.count}</div>
                  <div className="text-xs text-slate-600 leading-tight">{stage.desc}</div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && totalMembers === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>No member journeys tracked yet. Journeys are created automatically when contacts join your org or attend events.</p>
            </div>
          )}
          
          {/* Deep Dive Button */}
          {!loading && totalMembers > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/engage/pipeline')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Deep Dive into Pipeline
              </button>
            </div>
          )}
        </div>

        {/* Tools to Engage */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
            Tools to Engage
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {engageTools.map((tool, idx) => (
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
        </div>
      </div>
    </div>
  );
}

