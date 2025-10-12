import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function EventAttendeeList() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load event details
      const eventRes = await api.get(`/events/${eventId}`);
      setEvent(eventRes.data);
      
      // Load all attendees for this event (no audience filter)
      const attendeesRes = await api.get(`/events/${eventId}/attendees`);
      console.log('🔍 RAW API RESPONSE:', attendeesRes.data);
      console.log('🔍 FIRST ATTENDEE:', attendeesRes.data[0]);
      setAttendees(attendeesRes.data);
      
      console.log('📋 Loaded', attendeesRes.data.length, 'attendees for event:', eventRes.data.name);
      
    } catch (error) {
      console.error('❌ Error loading attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendee = async (attendeeId, contactName) => {
    if (!confirm(`Remove ${contactName} from this event?`)) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}/attendees/${attendeeId}`);
      console.log('✅ Attendee removed');
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error('❌ Error removing attendee:', error);
      alert('Failed to remove attendee');
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'rsvped': case 'rsvp': return 'bg-green-100 text-green-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      case 'attended': return 'bg-purple-100 text-purple-700';
      case 'aware': return 'bg-yellow-100 text-yellow-700';
      case 'committed': return 'bg-orange-100 text-orange-700';
      case 'executing': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAudienceColor = (audience) => {
    switch (audience) {
      case 'org_members': return 'bg-blue-100 text-blue-700';
      case 'friends_family': return 'bg-green-100 text-green-700';
      case 'champions': return 'bg-purple-100 text-purple-700';
      case 'community_partners': return 'bg-orange-100 text-orange-700';
      case 'business_sponsor': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/events')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ← Back to Events
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {event?.name || 'Event'} - All Attendees
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all contacts registered for this event
          </p>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{attendees.length}</div>
              <div className="text-sm text-gray-600">Total Attendees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {attendees.filter(a => a.currentStage === 'rsvped' || a.currentStage === 'rsvp').length}
              </div>
              <div className="text-sm text-gray-600">RSVP'd</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {attendees.filter(a => a.currentStage === 'paid').length}
              </div>
              <div className="text-sm text-gray-600">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {attendees.filter(a => a.currentStage === 'attended').length}
              </div>
              <div className="text-sm text-gray-600">Attended</div>
            </div>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Attendees ({attendees.length})</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {attendees.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 text-lg mb-2">👥</div>
                <p className="text-gray-600">No attendees registered for this event yet.</p>
                <button
                  onClick={() => navigate(`/event/${eventId}/pipelines`)}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  View Pipeline
                </button>
              </div>
            ) : (
              attendees.map((attendee) => (
                <div key={attendee.attendeeId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    
                    {/* Contact Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {attendee.contact?.firstName?.[0]}{attendee.contact?.lastName?.[0]}
                        </span>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          {attendee.contact?.firstName} {attendee.contact?.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {attendee.contact?.email} • {attendee.contact?.phone}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      {/* Audience Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAudienceColor(attendee.audienceType)}`}>
                        {attendee.audienceType?.replace('_', ' ') || 'Unknown'}
                      </span>
                      
                      {/* Stage Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(attendee.currentStage)}`}>
                        {attendee.currentStage?.replace('_', ' ') || 'Unknown'}
                      </span>
                      
                      {/* Actual Type Badge */}
                      <span className={`px-2 py-1 rounded text-xs ${
                        attendee.actualType === 'org_member' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {attendee.actualType === 'org_member' ? '✓ Org Member' : 'Contact Only'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/event/${eventId}/pipelines`)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View Pipeline
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAttendee(attendee.id, `${attendee.contact?.firstName} ${attendee.contact?.lastName}`)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove from event"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate(`/event/${eventId}/pipelines`)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
          >
            📊 View Pipeline
          </button>
          
          <button
            onClick={() => navigate('/events')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    </div>
  );
}
