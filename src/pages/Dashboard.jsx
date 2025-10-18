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
  const [upcomingEvent, setUpcomingEvent] = useState(null);

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
      
      if (cachedEvent) {
        const now = new Date();
        const eventDate = new Date(cachedEvent.date);
        if (eventDate >= now) {
          setUpcomingEvent(cachedEvent);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  const getDaysUntil = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        
        {/* Hero Message */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-slate-900 mb-3">
            Activate Growth at {org?.name || "Your Organization"}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Use the tools below to <span className="font-semibold text-indigo-600">nurture your existing members</span> or <span className="font-semibold text-green-600">recruit new ones</span>.
          </p>
        </div>
        
        {/* Event Countdown */}
        {upcomingEvent && (
          <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center">
            <div className="text-sm uppercase tracking-wide mb-2 text-white/80">Next Event</div>
            <h2 className="text-4xl font-black mb-2">{upcomingEvent.name}</h2>
            <div className="flex items-center justify-center gap-6">
              <div>
                <div className="text-6xl font-black mb-1">{getDaysUntil(upcomingEvent.date)}</div>
                <div className="text-sm text-white/80">Days Away</div>
              </div>
              <div className="text-left">
                <div className="text-sm text-white/80">Date</div>
                <div className="text-lg font-semibold">{new Date(upcomingEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/event/${upcomingEvent.id}/pipelines`)}
              className="mt-6 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all shadow-lg"
            >
              Manage Event Pipeline →
            </button>
          </div>
        )}
        
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

        {/* Journey Pipeline */}
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

        {/* ENGAGE SECTION */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🧠</div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">Engage Your Members</h2>
            <p className="text-lg text-slate-600">Strengthen your core and deepen connection with people who already know you</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate("/engage/email")}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">✉️</div>
              <h3 className="text-2xl font-bold mb-2">Email Your Crew</h3>
              <p className="text-white/90 text-sm mb-4">Pre-built templates for weekly check-ins and member updates</p>
              <div className="flex items-center gap-2 text-white/70 group-hover:text-white">
                <span className="text-sm font-medium">View Templates</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => navigate("/engage/challenges")}
              className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💪</div>
              <h3 className="text-2xl font-bold mb-2">Challenges</h3>
              <p className="text-white/90 text-sm mb-4">Rally your members with ready-to-use challenge templates</p>
              <div className="flex items-center gap-2 text-white/70 group-hover:text-white">
                <span className="text-sm font-medium">Browse Challenges</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => navigate("/engage/story")}
              className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎥</div>
              <h3 className="text-2xl font-bold mb-2">Member Stories</h3>
              <p className="text-white/90 text-sm mb-4">Showcase transformation stories that inspire your community</p>
              <div className="flex items-center gap-2 text-white/70 group-hover:text-white">
                <span className="text-sm font-medium">Upload Story</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* RECRUIT SECTION */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🚀</div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">Recruit New Members</h2>
            <p className="text-lg text-slate-600">Grow your reach and bring new people into the journey</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate("/recruit/google")}
              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
              <h3 className="text-2xl font-bold mb-2">Google Ads</h3>
              <p className="text-white/90 text-sm mb-4">Create awareness campaigns with templates and AI generation</p>
              <div className="flex items-center gap-2 text-white/70 group-hover:text-white">
                <span className="text-sm font-medium">Build Campaign</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => navigate("/recruit/facebook")}
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📱</div>
              <h3 className="text-2xl font-bold mb-2">Facebook / Instagram</h3>
              <p className="text-white/90 text-sm mb-4">Social media campaigns with templates and targeting tips</p>
              <div className="flex items-center gap-2 text-white/70 group-hover:text-white">
                <span className="text-sm font-medium">Create Post</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => navigate("/recruit/eventbrite")}
              className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎟️</div>
              <h3 className="text-2xl font-bold mb-2">Eventbrite</h3>
              <p className="text-white/90 text-sm mb-4">Sync public events and pull attendees into your CRM</p>
              <div className="flex items-center gap-2 text-white/70 group-hover:text-white">
                <span className="text-sm font-medium">Connect Account</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Setup + Contacts Row */}
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/org-dashboard")}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-5 text-left border-2 border-transparent hover:border-orange-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900">Organization</div>
                <div className="text-xs text-slate-600">Settings & team</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/events")}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-5 text-left border-2 border-transparent hover:border-indigo-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900">Events</div>
                <div className="text-xs text-slate-600">Create & manage</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/contacts")}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-5 text-left border-2 border-transparent hover:border-blue-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg">{supporterCount.toLocaleString()}</div>
                <div className="text-xs text-slate-600">Total Contacts · <span className="text-blue-600 group-hover:underline">See All</span></div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
