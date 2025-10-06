import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function Events() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [orgId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orgs/${orgId}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntil = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEventStatus = (date) => {
    const days = getDaysUntil(date);
    if (days < 0) return { label: "Past", color: "gray" };
    if (days === 0) return { label: "Today", color: "red" };
    if (days <= 7) return { label: "This Week", color: "orange" };
    if (days <= 30) return { label: "This Month", color: "blue" };
    return { label: "Upcoming", color: "green" };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Events</h1>
              <p className="text-gray-600 mt-1">Manage all your events and their pipelines</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => navigate("/event/create")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                + Create Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard-Style Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Events */}
          <div className="bg-white p-6 rounded-lg shadow text-left border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Events</h3>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{events.length}</p>
            <p className="text-sm text-gray-500 mt-1">All events</p>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white p-6 rounded-lg shadow text-left border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Upcoming</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {events.filter(e => e.date && getDaysUntil(e.date) >= 0).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Future events</p>
          </div>

          {/* Past Events */}
          <div className="bg-white p-6 rounded-lg shadow text-left border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Past Events</h3>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {events.filter(e => e.date && getDaysUntil(e.date) < 0).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>

          {/* Total Fundraising Goal */}
          <div className="bg-white p-6 rounded-lg shadow text-left border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Goal</h3>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${events.reduce((sum, e) => sum + (e.fundraisingGoal || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Across all events</p>
          </div>

          {/* Event Tasks */}
          <div className="bg-white p-6 rounded-lg shadow text-left border-2 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Event Tasks</h3>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">—</p>
            <p className="text-sm text-gray-500 mt-1">Coming soon</p>
          </div>
        </div>

        {/* Dashboard-Style Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Create Event */}
          <button
            onClick={() => navigate("/event/create")}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <svg className="w-6 h-6 text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Create Event</h2>
            <p className="text-indigo-100 text-sm">Set up a new event with goals, location, and fundraising targets</p>
          </button>

          {/* View My Events */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">View My Events</h2>
            <p className="text-gray-600 text-sm">Browse all events below</p>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-600 mb-6">Click "Create Event" above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => {
              const status = event.date ? getEventStatus(event.date) : null;
              const daysUntil = event.date ? getDaysUntil(event.date) : null;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                          {status && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                status.color === "red"
                                  ? "bg-red-100 text-red-700"
                                  : status.color === "orange"
                                  ? "bg-orange-100 text-orange-700"
                                  : status.color === "blue"
                                  ? "bg-blue-100 text-blue-700"
                                  : status.color === "green"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {status.label}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-gray-600 mb-3">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {event.date && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>
                                {new Date(event.date).toLocaleDateString()}
                                {daysUntil !== null && daysUntil >= 0 && (
                                  <span className="text-indigo-600 font-medium ml-1">({daysUntil} days)</span>
                                )}
                              </span>
                            </div>
                          )}
                          {event.time && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{event.time}</span>
                            </div>
                          )}
                          {(event.venueName || event.customLocation) && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{event.venueName || event.customLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Event Goals */}
                    {event.fundraisingGoal > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Fundraising Goal</p>
                            <p className="text-lg font-bold text-green-700">${event.fundraisingGoal.toLocaleString()}</p>
                          </div>
                          {event.hasTickets && event.ticketCost > 0 && (
                            <div>
                              <p className="text-sm text-gray-600">Tickets Needed</p>
                              <p className="text-lg font-bold text-indigo-700">
                                {Math.ceil((event.fundraisingGoal + (event.additionalExpenses || 0)) / event.ticketCost)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          // Smart routing: Check if pretask survey done, if tasks exist
                          try {
                            const tasksRes = await api.get(`/events/${event.id}/tasks`);
                            const hasTasks = tasksRes.data && tasksRes.data.length > 0;
                            
                            if (hasTasks) {
                              // Has tasks → Go to task dashboard
                              navigate(`/event/${event.id}/tasks`);
                            } else {
                              // No tasks → Check if survey done
                              const surveyRes = await api.get(`/events/${event.id}/pretask-survey`).catch(() => null);
                              
                              if (surveyRes && surveyRes.data) {
                                // Survey done → Go pick tasks
                                navigate(`/event/${event.id}/task-suggestions`);
                              } else {
                                // No survey → Start with baseline
                                navigate(`/event/${event.id}/setup`);
                              }
                            }
                          } catch (error) {
                            // Error → Default to setup survey
                            navigate(`/event/${event.id}/setup`);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                      >
                        📋 View Tasks
                      </button>
                      <button
                        onClick={() => navigate(`/event/${event.id}/pipelines`)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                      >
                        Pipeline
                      </button>
                      <button
                        onClick={() => navigate(`/event/${event.id}/edit`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

