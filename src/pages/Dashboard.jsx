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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-900 mb-3">
            Activate Growth at {org?.name || "Your Organization"}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Three paths to building your community: <span className="font-semibold text-blue-600">Engage existing members</span>, <span className="font-semibold text-green-600">recruit new ones</span>, or <span className="font-semibold text-purple-600">activate through events</span>.
          </p>
        </div>
        
        {/* Event Countdown */}
        {upcomingEvent && (
          <div className="mb-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center">
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
          </div>
        )}

        {/* Three Main Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          
          {/* ENGAGE */}
          <button
            onClick={() => navigate("/engage")}
            className="group relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-10 text-left overflow-hidden hover:scale-[1.03]"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🧠</div>
              <h2 className="text-4xl font-black text-white mb-3">Engage</h2>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Nurture existing members. See where they are, move them forward.
              </p>
              
              <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                <span className="font-semibold">View Pipeline & Tools</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>

          {/* ACTIVATE (Events) */}
          <button
            onClick={() => navigate("/events")}
            className="group relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-10 text-left overflow-hidden hover:scale-[1.03]"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h2 className="text-4xl font-black text-white mb-3">Activate</h2>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Events are the bridge. Turn curious into committed. Create, manage, and track all your events.
              </p>
              
              <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                <span className="font-semibold">View All Events</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>

          {/* RECRUIT */}
          <button
            onClick={() => navigate("/recruit")}
            className="group relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-10 text-left overflow-hidden hover:scale-[1.03]"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🚀</div>
              <h2 className="text-4xl font-black text-white mb-3">Recruit</h2>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Reach new people. Ads, social, and public events.
              </p>
              
              <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                <span className="font-semibold">Explore Channels</span>
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Bottom Row: Setup + Contacts */}
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
                <div className="text-xs text-slate-600">Overview & details</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/settings/admins")}
            className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-lg shadow-md hover:shadow-xl transition-all p-5 text-left border-2 border-transparent hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="font-bold">Settings</div>
                <div className="text-xs text-white/80">Manage team & admins</div>
              </div>
            </div>
          </button>

          <div className="bg-slate-100 rounded-lg p-5 border-2 border-slate-200">
            <div className="text-center text-sm text-slate-500">Setup & Infrastructure</div>
          </div>

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
