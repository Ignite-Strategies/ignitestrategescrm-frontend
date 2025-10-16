import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
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
      console.log('🚀 Dashboard loadData starting with orgId:', orgId, '- CACHE BUST VERSION');
      const [orgRes, eventsRes, orgMembersRes] = await Promise.all([
        api.get(`/orgs/${orgId}`),
        api.get(`/events?orgId=${orgId}&v=${Date.now()}`),
        api.get(`/orgmembers?orgId=${orgId}`)
      ]);
      console.log('📊 Dashboard API responses:', {
        org: orgRes.data,
        events: eventsRes.data,
        orgMembers: orgMembersRes.data
      });
      setOrg(orgRes.data);
      setEvents(eventsRes.data);
      
      // Count OrgMembers (all are non-admin in Contact-First architecture)
      setSupporterCount(orgMembersRes.data.members?.length || 0);
      
      // 🔥 HYDRATION RULE: Always hydrate OrgMembers to localStorage when landing on Dashboard
      localStorage.setItem(`org_${orgId}_members`, JSON.stringify(orgMembersRes.data.members || []));
      console.log('✅ DASHBOARD HYDRATION: Cached', orgMembersRes.data.members?.length || 0, 'org members');

      // Find next upcoming event
      const now = new Date();
      const upcoming = eventsRes.data
        .filter(e => e.date && new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      setUpcomingEvent(upcoming);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
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
        {/* Smart Onboarding Banners - Contact banner deprecated, now just event banner */}
        {supporterCount > 0 && events.length === 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">🎉 Great! You have {supporterCount} contacts. Ready to create your first event?</h2>
                <p className="text-white/90 mb-4">
                  Events are the heart of your CRM. Your contacts will auto-populate into the event pipeline when you create one.
                </p>
                <button
                  onClick={() => navigate("/event/create")}
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition shadow-lg"
                >
                  🚀 Create Your First Event
                </button>
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('dismissedEventsBanner', 'true');
                  window.location.reload();
                }}
                className="text-white/60 hover:text-white transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Org Members */}
          <button
            onClick={() => navigate("/org-dashboard")}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Org Members</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{supporterCount.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Members (excl. admins)</p>
          </button>

          {/* Next Event */}
          <button
            onClick={() => upcomingEvent && navigate(`/event/${upcomingEvent.id}/pipelines`)}
            disabled={!upcomingEvent}
            className={`bg-white p-6 rounded-lg shadow transition text-left border-2 ${
              upcomingEvent 
                ? "hover:shadow-lg border-transparent hover:border-indigo-500 cursor-pointer" 
                : "border-gray-200 cursor-default"
            }`}
          >
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
          </button>

          {/* Total Invited */}
          <div className="bg-white p-6 rounded-lg shadow text-left border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Invited</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">—</p>
            <p className="text-sm text-gray-500 mt-1">Coming soon</p>
          </div>

          {/* Progress to Goal */}
          <div className="bg-white p-6 rounded-lg shadow text-left border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Progress to Goal</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">—</p>
            <p className="text-sm text-gray-500 mt-1">Coming soon</p>
          </div>
        </div>

        {/* HubSpot-Style Main Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Contact Management */}
          <button
            onClick={() => navigate("/contacts")}
            className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Contact Management</h2>
            <p className="text-blue-100 text-sm mb-4">Upload contacts, create lists, manage your database</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Upload</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">See List</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Create List</span>
            </div>
          </button>

          {/* Event Management */}
          <button
            onClick={() => navigate("/events")}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Event Management</h2>
            <p className="text-indigo-100 text-sm mb-4">Create events, set goals, manage venues, and access pipelines</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Create Event</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">View All</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Pipelines</span>
            </div>
          </button>

          {/* Pipeline Management */}
          <button
            onClick={() => {
              const eventId = upcomingEvent?.id || events[0]?.id;
              if (eventId) navigate(`/event/${eventId}/pipelines`);
            }}
            disabled={!upcomingEvent && events.length === 0}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group disabled:opacity-50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Pipeline Management</h2>
            <p className="text-purple-100 text-sm mb-4">Manage funnels, move contacts through stages, track progress</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">View Pipelines</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Move Stages</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Track Progress</span>
            </div>
          </button>

          {/* Email Dashboard */}
          <button
            onClick={() => navigate("/campaignhome")}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Email Campaign Management</h2>
            <p className="text-emerald-100 text-sm mb-4">Email campaigns and personal outreach</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Campaigns</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Personal Outreach</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Templates</span>
            </div>
          </button>

          {/* Forms - NEW! 🔥 */}
          <button
            onClick={() => {
              if (upcomingEvent) {
                navigate(`/event/${upcomingEvent.id}/forms`);
              } else {
                alert('Please create an event first!');
              }
            }}
            disabled={!upcomingEvent}
            className={`bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl shadow-lg transition-all p-8 text-left group ${
              !upcomingEvent ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Forms 🆕</h2>
            <p className="text-cyan-100 text-sm mb-4">Create custom forms, collect submissions, drive pipeline intake</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Create Form</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Submissions</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Embed Code</span>
            </div>
          </button>

          {/* Ad Management */}
          <button
            onClick={() => navigate("/ads")}
            className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Ad Management</h2>
            <p className="text-pink-100 text-sm mb-4">Create and manage advertising campaigns, track performance</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Campaigns</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Analytics</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Google Ads</span>
            </div>
          </button>

          {/* Organization Management */}
          <button
            onClick={() => {
              navigate("/org-dashboard");
            }}
            className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Organization</h2>
            <p className="text-orange-100 text-sm mb-4">Manage team members, settings, and organization details</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Team</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Settings</span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">Profile</span>
            </div>
          </button>
        </div>

        {/* Recent Events List (simplified) */}
        {events.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
              <button
                onClick={() => navigate("/events")}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.date ? new Date(event.date).toLocaleDateString() : "Date TBD"}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/event/${event.id}/pipelines`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                    >
                      Manage Pipeline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

