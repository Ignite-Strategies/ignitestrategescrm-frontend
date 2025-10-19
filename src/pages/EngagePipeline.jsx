import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrgId } from "../lib/org";
import api from "../lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://eventscrm-backend.vercel.app";

export default function EngagePipeline() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const containerId = localStorage.getItem('containerId');
  
  // Pipeline stages (member journey stages)
  const stages = [
    { key: "unaware", label: "Unaware", emoji: "👀", desc: "Never heard of you" },
    { key: "curious", label: "Curious", emoji: "🤔", desc: "Considering participation" },
    { key: "activated", label: "Activated", emoji: "⚡", desc: "Took first action" },
    { key: "engaged", label: "Engaged", emoji: "🔥", desc: "Participating repeatedly" },
    { key: "champion", label: "Champion", emoji: "👑", desc: "Leading & multiplying" },
    { key: "alumni", label: "Alumni", emoji: "💤", desc: "Dormant but connected" }
  ];

  const [contacts, setContacts] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddContacts, setShowAddContacts] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState(new Set());

  useEffect(() => {
    if (orgId && containerId) {
      loadPipelineData();
    }
  }, [orgId, containerId]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading member journey pipeline...');
      
      // For now, use hardcoded data to avoid API issues
      const hardcodedData = [
        {
          stage: "unaware",
          contacts: [
            { contactId: "1", firstName: "John", lastName: "Doe", email: "john@example.com", phone: "555-0101" },
            { contactId: "2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "555-0102" },
            { contactId: "3", firstName: "Bob", lastName: "Johnson", email: "bob@example.com", phone: "555-0103" }
          ]
        },
        {
          stage: "curious",
          contacts: [
            { contactId: "4", firstName: "Alice", lastName: "Brown", email: "alice@example.com", phone: "555-0104" },
            { contactId: "5", firstName: "Charlie", lastName: "Wilson", email: "charlie@example.com", phone: "555-0105" }
          ]
        },
        {
          stage: "activated",
          contacts: [
            { contactId: "6", firstName: "David", lastName: "Lee", email: "david@example.com", phone: "555-0106" },
            { contactId: "7", firstName: "Emma", lastName: "Davis", email: "emma@example.com", phone: "555-0107" },
            { contactId: "8", firstName: "Frank", lastName: "Miller", email: "frank@example.com", phone: "555-0108" }
          ]
        },
        {
          stage: "engaged",
          contacts: [
            { contactId: "9", firstName: "Grace", lastName: "Taylor", email: "grace@example.com", phone: "555-0109" },
            { contactId: "10", firstName: "Henry", lastName: "Anderson", email: "henry@example.com", phone: "555-0110" },
            { contactId: "11", firstName: "Ivy", lastName: "Thomas", email: "ivy@example.com", phone: "555-0111" },
            { contactId: "12", firstName: "Jack", lastName: "Jackson", email: "jack@example.com", phone: "555-0112" }
          ]
        },
        {
          stage: "champion",
          contacts: [
            { contactId: "13", firstName: "Kate", lastName: "White", email: "kate@example.com", phone: "555-0113" },
            { contactId: "14", firstName: "Liam", lastName: "Harris", email: "liam@example.com", phone: "555-0114" }
          ]
        },
        {
          stage: "alumni",
          contacts: [
            { contactId: "15", firstName: "Maya", lastName: "Martin", email: "maya@example.com", phone: "555-0115" }
          ]
        }
      ];

      setPipelineData(hardcodedData);
      
      // Flatten all contacts for the "Add Contacts" modal
      const allContacts = hardcodedData.flatMap(stage => stage.contacts);
      setContacts(allContacts);
      
    } catch (error) {
      console.error('❌ Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContactsForStage = (stage) => {
    const stageData = pipelineData.find(item => item.stage === stage);
    return stageData ? stageData.contacts : [];
  };

  const getLogicalNextStages = (currentStage) => {
    const currentIndex = stages.findIndex(stage => stage.key === currentStage);
    if (currentIndex === -1) return [];
    
    // Return all stages that come after the current stage
    return stages.slice(currentIndex + 1);
  };

  const handleStageChange = async (contactId, newStage) => {
    try {
      console.log(`Moving contact ${contactId} to stage ${newStage}`);
      
      // Update the local state immediately for better UX
      setPipelineData(prevData => {
        const newData = [...prevData];
        
        // Remove contact from current stage
        newData.forEach(stage => {
          stage.contacts = stage.contacts.filter(contact => contact.contactId !== contactId);
        });
        
        // Add contact to new stage
        const targetStage = newData.find(stage => stage.stage === newStage);
        if (targetStage) {
          // Find the contact to move
          const contactToMove = contacts.find(c => c.contactId === contactId);
          if (contactToMove) {
            targetStage.contacts.push(contactToMove);
          }
        }
        
        return newData;
      });
      
      // TODO: Make API call to update backend
      // await api.put(`/contacts/${contactId}/stage`, { stage: newStage, orgId, containerId });
      
    } catch (error) {
      console.error('Error updating contact stage:', error);
    }
  };

  const handleAddContacts = () => {
    if (selectedContacts.size === 0) {
      alert("Please select contacts to add to the pipeline!");
      return;
    }
    
    console.log('Adding contacts to pipeline:', Array.from(selectedContacts));
    
    // Reset selection and close modal
    setSelectedContacts(new Set());
    setShowAddContacts(false);
    
    // TODO: Implement adding contacts to pipeline
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading member pipeline...</p>
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
              <button
                onClick={() => navigate('/engage')}
                className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Engage Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Member Journey Pipeline</h1>
              <p className="text-gray-600 mt-2">Track and move your members through their engagement journey</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddContacts(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Members
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline Stages - HubSpot Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stages.map((stage) => {
            const stageContacts = getContactsForStage(stage.key);
            return (
              <div key={stage.key} className="bg-white rounded-lg shadow-sm border">
                {/* Stage Header */}
                <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{stage.emoji}</span>
                    <h3 className="font-semibold text-gray-900">
                      {stage.label}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {stageContacts.length} members
                  </p>
                  <p className="text-xs text-gray-400">
                    {stage.desc}
                  </p>
                </div>

                {/* Contacts */}
                <div className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
                  {stageContacts.length > 0 ? (
                    <div className="space-y-3">
                      {stageContacts.map((contact) => (
                        <div key={contact.contactId} className="bg-gray-50 p-3 rounded border hover:shadow-sm transition-shadow">
                          <div className="font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contact.email}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {contact.phone}
                          </div>
                          
                          {/* Forward Arrow - Move to Next Stage */}
                          {getLogicalNextStages(stage.key).length > 0 && (
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  const nextStage = getLogicalNextStages(stage.key)[0];
                                  handleStageChange(contact.contactId, nextStage);
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
                      <div className="text-4xl mb-2">{stage.emoji}</div>
                      <p className="text-sm">No members in this stage</p>
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
              <h3 className="text-lg font-semibold mb-4">Add Members to Pipeline</h3>
              
              {/* Contact Selection */}
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {contacts.map((contact) => (
                  <label key={contact.contactId} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.contactId)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedContacts);
                        if (e.target.checked) {
                          newSelected.add(contact.contactId);
                        } else {
                          newSelected.delete(contact.contactId);
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