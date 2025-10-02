import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function EventPipelines() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [stages, setStages] = useState([]);
  const [showChampionsOnly, setShowChampionsOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      const [eventRes, membershipsRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/memberships`)
      ]);
      
      setEvent(eventRes.data);
      setMemberships(membershipsRes.data);
      setStages(eventRes.data.pipelines || ["sop_entry", "rsvp", "paid", "attended", "champion"]);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleDragStart = (e, membershipId) => {
    e.dataTransfer.setData("membershipId", membershipId);
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    const membershipId = e.dataTransfer.getData("membershipId");
    
    try {
      await api.patch(`/memberships/${membershipId}`, { stage: newStage });
      loadData(); // Reload to show updated position
    } catch (error) {
      alert("Error moving contact: " + error.message);
    }
  };

  const handleMarkChampion = async (membershipId) => {
    try {
      await api.post(`/memberships/${membershipId}/champion`, {
        note: "manual_mark"
      });
      loadData();
    } catch (error) {
      alert("Error marking champion: " + error.message);
    }
  };

  const getMembershipsForStage = (stage) => {
    let filtered = memberships.filter(m => m.stage === stage);
    if (showChampionsOnly) {
      filtered = filtered.filter(m => m.champion);
    }
    return filtered;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event?.name || "Event Pipeline"}</h1>
              <p className="text-gray-600 mt-1">Drag contacts between stages</p>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={showChampionsOnly}
                  onChange={(e) => setShowChampionsOnly(e.target.checked)}
                  className="w-4 h-4 text-yellow-600 rounded"
                />
                <span className="text-sm font-medium text-yellow-900">⭐ Champions Only</span>
              </label>
              <button
                onClick={() => navigate(`/event/${eventId}/pipeline-config`)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage) => (
            <div
              key={stage}
              className="bg-gray-100 rounded-lg p-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {stage.replace(/_/g, " ")}
                </h3>
                <span className="text-sm text-gray-600">
                  {getMembershipsForStage(stage).length}
                </span>
              </div>

              <div className="space-y-2">
                {getMembershipsForStage(stage).map((membership) => (
                  <div
                    key={membership._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, membership._id)}
                    className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-move border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 text-sm">
                        {membership.contactId?.name || "Unknown"}
                      </div>
                      {membership.champion && (
                        <span className="text-yellow-500 text-sm">⭐</span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      {membership.contactId?.email}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {membership.rsvp && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          RSVP
                        </span>
                      )}
                      {membership.paid && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          ${membership.amount}
                        </span>
                      )}
                    </div>

                    {!membership.champion && event?.pipelineRules?.championCriteria?.manualOverrideAllowed && (
                      <button
                        onClick={() => handleMarkChampion(membership._id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark Champion
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {getMembershipsForStage(stage).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Drop here
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

