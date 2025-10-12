import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function EventPipelines() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState('org_members');
  const [showAddContacts, setShowAddContacts] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [availableStages, setAvailableStages] = useState([]);
  const [availableAudiences, setAvailableAudiences] = useState([]);
  const [pipelineConfigs, setPipelineConfigs] = useState([]);
  const [registryData, setRegistryData] = useState([]);

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId, selectedPipeline]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to load cached configs from localStorage first
      const cachedConfigs = localStorage.getItem('pipelineConfigs');
      let configs;
      
      if (cachedConfigs) {
        configs = JSON.parse(cachedConfigs);
        console.log('✅ USING CACHED PIPELINE CONFIGS:', configs);
      } else {
        // Load pipeline configs from DATABASE (only if not cached)
        const configRes = await api.get('/pipeline-config');
        configs = configRes.data;
        
        console.log('✅ LOADED PIPELINE CONFIGS FROM DATABASE:', configs);
        
        // Cache for future use
        localStorage.setItem('pipelineConfigs', JSON.stringify(configs));
      }
      
      setPipelineConfigs(configs);
      
      // Extract audiences (in order from API)
      const audiences = configs.map(c => c.audienceType);
      setAvailableAudiences(audiences);
      
      // Get stages for current selected pipeline
      const currentConfig = configs.find(c => c.audienceType === selectedPipeline);
      const stagesToUse = currentConfig ? currentConfig.stages : [];
      
      console.log('✅ STAGES for', selectedPipeline, ':', stagesToUse);
      
      setAvailableStages(stagesToUse);
      
      // Load event data
      const eventRes = await api.get(`/events/${eventId}`);
      setEvent(eventRes.data);
      
      console.log('🔍 EVENT DATA:', eventRes.data);
      
      // Load pipeline data (attendees)
      const pipelineRes = await api.get(`/events/${eventId}/pipeline?audienceType=${selectedPipeline}`);
      setRegistryData(pipelineRes.data);
      
      console.log('📊 PIPELINE DATA:', pipelineRes.data);
      
      // Extract all contacts from pipeline data
      const allContacts = pipelineRes.data.flatMap(stage => stage.contacts || []);
      setContacts(allContacts);
      
      // Save to localStorage for caching
      localStorage.setItem(`event_${eventId}_config`, JSON.stringify({
        eventId,
        pipelines: stagesToUse,
        audienceTypes: audiences,
        selectedAudience: selectedPipeline
      }));
      localStorage.setItem(`event_${eventId}_pipeline_${selectedPipeline}`, JSON.stringify(pipelineRes.data));
      localStorage.setItem(`event_${eventId}_data`, JSON.stringify(eventRes.data));
      
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContactsForStage = (stage) => {
    const stageData = registryData.find(item => item.stage === stage);
    return stageData ? stageData.contacts : [];
  };

  const getLogicalNextStages = (currentStage) => {
    // Use actual event pipeline stages instead of hardcoded progression
    if (!availableStages || availableStages.length === 0) {
      return [];
    }

    const currentIndex = availableStages.indexOf(currentStage);
    if (currentIndex === -1) {
      return [];
    }

    // Return all stages that come after the current stage
    return availableStages.slice(currentIndex + 1);
  };

  const handleStageChange = async (contactId, newStage) => {
    try {
      // Update contact stage in backend
      await api.put(`/contacts/${contactId}/stage`, {
        stage: newStage,
        eventId: eventId,
        audienceType: selectedPipeline
      });
      
      // Reload data to reflect changes
      loadData();
    } catch (error) {
      console.error('Error updating contact stage:', error);
    }
  };

  const handleAddContacts = () => {
    if (selectedContacts.size === 0) {
      alert("Please select contacts to add to the pipeline!");
      return;
    }
    
    // Add selected contacts to the pipeline
    const contactsToAdd = Array.from(selectedContacts);
    // Implementation for adding contacts to pipeline
    console.log('Adding contacts to pipeline:', contactsToAdd);
    
    // Reset selection and close modal
    setSelectedContacts(new Set());
    setShowAddContacts(false);
    
    // Reload data
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event?.name}</h1>
              <p className="text-gray-600 mt-2">{event?.description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddContacts(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Contacts
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {availableAudiences.map((pipeline) => (
              <button
                key={pipeline}
                onClick={() => setSelectedPipeline(pipeline)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPipeline === pipeline
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                {pipeline.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableStages.map((stage) => {
            const stageContacts = getContactsForStage(stage);
            return (
              <div key={stage} className="bg-white rounded-lg shadow-sm border">
                {/* Stage Header */}
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {stage.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {stageContacts.length} contacts
                  </p>
                </div>

                {/* Contacts */}
                <div className="p-4 min-h-[200px]">
                  {stageContacts.length > 0 ? (
                    <div className="space-y-3">
                      {stageContacts.map((contact) => (
                        <div key={contact.contactId || contact._id} className="bg-gray-50 p-3 rounded border">
                          <div className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contact.email}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {contact.phone}
                          </div>
                          
                          {/* Single Forward Arrow - Move to Next Stage */}
                          {getLogicalNextStages(stage).length > 0 && (
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  const nextStage = getLogicalNextStages(stage)[0]; // Get first next stage
                                  handleStageChange(contact.contactId || contact._id, nextStage);
                                }}
                                className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded font-medium hover:bg-indigo-200 transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Next Stage
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No contacts in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Contacts Modal */}
        {showAddContacts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Add Contacts to Pipeline</h3>
              
              {/* Contact Selection */}
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {contacts.map((contact) => (
                  <label key={contact.contactId || contact._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.contactId || contact._id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedContacts);
                        if (e.target.checked) {
                          newSelected.add(contact.contactId || contact._id);
                        } else {
                          newSelected.delete(contact.contactId || contact._id);
                        }
                        setSelectedContacts(newSelected);
                      }}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddContacts(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContacts}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Add Selected ({selectedContacts.size})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}