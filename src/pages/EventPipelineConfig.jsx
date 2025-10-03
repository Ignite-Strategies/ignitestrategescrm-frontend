import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

// MVP1: Focus on F3 Members only
const SUGGESTED_PIPELINES = [
  {
    id: "org_member",
    name: "F3 Members",
    description: "Your core F3 brothers - highest conversion rate",
    conversionRate: "25%",
    color: "green",
    suggested: true,
    mvp1: true
  }
  // Future audience types (MVP2+):
  // {
  //   id: "friend_spouse", 
  //   name: "Friends & Spouses",
  //   description: "Friends, family, and spouses of F3 members",
  //   conversionRate: "15%",
  //   color: "blue",
  //   suggested: true
  // },
  // {
  //   id: "community_partner",
  //   name: "Community Partners", 
  //   description: "Local businesses and community connections",
  //   conversionRate: "10%",
  //   color: "purple",
  //   suggested: true
  // }
];

export default function EventPipelineConfig() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [event, setEvent] = useState(null);
  const [selectedPipelines, setSelectedPipelines] = useState(new Set(["org_member"]));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
      
      // Load existing pipeline config if any
      if (response.data.pipelines && response.data.pipelines.length > 0) {
        setSelectedPipelines(new Set(response.data.pipelines));
      }
    } catch (error) {
      console.error("Error loading event:", error);
    }
  };

  const togglePipeline = (pipelineId) => {
    setSelectedPipelines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pipelineId)) {
        newSet.delete(pipelineId);
      } else {
        newSet.add(pipelineId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (selectedPipelines.size === 0) {
      alert("Please select at least one pipeline!");
      return;
    }

    setLoading(true);
    try {
      // Save pipeline configuration to event
      await api.patch(`/events/${eventId}`, {
        pipelines: Array.from(selectedPipelines)
      });
      
      // Create pipeline collections for each selected audience type
      const pipelineArray = Array.from(selectedPipelines);
      const result = await api.post(`/events/${eventId}/pipelines/create`, {
        orgId,
        audienceTypes: pipelineArray
      });
      
      alert(`Pipeline configuration saved! Created ${pipelineArray.length} audience pipelines.`);
      navigate(`/event/${eventId}/pipelines`);
    } catch (error) {
      alert("Error saving config: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      green: "bg-green-50 border-green-200 text-green-800",
      blue: "bg-blue-50 border-blue-200 text-blue-800", 
      purple: "bg-purple-50 border-purple-200 text-purple-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800",
      red: "bg-red-50 border-red-200 text-red-800"
    };
    return colors[color] || "bg-gray-50 border-gray-200 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your F3 Member Pipeline</h1>
            <p className="text-gray-600">Start with your core F3 brothers for {event?.name}</p>
            <div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <p className="text-sm text-blue-800">
                <strong>MVP1:</strong> Focus on F3 Members first. Additional audience types coming in MVP2!
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {SUGGESTED_PIPELINES.map((pipeline) => (
              <div
                key={pipeline.id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPipelines.has(pipeline.id)
                    ? `${getColorClasses(pipeline.color)} border-opacity-100`
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => togglePipeline(pipeline.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedPipelines.has(pipeline.id)}
                      onChange={() => togglePipeline(pipeline.id)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{pipeline.name}</h3>
                        {pipeline.suggested && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                            Suggested
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{pipeline.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{pipeline.conversionRate}</div>
                    <div className="text-xs text-gray-500">conversion rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Pipeline Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Selected Pipelines:</span>
                <div className="font-semibold text-gray-900">{selectedPipelines.size}</div>
              </div>
              <div>
                <span className="text-gray-600">Audience Types:</span>
                <div className="font-semibold text-gray-900">
                  {Array.from(selectedPipelines).map(id => 
                    SUGGESTED_PIPELINES.find(p => p.id === id)?.name
                  ).join(", ")}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Stages per Pipeline:</span>
                <div className="font-semibold text-gray-900">Member → Soft Commit → Paid</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading || selectedPipelines.size === 0}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Pipelines..." : `Create ${selectedPipelines.size} Pipelines →`}
            </button>
            <button
              onClick={() => navigate(`/event/${eventId}/pipelines`)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Skip to Kanban
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

