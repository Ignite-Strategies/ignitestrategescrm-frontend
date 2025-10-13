import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ContactManageSelector() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [orgId]);

  const loadEvents = async () => {
    try {
      const response = await api.get(`/orgs/${orgId}/events`);
      setEvents(response.data || []);
      
      // Auto-select first event if available
      if (response.data?.length > 0) {
        setSelectedEventId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationContacts = () => {
    navigate("/org-members");
  };

  const handleEventContacts = () => {
    if (!selectedEventId) {
      alert("Please select an event");
      return;
    }
    navigate(`/event/${selectedEventId}/attendees`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate("/contacts")}
            className="text-indigo-600 hover:text-indigo-800 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Back to Contact Management
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Which contacts do you want to manage?
          </h1>
          <p className="text-gray-600 text-lg">
            Choose between organization-wide contacts or event-specific contacts
          </p>
        </div>

        {/* Two Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Organization Contacts */}
          <button
            onClick={handleOrganizationContacts}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  🏢 All Organization
                </h2>
                <p className="text-gray-600 mb-4">
                  View and manage all org members - the sacred tribe of your organization
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Board members & staff
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Core volunteers
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Committee members
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Engagement tracking
                  </li>
                </ul>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-end text-blue-600 font-semibold group-hover:translate-x-2 transition">
                View Org Members →
              </div>
            </div>
          </button>

          {/* Event Contacts */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent">
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  📅 Specific Event
                </h2>
                <p className="text-gray-600 mb-4">
                  Manage contacts for a specific event - see attendees, stages, and forms
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Event attendees
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Pipeline stages
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Form submissions
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Elevate to org member
                  </li>
                </ul>

                {/* Event Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Event
                  </label>
                  {loading ? (
                    <div className="text-sm text-gray-500">Loading events...</div>
                  ) : events.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No events found. <button onClick={() => navigate("/event/create")} className="text-indigo-600 hover:underline">Create one?</button>
                    </div>
                  ) : (
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} {event.date ? `(${new Date(event.date).toLocaleDateString()})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Button */}
              <button
                onClick={handleEventContacts}
                disabled={!selectedEventId || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Event Contacts →
              </button>
            </div>
          </div>

        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            💡 <strong>Tip:</strong> Organization contacts are your core team. Event contacts are specific to individual events and can be elevated to org members.
          </p>
        </div>

      </div>
    </div>
  );
}

