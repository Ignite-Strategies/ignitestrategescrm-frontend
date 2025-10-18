import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getOrgId } from "../lib/org";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://eventscrm-backend.vercel.app";

export default function PersonaBuilder() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [personas, setPersonas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    personaName: "",
    demographics: "",
    painPoint: "",
    desire: "",
    motivators: "",
    barriers: "",
    tone: "",
    channels: "",
    primaryStage: "curious",
    notes: ""
  });

  const journeyStages = [
    { value: "unaware", label: "👀 Unaware", desc: "Discovery" },
    { value: "curious", label: "🤔 Curious", desc: "Interest" },
    { value: "activated", label: "⚡ Activated", desc: "Action" },
    { value: "engaged", label: "🔥 Engaged", desc: "Connection" },
    { value: "champion", label: "👑 Champion", desc: "Ownership" },
    { value: "alumni", label: "💤 Alumni", desc: "Legacy" }
  ];

  const examplePersonas = [
    {
      personaName: "Disconnected Dad",
      demographics: "Men 30-50, Arlington VA, married with kids",
      painPoint: "Feels isolated, lacks accountability, losing touch with himself",
      desire: "Wants community, purpose, structure, and to set an example for his kids",
      motivators: "Challenge, brotherhood, shared purpose, being a leader",
      barriers: "Time constraints, ego, not knowing where to start, fear of judgment",
      tone: "Masculine, authentic, no-BS, encouraging but direct",
      channels: "Google Search, Facebook, YouTube",
      primaryStage: "curious"
    },
    {
      personaName: "Corporate Burnout",
      demographics: "Women 28-40, working professionals, high achievers",
      painPoint: "Exhausted from work, lost sense of self, lacking real connection",
      desire: "Wants authentic relationships, personal growth, life beyond work",
      motivators: "Personal development, meaningful friendships, holistic health",
      barriers: "Busy schedule, perfectionism, vulnerability feels risky",
      tone: "Empowering, genuine, supportive but challenging",
      channels: "Instagram, LinkedIn, Google Search",
      primaryStage: "curious"
    },
    {
      personaName: "Young Leader",
      demographics: "Men & Women 22-28, recent grads or early career",
      painPoint: "Feels directionless, comparing to others, lacking mentorship",
      desire: "Wants to build discipline, find their tribe, develop leadership",
      motivators: "Growth mindset, adventure, being part of something bigger",
      barriers: "Financial concerns, imposter syndrome, social anxiety",
      tone: "Energetic, aspirational, youth-focused but mature",
      channels: "Instagram, TikTok, Google Search",
      primaryStage: "unaware"
    }
  ];

  useEffect(() => {
    loadPersonas();
    if (editId) {
      loadPersonaForEdit(editId);
    }
  }, [editId]);

  const loadPersonas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/personas?orgId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setPersonas(data);
      }
    } catch (error) {
      console.error("Error loading personas:", error);
    }
  };

  const loadPersonaForEdit = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/personas/${id}?orgId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
        setShowForm(true);
      }
    } catch (error) {
      console.error("Error loading persona:", error);
    }
  };

  const handleLoadExample = (example) => {
    setFormData({
      ...formData,
      ...example
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const url = editId 
        ? `${API_BASE_URL}/api/personas/${editId}`
        : `${API_BASE_URL}/api/personas`;
      
      const method = editId ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, orgId })
      });

      if (response.ok) {
        alert("✅ Persona saved!");
        setShowForm(false);
        setFormData({
          personaName: "",
          demographics: "",
          painPoint: "",
          desire: "",
          motivators: "",
          barriers: "",
          tone: "",
          channels: "",
          primaryStage: "curious",
          notes: ""
        });
        loadPersonas();
        navigate("/personas");
      } else {
        alert("❌ Failed to save persona");
      }
    } catch (error) {
      console.error("Error saving persona:", error);
      alert("❌ Error saving persona");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this persona?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/personas/${id}?orgId=${orgId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        alert("✅ Persona deleted!");
        loadPersonas();
      }
    } catch (error) {
      console.error("Error deleting persona:", error);
    }
  };

  const handleGenerateCampaign = (persona) => {
    // Navigate to Google Ads campaign generator with this persona
    navigate(`/recruit/google?personaId=${persona.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/engage")}
          className="mb-6 text-violet-600 hover:text-violet-800 flex items-center gap-2 font-medium"
        >
          ← Back to Engagement Hub
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🧩</div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">The Human Stack</h1>
                <p className="text-slate-600 mt-2">
                  Define WHO you're reaching. Build personas that power AI campaigns.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg"
            >
              {showForm ? "Cancel" : "+ New Persona"}
            </button>
          </div>
        </div>

        {/* Example Personas */}
        {!showForm && personas.length === 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">🎯 Start with an Example</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {examplePersonas.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadExample(example)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left border-2 border-transparent hover:border-violet-300"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{example.personaName}</h3>
                  <p className="text-sm text-slate-600 mb-3">{example.demographics}</p>
                  <div className="text-xs text-violet-600 font-semibold">
                    Click to customize →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Persona Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editId ? "Edit Persona" : "Create New Persona"}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Persona Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personaName}
                    onChange={(e) => setFormData({ ...formData, personaName: e.target.value })}
                    placeholder='e.g., "Disconnected Dad"'
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Quick internal label</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Demographics *
                  </label>
                  <textarea
                    value={formData.demographics}
                    onChange={(e) => setFormData({ ...formData, demographics: e.target.value })}
                    placeholder="e.g., Men 30-50, Arlington VA, married with kids"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Age, location, life situation</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pain Point *
                  </label>
                  <textarea
                    value={formData.painPoint}
                    onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                    placeholder="e.g., Feels isolated, lacks accountability"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Core emotional driver / struggle</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Desire / Aspiration *
                  </label>
                  <textarea
                    value={formData.desire}
                    onChange={(e) => setFormData({ ...formData, desire: e.target.value })}
                    placeholder="e.g., Wants community, purpose, structure"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Positive end-state they want</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Motivators
                  </label>
                  <textarea
                    value={formData.motivators}
                    onChange={(e) => setFormData({ ...formData, motivators: e.target.value })}
                    placeholder="e.g., Challenge, brotherhood, shared purpose"
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">What energizes them</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Barriers / Friction
                  </label>
                  <textarea
                    value={formData.barriers}
                    onChange={(e) => setFormData({ ...formData, barriers: e.target.value })}
                    placeholder="e.g., Time, ego, not knowing where to start"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Why they haven't moved yet</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tone / Voice *
                  </label>
                  <textarea
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    placeholder="e.g., Masculine, authentic, no-BS"
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">How to speak to them</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Channels *
                  </label>
                  <input
                    type="text"
                    value={formData.channels}
                    onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                    placeholder="e.g., Google Search, YouTube, Facebook"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Where they hang out</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Primary Journey Stage *
                  </label>
                  <select
                    value={formData.primaryStage}
                    onChange={(e) => setFormData({ ...formData, primaryStage: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    {journeyStages.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label} - {stage.desc}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Where they typically enter</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any other insights or context..."
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-3 rounded-lg font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all"
              >
                💾 Save Persona
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    personaName: "",
                    demographics: "",
                    painPoint: "",
                    desire: "",
                    motivators: "",
                    barriers: "",
                    tone: "",
                    channels: "",
                    primaryStage: "curious",
                    notes: ""
                  });
                }}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Saved Personas */}
        {personas.length > 0 && !showForm && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Personas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-violet-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{persona.personaName}</h3>
                      <p className="text-sm text-slate-600 mb-3">{persona.demographics}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div>
                          <span className="text-xs font-semibold text-slate-500">Pain Point:</span>
                          <p className="text-sm text-slate-700">{persona.painPoint}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500">Desire:</span>
                          <p className="text-sm text-slate-700">{persona.desire}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500">Channels:</span>
                          <p className="text-sm text-slate-700">{persona.channels}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs px-3 py-1 bg-violet-100 text-violet-700 rounded-full font-semibold">
                          {journeyStages.find(s => s.value === persona.primaryStage)?.label || persona.primaryStage}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleGenerateCampaign(persona)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all text-sm"
                    >
                      🪄 Generate Campaign
                    </button>
                    <button
                      onClick={() => navigate(`/personas?edit=${persona.id}`)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(persona.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>How It Works</span>
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">1.</span>
              <span>Build detailed personas that capture the essence of who you're reaching</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">2.</span>
              <span>AI uses your persona data to generate targeted campaigns (Google Ads, Facebook, email)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">3.</span>
              <span>Campaigns are pre-filled with copy, keywords, and targeting based on persona insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">4.</span>
              <span>One persona can power multiple campaigns across different channels</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

