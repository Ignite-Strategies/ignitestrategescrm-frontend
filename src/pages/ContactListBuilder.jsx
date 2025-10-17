import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { getOrgId } from '../lib/org';

const AUDIENCE_OPTIONS = [
  { value: 'org_members', label: 'Org Members' },
  { value: 'prospects', label: 'Prospects' },
  { value: 'donors', label: 'Donors' },
  { value: 'vip', label: 'VIP' }
];

const STAGE_OPTIONS = [
  { value: 'aware', label: 'Aware' },
  { value: 'invited', label: 'Invited' },
  { value: 'rsvped', label: 'RSVP\'d' },
  { value: 'paid', label: 'Paid' },
  { value: 'attended', label: 'Attended' }
];

export default function ContactListBuilder() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  console.log('🚀 ContactListBuilder - orgId:', orgId);
  
  const [listName, setListName] = useState('');
  const [adventureChoice, setAdventureChoice] = useState(''); // 'all', 'event', 'org'
  const [filters, setFilters] = useState({
    eventId: '',
    audienceType: '',
    currentStage: '',
    engagementValue: '',
    chapterResponsibleFor: ''
  });
  
  const [preview, setPreview] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    loadEvents();
    loadOrgs();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get(`/events/${orgId}/events`);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadOrgs = async () => {
    try {
      const response = await api.get('/orgs/first');
      setOrgs(response.data ? [response.data] : []);
    } catch (error) {
      console.error('Error loading orgs:', error);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const params = { orgId };
      
      // Add filters based on adventure choice
      if (adventureChoice === 'event') {
        if (filters.eventId) params.eventId = filters.eventId;
        if (filters.audienceType) params.audienceType = filters.audienceType;
        if (filters.currentStage) params.currentStage = filters.currentStage;
      } else if (adventureChoice === 'org') {
        if (filters.chapterResponsibleFor) params.chapterResponsibleFor = filters.chapterResponsibleFor;
      }
      // For 'all' - just use orgId (shows all contacts in org)

      console.log('🚀 FETCHING CONTACTS with params:', params);
      const response = await api.get('/contacts', { params });
      
      console.log('✅ CONTACTS RESPONSE:', response.data);
      setPreview(response.data.contacts || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error('❌ Error previewing:', error);
      alert('Error previewing: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!listName) {
      alert('Please enter a list name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/lists/create', {
        name: listName,
        description: `${totalCount} contacts (${adventureChoice})`,
        orgId,
        filters: {
          eventId: filters.eventId || undefined,
          audienceType: filters.audienceType || undefined,
          currentStage: filters.currentStage || undefined,
          engagementValue: filters.engagementValue ? parseInt(filters.engagementValue) : undefined,
          chapterResponsibleFor: filters.chapterResponsibleFor || undefined
        }
      });

      navigate('/list-created-success', {
        state: {
          listName,
          contactCount: totalCount,
          listId: response.data.list.id
        }
      });
    } catch (error) {
      alert('Error creating list: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🎯 Build Contact List</h1>
        <p className="text-gray-600 mb-8">Filter contacts and create a targeted list</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Choose Your Adventure</h2>

            {/* Adventure Choice */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What do you want to target?</label>
              <select
                value={adventureChoice}
                onChange={(e) => {
                  setAdventureChoice(e.target.value);
                  // Reset filters when changing adventure
                  setFilters({
                    eventId: '',
                    audienceType: '',
                    currentStage: '',
                    engagementValue: '',
                    chapterResponsibleFor: ''
                  });
                  setPreview([]);
                  setTotalCount(0);
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Choose your adventure...</option>
                <option value="all">🎯 All Contacts</option>
                <option value="event">🎪 Event Attendees</option>
                <option value="org">🏢 Org Members</option>
              </select>
            </div>

            {/* Event Filters - Show when event is chosen */}
            {adventureChoice === 'event' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                  <select
                    value={filters.eventId}
                    onChange={(e) => setFilters({...filters, eventId: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">All Events</option>
                    {events.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience Type</label>
                  <select
                    value={filters.audienceType}
                    onChange={(e) => setFilters({...filters, audienceType: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">All Audiences</option>
                    {AUDIENCE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stage</label>
                  <select
                    value={filters.currentStage}
                    onChange={(e) => setFilters({...filters, currentStage: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">All Stages</option>
                    {STAGE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Org Filters - Show when org is chosen */}
            {adventureChoice === 'org' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <select
                    value={filters.orgId || orgId}
                    onChange={(e) => setFilters({...filters, orgId: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {orgs.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                  <input
                    type="text"
                    value={filters.chapterResponsibleFor}
                    onChange={(e) => setFilters({...filters, chapterResponsibleFor: e.target.value})}
                    placeholder="e.g., Manhattan, Brooklyn"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </>
            )}

            {/* All Contacts - Simple org filter */}
            {adventureChoice === 'all' && (
              <div className="text-gray-600 text-center py-4 border rounded-lg bg-blue-50">
                🎯 <strong>All Contacts</strong><br/>
                Will show all contacts in your organization
              </div>
            )}


            {adventureChoice && (
              <button
                onClick={handlePreview}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : '👁️ Preview'}
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Preview ({totalCount} contacts)
            </h2>

            {!adventureChoice ? (
              <p className="text-gray-500 text-center py-8">
                Choose your adventure to start building a list
              </p>
            ) : preview.length > 0 ? (
              <>
                <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                  {preview.map(contact => (
                    <div key={contact.id} className="border rounded p-2">
                      <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      <div className="flex gap-2 mt-1">
                        {contact.currentStage && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {contact.currentStage}
                          </span>
                        )}
                        {contact.audienceType && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {contact.audienceType}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    placeholder="List name..."
                    className="w-full border rounded-lg px-3 py-2 mb-3"
                  />
                  <button
                    onClick={handleCreate}
                    disabled={loading || !listName}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Create List ({totalCount} contacts)
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select filters and click Preview to see results
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
