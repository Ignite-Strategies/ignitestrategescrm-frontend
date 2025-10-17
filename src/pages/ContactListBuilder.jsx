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
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(new Set());

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

  const handleLoadContacts = async () => {
    setLoading(true);
    try {
      // SUPER SIMPLE - just get ALL contacts with orgId
      console.log('🚀 LOADING ALL CONTACTS for orgId:', orgId);
      const response = await api.get('/contacts', { 
        params: { orgId } 
      });
      
      console.log('✅ ALL CONTACTS RESPONSE:', response.data);
      setContacts(response.data.contacts || []);
      setSelectedContacts(new Set()); // Reset selections
    } catch (error) {
      console.error('❌ Error loading contacts:', error);
      alert('Error loading contacts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contactId) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = contacts.map(c => c.id);
    setSelectedContacts(new Set(allIds));
  };

  const handleDeselectAll = () => {
    setSelectedContacts(new Set());
  };

  const handleCreate = async () => {
    if (!listName) {
      alert('Please enter a list name');
      return;
    }

    // Use selected contacts or all contacts if none selected
    const contactIds = selectedContacts.size > 0 
      ? Array.from(selectedContacts)
      : contacts.map(c => c.id);

    if (contactIds.length === 0) {
      alert('Please select at least one contact');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/contact-lists', {
        name: listName,
        description: `${contactIds.length} contacts (${adventureChoice})`,
        orgId,
        contactIds
      });

      navigate('/list-created-success', {
        state: {
          listName,
          contactCount: contactIds.length,
          listId: response.data.id
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
                  setContacts([]);
                  setSelectedContacts(new Set());
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Choose your adventure...</option>
                <option value="all">🎯 All Contacts</option>
                <option value="event">🎪 Event Attendees</option>
                <option value="org">🏢 Org Members</option>
              </select>
            </div>

            {/* Simple message */}
            <div className="text-gray-600 text-center py-4 border rounded-lg bg-blue-50">
              🎯 <strong>All Contacts</strong><br/>
              Will show all contacts in your organization
            </div>


            {adventureChoice && (
              <button
                onClick={handleLoadContacts}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : '📋 Load Contacts'}
              </button>
            )}
          </div>

          {/* Contacts List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Contacts ({contacts.length})
            </h2>

            {!adventureChoice ? (
              <p className="text-gray-500 text-center py-8">
                Choose your adventure to start building a list
              </p>
            ) : contacts.length > 0 ? (
              <>
                {/* Selection Controls */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSelectAll}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                      Deselect All
                    </button>
                    <span className="text-sm text-gray-600">
                      {selectedContacts.size} of {contacts.length} selected
                    </span>
                  </div>
                </div>

                {/* Contacts Table */}
                <div className="overflow-x-auto mb-4 max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Audience</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {contacts.map(contact => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedContacts.has(contact.id)}
                              onChange={() => handleSelectContact(contact.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {contact.email}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {contact.currentStage && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {contact.currentStage}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {contact.audienceType && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {contact.audienceType}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Create List Section */}
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
                    disabled={loading || !listName || selectedContacts.size === 0}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : `Create List (${selectedContacts.size} contacts)`}
                  </button>
                </div>
              </>
            ) : adventureChoice ? (
              <p className="text-gray-500 text-center py-8">
                No contacts found. Try adjusting your filters.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
