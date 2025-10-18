import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrgId } from "../lib/org";
import { signOutUser } from "../firebase";

export default function Dashboard() {
  const orgId = getOrgId();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState([]);
  const [supporterCount, setSupporterCount] = useState(0);

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const loadData = async () => {
    try {
      const cachedOrg = JSON.parse(localStorage.getItem('org') || 'null');
      const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');
      const cachedMembers = JSON.parse(localStorage.getItem(`org_${orgId}_members`) || '[]');
      
      setOrg(cachedOrg);
      setEvents(cachedEvent ? [cachedEvent] : []);
      setSupporterCount(cachedMembers.length);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{org?.name || "High Impact Events"}</h1>
              <p className="text-sm text-gray-600">{org?.mission || "Event-driven member cultivation"}</p>
            </div>
            
            {/* Top Right - Setup */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">Total Members</div>
                <div className="text-xl font-bold text-gray-900">{supporterCount}</div>
              </div>
              
              <button
                onClick={() => navigate("/org-dashboard")}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors group"
                title="Setup & Settings"
              >
                <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-900 group-hover:rotate-90 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <button
                onClick={async () => {
                  await signOutUser();
                  localStorage.clear();
                  window.location.href = "/";
                }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Org Member Journey Pipeline */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
            Org Member Journey Pipeline
          </h2>
          <div className="grid md:grid-cols-6 gap-4 mb-4">
            {[
              { emoji: "👀", stage: "Unaware", desc: "Discovery", color: "slate" },
              { emoji: "🤔", stage: "Curious", desc: "Interest", color: "blue" },
              { emoji: "⚡", stage: "Activated", desc: "Action", color: "yellow" },
              { emoji: "🔥", stage: "Engaged", desc: "Connection", color: "orange" },
              { emoji: "👑", stage: "Champion", desc: "Ownership", color: "purple" },
              { emoji: "💤", stage: "Alumni", desc: "Legacy", color: "gray" }
            ].map((item, idx) => (
              <div key={idx} className={`bg-white rounded-xl p-4 text-center shadow-md border-2 border-${item.color}-200 hover:shadow-lg transition-all`}>
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="font-bold text-slate-900 text-sm mb-1">{item.stage}</div>
                <div className="text-xs text-slate-600">{item.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-600 text-sm">
            Your job: Meet people where they are, move them forward
          </p>
        </div>

        {/* The 2 Main Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* ENGAGE */}
          <button
            onClick={() => navigate("/engage")}
            className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-12 text-left overflow-hidden hover:scale-[1.02]"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">🧠</div>
              <h2 className="text-5xl font-black text-white mb-4 group-hover:translate-x-2 transition-transform">
                Engage
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Strengthen your core. Email campaigns, challenges, and stories that deepen connection with existing members.
              </p>
              
              <div className="flex items-center gap-3 text-white/80 group-hover:text-white transition-colors">
                <span className="text-lg font-semibold">Tools Inside</span>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white backdrop-blur-sm">Email Your Crew</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white backdrop-blur-sm">Challenges</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white backdrop-blur-sm">Member Stories</span>
              </div>
            </div>
          </button>

          {/* RECRUIT */}
          <button
            onClick={() => navigate("/engage")}
            className="group relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-12 text-left overflow-hidden hover:scale-[1.02]"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">🚀</div>
              <h2 className="text-5xl font-black text-white mb-4 group-hover:translate-x-2 transition-transform">
                Recruit
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Grow your reach. Google Ads, social campaigns, and event promotion that bring new people into the journey.
              </p>
              
              <div className="flex items-center gap-3 text-white/80 group-hover:text-white transition-colors">
                <span className="text-lg font-semibold">Tools Inside</span>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white backdrop-blur-sm">Google Ads</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white backdrop-blur-sm">Facebook/Instagram</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white backdrop-blur-sm">Eventbrite</span>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Access Tools (Minimal) */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Quick Access</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/events")}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 text-left border-2 border-transparent hover:border-indigo-300"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-semibold text-slate-900">Events</div>
              <div className="text-xs text-slate-600">Manage your events</div>
            </button>
            
            <button
              onClick={() => navigate("/contacts")}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 text-left border-2 border-transparent hover:border-blue-300"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold text-slate-900">Contacts</div>
              <div className="text-xs text-slate-600">Your people database</div>
            </button>
            
            <button
              onClick={() => navigate("/campaignhome")}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 text-left border-2 border-transparent hover:border-green-300"
            >
              <div className="text-2xl mb-2">✉️</div>
              <div className="font-semibold text-slate-900">Campaigns</div>
              <div className="text-xs text-slate-600">Email sequences</div>
            </button>
            
            <button
              onClick={() => navigate("/personas")}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 text-left border-2 border-transparent hover:border-purple-300"
            >
              <div className="text-2xl mb-2">🧩</div>
              <div className="font-semibold text-slate-900">Personas</div>
              <div className="text-xs text-slate-600">The Human Stack</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
