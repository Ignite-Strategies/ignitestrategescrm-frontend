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
    console.log('🔍 Dashboard useEffect - orgId:', orgId);
    if (orgId) {
      console.log('✅ Dashboard: orgId found, loading data...');
      loadData();
    } else {
      console.log('❌ Dashboard: No orgId found, checking localStorage...');
      console.log('localStorage orgId:', localStorage.getItem('orgId'));
      console.log('localStorage org:', localStorage.getItem('org'));
    }
  }, [orgId]);

  const loadData = async () => {
    try {
      console.log('🚀 Dashboard loadData from localStorage - orgId:', orgId);
      
      // Get data from localStorage (cached from Welcome page)
      const cachedOrg = JSON.parse(localStorage.getItem('org') || 'null');
      const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');
      const cachedMembers = JSON.parse(localStorage.getItem(`org_${orgId}_members`) || '[]');
      
      console.log('📊 Dashboard data from cache:', {
        org: cachedOrg,
        event: cachedEvent,
        members: cachedMembers
      });
      
      setOrg(cachedOrg);
      setEvents(cachedEvent ? [cachedEvent] : []);
      setSupporterCount(cachedMembers.length);
      
      // Find next upcoming event (if we have events)
      if (cachedEvent) {
        const now = new Date();
        const eventDate = new Date(cachedEvent.date);
        if (eventDate >= now) {
          setUpcomingEvent(cachedEvent);
        }
      }
      
      console.log('✅ Dashboard loaded from localStorage');
    } catch (error) {
      console.error("Error loading dashboard from cache:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{org?.name || "Dashboard"}</h1>
              <p className="text-gray-600 mt-1">{org?.mission}</p>
            </div>
            <button
              onClick={async () => {
                try {
                  await signOutUser();
                  localStorage.clear();
                  window.location.href = "/";
                } catch (error) {
                  console.error("Sign out error:", error);
                  localStorage.clear();
                  window.location.href = "/";
                }
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Org Members */}
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-transparent hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Org Members</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{supporterCount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Total contacts</p>
          </div>

          {/* Next Event */}
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Next Event</h3>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {upcomingEvent ? (
              <>
                <p className="text-3xl font-bold text-gray-900">{getDaysUntil(upcomingEvent.date)} days</p>
                <p className="text-sm text-gray-500 mt-1 truncate">{upcomingEvent.name}</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-400">—</p>
                <p className="text-sm text-gray-400 mt-1">No upcoming events</p>
              </>
            )}
          </div>

          {/* Active Campaigns */}
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Campaigns</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">—</p>
            <p className="text-sm text-gray-500 mt-1">Coming soon</p>
          </div>

          {/* Engagement Rate */}
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Engagement Rate</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">—</p>
            <p className="text-sm text-gray-500 mt-1">Coming soon</p>
          </div>
        </div>

        {/* Journey-Based Navigation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            <span>Your Organization Journey</span>
          </h2>

          {/* Setup Phase */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">🏗️</div>
              <h3 className="text-xl font-bold text-slate-800">Setup & Foundation</h3>
              <span className="text-sm text-slate-500 ml-2">Build your infrastructure</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Org Settings */}
              <button
                onClick={() => navigate("/org-dashboard")}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border-2 border-transparent hover:border-orange-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Organization</h4>
                <p className="text-sm text-slate-600">Manage team, settings, and org details</p>
              </button>

              {/* Events */}
              <button
                onClick={() => navigate("/events")}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border-2 border-transparent hover:border-indigo-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Events</h4>
                <p className="text-sm text-slate-600">Create and manage events, track attendance</p>
              </button>

              {/* Contacts */}
              <button
                onClick={() => navigate("/contacts")}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border-2 border-transparent hover:border-blue-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Contacts</h4>
                <p className="text-sm text-slate-600">Upload and organize your contact database</p>
              </button>
            </div>
          </div>

          {/* Engage Phase - NEW! */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">🎯</div>
              <h3 className="text-xl font-bold text-slate-800">Engage & Recruit</h3>
              <span className="text-sm text-slate-500 ml-2">Activate and grow your community</span>
              <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
                NEW!
              </span>
            </div>
            <div className="grid md:grid-cols-1 gap-6">
              {/* Engagement Hub - HERO CARD */}
              <button
                onClick={() => navigate("/engage")}
                className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all p-8 text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <span className="text-4xl">🎯</span>
                      </div>
                      <div>
                        <h4 className="text-3xl font-bold mb-2">Engagement Hub</h4>
                        <p className="text-white/90">The complete toolkit for engaging your core and recruiting new members</p>
                      </div>
                    </div>
                    <svg className="w-8 h-8 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl mb-2">🧠</div>
                      <h5 className="font-bold mb-1">Engage Core</h5>
                      <p className="text-sm text-white/80">Email campaigns, challenges, member stories</p>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="text-2xl mb-2">🚀</div>
                      <h5 className="font-bold mb-1">Recruit Public</h5>
                      <p className="text-sm text-white/80">Google Ads, social campaigns, event promotion</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Nurture Phase */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">🌱</div>
              <h3 className="text-xl font-bold text-slate-800">Nurture & Convert</h3>
              <span className="text-sm text-slate-500 ml-2">Move people through your funnels</span>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Pipelines */}
              <button
                onClick={() => {
                  const eventId = upcomingEvent?.id || events[0]?.id;
                  if (eventId) navigate(`/event/${eventId}/pipelines`);
                  else alert("Please create an event first!");
                }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border-2 border-transparent hover:border-purple-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Pipelines</h4>
                <p className="text-sm text-slate-600">Manage event funnels and track progress</p>
              </button>

              {/* Campaigns */}
              <button
                onClick={() => navigate("/campaignhome")}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border-2 border-transparent hover:border-green-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Email Campaigns</h4>
                <p className="text-sm text-slate-600">Automated email sequences and outreach</p>
              </button>

              {/* Forms */}
              <button
                onClick={() => {
                  if (upcomingEvent) {
                    navigate(`/event/${upcomingEvent.id}/forms`);
                  } else {
                    alert('Please create an event first!');
                  }
                }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border-2 border-transparent hover:border-cyan-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Forms</h4>
                <p className="text-sm text-slate-600">Collect submissions and drive intake</p>
              </button>
            </div>
          </div>

          {/* Analyze Phase */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">📊</div>
              <h3 className="text-xl font-bold text-slate-800">Analyze & Optimize</h3>
              <span className="text-sm text-slate-500 ml-2">Track performance and insights</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Analytics */}
              <button
                onClick={() => navigate("/analytics")}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border-2 border-transparent hover:border-blue-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Analytics</h4>
                <p className="text-sm text-slate-600">Track engagement and campaign performance</p>
              </button>

              {/* Ad Management */}
              <button
                onClick={() => navigate("/ads")}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border-2 border-transparent hover:border-pink-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Ad Performance</h4>
                <p className="text-sm text-slate-600">Monitor ad campaigns and ROI</p>
              </button>
            </div>
          </div>
        </div>

        {/* Org Member Journey Pipeline Visual */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 border-2 border-purple-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>Org Member Journey Pipeline</span>
          </h3>
          <p className="text-slate-700 mb-6">Every contact moves through these stages. Your job is to meet them where they are.</p>
          
          <div className="grid md:grid-cols-6 gap-4">
            {[
              { emoji: "👀", stage: "Unaware", desc: "Discovery" },
              { emoji: "🤔", stage: "Curious", desc: "Interest" },
              { emoji: "⚡", stage: "Activated", desc: "Action" },
              { emoji: "🔥", stage: "Engaged", desc: "Connection" },
              { emoji: "👑", stage: "Champion", desc: "Ownership" },
              { emoji: "💤", stage: "Alumni", desc: "Legacy" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="font-bold text-slate-900 text-sm mb-1">{item.stage}</div>
                <div className="text-xs text-slate-600">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
