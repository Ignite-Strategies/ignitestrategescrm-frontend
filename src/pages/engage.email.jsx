import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function EngageEmail() {
  const { orgId } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedTags, setSelectedTags] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadEvents();
  }, [orgId]);

  const loadEvents = async () => {
    try {
      const response = await api.get(`/orgs/${orgId}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadRecipients = async () => {
    if (!selectedEvent) return;

    try {
      let url = `/events/${selectedEvent}/memberships`;
      const params = new URLSearchParams();
      
      if (selectedStage) params.append("stage", selectedStage);
      if (params.toString()) url += `?${params}`;

      const response = await api.get(url);
      setRecipients(response.data);
    } catch (error) {
      console.error("Error loading recipients:", error);
    }
  };

  useEffect(() => {
    loadRecipients();
  }, [selectedEvent, selectedStage]);

  const handleSend = async () => {
    if (!subject || !message) {
      alert("Please fill in subject and message");
      return;
    }

    if (recipients.length === 0) {
      alert("No recipients selected");
      return;
    }

    // This is a placeholder - in production, integrate with SendGrid/Mailgun
    console.log("Sending email to:", recipients.length, "recipients");
    console.log("Subject:", subject);
    console.log("Message:", message);

    alert(`Email campaign queued for ${recipients.length} recipients!\n(In production, this would integrate with SendGrid/Mailgun)`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Campaign</h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Filters */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Audience</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event
                  </label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select event...</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pipeline Stage
                  </label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={!selectedEvent}
                  >
                    <option value="">All stages</option>
                    <option value="sop_entry">SOP Entry</option>
                    <option value="rsvp">RSVP</option>
                    <option value="paid">Paid</option>
                    <option value="attended">Attended</option>
                    <option value="champion">Champion</option>
                  </select>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Recipients: <span className="text-indigo-600">{recipients.length}</span>
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {recipients.map((r) => (
                      <div key={r._id} className="text-xs text-gray-600">
                        {r.contactId?.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compose */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Compose Email</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="You're invited to Bros & Brews 2025!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows="12"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Hey there!&#10;&#10;We're excited to invite you to our upcoming event...&#10;&#10;Best,&#10;The Team"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSend}
                    disabled={recipients.length === 0}
                    className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send to {recipients.length} Recipients
                  </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-900">
                    💡 In production, this integrates with SendGrid or Mailgun for email delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

