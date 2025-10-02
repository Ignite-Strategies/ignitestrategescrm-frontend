import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

const PIPELINES = [
  { id: "org_member", label: "Org Member" },
  { id: "friend_spouse", label: "Friend/Spouse" },
  { id: "community_partner", label: "Community Partner" },
  { id: "business_sponsor", label: "Business Sponsor" },
  { id: "champion", label: "Champion" }
];

const STAGES = [
  { id: "member", label: "Member" },
  { id: "soft_commit", label: "Soft Commit" },
  { id: "paid", label: "Paid" }
];

export default function EventPipelines() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState("org_member");

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      const [eventRes, attendeesRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/attendees`)
      ]);
      
      setEvent(eventRes.data);
      setAttendees(attendeesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleDragStart = (e, attendeeId) => {
    e.dataTransfer.setData("attendeeId", attendeeId);
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    const attendeeId = e.dataTransfer.getData("attendeeId");
    
    try {
      await api.patch(`/attendees/${attendeeId}`, { stage: newStage });
      loadData();
    } catch (error) {
      alert("Error moving attendee: " + error.message);
    }
  };

  const getAttendeesForStage = (stage) => {
    return attendees.filter(a => 
      a.audienceType === selectedPipeline && 
      a.stage === stage
    );
  };

  const getPipelineCounts = () => {
    return PIPELINES.map(pipeline => ({
      ...pipeline,
      count: attendees.filter(a => a.audienceType === pipeline.id).length
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
              <p className="text-gray-600 text-sm mt-1">Drag attendees between stages</p>
            </div>
            <button
              onClick={() => navigate(`/event/${eventId}/pipeline-config`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Configure
            </button>
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

      {/* HubSpot-style Stages */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {STAGES.map((stage) => {
            const stageAttendees = getAttendeesForStage(stage.id);
            
            return (
              <div key={stage.id} className="flex flex-col">
                {/* Stage Header */}
                <div className="bg-white rounded-t-lg border border-gray-200 px-4 py-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                    <span className="text-sm text-gray-500 font-medium">
                      {stageAttendees.length}
                    </span>
                  </div>
                </div>

                {/* Stage Column */}
                <div
                  className="flex-1 bg-gray-50 rounded-b-lg border-x border-b border-gray-200 p-4 min-h-[600px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="space-y-3">
                    {stageAttendees.map((attendee) => (
                      <div
                        key={attendee._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, attendee._id)}
                        className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-move border border-gray-200 hover:border-indigo-300"
                      >
                        <div className="font-medium text-gray-900 mb-1">
                          {attendee.name}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {attendee.email}
                        </div>
                        
                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-1">
                          {attendee.rsvp && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              RSVP
                            </span>
                          )}
                          {attendee.paid && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                              ${attendee.amount}
                            </span>
                          )}
                          {attendee.source && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              {attendee.source}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {stageAttendees.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      Drag attendees here
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
