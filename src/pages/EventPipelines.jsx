import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

const PIPELINES = [
  { id: "org_member", label: "Org Member" },
  { id: "friend_spouse", label: "Friend/Spouse" },
  { id: "community_partner", label: "Community Partner" },
  { id: "business_sponsor", label: "Business Sponsor" },
  { id: "champion", label: "Champion" }
];

// MVP1: Hardcoded stages (not editable like HubSpot)
const STAGES = [
  { id: "member", label: "Prospective Attendee", description: "New supporters added to event" },
  { id: "soft_commit", label: "Soft Commit", description: "Showed interest/RSVP" },
  { id: "paid", label: "Paid", description: "Payment confirmed" },
  { id: "lost", label: "Can't Make It", description: "Deal lost - won't attend" }
];

export default function EventPipelines() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [event, setEvent] = useState(null);
  const [registryData, setRegistryData] = useState([]); // New registry format
  const [supporters, setSupporters] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState("org_member");
  const [showAddSupporters, setShowAddSupporters] = useState(false);
  const [selectedSupporters, setSelectedSupporters] = useState(new Set());

  useEffect(() => {
    loadData();
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [selectedPipeline]);

  const loadData = async () => {
    try {
      const [eventRes, registryRes, supportersRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/pipeline?audienceType=${selectedPipeline}`),
        api.get(`/orgs/${orgId}/supporters`)
      ]);
      
      setEvent(eventRes.data);
      setRegistryData(registryRes.data); // New registry format
      setSupporters(supportersRes.data);
      
      console.log('📋 FRONTEND: Loaded registry data:', registryRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleStageUpdate = async (supporterId, fromStage, toStage) => {
    try {
      console.log('🔄 FRONTEND: Moving supporter', supporterId, 'from', fromStage, 'to', toStage);
      await api.patch(`/events/${eventId}/pipeline/move`, {
        supporterId,
        fromStage,
        toStage,
        audienceType: selectedPipeline
      });
      loadData();
    } catch (error) {
      console.error('❌ FRONTEND: Error moving supporter:', error);
      alert("Error moving contact: " + error.message);
    }
  };

  const handlePushSupporters = async () => {
    if (selectedSupporters.size === 0) {
      alert("Please select supporters to add to the pipeline!");
      return;
    }

    try {
      const result = await api.post(`/events/${eventId}/pipeline/push`, {
        orgId,
        supporterIds: Array.from(selectedSupporters),
        audienceType: selectedPipeline,
        stage: "member",
        source: "admin_add"
      });
      
      // Show success message inline instead of popup
      console.log(`✅ Successfully added ${result.data.success.length} supporters to pipeline!`);
      setSelectedSupporters(new Set());
      setShowAddSupporters(false);
      loadData();
    } catch (error) {
      alert("Error adding supporters: " + error.message);
    }
  };

  const handlePushAllSupporters = async () => {
    if (supporters.length === 0) {
      alert("No supporters available to add!");
      return;
    }

    if (!confirm(`Add all ${supporters.length} supporters to the pipeline?`)) {
      return;
    }

    try {
      const result = await api.post(`/events/${eventId}/pipeline/push-all`, {
        orgId,
        audienceType: selectedPipeline,
        stage: "member",
        source: "bulk_add"
      });
      
      // Show success message inline instead of popup
      console.log(`✅ Successfully added ${result.data.success.length} supporters to pipeline!`);
      setShowAddSupporters(false);
      loadData();
    } catch (error) {
      alert("Error adding all supporters: " + error.message);
    }
  };

  const handleSelectAll = () => {
    if (selectedSupporters.size === supporters.length) {
      // Deselect all
      setSelectedSupporters(new Set());
    } else {
      // Select all
      setSelectedSupporters(new Set(supporters.map(s => s._id)));
    }
  };

  const getSupportersForStage = (stage) => {
    const stageData = registryData.find(stageData => stageData.stage === stage);
    return stageData ? stageData.supporters : [];
  };

  const getPipelineCounts = () => {
    return PIPELINES.map(pipeline => ({
      ...pipeline,
      count: pipeline.id === selectedPipeline ? 
        registryData.reduce((total, stage) => total + stage.count, 0) : 0
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event?.name || "Event Pipeline"}</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your F3 Member pipeline</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddSupporters(!showAddSupporters)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                + Add Supporters
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                ← Dashboard
              </button>
            </div>
          </div>

          {/* Pipeline Selector */}
          <div className="flex gap-2">
            {getPipelineCounts().map((pipeline) => (
              <button
                key={pipeline.id}
                onClick={() => setSelectedPipeline(pipeline.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedPipeline === pipeline.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {pipeline.label} ({pipeline.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Supporters Modal */}
      {showAddSupporters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Supporters to Pipeline</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  {selectedSupporters.size === supporters.length ? "Deselect All" : "Select All"}
                </button>
                <button
                  onClick={handlePushAllSupporters}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                >
                  Add All ({supporters.length})
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {supporters.map((supporter) => (
                <label key={supporter._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedSupporters.has(supporter._id)}
                    onChange={() => {
                      const newSet = new Set(selectedSupporters);
                      if (newSet.has(supporter._id)) {
                        newSet.delete(supporter._id);
                      } else {
                        newSet.add(supporter._id);
                      }
                      setSelectedSupporters(newSet);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">
                    {supporter.firstName} {supporter.lastName} ({supporter.email})
                  </span>
                </label>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handlePushSupporters}
                disabled={selectedSupporters.size === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {selectedSupporters.size} Selected
              </button>
              <button
                onClick={() => setShowAddSupporters(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

              {/* HubSpot-style Stages */}
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-4 gap-6">
                  {STAGES.map((stage, index) => {
                    const stageSupporters = getSupportersForStage(stage.id);
                    
                    return (
                      <div key={stage.id} className="flex flex-col">
                        {/* Stage Header */}
                        <div className="bg-white rounded-t-lg border border-gray-200 px-4 py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                              <p className="text-xs text-gray-500">{stage.description}</p>
                            </div>
                            <span className="text-sm text-gray-500 font-medium">
                              {stageSupporters.length}
                            </span>
                          </div>
                        </div>

                        {/* Stage Column */}
                        <div className="flex-1 bg-gray-50 rounded-b-lg border-x border-b border-gray-200 p-4 min-h-[600px]">
                          <div className="space-y-3">
                            {stageSupporters.map((supporter) => (
                              <div
                                key={supporter._id}
                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                              >
                                <button
                                  onClick={() => navigate(`/contact/${supporter._id}`)}
                                  className="font-medium text-indigo-600 hover:text-indigo-800 mb-1 text-left w-full"
                                >
                                  {supporter.firstName} {supporter.lastName}
                                </button>
                                <div className="text-xs text-gray-600 mb-2">
                                  {supporter.email}
                                </div>
                                
                                {/* Status Badges */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {supporter.categoryOfEngagement && (
                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                      supporter.categoryOfEngagement === 'high' ? 'bg-green-100 text-green-700' :
                                      supporter.categoryOfEngagement === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      supporter.categoryOfEngagement === 'low' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {supporter.categoryOfEngagement}
                                    </span>
                                  )}
                                </div>

                                {/* Stage Progression Buttons */}
                                <div className="flex gap-1">
                                  {index > 0 && (
                                    <button
                                      onClick={() => handleStageUpdate(supporter._id, stage.id, STAGES[index - 1].id)}
                                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                                    >
                                      ← {STAGES[index - 1].label}
                                    </button>
                                  )}
                                  {index < STAGES.length - 1 && (
                                    <button
                                      onClick={() => handleStageUpdate(supporter._id, stage.id, STAGES[index + 1].id)}
                                      className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                                    >
                                      {STAGES[index + 1].label} →
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {stageSupporters.length === 0 && (
                            <div className="text-center py-12 text-gray-400 text-sm">
                              No contacts in this stage
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
    </div>
  );
}
