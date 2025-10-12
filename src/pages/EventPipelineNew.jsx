import { useState, useEffect } from "react";
import api from "../lib/api";

export default function EventPipelineNew() {
  const [eventId, setEventId] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventId();
  }, []);

  const loadEventId = () => {
    // Get eventId from localStorage
    const storedEventId = localStorage.getItem('currentEventId');
    if (storedEventId) {
      setEventId(storedEventId);
      loadAttendees(storedEventId);
    } else {
      console.log('❌ No eventId in localStorage');
      setLoading(false);
    }
  };

  const loadAttendees = async (eventId) => {
    try {
      console.log('🔍 Loading EventAttendees + Contact data for event:', eventId);
      
      // Get EventAttendees with Contact data in one clean query
      const response = await api.get(`/events/${eventId}/attendees`);
      
      console.log('✅ Combined EventAttendee + Contact response:', response.data);
      
      // The response now contains both EventAttendee and Contact data in one object
      setAttendees(response.data);
      setContacts(response.data); // Same data, but we'll display it differently
      
    } catch (error) {
      console.error('❌ Error loading attendees:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Event Selected</h1>
          <p className="text-gray-600">Please select an event first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Event Pipeline (New)</h1>
        
        {/* EventAttendees */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">EventAttendees ({attendees.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendees.map((attendee, index) => (
              <div key={attendee.id} className="bg-white p-4 rounded-lg shadow border">
                <h3 className="font-semibold text-gray-900 mb-2">EventAttendee #{index + 1}</h3>
                <div className="text-sm space-y-1">
                  <div><strong>ID:</strong> {attendee.id}</div>
                  <div><strong>Event ID:</strong> {attendee.eventId}</div>
                  <div><strong>Contact ID:</strong> {attendee.contactId}</div>
                  <div><strong>Audience Type:</strong> {attendee.audienceType || 'NULL'}</div>
                  <div><strong>Current Stage:</strong> {attendee.currentStage || 'NULL'}</div>
                  <div><strong>Attended:</strong> {attendee.attended ? 'Yes' : 'No'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Contacts ({contacts.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact, index) => (
              <div key={contact.id} className="bg-white p-4 rounded-lg shadow border">
                <h3 className="font-semibold text-gray-900 mb-2">Contact #{index + 1}</h3>
                <div className="text-sm space-y-1">
                  <div><strong>ID:</strong> {contact.id}</div>
                  <div><strong>Name:</strong> {contact.firstName} {contact.lastName}</div>
                  <div><strong>Email:</strong> {contact.email}</div>
                  <div><strong>Phone:</strong> {contact.phone}</div>
                  <div><strong>Org ID:</strong> {contact.orgId}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clean Combined View */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Clean Combined View (EventAttendee + Contact)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendees.map((item, index) => (
              <div key={item.attendeeId} className="bg-white p-4 rounded-lg shadow border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.firstName ? `${item.firstName} ${item.lastName}` : 'Unknown Contact'}
                </h3>
                <div className="text-sm space-y-1">
                  <div><strong>Email:</strong> {item.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {item.phone || 'N/A'}</div>
                  <div><strong>Stage:</strong> {item.currentStage || 'NULL'}</div>
                  <div><strong>Audience:</strong> {item.audienceType || 'NULL'}</div>
                  <div><strong>Attendee ID:</strong> {item.attendeeId}</div>
                  <div><strong>Contact ID:</strong> {item.contactId}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">EventAttendees:</h4>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {JSON.stringify(attendees, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">Contacts:</h4>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {JSON.stringify(contacts, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
