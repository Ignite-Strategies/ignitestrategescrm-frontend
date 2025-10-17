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
  
  // Management mode toggles
  const [managementMode, setManagementMode] = useState('contacts'); // 'contacts', 'org', 'event'
  
  // Contact detail modal
  const [selectedContactDetail, setSelectedContactDetail] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Reload contacts when management mode changes
  useEffect(() => {
    loadContacts();
  }, [managementMode]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const containerId = 'cmgu7w02h0000ceaqt7iz6bf9'; // From config
      
      let response;
      if (managementMode === 'contacts') {
        console.log('🚀 LOADING BASE CONTACTS by orgId (fallback):', orgId);
        response = await api.get('/contacts', {
          params: { orgId }
        });
      } else if (managementMode === 'org') {
        console.log('🚀 LOADING ORG MEMBERS by orgId:', orgId);
        response = await api.get('/contacts', {
          params: { orgId }
        });
      } else if (managementMode === 'event') {
        console.log('🚀 LOADING EVENT ATTENDEES by eventId');
        const eventId = 'cmggljv7z0002nt28gckp1jpe'; // Bros & Brews
        response = await api.get('/contacts', {
          params: { eventId }
        });
      }
      
      console.log('✅ LOADED CONTACTS:', response.data);
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

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }

    try {
      console.log(`🗑️ Deleting contact: ${contactId}`);
      await api.delete(`/contacts/${contactId}`);
      console.log(`✅ Contact deleted successfully`);
      loadContacts(); // Refresh the list
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      alert('Error deleting contact: ' + error.message);
    }
  };

  const handleViewContact = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    setSelectedContactDetail(contact);
    setShowContactModal(true);
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
              📋 Base Contacts
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
                    <option value={orgId}>F3</option>
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
                    <option value="cmggljv7z0002nt28gckp1jpe">Bros & Brews</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                  {managementMode === 'contacts' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goes By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Org</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    </>
                  )}
                  {managementMode === 'org' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chapter Responsible</th>
                    </>
                  )}
                  {managementMode === 'event' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attended</th>
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
                      <button
                        onClick={() => handleViewContact(contact.id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {contact.firstName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <button
                        onClick={() => handleViewContact(contact.id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {contact.lastName}
                      </button>
                    </td>
                    
                    {/* BASE CONTACT MANAGEMENT MODE */}
                    {managementMode === 'contacts' && (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={contact.goesBy || ''}
                            onChange={(e) => handleInlineEdit(contact.id, 'goesBy', e.target.value)}
                            className="text-xs border rounded px-2 py-1 w-full"
                            placeholder="Goes by..."
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="email"
                            value={contact.email || ''}
                            onChange={(e) => handleInlineEdit(contact.id, 'email', e.target.value)}
                            className="text-xs border rounded px-2 py-1 w-full"
                            placeholder="Email..."
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="tel"
                            value={contact.phone || ''}
                            onChange={(e) => handleInlineEdit(contact.id, 'phone', e.target.value)}
                            className="text-xs border rounded px-2 py-1 w-full"
                            placeholder="Phone..."
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={contact.orgId || ''}
                            onChange={(e) => handleInlineEdit(contact.id, 'orgId', e.target.value || null)}
                            className="text-xs border rounded px-2 py-1 w-full"
                          >
                            <option value="">None</option>
                            <option value={orgId}>F3</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={contact.eventId || ''}
                            onChange={(e) => handleInlineEdit(contact.id, 'eventId', e.target.value || null)}
                            className="text-xs border rounded px-2 py-1 w-full"
                          >
                            <option value="">None</option>
                            <option value="cmggljv7z0002nt28gckp1jpe">Bros & Brews</option>
                          </select>
                        </td>
                      </>
                    )}
                    
                    {/* ORG MANAGEMENT MODE */}
                    {managementMode === 'org' && (
                      <>
                        <td className="px-4 py-3">
                          <select
                            value={contact.engagement || ''}
                            onChange={(e) => handleInlineEdit(contact.id, 'engagement', e.target.value)}
                            className="text-xs border rounded px-2 py-1 w-full"
                          >
                            <option value="">Not set</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="prospective">Prospective</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={contact.role || ''}
                            onChange={(e) => handleInlineEdit(contact.id, 'role', e.target.value)}
                            className="text-xs border rounded px-2 py-1 w-full"
                            placeholder="Role..."
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={contact.chapterResponsibleOf || ''}
                            onChange={(e) => handleInlineEdit(contact.id, 'chapterResponsibleOf', e.target.value)}
                            className="text-xs border rounded px-2 py-1 w-full"
                            placeholder="Chapter..."
                          />
                        </td>
                      </>
                    )}
                    
                    {/* EVENT MANAGEMENT MODE */}
                    {managementMode === 'event' && (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {contact.email}
                        </td>
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
                        <td className="px-4 py-3">
                          <select
                            value={contact.attended ? 'true' : 'false'}
                            onChange={(e) => handleInlineEdit(contact.id, 'attended', e.target.value === 'true')}
                            className="text-xs border rounded px-2 py-1 w-full"
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                        </td>
                      </>
                    )}
                    
                    {/* Delete Button */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        🗑️ Delete
                      </button>
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

      {/* Contact Detail Modal */}
      {showContactModal && selectedContactDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedContactDetail.firstName} {selectedContactDetail.lastName}
              </h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{selectedContactDetail.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{selectedContactDetail.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goes By</label>
                <p className="text-gray-900">{selectedContactDetail.goesBy || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <p className="text-gray-900">{selectedContactDetail.orgId ? 'F3' : 'Not assigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                <p className="text-gray-900">{selectedContactDetail.eventId ? 'Bros & Brews' : 'Not assigned'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience Type</label>
                <p className="text-gray-900">{selectedContactDetail.audienceType || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stage</label>
                <p className="text-gray-900">{selectedContactDetail.currentStage || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact ID</label>
                <p className="text-gray-500 text-sm font-mono">{selectedContactDetail.id}</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowContactModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  handleDeleteContact(selectedContactDetail.id);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                🗑️ Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
