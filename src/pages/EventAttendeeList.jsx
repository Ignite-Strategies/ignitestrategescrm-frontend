import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import EditableFieldComponent from "../components/EditableFieldComponent.jsx";

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
      const cacheTimestamp = localStorage.getItem(`event_${eventId}_attendees_timestamp`);
      const now = Date.now();
      const cacheAge = now - (parseInt(cacheTimestamp) || 0);
      
      if (cachedAttendees && cacheAge < 30000) { // Cache valid for 30 seconds
        console.log('🚀 Loading attendees from localStorage (fast!)');
        const parsedAttendees = JSON.parse(cachedAttendees);
        
        // Check if cached data has contactId (hydration check)
        const hasContactId = parsedAttendees.length > 0 && parsedAttendees[0].hasOwnProperty('contactId');
        if (hasContactId) {
          setAttendees(parsedAttendees);
        setLoading(false);
        return;
        } else {
          console.log('⚠️ Cached data missing contactId, reloading from API...');
        }
      }
      
      // 🔥 CONTACT-FIRST: Load contacts by eventId
      console.log('📡 Loading event contacts from Contact API');
      const contactsRes = await api.get('/contacts', {
        params: { eventId }
      });
      console.log('🔍 RAW API RESPONSE:', contactsRes.data);
      console.log('🔍 FIRST CONTACT:', contactsRes.data[0]);
      setAttendees(contactsRes.data);
      
      // Cache for next time (with timestamp)
      localStorage.setItem(`event_${eventId}_attendees`, JSON.stringify(contactsRes.data));
      localStorage.setItem(`event_${eventId}_attendees_timestamp`, Date.now().toString());
      
      console.log('📋 Loaded', contactsRes.data.length, 'contacts for event:', eventRes.data.name);
      
    } catch (error) {
      console.error('❌ Error loading attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromEvent = async (contactId, contactName) => {
    if (!confirm(`Remove ${contactName} from this event?`)) {
      return;
    }

    try {
      // 🔥 CONTACT-FIRST: Update Contact to remove eventId
      await api.patch(`/contacts/${contactId}`, {
        eventId: null
      });
      console.log('✅ Contact removed from event');
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error('❌ Error removing contact from event:', error);
      alert('Failed to remove contact from event');
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
      
      // Clear cache and reload data
      localStorage.removeItem(`event_${eventId}_attendees`);
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
        { contactId: contactId, orgId: orgId }
      );
      
      console.log('✅ Contact elevated to Org Member');
      alert(`${contactName} has been elevated to Org Member!`);
      
      // Clear cache and reload data to show updated status
      localStorage.removeItem(`event_${eventId}_attendees`);
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
    
    // Special cases
    if (text === 'rsvped' || text === 'rsvp') return 'RSVPed';
    
    return text.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Helper function to format phone numbers
  const formatPhone = (phone) => {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as 555-555-5555
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // If not 10 digits, return as-is
    return phone;
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

  // Handle viewing form response for an attendee
  const handleViewFormResponse = async (attendeeId, contactName) => {
    try {
      const response = await api.get(`/attendees/${attendeeId}/form-response`);
      const formResponse = response.data;
      
      // Create a formatted display of the form response
      let displayMessage = `📋 Form Response for ${contactName}\n\n`;
      displayMessage += `Form: ${formResponse.formName}\n`;
      displayMessage += `Email: ${formResponse.email}\n`;
      if (formResponse.phone) displayMessage += `Phone: ${formResponse.phone}\n`;
      displayMessage += `\nCustom Responses:\n`;
      
      Object.entries(formResponse.formResponses).forEach(([key, value]) => {
        displayMessage += `- ${key}: ${value}\n`;
      });
      
      alert(displayMessage);
      
    } catch (error) {
      console.error('❌ Error loading form response:', error);
      if (error.response?.status === 404) {
        alert('No form response found for this attendee');
      } else {
        alert('Failed to load form response');
      }
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
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-indigo-600 transition"
          >
            Main Dashboard
          </button>
          <span>→</span>
          <button
            onClick={() => navigate("/contacts")}
            className="hover:text-indigo-600 transition"
          >
            Contact Management Home
          </button>
          <span>→</span>
          <span className="text-gray-900 font-medium">{event?.name || 'Event'} - Attendees</span>
        </div>

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
                      Who's Coming
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Likelihood
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
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-indigo-600 font-medium text-xs">
                              {attendee.firstName?.[0]}{attendee.lastName?.[0]}
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewContactDetails(attendee.id, `${attendee.firstName} ${attendee.lastName}`)}
                            className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline text-left text-sm"
                          >
                            {attendee.firstName} {attendee.lastName}
                          </button>
                        </div>
                      </td>
                      
                      {/* Email */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        <EditableFieldComponent
                          value={attendee.email}
                          field="email"
                          type="email"
                          contactId={attendee.id}
                          onSave={loadData}
                          placeholder="email@example.com"
                        />
                      </td>
                      
                      {/* Phone */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        <EditableFieldComponent
                          value={formatPhone(attendee.phone)}
                          field="phone"
                          type="tel"
                          contactId={attendee.id}
                          onSave={loadData}
                          placeholder="555-555-5555"
                        />
                      </td>
                      
                      {/* Audience */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <EditableFieldComponent
                          value={attendee.audienceType}
                          field="audienceType"
                          type="select"
                          contactId={attendee.id}
                          onSave={loadData}
                          options={[
                            { value: 'org_members', label: 'Org Members' },
                            { value: 'friends_family', label: 'Friends & Family' },
                            { value: 'champions', label: 'Champions' },
                            { value: 'community_partners', label: 'Community Partners' },
                            { value: 'business_sponsor', label: 'Business Sponsor' }
                          ]}
                        />
                      </td>
                      
                      {/* Stage */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <EditableFieldComponent
                          value={attendee.currentStage}
                          field="currentStage"
                          type="select"
                          contactId={attendee.id}
                          onSave={loadData}
                          options={[
                            { value: 'aware', label: 'Aware' },
                            { value: 'committed', label: 'Committed' },
                            { value: 'rsvped', label: 'RSVPed' },
                            { value: 'paid', label: 'Paid' },
                            { value: 'attended', label: 'Attended' }
                          ]}
                        />
                      </td>
                      
                      {/* Who's Coming */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <EditableFieldComponent
                          value={attendee.spouseOrOther}
                          field="spouseOrOther"
                          type="select"
                          contactId={attendee.id}
                          onSave={loadData}
                          options={[
                            { value: 'solo', label: 'Solo' },
                            { value: 'spouse', label: 'Spouse' },
                            { value: 'other', label: 'Other' }
                          ]}
                        />
                      </td>
                      
                      {/* Party Size */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <EditableFieldComponent
                          value={attendee.howManyInParty}
                          field="howManyInParty"
                          type="number"
                          contactId={attendee.id}
                          onSave={loadData}
                          placeholder="1"
                        />
                      </td>
                      
                      {/* Likelihood */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <EditableFieldComponent
                          value={attendee.likelihoodToAttendId}
                          field="likelihoodToAttendId"
                          type="select"
                          contactId={attendee.id}
                          onSave={loadData}
                          options={[
                            { value: '1', label: 'High' },
                            { value: '2', label: 'Medium' },
                            { value: '3', label: 'Low' },
                            { value: '4', label: 'Support from Afar' }
                          ]}
                        />
                      </td>
                      
                      {/* Actions */}
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-2">
                          
                          {/* Member of Org: Yes/No */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            attendee.contactId 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {attendee.contactId ? 'Yes' : 'No'}
                          </span>
                          
                          {/* Elevate button - only show if NOT already a contact */}
                          {!attendee.contactId && (
                            <button
                                    onClick={() => handleElevateToOrgMember(attendee.id, `${attendee.firstName} ${attendee.lastName}`)}
                              className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded hover:bg-blue-200"
                              title="Elevate to Org Member"
                            >
                              ⬆️
                            </button>
                          )}
                          
                          {/* Delete dropdown */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(attendee.id);
                              }}
                              className="text-red-600 hover:text-red-900 px-1 py-0.5 rounded text-xs"
                              title="Delete options"
                            >
                              🗑️
                            </button>
                            
                            {openDropdowns[attendee.id] && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      closeAllDropdowns();
                                      handleRemoveFromEvent(attendee.id, `${attendee.firstName} ${attendee.lastName}`);
                                    }}
                                    className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                                  >
                                    Remove from Event
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      closeAllDropdowns();
                                      handleDeleteContact(attendee.id, `${attendee.firstName} ${attendee.lastName}`);
                                    }}
                                    className="block w-full text-left px-3 py-1 text-xs text-red-600 hover:bg-red-50"
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
            onClick={() => navigate(`/contacts/selector`)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
          >
            👥 Go to Contacts Manager Hub
          </button>
          
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
