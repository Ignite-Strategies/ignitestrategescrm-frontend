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
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{org?.name || "High Impact Events"}</h1>
              <p className="text-sm text-gray-600">{org?.mission || "Event-driven member cultivation"}</p>
            </div>
            
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Setup Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span>⚙️</span>
            <span>Setup</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/org-dashboard")}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 text-left border-2 border-transparent hover:border-orange-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Organization</div>
                  <div className="text-sm text-slate-600">Settings, team, details</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/events")}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 text-left border-2 border-transparent hover:border-indigo-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Events</div>
                  <div className="text-sm text-slate-600">Create and manage events</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Org Member Journey Pipeline */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
            Org Member Journey
          </h2>
          <div className="grid md:grid-cols-6 gap-3">
            {[
              { emoji: "👀", stage: "Unaware", desc: "Discovery" },
              { emoji: "🤔", stage: "Curious", desc: "Interest" },
              { emoji: "⚡", stage: "Activated", desc: "Action" },
              { emoji: "🔥", stage: "Engaged", desc: "Connection" },
              { emoji: "👑", stage: "Champion", desc: "Ownership" },
              { emoji: "💤", stage: "Alumni", desc: "Legacy" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 text-center shadow-sm border border-slate-200">
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="font-bold text-slate-900 text-xs mb-0.5">{item.stage}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* The 2 Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          
          {/* ENGAGE */}
          <button
            onClick={() => navigate("/engage")}
            className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-12 text-left overflow-hidden hover:scale-[1.02]"
          >
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
                <span className="text-lg font-semibold">Explore Tools</span>
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
                <span className="text-lg font-semibold">Explore Tools</span>
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

        {/* Bottom Right - See Contacts */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/contacts")}
            className="flex items-center gap-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-blue-300 group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-900">See Contacts</div>
              <div className="text-sm text-slate-600">{supporterCount} total</div>
            </div>
            <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
