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

export default function UniversalListBuilder() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [listName, setListName] = useState('');
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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/events', { params: { orgId } });
      setEvents(response.data.events || response.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const params = { orgId };
      if (filters.eventId) params.eventId = filters.eventId;
      if (filters.audienceType) params.audienceType = filters.audienceType;
      if (filters.currentStage) params.currentStage = filters.currentStage;
      if (filters.engagementValue) params.engagementValue = filters.engagementValue;
      if (filters.chapterResponsibleFor) params.chapterResponsibleFor = filters.chapterResponsibleFor;

      const response = await api.get('/lists/preview', { params });
      
      setPreview(response.data.contacts);
      setTotalCount(response.data.totalCount);
    } catch (error) {
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
        description: `${totalCount} contacts`,
        orgId,
        filters: {
          eventId: filters.eventId || undefined,
          audienceType: filters.audienceType || undefined,
          currentStage: filters.currentStage || undefined,
          engagementValue: filters.engagementValue ? parseInt(filters.engagementValue) : undefined,
          chapterResponsibleFor: filters.chapterResponsibleFor || undefined
        }
      });

      alert(`✅ Created list "${listName}" with ${totalCount} contacts!`);
      navigate('/contact-list-manager');
    } catch (error) {
      alert('Error creating list: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🎯 Universal List Builder</h1>
        <p className="text-gray-600 mb-8">Build lists from any combination of filters</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Filters</h2>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Engagement</label>
              <select
                value={filters.engagementValue}
                onChange={(e) => setFilters({...filters, engagementValue: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">All</option>
                <option value="4">High (4)</option>
                <option value="3">Medium (3)</option>
                <option value="2">Low (2)</option>
                <option value="1">Undetermined (1)</option>
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

            <button
              onClick={handlePreview}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : '👁️ Preview'}
            </button>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Preview ({previewCount} contacts)
            </h2>

            {preview.length > 0 ? (
              <>
                <div className="space-y-2 mb-4">
                  {preview.map(contact => (
                    <div key={contact.id} className="border rounded p-2">
                      <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                      {contact.currentStage && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {contact.currentStage}
                        </span>
                      )}
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
                    Create List ({previewCount} contacts)
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

