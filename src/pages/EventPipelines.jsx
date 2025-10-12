import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function EventPipelines() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [pipelineData, setPipelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading pipeline for event:', eventId);
      
      const [eventRes, pipelineRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/events/${eventId}/pipeline?audienceType=org_members`)
      ]);
      
      console.log('✅ Event data:', eventRes.data);
      console.log('✅ Pipeline data:', pipelineRes.data);
      
      setEvent(eventRes.data);
      setPipelineData(pipelineRes.data);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">{event?.name}</h1>
          <p className="text-gray-600 mt-2">{event?.description}</p>
        </div>

        {/* Pipeline Stages */}
        <div className="grid grid-cols-4 gap-6">
          {pipelineData.map((stage) => (
            <div key={stage.stage} className="bg-white rounded-lg shadow-sm border">
              {/* Stage Header */}
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {stage.stage.replace('_', ' ')}
                </h3>
                <p className="text-sm text-gray-500">
                  {stage.count} contacts
                </p>
              </div>

              {/* Contacts */}
              <div className="p-4">
                {stage.contacts && stage.contacts.length > 0 ? (
                  <div className="space-y-3">
                    {stage.contacts.map((contact) => (
                      <div key={contact._id} className="bg-gray-50 p-3 rounded border">
                        <div className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {contact.email}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {contact.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No contacts
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(pipelineData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}