import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

export default function CampaignSequences() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  
  const [campaign, setCampaign] = useState(null);
  const [sequences, setSequences] = useState([]);
  const [showAddSequence, setShowAddSequence] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    html: "",
    delayDays: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCampaign();
    loadSequences();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const response = await api.get(`/campaigns/${campaignId}`);
      setCampaign(response.data);
    } catch (err) {
      console.error("Error loading campaign:", err);
      setError("Failed to load campaign");
    }
  };

  const loadSequences = async () => {
    try {
      const response = await api.get(`/sequences?campaignId=${campaignId}`);
      setSequences(response.data);
    } catch (err) {
      console.error("Error loading sequences:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSequence = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject || !formData.html) {
      setError("Name, subject, and message are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/sequences", {
        campaignId,
        ...formData,
        order: sequences.length + 1
      });

      alert(`Sequence "${formData.name}" added!`);
      setFormData({ name: "", subject: "", html: "", delayDays: 0 });
      setShowAddSequence(false);
      loadSequences();
    } catch (err) {
      console.error("Error adding sequence:", err);
      setError(err.response?.data?.error || "Failed to add sequence");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSequence = async (sequenceId) => {
    if (!confirm("Send this email to all contacts in the campaign?")) return;

    try {
      setLoading(true);
      const response = await api.post(`/sequences/${sequenceId}/send`);
      alert(`✅ ${response.data.message}\nSent to ${response.data.totalContacts} contacts`);
      loadSequences();
    } catch (err) {
      console.error("Error sending sequence:", err);
      alert(`Failed to send: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
              <p className="text-gray-600">{campaign.description || "Campaign email sequences"}</p>
              <p className="text-sm text-gray-500 mt-1">
                Target: <span className="font-medium">{campaign.contactList?.name}</span> ({campaign.contactList?.totalContacts} contacts)
              </p>
            </div>
            <button
              onClick={() => navigate("/campaigns")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Campaigns
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Sequences List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Sequences</h2>
            
            {sequences.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No sequences yet. Add your first email!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sequences.map((seq, index) => (
                  <div key={seq.id} className="p-6 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            Step {seq.order}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">{seq.name}</h3>
                          {seq.delayDays > 0 && (
                            <span className="text-sm text-gray-500">({seq.delayDays} days after previous)</span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2"><strong>Subject:</strong> {seq.subject}</p>
                        <p className="text-sm text-gray-600">{seq.html.substring(0, 150)}...</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          seq.status === 'sent' ? 'bg-green-100 text-green-700' :
                          seq.status === 'sending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {seq.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {seq.status === 'draft' && (
                          <button
                            onClick={() => handleSendSequence(seq.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                          >
                            Send Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Sequence Button/Form */}
          {!showAddSequence ? (
            <button
              onClick={() => setShowAddSequence(true)}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition"
            >
              + Add Email Sequence
            </button>
          ) : (
            <div className="border-2 border-indigo-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Sequence</h3>
              <form onSubmit={handleAddSequence} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sequence Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Initial Invite, Follow-up, Last Call"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delay (Days) *
                  </label>
                  <input
                    type="number"
                    name="delayDays"
                    value={formData.delayDays}
                    onChange={handleInputChange}
                    placeholder="0 = send immediately, 4 = wait 4 days"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Email subject line"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Body (HTML) *
                  </label>
                  <textarea
                    name="html"
                    rows="8"
                    value={formData.html}
                    onChange={handleInputChange}
                    placeholder="<p>Hi {{firstName}},</p><p>We're excited to invite you...</p>"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    required
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    Use {{firstName}}, {{lastName}}, {{email}} for personalization
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSequence(false);
                      setFormData({ name: "", subject: "", html: "", delayDays: 0 });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {loading ? "Adding..." : "Add Sequence"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

