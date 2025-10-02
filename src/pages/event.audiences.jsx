import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function EventAudiences() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [org, setOrg] = useState(null);
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [contacts, setContacts] = useState([]);

  const defaultAudiences = [
    "org_members",
    "friends_family",
    "community_partners",
    "local_businesses",
    "general_public"
  ];

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      const eventRes = await api.get(`/events/${eventId}`);
      setEvent(eventRes.data);
      
      const orgRes = await api.get(`/orgs/${eventRes.data.orgId}`);
      setOrg(orgRes.data);

      const contactsRes = await api.get(`/orgs/${eventRes.data.orgId}/contacts`);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const toggleAudience = (audience) => {
    setSelectedAudiences(prev =>
      prev.includes(audience)
        ? prev.filter(a => a !== audience)
        : [...prev, audience]
    );
  };

  const handleApply = async () => {
    if (selectedAudiences.length === 0) {
      alert("Please select at least one audience");
      return;
    }

    try {
      // For "org_members", add all contacts to the event
      if (selectedAudiences.includes("org_members")) {
        const contactIds = contacts.map(c => c._id);
        
        if (contactIds.length > 0) {
          await api.post(`/events/${eventId}/memberships`, {
            contactIds,
            source: "audience_selection",
            stage: "sop_entry"
          });
        }
      }

      alert(`Applied ${selectedAudiences.length} audience(s) to event`);
      navigate(`/event/${eventId}/pipelines`);
    } catch (error) {
      alert("Error applying audiences: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Define Audiences</h1>
          <p className="text-gray-600 mt-1">Choose who to target for {event?.name}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Target Audiences</h2>
          
          <div className="space-y-3">
            {defaultAudiences.map((audience) => (
              <label
                key={audience}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedAudiences.includes(audience)
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAudiences.includes(audience)}
                  onChange={() => toggleAudience(audience)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 capitalize">
                    {audience.replace(/_/g, " ")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {audience === "org_members" && `All ${contacts.length} contacts in your master CRM`}
                    {audience === "friends_family" && "Close personal network"}
                    {audience === "community_partners" && "Local organizations and partners"}
                    {audience === "local_businesses" && "Business sponsors and vendors"}
                    {audience === "general_public" && "Open public audience"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedAudiences.includes("org_members") && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900 font-medium">
              ℹ️ Selected "Org Members" - all {contacts.length} contacts will be added to this event's pipeline
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleApply}
            disabled={selectedAudiences.length === 0}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Audiences
          </button>
          <button
            onClick={() => navigate(`/event/${eventId}/pipelines`)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

