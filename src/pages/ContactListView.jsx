import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { getOrgId } from '../lib/org';

export default function ContactListView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  
  const type = searchParams.get('type');
  const campaignId = searchParams.get('campaignId');
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadContacts();
  }, [type]);
  
  const loadContacts = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (type === 'org_members') {
        console.log('📞 Loading org members...');
        response = await api.get(`/orgmembers?orgId=${orgId}`);
        const members = response.data.members || response.data || [];
        setContacts(members);
        console.log('✅ Loaded org members:', members.length);
        
      } else if (type === 'all_attendees') {
        console.log('📅 Loading event attendees...');
        const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');
        if (!cachedEvent) {
          throw new Error('No event found. Please go to Events page first.');
        }
        response = await api.get(`/events/${cachedEvent.id}/attendees`);
        setContacts(response.data || []);
        console.log('✅ Loaded event attendees:', response.data?.length || 0);
        
      } else if (type === 'paid_attendees') {
        console.log('💰 Loading paid attendees...');
        response = await api.get(`/orgs/${orgId}/attendees?stage=paid`);
        setContacts(response.data || []);
        console.log('✅ Loaded paid attendees:', response.data?.length || 0);
        
      } else {
        throw new Error('Invalid contact type');
      }
      
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseList = async () => {
    try {
      setLoading(true);
      
      // Create contact list
      const listData = {
        name: getListName(),
        description: getListDescription(),
        orgId,
        contactIds: contacts.map(c => c.contactId || c.id)
      };
      
      console.log('📝 Creating contact list:', listData.name);
      const response = await api.post('/contact-lists', listData);
      const listId = response.data.id;
      
      console.log('✅ Contact list created:', listId);
      
      // Navigate based on campaign flow
      if (campaignId) {
        navigate(`/campaign-creator?campaignId=${campaignId}&listId=${listId}`);
      } else {
        navigate('/contact-list-manager');
      }
      
    } catch (err) {
      console.error('Error creating list:', err);
      setError('Failed to create contact list');
    } finally {
      setLoading(false);
    }
  };
  
  const getListName = () => {
    switch (type) {
      case 'org_members': return 'All Org Members';
      case 'all_attendees': return 'All Event Attendees';
      case 'paid_attendees': return 'Paid Attendees';
      default: return 'Contact List';
    }
  };
  
  const getListDescription = () => {
    switch (type) {
      case 'org_members': return 'All organization members';
      case 'all_attendees': return 'All attendees from the current event';
      case 'paid_attendees': return 'Attendees who have paid';
      default: return 'Contact list';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Loading Contacts...</div>
          <div className="text-gray-600">Fetching {getListName().toLowerCase()}...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/contact-list-builder')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ← Back to Contact List Builder
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getListName()}</h1>
              <p className="text-gray-600 mt-2">
                {contacts.length} contacts • {getListDescription()}
              </p>
            </div>
            <button
              onClick={() => navigate('/contact-list-builder')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              ← Back to Builder
            </button>
          </div>
        </div>
        
        {/* Contact List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Contacts ({contacts.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  {type === 'all_attendees' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  )}
                  {type === 'org_members' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.map((contact, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.phone || 'N/A'}
                    </td>
                    {type === 'all_attendees' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {contact.currentStage || 'Unknown'}
                        </span>
                      </td>
                    )}
                    {type === 'org_members' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          contact.engagementValue === 4 ? 'bg-green-100 text-green-800' :
                          contact.engagementValue === 3 ? 'bg-yellow-100 text-yellow-800' :
                          contact.engagementValue === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.engagementValue === 4 ? 'Champion' :
                           contact.engagementValue === 3 ? 'High' :
                           contact.engagementValue === 2 ? 'Medium' :
                           'Low'}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleUseList}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
          >
            {loading ? 'Creating List...' : 'Use This List'}
          </button>
          <button
            onClick={() => navigate('/contact-list-builder')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}