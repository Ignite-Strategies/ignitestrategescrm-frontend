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
  const [bulkOrgId, setBulkOrgId] = useState('');
  const [bulkEventId, setBulkEventId] = useState('');

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

  const handleInlineEdit = async (contactId, field, value) => {
    // Optimistically update UI
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, [field]: value }
        : contact
    ));

    // Save to backend instantly
    try {
      console.log(`💾 Saving ${field} = ${value} for contact ${contactId}`);
      await api.patch(`/contacts/${contactId}`, {
        [field]: value
      });
      console.log(`✅ Saved ${field} successfully`);
    } catch (error) {
      console.error(`❌ Error saving ${field}:`, error);
      // Revert on error
      loadContacts();
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
    if (bulkOrgId !== '') updates.orgId = bulkOrgId === 'none' ? null : bulkOrgId;
    if (bulkEventId !== '') updates.eventId = bulkEventId === 'none' ? null : bulkEventId;

    if (Object.keys(updates).length === 0) {
      alert('Please select at least one field to update');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">👥 All Contact Management</h1>
        <p className="text-gray-600 mb-8">Manage contacts, orgs, and events</p>
        
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <select
                    value={bulkOrgId}
                    onChange={(e) => setBulkOrgId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Don't change...</option>
                    <option value={orgId}>F3 CRM</option>
                    <option value="none">Remove from Org</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event
                  </label>
                  <select
                    value={bulkEventId}
                    onChange={(e) => setBulkEventId(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Don't change...</option>
                    <option value="event_123">Bros & Brews</option>
                    <option value="none">Remove from Event</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audience</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Org</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
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
                    
                    {/* Audience Type - Inline Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={contact.audienceType || ''}
                        onChange={(e) => handleInlineEdit(contact.id, 'audienceType', e.target.value)}
                        className="text-xs border rounded px-2 py-1 w-full"
                      >
                        <option value="">Not set</option>
                        {AUDIENCE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    {/* Stage - Inline Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={contact.currentStage || ''}
                        onChange={(e) => handleInlineEdit(contact.id, 'currentStage', e.target.value)}
                        className="text-xs border rounded px-2 py-1 w-full"
                      >
                        <option value="">Not set</option>
                        {STAGE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    {/* Org - Inline Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={contact.orgId || ''}
                        onChange={(e) => handleInlineEdit(contact.id, 'orgId', e.target.value || null)}
                        className="text-xs border rounded px-2 py-1 w-full"
                      >
                        <option value="">None</option>
                        <option value={orgId}>F3 CRM</option>
                      </select>
                    </td>
                    
                    {/* Event - Inline Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={contact.eventId || ''}
                        onChange={(e) => handleInlineEdit(contact.id, 'eventId', e.target.value || null)}
                        className="text-xs border rounded px-2 py-1 w-full"
                      >
                        <option value="">None</option>
                        <option value="event_123">Bros & Brews</option>
                      </select>
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
