import { useState, useEffect } from 'react';
import api from '../lib/api';
import { getOrgId } from '../lib/org';

export default function ContactListAll() {
  const orgId = getOrgId();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState(new Set());

  const loadContacts = async () => {
    setLoading(true);
    try {
      console.log('🚀 LOADING ALL CONTACTS for orgId:', orgId);
      
      const response = await api.get('/contacts', { 
        params: { orgId } 
      });
      
      console.log('✅ API RESPONSE:', response.data);
      console.log('✅ CONTACTS:', response.data.contacts);
      
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">📋 All Contacts</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={loadContacts}
            disabled={loading}
            className="mb-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load All Contacts'}
          </button>

          {contacts.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
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
                <span className="text-sm text-gray-600">
                  {selectedContacts.size} of {contacts.length} selected
                </span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
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

          {contacts.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-8">
              Click "Load All Contacts" to see contacts
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
