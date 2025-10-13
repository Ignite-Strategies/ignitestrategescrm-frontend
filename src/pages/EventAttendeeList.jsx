import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function EventAttendeeList() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState([]);
  const [event, setEvent] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({});

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
      
      // Load org details for the name
      const orgId = localStorage.getItem('orgId');
      if (orgId) {
        const orgRes = await api.get(`/orgs/${orgId}`);
        setOrgName(orgRes.data.name || 'Organization');
      }
      
      // Try to load from localStorage first (fast!)
      const cachedAttendees = localStorage.getItem(`event_${eventId}_attendees`);
      if (cachedAttendees) {
        console.log('🚀 Loading attendees from localStorage (fast!)');
        setAttendees(JSON.parse(cachedAttendees));
        setLoading(false);
        return;
      }
      
      // Fallback: Load from API if not cached
      console.log('📡 Loading attendees from API (slow)');
      const attendeesRes = await api.get(`/events/${eventId}/attendees`);
      console.log('🔍 RAW API RESPONSE:', attendeesRes.data);
      console.log('🔍 FIRST ATTENDEE:', attendeesRes.data[0]);
      console.log('🔍 FIRST ATTENDEE CONTACT:', attendeesRes.data[0]?.contact);
      console.log('🔍 FIRST ATTENDEE FIRSTNAME:', attendeesRes.data[0]?.contact?.firstName);
      setAttendees(attendeesRes.data);
      
      // Cache for next time
      localStorage.setItem(`event_${eventId}_attendees`, JSON.stringify(attendeesRes.data));
      
      console.log('📋 Loaded', attendeesRes.data.length, 'attendees for event:', eventRes.data.name);
      
    } catch (error) {
      console.error('❌ Error loading attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromEvent = async (attendeeId, contactName) => {
    if (!confirm(`Remove ${contactName} from this event?`)) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}/attendees/${attendeeId}`);
      console.log('✅ Attendee removed from event');
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error('❌ Error removing attendee:', error);
      alert('Failed to remove attendee from event');
    }
  };

  const handleDeleteContact = async (contactId, contactName) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE ${contactName}?\n\nThis will:\n- Remove them from this event\n- Delete their contact record entirely\n- Remove them from ALL events\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      // Delete the contact entirely (this should cascade to EventAttendee records)
      await api.delete(`/contacts/${contactId}`);
      console.log('✅ Contact deleted entirely');
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const handleElevateToOrgMember = async (contactId, contactName) => {
    if (!confirm(`Add ${contactName} to ${orgName || 'the org'} as a member?`)) {
      return;
    }

    try {
      // Create OrgMember record for this contact (SAME ROUTE as ContactDetail)
      const orgId = localStorage.getItem('orgId');
      await api.post('/org-members', 
        { contactId: contactId },
        { headers: { 'x-org-id': orgId } }
      );
      
      console.log('✅ Contact elevated to Org Member');
      alert(`${contactName} has been elevated to Org Member!`);
      
      // Reload data to show updated status
      await loadData();

    } catch (error) {
      console.error('❌ Error elevating to org member:', error);
      alert('Failed to elevate to org member');
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

  // Helper function to capitalize text
  const capitalizeText = (text) => {
    if (!text) return 'Unknown';
    return text.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Toggle dropdown
  const toggleDropdown = (attendeeId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [attendeeId]: !prev[attendeeId]
    }));
  };

  // Close dropdown when clicking outside
  const closeAllDropdowns = () => {
    setOpenDropdowns({});
  };

  // Handle clicking on contact name to view details
  const handleViewContactDetails = (contactId, contactName) => {
    // Navigate to ContactDetail page
    navigate(`/contact/${contactId}`);
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

        {/* Attendees Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" onClick={closeAllDropdowns}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Attendees ({attendees.length})</h2>
          </div>
          
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Audience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-gray-50">
                      {/* Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-indigo-600 font-medium text-xs">
                              {attendee.contact?.firstName?.[0]}{attendee.contact?.lastName?.[0]}
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewContactDetails(attendee.contactId, `${attendee.contact?.firstName} ${attendee.contact?.lastName}`)}
                            className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                          >
                            {attendee.contact?.firstName} {attendee.contact?.lastName}
                          </button>
                        </div>
                      </td>
                      
                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendee.contact?.email}
                      </td>
                      
                      {/* Phone */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendee.contact?.phone}
                      </td>
                      
                      {/* Audience */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAudienceColor(attendee.audienceType)}`}>
                          {capitalizeText(attendee.audienceType)}
                        </span>
                      </td>
                      
                      {/* Stage */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(attendee.currentStage)}`}>
                          {capitalizeText(attendee.currentStage)}
                        </span>
                      </td>
                      
                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {attendee.actualType === 'org_member' ? '✓ Org Member' : 'Non-Org'}
                          </span>
                          
                          {/* Elevate button for non-org members */}
                          {attendee.actualType !== 'org_member' && (
                            <button
                              onClick={() => handleElevateToOrgMember(attendee.contactId, `${attendee.contact?.firstName} ${attendee.contact?.lastName}`)}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                              title="Elevate to Org Member"
                            >
                              ⬆️
                            </button>
                          )}
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/event/${eventId}/pipelines`)}
                            className="text-indigo-600 hover:text-indigo-900 px-3 py-1 rounded text-sm font-medium"
                          >
                            Edit
                          </button>
                          
                          {/* Dropdown for delete options */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(attendee.id);
                              }}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                              title="Delete options"
                            >
                              🗑️
                            </button>
                            {openDropdowns[attendee.id] && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      closeAllDropdowns();
                                      handleRemoveFromEvent(attendee.id, `${attendee.contact?.firstName} ${attendee.contact?.lastName}`);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    Remove from Event
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      closeAllDropdowns();
                                      handleDeleteContact(attendee.contactId, `${attendee.contact?.firstName} ${attendee.contact?.lastName}`);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Delete Contact Entirely
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            onClick={() => navigate(`/event/${eventId}/form-submissions`)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            📝 Form Submissions
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
