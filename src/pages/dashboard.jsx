import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Dashboard() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      const [orgRes, eventsRes] = await Promise.all([
        api.get(`/orgs/${orgId}`),
        api.get(`/orgs/${orgId}/events`)
      ]);
      setOrg(orgRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{org?.name || "Dashboard"}</h1>
          <p className="text-gray-600 mt-1">{org?.mission}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate(`/event/create/${orgId}`)}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-2 border-transparent hover:border-indigo-500 text-left"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Create Event</h3>
            <p className="text-sm text-gray-600">Set up a new event with goals and pipelines</p>
          </button>

          <button
            onClick={() => navigate(`/org/${orgId}/users`)}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-2 border-transparent hover:border-green-500 text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Contacts</h3>
            <p className="text-sm text-gray-600">Upload and manage your master CRM</p>
          </button>

          <button
            onClick={() => navigate(`/engage/email/${orgId}`)}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition border-2 border-transparent hover:border-purple-500 text-left"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Email Campaigns</h3>
            <p className="text-sm text-gray-600">Send targeted emails to your audiences</p>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Events</h2>
          </div>

          {events.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.date ? new Date(event.date).toLocaleDateString() : "Date TBD"} • {event.location || "Location TBD"}
                      </p>
                      {event.goals?.revenueTarget && (
                        <p className="text-sm text-indigo-600 mt-2">
                          Goal: ${event.goals.revenueTarget.toLocaleString()} • 
                          {event.goals.ticketPrice > 0 && 
                            ` ${Math.ceil((event.goals.revenueTarget - (event.goals.costs || 0)) / event.goals.ticketPrice)} tickets needed`
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/event/${event._id}/pipelines`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                      >
                        Kanban
                      </button>
                      <button
                        onClick={() => navigate(`/event/${event._id}/pipeline-config`)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                      >
                        Config
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No events yet. Create your first event to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

