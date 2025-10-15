import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
// Pipeline config imported inline (from backend config/pipelineConfig.js)
const AUDIENCE_STAGES = {
  'org_members': [
    'in_funnel',
    'general_awareness',
    'personal_invite',
    'expressed_interest',
    'rsvped',
    'thanked',
    'paid',
    'thanked_paid',
    'attended',
    'followed_up'
  ],
  'friends_family': [
    'in_funnel',
    'general_awareness',
    'personal_invite',
    'expressed_interest',
    'rsvped',
    'thanked',
    'paid',
    'thanked_paid',
    'attended',
    'followed_up'
  ],
  'community_partners': [
    'interested',
    'contacted',
    'partner',
    'thanked'
  ],
  'business_sponsor': [
    'interested',
    'contacted',
    'sponsor',
    'thanked'
  ],
  'champions': [
    'aware',
    'contacted',
    'committed',
    'thanked',
    'executing',
    'recognized'
  ]
};

export default function OrgMembersUploadPreview() {
  const navigate = useNavigate();
  const [orgId] = useState(() => localStorage.getItem('orgId'));
  const [file, setFile] = useState(() => {
    const savedFile = localStorage.getItem('uploadFile');
    return savedFile ? JSON.parse(savedFile) : null;
  });
  
  const [fieldMapping, setFieldMapping] = useState([]);
  const [csvPreviewData, setCsvPreviewData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Event assignment
  const [addToEvent, setAddToEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('org_members');
  const [selectedStage, setSelectedStage] = useState('in_funnel');
  const [availableEvents, setAvailableEvents] = useState([]);
  const [availableStages, setAvailableStages] = useState([]);

  // Load events - check cache first, then API
  useEffect(() => {
    const loadEvents = async () => {
      if (!orgId) return;
      
      // Try to get current event from cache (set by Welcome)
      const cachedEvent = localStorage.getItem('event');
      if (cachedEvent) {
        try {
          const event = JSON.parse(cachedEvent);
          console.log('✅ Using cached event from Welcome hydration:', event.name);
          setAvailableEvents([event]);
          setSelectedEvent(event.id);
          return;
        } catch (error) {
          console.error('⚠️ Failed to parse cached event, loading from API');
        }
      }
      
      // If no cache, fetch all events from API
      try {
        console.log('🔍 Fetching events for org:', orgId);
        const response = await api.get(`/events/${orgId}/events`);
        const events = response.data;
        console.log('✅ Events loaded:', events);
        setAvailableEvents(events);
        if (events.length > 0) {
          setSelectedEvent(events[0].id);
        }
      } catch (error) {
        console.error('❌ Error loading events:', error);
      }
    };

    loadEvents();
  }, [orgId]);

  // Load stages when audience changes
  useEffect(() => {
    if (addToEvent && selectedAudience) {
      const stages = AUDIENCE_STAGES[selectedAudience] || [];
      setAvailableStages(stages);
      if (stages.length > 0) {
        setSelectedStage(stages[0]);
      }
    }
  }, [addToEvent, selectedAudience]);

  // Load preview from backend
  useEffect(() => {
    const loadPreview = async () => {
      if (!file || !file.content) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📋 Loading preview data...');
        
        const formData = new FormData();
        const blob = new Blob([file.content], { type: 'text/csv' });
        formData.append('file', blob, file.name);
        formData.append('uploadType', 'orgMember');
        formData.append('orgId', orgId);

        const response = await api.post('/contacts/upload/preview', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          const mappings = response.data.fieldMappingSuggestions.map(suggestion => ({
            csvHeader: suggestion.csvHeader,
            mappedField: suggestion.suggestedField
          }));
          setFieldMapping(mappings);
          
          const previewRows = response.data.preview.map(record => {
            return mappings.map(mapping => record[mapping.mappedField] || '');
          });
          setCsvPreviewData(previewRows);
          console.log('✅ Preview data loaded');
        }
      } catch (error) {
        console.error('❌ Error loading preview:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [file, orgId]);

  const handleUpload = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      const blob = new Blob([file.content], { type: 'text/csv' });
      formData.append('file', blob, file.name);
      formData.append('uploadType', 'orgMember');
      formData.append('orgId', orgId);
      
      // Add event assignment if enabled
      if (addToEvent && selectedEvent) {
        console.log('🎯 Adding event assignment:', {
          eventId: selectedEvent,
          audienceType: selectedAudience,
          currentStage: selectedStage
        });
        
        // eventId goes as separate field (backend expects it in req.body)
        formData.append('eventId', selectedEvent);
        
        // assignments contains audience and stage
        formData.append('assignments', JSON.stringify({
          audienceType: selectedAudience,
          defaultStage: selectedStage  // Backend uses 'defaultStage', not 'currentStage'
        }));
      }

      console.log('📤 Uploading org members with formData');
      const response = await api.post('/contacts/upload/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Upload response:', response.data);
      if (response.data.success) {
        navigate('/org-members/upload/success', { 
          state: { results: response.data } 
        });
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('Upload failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  if (!file) {
    return <div>No file found. Please go back and upload a file.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Loading Your Data...</h2>
            <p className="text-gray-600">Analyzing CSV and mapping fields</p>
          </div>
          <div className="flex justify-center pt-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preview & Import</h1>
          <p className="text-gray-600 mt-2">Review your data before importing</p>
        </div>

        {/* Field Mapping */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Field Mapping</h2>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CSV Column</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maps To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fieldMapping.map((field, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {field.csvHeader}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {field.mappedField}
                    </td>
                    <td className="px-4 py-3">
                      {field.mappedField === 'unmapped' ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Not Mapped
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ✓ Mapped
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Preview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Data Preview</h2>
          
          {csvPreviewData.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {fieldMapping.map((field, idx) => (
                      <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {field.csvHeader}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {csvPreviewData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-3 py-2 text-gray-700">
                          {cell || <span className="text-gray-400 italic">empty</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No data preview available</p>
            </div>
          )}
        </div>

        {/* Event Assignment */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow p-6 border border-indigo-200 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Add to Event (Optional)</h2>
          
          <div className="space-y-4">
            <label className="flex items-center cursor-pointer bg-white rounded-lg p-3 border border-indigo-200">
              <input
                type="checkbox"
                checked={addToEvent}
                onChange={(e) => setAddToEvent(e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Add these contacts to an event</span>
            </label>

            {addToEvent && (
              <div className="space-y-4 bg-white rounded-lg p-4 border border-indigo-200">
                {/* Event Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                  <select
                    value={selectedEvent || ''}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Choose an event...</option>
                    {availableEvents.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audience Type</label>
                  <select
                    value={selectedAudience}
                    onChange={(e) => setSelectedAudience(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="org_members">Org Members</option>
                    <option value="friends_family">Friends & Family</option>
                    <option value="community_partners">Community Partners</option>
                    <option value="business_sponsor">Business Sponsor</option>
                    <option value="champions">Champions</option>
                  </select>
                </div>

                {/* Stage Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Stage</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {availableStages.map(stage => (
                      <option key={stage} value={stage}>
                        {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/org-members/upload")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {uploading ? "Importing..." : "Import My Contacts"}
          </button>
        </div>

      </div>
    </div>
  );
}
