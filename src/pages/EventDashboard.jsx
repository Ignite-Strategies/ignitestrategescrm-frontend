import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function Events() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [eventStats, setEventStats] = useState(null);
  const [selectedEventContacts, setSelectedEventContacts] = useState([]);
  const [selectedEventName, setSelectedEventName] = useState('');
  const [showForms, setShowForms] = useState(false);
  const [availableForms, setAvailableForms] = useState([]);
  const [associatedForm, setAssociatedForm] = useState(null);

  useEffect(() => {
    // Wait for orgId to be available from hydration
    if (!orgId) {
      console.log('⏳ Waiting for orgId from hydration...');
      return;
    }
    
    console.log('✅ OrgId available, loading events:', orgId);
    loadEvents();
    loadAssociatedForm();
  }, [orgId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Load events for org
      const response = await api.get(`/events/${orgId}/events`);
      setEvents(response.data);
      
      // Load stats for the main event if we have events
      if (response.data.length > 0) {
        const mainEvent = response.data.find(e => e.status === 'upcoming') || response.data[0];
        await loadEventStats(mainEvent.id);
      }
      
      // HYDRATE PIPELINE CONFIG to localStorage (for EventPipelines page)
      try {
        const configRes = await api.get('/pipeline-config');
        localStorage.setItem('pipelineConfigs', JSON.stringify(configRes.data));
        console.log('✅ Pipeline configs cached:', configRes.data.length, 'audiences');
      } catch (configError) {
        console.error('⚠️ Failed to cache pipeline configs:', configError);
        // Don't block event loading if config fails
      }
      
      // HYDRATE ALL EVENT ATTENDEES to localStorage (for quick access)
      try {
        const eventId = localStorage.getItem('eventId');
        if (eventId) {
          // Load ALL attendees (for EventAttendeeList)
          const allAttendeesRes = await api.get(`/events/${eventId}/attendees`);
          localStorage.setItem(`event_${eventId}_attendees`, JSON.stringify(allAttendeesRes.data));
          console.log(`✅ Cached ALL attendees for event ${eventId}:`, allAttendeesRes.data.length);
          
          // Load attendees for all audiences (for pipeline views)
          const audiences = ['org_members', 'friends_family', 'champions', 'community_partners', 'business_sponsor'];
          for (const audience of audiences) {
            const attendeesRes = await api.get(`/events/${eventId}/pipeline?audienceType=${audience}`);
            localStorage.setItem(`event_${eventId}_pipeline_${audience}`, JSON.stringify(attendeesRes.data));
            console.log(`✅ Cached ${audience} attendees for event ${eventId}`);
          }
        }
      } catch (attendeesError) {
        console.error('⚠️ Failed to cache event attendees:', attendeesError);
        // Don't block event loading if attendee caching fails
      }
      
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventStats = async (eventId) => {
    try {
      // Load all attendees for this event (no audience filter)
      const response = await api.get(`/events/${eventId}/attendees`);
      const attendees = response.data;
      
      // Count by stage
      const stats = {
        totalRsvp: 0,
        totalPaid: 0,
        totalAttended: 0
      };
      
      attendees.forEach(attendee => {
        if (attendee.currentStage === 'rsvped' || attendee.currentStage === 'rsvp') {
          stats.totalRsvp++;
        } else if (attendee.currentStage === 'paid') {
          stats.totalPaid++;
        } else if (attendee.currentStage === 'attended') {
          stats.totalAttended++;
        }
      });
      
      console.log('📊 Event stats loaded:', stats);
      setEventStats(stats);
      
    } catch (error) {
      console.error('❌ Error loading event stats:', error);
      setEventStats({ totalRsvp: 0, totalPaid: 0, totalAttended: 0 });
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

  const loadEventContacts = async (eventId, eventName) => {
    try {
      // Load all attendees for this event using our clean backend endpoint
      const response = await api.get(`/events/${eventId}/attendees`);
      setSelectedEventContacts(response.data);
      setSelectedEventName(eventName);
      setShowContactsModal(true);
    } catch (error) {
      console.error('Error loading event contacts:', error);
      alert('Failed to load contacts for this event');
    }
  };

  const deleteContactFromEvent = async (contactId, attendeeId) => {
    try {
      // Delete the EventAttendee record (this removes the contact from the event)
      await api.delete(`/events/${selectedEventContacts[0]?.eventId}/attendees/${attendeeId}`);
      
      // Remove from local state
      setSelectedEventContacts(prev => prev.filter(contact => contact.attendeeId !== attendeeId));
      
      alert('Contact removed from event successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to remove contact from event');
    }
  };

  const loadAvailableForms = async () => {
    try {
      const orgId = localStorage.getItem('orgId');
      const response = await api.get(`/forms?orgId=${orgId}`);
      setAvailableForms(response.data);
      console.log('📋 Loaded forms:', response.data.length);
    } catch (error) {
      console.error('❌ Error loading forms:', error);
    }
  };

  const handleAssociateForm = () => {
    if (!showForms) {
      loadAvailableForms();
      setShowForms(true);
    } else {
      setShowForms(false);
    }
  };

  const handleSelectForm = (form) => {
    const eventId = localStorage.getItem('eventId');
    const formAssociation = {
      eventId: eventId,
      formId: form.id,
      publicFormId: form.publicFormId, // ← SQL ID for fetching form responses
      formName: form.name,
      slug: form.slug,
      formData: form,
      associatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('eventFormAssociation', JSON.stringify(formAssociation));
    setAssociatedForm(formAssociation);
    setShowForms(false);
    
    console.log('✅ Form associated with event:', form.name, 'publicFormId:', form.publicFormId);
  };

  const loadAssociatedForm = () => {
    const stored = localStorage.getItem('eventFormAssociation');
    if (stored) {
      const association = JSON.parse(stored);
      setAssociatedForm(association);
    }
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

        {/* Primary Event Management */}
        {events.length > 0 && (
          <div className="mb-8">
            {/* Primary Event Focus */}
            {(() => {
              // Find the primary event: upcoming first, then most recent
              const primaryEvent = events.find(e => e.status === 'upcoming') || events[0];
              if (!primaryEvent) return null;
              
              const status = primaryEvent.date ? getEventStatus(primaryEvent.date) : null;
              const daysUntil = primaryEvent.date ? getDaysUntil(primaryEvent.date) : null;
              
              return (
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-8 mb-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{primaryEvent.name}</h2>
                      <p className="text-indigo-100 text-lg">{primaryEvent.description}</p>
                      {status && (
                        <span className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-medium ${
                          status.color === "red" ? "bg-red-500 text-white" :
                          status.color === "orange" ? "bg-orange-500 text-white" :
                          status.color === "blue" ? "bg-blue-500 text-white" :
                          status.color === "green" ? "bg-green-500 text-white" :
                          "bg-gray-500 text-white"
                        }`}>
                          {status.label}
                          {daysUntil !== null && daysUntil >= 0 && (
                            <span className="ml-2">({daysUntil} days away)</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold">{events.length}</p>
                      <p className="text-indigo-200">Total Events</p>
                    </div>
                  </div>
                  
                  {/* Event Summary Stats */}
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                    <div className="flex gap-6 text-sm">
                      <span>📝 Total RSVP: <span className="font-bold">{eventStats?.totalRsvp || 0}</span></span>
                      <span>💳 Paid: <span className="font-bold">{eventStats?.totalPaid || 0}</span></span>
                      <span>✅ Attended: <span className="font-bold">{eventStats?.totalAttended || 0}</span></span>
                    </div>
                  </div>
                  
                  {/* Quick Actions for Main Event */}
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => navigate(`/event/${primaryEvent.id}/attendees`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      👥 Manage Contacts
                    </button>
                    <button
                      onClick={() => navigate(`/event/${primaryEvent.id}/pipelines`)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      📊 View Pipeline
                    </button>
                    <button
                      onClick={handleAssociateForm}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      📝 Associate Form
                    </button>
                    <button
                      onClick={() => navigate("/contact-upload-selector")}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      ➕ Add More Contacts
                    </button>
                  </div>
                  
                  {/* Form Association Section */}
                  <div className="bg-white bg-opacity-10 rounded-lg p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Form Association</h3>
                      {associatedForm && (
                        <span className="text-sm text-green-200 bg-green-800 bg-opacity-50 px-3 py-1 rounded-full">
                          ✅ {associatedForm.formName}
                        </span>
                      )}
                    </div>
                    
                    {showForms && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-indigo-100">Available Forms:</h4>
                        {availableForms.length === 0 ? (
                          <p className="text-indigo-200 italic">No forms available</p>
                        ) : (
                          <div className="space-y-2">
                            {availableForms.map((form) => (
                              <button
                                key={form.id}
                                onClick={() => handleSelectForm(form)}
                                className="w-full text-left p-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg hover:bg-opacity-30 hover:border-opacity-50 transition-colors"
                              >
                                <div className="font-medium text-white">{form.name}</div>
                                <div className="text-sm text-indigo-200">{form.description || 'No description'}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* All Events - Compact List */}
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
            <p className="text-gray-600 mb-6">Create your first event to get started</p>
            <button
              onClick={() => navigate("/event/create")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              + Create Event
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Events</h3>
              <p className="text-gray-600 text-sm mt-1">Manage all your events</p>
            </div>
            <div className="divide-y divide-gray-200">
            {events.map((event) => {
              const status = event.date ? getEventStatus(event.date) : null;
              const daysUntil = event.date ? getDaysUntil(event.date) : null;

              return (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900">{event.name}</h4>
                        {status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status.color === "red" ? "bg-red-100 text-red-700" :
                            status.color === "orange" ? "bg-orange-100 text-orange-700" :
                            status.color === "blue" ? "bg-blue-100 text-blue-700" :
                            status.color === "green" ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {status.label}
                            {daysUntil !== null && daysUntil >= 0 && ` (${daysUntil}d)`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {event.date && (
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        )}
                        {event.time && <span>{event.time}</span>}
                        {(event.venueName || event.customLocation) && (
                          <span>{event.venueName || event.customLocation}</span>
                        )}
                        {event.fundraisingGoal > 0 && (
                          <span className="text-green-600 font-medium">${event.fundraisingGoal.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadEventContacts(event.id, event.name)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                      >
                        👥 Contacts
                      </button>
                      <button
                        onClick={() => navigate(`/event/${event.id}/pipelines`)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition"
                      >
                        Pipeline
                      </button>
                      <button
                        onClick={() => navigate(`/event/${event.id}/edit`)}
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* Contacts Modal */}
        {showContactsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">All Contacts - {selectedEventName}</h2>
                    <p className="text-gray-600 mt-1">{selectedEventContacts.length} contacts registered</p>
                  </div>
                  <button
                    onClick={() => setShowContactsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contacts List */}
              <div className="overflow-y-auto max-h-[60vh]">
                {selectedEventContacts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p>No contacts registered for this event yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {selectedEventContacts.map((contact) => (
                      <div key={contact.attendeeId} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold text-sm">
                                  {contact.firstName?.[0]}{contact.lastName?.[0]}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {contact.firstName} {contact.lastName}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span>{contact.email}</span>
                                  {contact.phone && <span>{contact.phone}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Audience Badge */}
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              {contact.audienceType?.replace('_', ' ') || 'Unknown Audience'}
                            </span>
                            
                            {/* Stage Badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              contact.currentStage === 'rsvped' ? 'bg-green-100 text-green-700' :
                              contact.currentStage === 'paid' ? 'bg-blue-100 text-blue-700' :
                              contact.currentStage === 'attended' ? 'bg-purple-100 text-purple-700' :
                              contact.currentStage === 'aware' ? 'bg-yellow-100 text-yellow-700' :
                              contact.currentStage === 'committed' ? 'bg-orange-100 text-orange-700' :
                              contact.currentStage === 'executing' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {contact.currentStage?.replace('_', ' ') || 'Unknown'}
                            </span>
                            
                            {/* Actual Type - Are they REALLY an org member in the database? */}
                            <span className={`text-xs px-2 py-1 rounded ${
                              contact.actualType === 'org_member' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {contact.actualType === 'org_member' ? '✓ Org Member' : 'Contact Only'}
                            </span>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${contact.firstName} ${contact.lastName} from this event?`)) {
                                  deleteContactFromEvent(contact.contactId, contact.attendeeId);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded"
                              title="Remove from event"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total: {selectedEventContacts.length} contacts
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/event/${selectedEventContacts[0]?.eventId}/pipelines`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                      View Pipeline
                    </button>
                    <button
                      onClick={() => setShowContactsModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

