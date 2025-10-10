import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactListId: ""
  });
  
  const [contactLists, setContactLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadContactLists();
  }, [orgId]);

  const loadContactLists = async () => {
    try {
      const response = await api.get(`/contact-lists?orgId=${orgId}`);
      setContactLists(response.data);
    } catch (err) {
      console.error("Error loading contact lists:", err);
      setError("Failed to load contact lists");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contactListId) {
      setError("Campaign name and contact list are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/campaigns", {
        orgId,
        ...formData
      });

      alert(`Campaign "${formData.name}" created successfully!`);
      navigate(`/campaignsequences/${response.data.id}`);
    } catch (err) {
      console.error("Error creating campaign:", err);
      setError(err.response?.data?.error || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
              <p className="text-gray-600">Set up a new email campaign</p>
            </div>
            <button
              onClick={() => navigate("/campaignhome")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Bros & Brews 2025 Outreach"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional description of this campaign..."
              ></textarea>
            </div>

            {/* Contact List */}
            <div>
              <label htmlFor="contactListId" className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience (Contact List) *
              </label>
              <select
                id="contactListId"
                name="contactListId"
                value={formData.contactListId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a contact list...</option>
                {contactLists.map(list => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.totalContacts} contacts)
                  </option>
                ))}
              </select>
              {contactLists.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No contact lists found. 
                  <button
                    type="button"
                    onClick={() => navigate("/create-list-options")}
                    className="text-indigo-600 hover:text-indigo-700 ml-1"
                  >
                    Create one first →
                  </button>
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/campaignhome")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.contactListId}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {loading ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">What's Next?</h4>
                <p className="text-sm text-blue-800">
                  After creating the campaign, you'll add email sequences (Initial Invite, Follow-up, Last Call, etc.)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

