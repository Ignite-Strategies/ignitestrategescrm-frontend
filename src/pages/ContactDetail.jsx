import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function ContactDetail() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'events', 'profile'

  useEffect(() => {
    loadContactData();
  }, [contactId]);

  const loadContactData = async () => {
    try {
      // Load contact directly (Contact-first architecture)
      const contactRes = await api.get(`/contacts/${contactId}`);
      setContact(contactRes.data);
      
      // Load events for this contact
      try {
        const eventsRes = await api.get(`/contacts/${contactId}/events`);
        setEvents(eventsRes.data);
      } catch (err) {
        console.log('No events found for contact:', err);
        setEvents([]);
      }
      
    } catch (error) {
      console.error('Error loading contact:', error);
      alert('Error loading contact: ' + error.message);
      navigate('/org-members');
    } finally {
      setLoading(false);
    }
  };

  const handleElevate = async () => {
    if (!confirm(`Elevate ${contact.firstName} ${contact.lastName} to Org Member?\n\nThis will give them access to org features and add them to your master CRM list.`)) {
      return;
    }

    try {
      const orgId = localStorage.getItem('orgId');
      await api.post('/org-members', 
        { contactId: contactId },
        { headers: { 'x-org-id': orgId } }
      );
      
      console.log('✅ Contact elevated to Org Member');
      alert(`${contact.firstName} ${contact.lastName} has been elevated to Org Member!`);
      
      // Reload contact data to show updated status
      await loadContactData();
      
    } catch (error) {
      console.error('❌ Error elevating to org member:', error);
      alert('Failed to elevate to org member: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/supporters/${contactId}`);
      alert(`${contact.firstName} ${contact.lastName} has been deleted.`);
      navigate('/org-members');
    } catch (error) {
      alert('Error deleting contact: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Not Found</h1>
          <button
            onClick={() => navigate('/org-members')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
          >
            ← Back to Contacts
          </button>
        </div>
      </div>
    );
  }

  const getEngagementColor = (level) => {
    const colors = {
      high: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-orange-100 text-orange-800 border-orange-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[level] || colors.medium;
  };

  const getStageColor = (stage) => {
    const colors = {
      in_funnel: 'bg-gray-100 text-gray-800',
      general_awareness: 'bg-blue-100 text-blue-800',
      personal_invite: 'bg-purple-100 text-purple-800',
      expressed_interest: 'bg-yellow-100 text-yellow-800',
      soft_commit: 'bg-green-100 text-green-800',
      paid: 'bg-emerald-100 text-emerald-800',
      cant_attend: 'bg-red-100 text-red-800'
    };
    return colors[stage] || colors.in_funnel;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/org-members')}
          className="text-indigo-600 hover:text-indigo-800 mb-6 font-medium flex items-center gap-2"
        >
          <span>←</span> Back to Contacts
        </button>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {contact.firstName?.[0]}{contact.lastName?.[0]}
              </div>
              
              {/* Info */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {contact.firstName} {contact.lastName}
                </h1>
                {contact.goesBy && (
                  <p className="text-lg text-gray-600 mt-1">"{contact.goesBy}"</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEngagementColor(contact.categoryOfEngagement)}`}>
                    {contact.categoryOfEngagement || 'medium'} engagement
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 font-medium">{events.length} event{events.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!contact.orgId && (
                <button 
                  onClick={handleElevate}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium flex items-center gap-2"
                >
                  ⬆️ Elevate to Org Member
                </button>
              )}
              <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium">
                Edit
              </button>
              <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium">
                Add to Event
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Elevate Notice for Contacts without Organization */}
        {!contact.orgId && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Basic Contact Only:</strong> This person is in your system from a form submission but hasn't been added to your master CRM list yet. Click "Elevate to Org Member" to add extended details like address, employer, tags, and notes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'overview' 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            📋 Overview
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'events' 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            🎉 Events ({events.length})
          </button>
          {contact.orgId && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'profile' 
                  ? 'bg-white text-indigo-600 shadow-md' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              👤 Full Profile
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contact Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📞 Contact Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{contact.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{contact.phone || 'Not provided'}</p>
                </div>
                {contact.employer && (
                  <div>
                    <p className="text-sm text-gray-500">Employer</p>
                    <p className="text-gray-900 font-medium">{contact.employer}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Events Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Recent Events</h3>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.slice(0, 3).map(event => (
                    <div key={event.eventId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{event.eventName}</p>
                        <p className="text-sm text-gray-500">{event.audienceType}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(event.currentStage)}`}>
                        {event.currentStage?.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <button 
                      onClick={() => setActiveTab('events')}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View all {events.length} events →
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">No events yet</p>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <p className="text-3xl font-bold text-indigo-600">{events.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Events</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {events.filter(e => e.currentStage === 'paid').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Paid</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">
                    {events.filter(e => e.currentStage === 'soft_commit').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Committed</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">
                    {events.filter(e => e.attended).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Attended</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🎉 All Events</h3>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.eventId} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{event.eventName}</h4>
                        <p className="text-sm text-gray-500">
                          {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStageColor(event.currentStage)}`}>
                        {event.currentStage?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📊 {event.audienceType?.replace('_', ' ')}</span>
                      {event.attended && <span className="text-green-600 font-medium">✓ Attended</span>}
                      {event.amountPaid > 0 && <span className="text-indigo-600 font-medium">${event.amountPaid} paid</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No events yet</p>
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                  Add to Event
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">👤 Full Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Personal Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Birthday</p>
                    <p className="text-gray-900">{contact.birthday || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="text-gray-900">{contact.married ? 'Married' : 'Single'}</p>
                  </div>
                  {contact.spouseName && (
                    <div>
                      <p className="text-sm text-gray-500">Spouse</p>
                      <p className="text-gray-900">{contact.spouseName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Children</p>
                    <p className="text-gray-900">{contact.numberOfKids || 0}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Address</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Street</p>
                    <p className="text-gray-900">{contact.street || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City, State ZIP</p>
                    <p className="text-gray-900">
                      {contact.city && contact.state && contact.zip 
                        ? `${contact.city}, ${contact.state} ${contact.zip}`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Organization Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Employer</p>
                    <p className="text-gray-900">{contact.employer || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Years With Organization</p>
                    <p className="text-gray-900">{contact.yearsWithOrganization || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Chapter Responsible For</p>
                    <p className="text-gray-900">{contact.chapterResponsibleFor || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Notes & Story</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Origin Story</p>
                    <p className="text-gray-900">{contact.originStory || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">General Notes</p>
                    <p className="text-gray-900">{contact.notes || 'Not provided'}</p>
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
