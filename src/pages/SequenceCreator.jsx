import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Sequence Creator - Simple Apollo-style email sequence creator
 * Clean, focused, no complex wizards
 */
export default function SequenceCreator() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactLists, setContactLists] = useState([]);
  const [sequenceData, setSequenceData] = useState({
    name: "",
    subject: "test email",
    message: "test email",
    contactListId: ""
  });
  
  useEffect(() => {
    loadContactLists();
  }, [orgId]);
  
  const loadContactLists = async () => {
    try {
      const response = await api.get(`/contact-lists?orgId=${orgId}`);
      console.log("Contact lists loaded:", response.data);
      setContactLists(response.data);
    } catch (err) {
      console.error("Error loading contact lists:", err);
      setError("Failed to load contact lists");
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSequenceData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sequenceData.name || !sequenceData.subject || !sequenceData.message || !sequenceData.contactListId) {
      setError("Please fill in all required fields and select a contact list");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Create the sequence
      const sequenceResponse = await api.post("/sequences", {
        orgId,
        name: sequenceData.name,
        subject: sequenceData.subject,
        text: sequenceData.message,
        html: sequenceData.message,
        delayDays: 0,
        order: 1
      });
      
      // Show preview first
      const selectedList = contactLists.find(list => list.id === sequenceData.contactListId);
      alert(`✅ Sequence "${sequenceData.name}" created!\n\nReady to launch? This will send to ${selectedList?.totalContacts || 0} contacts.`);
      
      if (confirm("🚀 Launch sequence now?")) {
        // Send the sequence
        const sequenceId = sequenceResponse.data.id;
        await api.post("/enterprise-email/send-sequence", {
          sequenceId,
          delaySeconds: 2
        });
        
        alert(`🚀 Sequence "${sequenceData.name}" LAUNCHED!`);
      } else {
        alert(`✅ Sequence "${sequenceData.name}" saved for later!`);
      }
      
      // Reset form
      setSequenceData({
        name: "",
        subject: "test email",
        message: "test email",
        contactListId: ""
      });
      
    } catch (err) {
      console.error("Error creating sequence:", err);
      setError(err.response?.data?.error || "Failed to create sequence");
    } finally {
      setLoading(false);
    }
  };
  
  const getSelectedList = () => {
    return contactLists.find(list => list.id === sequenceData.contactListId);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Create Sequence</h1>
              <p className="text-gray-600">Simple email sequence creator.</p>
            </div>
            <button
              onClick={() => navigate("/campaignhome")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>
          
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sequence Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Sequence Name *
              </label>
              <input
                type="text"
                name="name"
                value={sequenceData.name}
                onChange={handleInputChange}
                placeholder="e.g., Bros & Brews Follow-up"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            {/* Contact List Selection - SIMPLE BOX */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience *
              </label>
              
              {sequenceData.contactListId ? (
                <div className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-500 text-white rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{getSelectedList()?.name || "Selected List"}</h3>
                        <p className="text-sm text-gray-600">{getSelectedList()?.description || "No description"}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-lg font-bold text-indigo-600">{getSelectedList()?.totalContacts || 0}</span>
                          <span className="text-sm text-gray-500 ml-1">contacts</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate("/contact-list-manager")}
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-300 rounded hover:bg-indigo-50"
                      >
                        Pick New List
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/contact-list-builder")}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Create New List
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-6">No contact list selected</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => navigate("/contact-list-manager")}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                      Pick List
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/contact-list-builder")}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Create List
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Email Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={sequenceData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            {/* Email Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Email Message *
              </label>
              <textarea
                name="message"
                value={sequenceData.message}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={loading || !sequenceData.contactListId}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {loading ? "Creating..." : "Create & Launch Sequence"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}