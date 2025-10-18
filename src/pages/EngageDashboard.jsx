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
    unaware: 0,
    curious: 0,
    activated: 0,
    engaged: 0,
    champion: 0,
    alumni: 0
  });
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId && containerId) {
      loadPipelineData();
    }
  }, [orgId, containerId]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading org member pipeline...');
      
      const response = await fetch(
        `${API_BASE_URL}/api/org-member-pipeline?containerId=${containerId}&orgId=${orgId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pipeline data loaded:', data);
        setPipelineData(data.pipeline);
        setTotalMembers(data.totalMembers);
      } else {
        console.error('❌ Failed to load pipeline data');
      }
    } catch (error) {
      console.error('❌ Error loading pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

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
      title: "Challenge of the Week",
      icon: "💪",
      description: "Rally your members with ready-to-use challenge templates",
      route: "/engage/challenges",
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Member Story Videos",
      icon: "🎥",
      description: "Showcase transformation stories that inspire your community",
      route: "/engage/story",
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

        {/* Org Member Pipeline - COMING SOON */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-lg p-12 mb-10 text-center border-2 border-dashed border-purple-300">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Org Member Journey Pipeline
          </h2>
          <p className="text-lg text-slate-700 mb-6 max-w-2xl mx-auto">
            Coming soon: See exactly where your members are in their journey (Unaware → Curious → Activated → Engaged → Champion → Alumni) with real-time data from the OrgMemberJourney table.
          </p>
          <div className="text-sm text-slate-600 italic">
            💡 This will show REAL member distribution across the 6 journey stages with proper enum tracking
          </div>
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

