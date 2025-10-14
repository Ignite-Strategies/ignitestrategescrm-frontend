import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, isSignedIn, getGmailAccessToken } from "../lib/googleAuth";

/**
 * Sequence Creator - Simple Apollo-style email sequence creator
 * Clean, focused, no complex wizards
 */
export default function SequenceCreator() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactLists, setContactLists] = useState([]);
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [sequenceData, setSequenceData] = useState(() => {
    // Load from localStorage if available, otherwise use defaults
    const saved = localStorage.getItem('sequenceDraft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.log('Failed to parse saved sequence data');
      }
    }
    return {
      name: "",
      subject: "test email",
      message: "test email",
      contactListId: ""
    };
  });
  const [showVariables, setShowVariables] = useState(false);
  const [hasLoadedSequence, setHasLoadedSequence] = useState(false);
  
  useEffect(() => {
    checkGmailAuth();
    loadContactLists();
  }, [orgId]);
  
  // Auto-select list if listId is in URL
  useEffect(() => {
    const listId = searchParams.get('listId');
    if (listId && contactLists.length > 0) {
      setSequenceData(prev => ({ ...prev, contactListId: listId }));
    }
  }, [searchParams, contactLists]);

  // Load existing sequence if editId is in URL (only once)
  useEffect(() => {
    const editId = searchParams.get('editId');
    if (editId && !hasLoadedSequence) {
      loadExistingSequence(editId);
      setHasLoadedSequence(true);
    }
  }, [searchParams, hasLoadedSequence]);

  const checkGmailAuth = () => {
    // Only check for Gmail access token, not Firebase auth
    const token = getGmailAccessToken();
    const gmailEmail = localStorage.getItem('gmailEmail');
    const isAuthenticated = !!token && !!gmailEmail;
    
    setGmailAuthenticated(isAuthenticated);
    setUserEmail(gmailEmail || '');
    
    console.log("📧 Gmail Auth Status:", { 
      hasToken: !!token, 
      email: gmailEmail,
      isAuthenticated 
    });
    
    // Redirect to CampaignHome if not authenticated
    if (!isAuthenticated) {
      console.log("⚠️ Gmail not authenticated, redirecting to CampaignHome...");
      localStorage.setItem('redirectMessage', 'Please connect Gmail to create and send sequences');
      navigate("/campaignhome");
    }
  };
  
  const loadExistingSequence = async (sequenceId) => {
    try {
      console.log(`📝 Loading existing sequence ${sequenceId}`);
      const response = await api.get(`/sequences/${sequenceId}`);
      const sequence = response.data;
      
      setSequenceData({
        name: sequence.name,
        subject: sequence.subject,
        message: sequence.html || sequence.body || "",
        contactListId: sequence.campaign?.contactListId || ""
      });
      
      console.log("✅ Sequence loaded:", sequence);
    } catch (err) {
      console.error("❌ Error loading sequence:", err);
      setError("Failed to load sequence for editing");
    }
  };

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
    const newData = { ...sequenceData, [name]: value };
    setSequenceData(newData);
    
    // Save to localStorage so it persists across navigation
    localStorage.setItem('sequenceDraft', JSON.stringify(newData));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!gmailAuthenticated) {
      setError("Please authenticate with Gmail first to send emails");
      alert("⚠️ Please authenticate with Gmail before creating and launching sequences");
      return;
    }

    if (!orgId) {
      setError("No organization selected. Please go to Dashboard and select an organization.");
      alert("❌ No organization selected. Please go to Dashboard first.");
      return;
    }

    if (!sequenceData.name || !sequenceData.subject || !sequenceData.message || !sequenceData.contactListId) {
      setError("Please fill in all required fields and select a contact list");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Check if we're editing an existing campaign
      const campaignId = searchParams.get('campaignId');
      let finalCampaignId = campaignId;
      
      if (!campaignId) {
        // Create a new campaign
        console.log("🏗️ Creating NEW campaign with:", { 
          orgId, 
          name: sequenceData.name, 
          contactListId: sequenceData.contactListId 
        });
        
        const campaignResponse = await api.post("/campaigns", {
          orgId,
          name: sequenceData.name,
          contactListId: sequenceData.contactListId,
          status: "draft"
        });
        
        finalCampaignId = campaignResponse.data.id;
      } else {
        console.log("📝 Using EXISTING campaign:", campaignId);
      }
      
      // Create the sequence
      const sequenceResponse = await api.post("/sequences", {
        campaignId: finalCampaignId,
        name: sequenceData.name,
        subject: sequenceData.subject,
        html: sequenceData.message,
        delayDays: 0,
        order: 1
      });
      
      // Show preview first
      const selectedList = contactLists.find(list => list.id === sequenceData.contactListId);
      alert(`✅ Sequence "${sequenceData.name}" created!\n\nReady to launch? This will send to ${selectedList?.totalContacts || 0} contacts.`);
      
      if (confirm("🚀 Launch sequence now?")) {
        try {
          // We already have the list data - no need for another API call!
          const selectedList = getSelectedList();
          console.log("📋 Using existing list data:", selectedList.name);
          
          // For MVP1, just send to the test contact (adam.cole.0524@gmail.com)
          const contactPayload = [{
            id: "test-contact-id",
            firstName: "Adam",
            email: "adam.cole.0524@gmail.com"
          }];
          
          console.log("👥 Using test contact:", contactPayload);
          
          console.log("📤 Sending via Gmail API:", {
            recipients: contactPayload.length,
            subject: sequenceData.subject
          });
          
          // Send via enterprise Gmail route (with variable replacement!)
          console.log("🔑 Gmail token being sent:", localStorage.getItem('gmailAccessToken')?.substring(0, 20) + '...');
          
          const gmailResponse = await api.post("/enterprise-gmail/send-sequence", {
            sequenceId: sequenceId,
            contacts: contactPayload,
            delaySeconds: 4
          });
          
          console.log("✅ Gmail response:", gmailResponse.data);
          alert(`🚀 Sequence "${sequenceData.name}" LAUNCHED via Gmail!`);
          
        } catch (gmailError) {
          console.error("❌ Gmail sending failed:", gmailError);
          alert(`❌ Failed to send via Gmail: ${gmailError.response?.data?.error || gmailError.message}`);
        }
      } else {
        alert(`✅ Sequence "${sequenceData.name}" saved for later!`);
      }
      
      // Reset form and clear localStorage
      setSequenceData({
        name: "",
        subject: "test email",
        message: "test email",
        contactListId: ""
      });
      localStorage.removeItem('sequenceDraft');
      
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {searchParams.get('editId') ? '✏️ Edit Sequence' : '🚀 Create Sequence'}
              </h1>
              <p className="text-gray-600">
                {searchParams.get('editId') ? 'Edit existing email sequence.' : 'Simple email sequence creator.'}
              </p>
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
              
              {/* Simple Token Picker - MVP1 Style */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.querySelector('textarea[name="message"]');
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const tokenText = '{{firstName}}';
                    const newText = sequenceData.message.substring(0, start) + tokenText + sequenceData.message.substring(end);
                    setSequenceData(prev => ({ ...prev, message: newText }));
                    
                    setTimeout(() => {
                      textarea.focus();
                      textarea.setSelectionRange(start + tokenText.length, start + tokenText.length);
                    }, 0);
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition font-medium"
                  title="Insert {{firstName}} - Example: Adam"
                >
                  + First Name
                </button>
              </div>
              
              <textarea
                name="message"
                value={sequenceData.message}
                onChange={handleInputChange}
                rows={6}
                placeholder="Hi {{firstName}},&#10;&#10;This is your personalized message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              
              {/* Live Preview - MVP1 Style */}
              {sequenceData.message && sequenceData.message.includes('{{firstName}}') && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium mb-1">Preview:</div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {sequenceData.message.replace(/\{\{firstName\}\}/g, 'Adam')}
                  </div>
                </div>
              )}
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