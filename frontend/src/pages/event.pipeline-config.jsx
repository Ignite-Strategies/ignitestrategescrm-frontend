import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function EventPipelineConfig() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [pipelines, setPipelines] = useState(["sop_entry", "rsvp", "paid", "attended", "champion"]);
  const [rules, setRules] = useState({
    autoSopOnIntake: true,
    sopTriggers: ["landing_form", "csv"],
    rsvpTriggers: ["form_rsvp"],
    paidTriggers: ["stripe_webhook"],
    championCriteria: {
      minEngagement: 3,
      tagsAny: ["role:ao_q", "shared_media"],
      manualOverrideAllowed: true
    }
  });

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
      
      if (response.data.pipelines) {
        setPipelines(response.data.pipelines);
      }
      if (response.data.pipelineRules) {
        setRules(response.data.pipelineRules);
      }
    } catch (error) {
      console.error("Error loading event:", error);
    }
  };

  const handleSave = async () => {
    try {
      await api.patch(`/events/${eventId}`, {
        pipelines,
        pipelineRules: rules
      });
      
      alert("Pipeline configuration saved!");
      navigate(`/event/${eventId}/pipelines`);
    } catch (error) {
      alert("Error saving config: " + error.message);
    }
  };

  const toggleTrigger = (type, trigger) => {
    setRules(prev => {
      const triggers = prev[type] || [];
      const newTriggers = triggers.includes(trigger)
        ? triggers.filter(t => t !== trigger)
        : [...triggers, trigger];
      return { ...prev, [type]: newTriggers };
    });
  };

  const toggleChampionTag = (tag) => {
    setRules(prev => {
      const tags = prev.championCriteria?.tagsAny || [];
      const newTags = tags.includes(tag)
        ? tags.filter(t => t !== tag)
        : [...tags, tag];
      return {
        ...prev,
        championCriteria: { ...prev.championCriteria, tagsAny: newTags }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configure Pipeline</h1>
          <p className="text-gray-600 mt-1">Set up automation rules for {event?.name}</p>
        </div>

        <div className="space-y-6">
          {/* Stages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pipeline Stages</h2>
            <div className="flex flex-wrap gap-2">
              {pipelines.map((stage) => (
                <span
                  key={stage}
                  className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-medium"
                >
                  {stage}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              These are your default stages. Contacts will flow through these as they engage.
            </p>
          </div>

          {/* Auto Rules */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Auto Rules</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={rules.autoSopOnIntake}
                    onChange={(e) => setRules({ ...rules, autoSopOnIntake: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="font-medium text-gray-700">Auto-mark SOP Entry on intake</span>
                </label>
                
                <p className="text-sm text-gray-600 mb-2">Mark new contacts as "SOP Entry" when source is:</p>
                <div className="flex flex-wrap gap-2">
                  {["landing_form", "csv", "qr", "admin_add"].map(trigger => (
                    <label key={trigger} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rules.sopTriggers?.includes(trigger)}
                        onChange={() => toggleTrigger("sopTriggers", trigger)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{trigger}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Advance to RSVP when:</p>
                <div className="flex flex-wrap gap-2">
                  {["form_rsvp", "button_click"].map(trigger => (
                    <label key={trigger} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rules.rsvpTriggers?.includes(trigger)}
                        onChange={() => toggleTrigger("rsvpTriggers", trigger)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{trigger}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    ℹ️ Contacts automatically advance to "Paid" when Stripe webhook confirms payment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Champion Logic */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Champion Logic</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Engagement Score: {rules.championCriteria?.minEngagement || 3}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={rules.championCriteria?.minEngagement || 3}
                  onChange={(e) => setRules({
                    ...rules,
                    championCriteria: {
                      ...rules.championCriteria,
                      minEngagement: parseInt(e.target.value)
                    }
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Tags that qualify as Champion:</p>
                <div className="flex flex-wrap gap-2">
                  {["role:ao_q", "role:influencer", "shared_media", "referred_5+"].map(tag => (
                    <label key={tag} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rules.championCriteria?.tagsAny?.includes(tag)}
                        onChange={() => toggleChampionTag(tag)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rules.championCriteria?.manualOverrideAllowed}
                    onChange={(e) => setRules({
                      ...rules,
                      championCriteria: {
                        ...rules.championCriteria,
                        manualOverrideAllowed: e.target.checked
                      }
                    })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Allow manual mark as Champion</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Save & Continue
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

