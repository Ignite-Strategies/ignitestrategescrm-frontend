import { useState, useEffect } from 'react';
import api from '../lib/api';
import { getOrgId } from '../lib/org';

// Official pipeline config from schema
const AUDIENCE_OPTIONS = [
  { value: 'org_members', label: 'Org Members' },
  { value: 'friends_family', label: 'Friends & Family' },
  { value: 'landing_page_public', label: 'Landing Page Public' },
  { value: 'community_partners', label: 'Community Partners' },
  { value: 'cold_outreach', label: 'Cold Outreach' }
];

const STAGE_OPTIONS = [
  { value: 'in_funnel', label: 'In Funnel' },
  { value: 'general_awareness', label: 'General Awareness' },
  { value: 'personal_invite', label: 'Personal Invite' },
  { value: 'expressed_interest', label: 'Expressed Interest' },
  { value: 'rsvped', label: 'RSVP\'d' },
  { value: 'thanked', label: 'Thanked' },
  { value: 'paid', label: 'Paid' },
  { value: 'thanked_paid', label: 'Thanked Paid' },
  { value: 'attended', label: 'Attended' },
  { value: 'followed_up', label: 'Followed Up' }
];

export default function AllContactManagement() {
  const orgId = getOrgId();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [editingContact, setEditingContact] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkAudienceType, setBulkAudienceType] = useState('');
  const [bulkCurrentStage, setBulkCurrentStage] = useState('');
  
  // Management mode toggles
  const [managementMode, setManagementMode] = useState('contacts'); // 'contacts', 'org', 'event'

  const loadContacts = async () => {
    setLoading(true);
    try {
      console.log('🚀 LOADING ALL CONTACTS for orgId:', orgId);
      
      const response = await api.get('/contacts', { 
        params: { orgId } 
      });
      
      console.log('✅ API RESPONSE:', response.data);
      setContacts(response.data.contacts || []);
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

  const handleInlineEdit = (contactId, field, value) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, [field]: value }
        : contact
    ));
  };

  const handleSaveContact = async (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    try {
      await api.patch(`/contacts/${contactId}`, {
        audienceType: contact.audienceType,
        currentStage: contact.currentStage
      });
      
      setEditingContact(null);
      console.log('✅ Contact updated:', contactId);
    } catch (error) {
      console.error('❌ Error updating contact:', error);
      alert('Error updating contact: ' + error.message);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedContacts.size === 0) {
      alert('Please select contacts to update');
      return;
    }

    const updates = {};
    if (bulkAudienceType) updates.audienceType = bulkAudienceType;
    if (bulkCurrentStage) updates.currentStage = bulkCurrentStage;

    if (Object.keys(updates).length === 0) {
      alert('Please select audience type or stage to update');
      return;
    }

    try {
      await api.post('/contacts/bulk-update', {
        contactIds: Array.from(selectedContacts),
        updates
      });

      // Update local state
      setContacts(prev => prev.map(contact => 
        selectedContacts.has(contact.id)
          ? { ...contact, ...updates }
          : contact
      ));

      setBulkEditMode(false);
      setSelectedContacts(new Set());
      setBulkAudienceType('');
      setBulkCurrentStage('');
      
      console.log('✅ Bulk update complete');
    } catch (error) {
      console.error('❌ Error bulk updating:', error);
      alert('Error bulk updating: ' + error.message);
    }
  };

  const handleAddToOrg = async (contactId) => {
    try {
      await api.patch(`/contacts/${contactId}`, {
        orgId: orgId // Add to current org
      });
      loadContacts();
    } catch (error) {
      console.error('Failed to add to org:', error);
    }
  };

  const handleAddToEvent = async (contactId) => {
    try {
      // For now, we'll need to get an eventId - this could be a modal or dropdown
      const eventId = prompt('Enter Event ID to add contact to:');
      if (eventId) {
        await api.patch(`/contacts/${contactId}`, {
          eventId: eventId
        });
        loadContacts();
      }
    } catch (error) {
      console.error('Failed to add to event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">👥 All Contact Management</h1>
        <p className="text-gray-600 mb-8">Manage contacts, org members, and event attendees</p>
        
        {/* Management Mode Toggle */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setManagementMode('contacts')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                managementMode === 'contacts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 All Contacts
            </button>
            <button
              onClick={() => setManagementMode('org')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                managementMode === 'org'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏢 Org Management
            </button>
            <button
              onClick={() => setManagementMode('event')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                managementMode === 'event'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎪 Event Management
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          {/* Header Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={loadContacts}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : '🔄 Refresh Contacts'}
              </button>
              
              <span className="text-sm text-gray-600">
                {contacts.length} contacts loaded
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
              >
                Deselect All
              </button>
              <button
                onClick={() => setBulkEditMode(!bulkEditMode)}
                className={`px-4 py-2 rounded-lg transition text-sm ${
                  bulkEditMode 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {bulkEditMode ? 'Cancel Bulk Edit' : 'Bulk Edit'}
              </button>
            </div>
          </div>

          {/* Bulk Edit Panel */}
          {bulkEditMode && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">
                Bulk Edit {selectedContacts.size} Selected Contacts
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience Type
                  </label>
                  <select
                    value={bulkAudienceType}
                    onChange={(e) => setBulkAudienceType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select audience type...</option>
                    {AUDIENCE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stage
                  </label>
                  <select
                    value={bulkCurrentStage}
                    onChange={(e) => setBulkCurrentStage(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select stage...</option>
                    {STAGE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleBulkUpdate}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Update {selectedContacts.size} Contacts
                </button>
                <button
                  onClick={() => setBulkEditMode(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Contacts Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      checked={selectedContacts.size === contacts.length && contacts.length > 0}
                      onChange={selectedContacts.size === contacts.length ? handleDeselectAll : handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  {managementMode === 'contacts' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audience</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                    </>
                  )}
                  {managementMode === 'org' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Is Active</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Years</th>
                    </>
                  )}
                  {managementMode === 'event' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attended</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {contact.email}
                    </td>
                    {/* Contacts Mode - Universal Management */}
                    {managementMode === 'contacts' && (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              contact.audienceType 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {contact.audienceType || 'Not set'}
                            </span>
                            <div className="text-xs text-gray-500">
                              {contact.orgId ? '🏢 In Org' : '❌ No Org'} | 
                              {contact.eventId ? '🎪 In Event' : '❌ No Event'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            contact.currentStage 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {contact.currentStage || 'Not set'}
                          </span>
                        </td>
                      </>
                    )}
                    
                    {/* Org Mode - Org Member Management */}
                    {managementMode === 'org' && (
                      <>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            contact.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {contact.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-900">{contact.role || 'Member'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-900">{contact.yearsInOrg || '0'} years</span>
                        </td>
                      </>
                    )}
                    
                    {/* Event Mode - Event Attendee Management */}
                    {managementMode === 'event' && (
                      <>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            contact.currentStage 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {contact.currentStage || 'Not set'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            contact.attended ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {contact.attended ? '✅ Attended' : '❌ No Show'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-900">${contact.amountPaid || '0'}</span>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      {editingContact === contact.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveContact(contact.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingContact(null)}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => setEditingContact(contact.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          {managementMode === 'contacts' && (
                            <div className="flex gap-1">
                              {!contact.orgId && (
                                <button
                                  onClick={() => handleAddToOrg(contact.id)}
                                  className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                >
                                  + Org
                                </button>
                              )}
                              {!contact.eventId && (
                                <button
                                  onClick={() => handleAddToEvent(contact.id)}
                                  className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                                >
                                  + Event
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contacts.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-8">
              Click "Refresh Contacts" to load contacts
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
