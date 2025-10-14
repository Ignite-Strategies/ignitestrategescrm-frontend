import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, getGmailAccessToken } from "../lib/googleAuth";

/**
 * CampaignCreator - Simple Vertical Flow
 * Name → List → Message → Send (all on one page, no wizards!)
 */
export default function CampaignCreator() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const orgId = getOrgId();
  
  // Get params from URL
  const campaignId = searchParams.get('campaignId');
  const listId = searchParams.get('listId');
  
  // Campaign data
  const [campaignName, setCampaignName] = useState("");
  const [contactList, setContactList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [availableLists, setAvailableLists] = useState([]);
  
  // Message data
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // HYDRAULIC PRESS THE ENTIRE PAGE ON LOAD!
  useEffect(() => {
    console.log('🔄 CampaignCreator loaded with params:', { campaignId, listId });
    
    // CRUSH EVERYTHING AND REBUILD!
    hydraulicPressHydration();
  }, [campaignId, listId]);
  
  const checkGmailAuth = () => {
    const token = getGmailAccessToken();
    const email = localStorage.getItem('gmailEmail');
    setGmailAuthenticated(!!token);
    setUserEmail(email || '');
  };
  
  const loadCampaignData = async () => {
    try {
      const response = await api.get(`/campaigns/${campaignId}`);
      const campaign = response.data;
      console.log('🔍 DEBUG: Loading campaign data:', campaign);
      
      setCampaignName(campaign.name);
      
      // Load subject and body if they exist
      if (campaign.subject) {
        console.log('🔍 DEBUG: Loading subject:', campaign.subject);
        setSubject(campaign.subject);
      }
      if (campaign.body) {
        console.log('🔍 DEBUG: Loading body:', campaign.body);
        setMessage(campaign.body);
      }
      
      console.log('🔍 DEBUG: Campaign data loaded - name:', campaign.name, 'subject:', campaign.subject, 'body:', campaign.body);
    } catch (err) {
      console.error("Error loading campaign:", err);
      setError("Failed to load campaign data");
    }
  };

  const loadAvailableLists = async () => {
    try {
      const [listsRes, campaignsRes] = await Promise.all([
        api.get(`/contact-lists?orgId=${orgId}`),
        api.get(`/campaigns?orgId=${orgId}`)
      ]);
      
      const enrichedLists = listsRes.data.map(list => {
        const linkedCampaigns = campaignsRes.data.filter(c => c.contactListId === list.id);
        return {
          ...list,
          inUse: linkedCampaigns.some(c => c.status === 'sent' || c.status === 'active'),
          assigned: linkedCampaigns.some(c => c.status === 'draft')
        };
      });
      
      setAvailableLists(enrichedLists);
    } catch (err) {
      console.error("Error loading lists:", err);
    }
  };
  
  const loadContactList = async () => {
    try {
      const response = await api.get(`/contact-lists/${listId}`);
      setContactList(response.data);
    } catch (err) {
      console.error("Error loading contact list:", err);
      // If list was deleted (404), clear stale localStorage
      if (err.response?.status === 404) {
        console.warn('⚠️ Contact list was deleted, clearing stale localStorage');
        localStorage.removeItem('listId');
        setListId(null);
        setContactList(null);
        setContacts([]);
        setError('Contact list no longer exists. Please select a new list.');
      }
    }
  };
  
  // Hydrate contacts on load
  const hydrateContacts = async () => {
    if (!listId) {
      console.log('⚠️ No listId for hydration');
      return;
    }
    
    try {
      console.log('💧 Hydrating contacts for list:', listId);
      const response = await api.get(`/contact-lists/${listId}/contacts`);
      console.log('💧 Hydrated contacts:', response.data.length);
      setContacts(response.data);
    } catch (err) {
      console.error("❌ Hydration failed:", err);
      setContacts([]);
    }
  };

  // Rehydrate when contacts are added/changed
  const rehydrateContacts = async () => {
    if (!listId) return;
    
    try {
      console.log('🔄 Rehydrating contacts...');
      await hydrateContacts();
      console.log('✅ Rehydration complete');
    } catch (err) {
      console.error("❌ Rehydration failed:", err);
    }
  };

  // HYDRAULIC PRESS THE ENTIRE PAGE!
  const hydraulicPressHydration = async () => {
    console.log('💥 HYDRAULIC PRESS: Crushing entire page with fresh data!', new Date().toISOString());
    
    try {
      // Reload EVERYTHING
      if (campaignId) {
        await loadCampaignData();
        await loadAvailableLists();
      }
      
      if (listId) {
        await loadContactList();
        await hydrateContacts();
      }
      
      await checkGmailAuth();
      await loadTemplates();
      
      console.log('💥 HYDRAULIC PRESS COMPLETE: Page completely crushed and rebuilt!');
    } catch (err) {
      console.error("💥 HYDRAULIC PRESS FAILED:", err);
    }
  };
  
  const loadTemplates = async () => {
    try {
      const response = await api.get(`/templates?orgId=${orgId}`);
      setTemplates(response.data);
      setShowTemplates(true);
    } catch (err) {
      console.error("Error loading templates:", err);
    }
  };
  
  const handleTemplateSelect = (template) => {
    setSubject(template.subject);
    setMessage(template.body);
    setShowTemplates(false);
  };
  
  const insertVariable = (variable) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = message.substring(0, start) + variable + message.substring(end);
      setMessage(newText);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };
  
  const saveCampaignContent = async () => {
    try {
      await api.patch(`/campaigns/${campaignId}`, {
        subject,
        body: message
      });
      console.log('✅ Campaign content saved');
    } catch (err) {
      console.error('❌ Error saving campaign content:', err);
      throw err;
    }
  };
  
  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      setError("Please enter a campaign name");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await api.post("/campaigns", {
        orgId,
        name: campaignName.trim(),
        description: `Campaign created ${new Date().toLocaleDateString()}`,
        status: "draft"
      });
      
      const campaign = response.data;
      console.log("✅ Campaign created:", campaign.id);
      
      // Navigate to same page but with campaignId param
      setSearchParams({ campaignId: campaign.id });
      
    } catch (err) {
      console.error("❌ Error creating campaign:", err);
      setError(err.response?.data?.error || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectList = async (list) => {
    setLoading(true);
    try {
      await api.patch(`/campaigns/${campaignId}`, {
        contactListId: list.id
      });
      
      // Navigate to same page but with listId param
      setSearchParams({ campaignId, listId: list.id });
      
    } catch (err) {
      console.error("Error assigning list:", err);
      setError(err.response?.data?.error || "Failed to assign list");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGmailAuth = async () => {
    try {
      const result = await signInWithGoogle();
      setUserEmail(result.email);
      setGmailAuthenticated(true);
      alert(`✅ Authenticated with ${result.email}!`);
    } catch (error) {
      console.error('Gmail auth failed:', error);
      alert('❌ Gmail authentication failed');
    }
  };
  
  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Please fill in subject and message");
      return;
    }
    
    setSending(true);
    setError("");
    
    try {
      // Check Gmail auth - if not authenticated, prompt user
      if (!gmailAuthenticated) {
        const confirmAuth = window.confirm("Gmail authentication required. Authenticate now?");
        if (confirmAuth) {
          await handleGmailAuth();
          // After auth, try again
          if (!getGmailAccessToken()) {
            setError("Gmail authentication failed");
            setSending(false);
            return;
          }
        } else {
          setSending(false);
          return;
        }
      }
      
      await api.post('/enterprise-gmail/send-campaign', {
        campaignId,
        subject,
        message,
        contactListId: listId
      });
      
      await api.patch(`/campaigns/${campaignId}`, {
        subject,
        body: message,
        status: 'sent'
      });
      
      alert(`✅ Campaign sent to ${contacts.length} contacts!`);
      
      // Clear and go home
      localStorage.removeItem('campaignId');
      localStorage.removeItem('currentCampaign');
      localStorage.removeItem('listId');
      
      navigate('/campaignhome');
      
    } catch (err) {
      console.error("Error sending:", err);
      setError(err.response?.data?.error || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Campaign Builder</h1>
              <p className="text-gray-600">Create and send your email campaign</p>
            </div>
            <button
              onClick={() => navigate("/campaignhome")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {/* Vertical Flow */}
          <div className="space-y-8">
            
            {/* 1. Campaign Name */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Campaign Name</h3>
              {campaignId ? (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h4 className="font-medium text-gray-900">{campaignName}</h4>
                    <p className="text-sm text-gray-600">ID: {campaignId}</p>
                  </div>
                  <button
                    onClick={() => {
                      setCampaignId(null);
                      localStorage.removeItem('campaignId');
                      localStorage.removeItem('currentCampaign');
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Enter campaign name (e.g., 'Spring Fundraiser 2025')"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleCreateCampaign}
                    disabled={loading || !campaignName.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {loading ? "Creating..." : "Create Campaign"}
                  </button>
                </div>
              )}
            </div>
            
            {/* 2. Contact List */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Contact List</h3>
                {contactList ? (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div>
                      <h4 className="font-medium text-gray-900">{contactList.name}</h4>
                      <p className="text-sm text-gray-600">{contacts.length} contacts</p>
                    </div>
                    <button
                      onClick={async () => {
                        setContactList(null);
                        setListId(null);
                        setContacts([]);
                        localStorage.removeItem('listId');
                        // Reload available lists to show them again
                        await loadAvailableLists();
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Change
                    </button>
                  </div>
                ) : campaignId ? (
                  <div>
                    {/* Navigation Buttons - Create or Pick */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => navigate(`/contact-list-builder?campaignId=${campaignId}`)}
                        className="p-6 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 bg-indigo-50 text-left transition"
                      >
                        <div className="text-4xl mb-2">✨</div>
                        <h4 className="font-semibold text-gray-900 mb-1">Create New List</h4>
                        <p className="text-sm text-gray-600">Build a smart list (All Org Members, etc.)</p>
                      </button>
                      
                      <button
                        onClick={() => navigate(`/contact-list-manager?campaignId=${campaignId}`)}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-400 text-left transition"
                      >
                        <div className="text-4xl mb-2">📋</div>
                        <h4 className="font-semibold text-gray-900 mb-1">Pick Existing List</h4>
                        <p className="text-sm text-gray-600">Choose from your saved lists</p>
                      </button>
                    </div>
                    
                    {/* Available Lists */}
                    {availableLists.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Available Lists</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableLists.map(list => (
                            <button
                              key={list.id}
                              onClick={() => handleSelectList(list)}
                              disabled={loading}
                              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-400 text-left transition disabled:opacity-50"
                            >
                              <h4 className="font-medium text-gray-900 mb-1">{list.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{list.description || "No description"}</p>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{list.totalContacts} contacts</span>
                                {list.inUse && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">In Use</span>}
                                {list.assigned && !list.inUse && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Assigned</span>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Contact List Locked</h4>
                    <p className="text-gray-600 mb-1">📝 Create a campaign first, then you'll be able to build your contact list!</p>
                    <p className="text-sm text-gray-500">👆 Click "Create Campaign" in Step 1 above</p>
                  </div>
                )}
            </div>
            
            {/* 3. Message Content */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">3. Message</h3>
                  <button
                    onClick={loadTemplates}
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition"
                  >
                    📄 Use Template
                  </button>
                </div>
                
                {/* Template Picker */}
                {showTemplates && (
                  <div className="mb-4 p-4 border border-indigo-200 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-indigo-900">Select a Template</span>
                      <button
                        onClick={() => setShowTemplates(false)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        ✕ Close
                      </button>
                    </div>
                    {templates.length === 0 ? (
                      <p className="text-sm text-gray-600">No templates available</p>
                    ) : (
                      <div className="space-y-2">
                        {templates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 text-left transition"
                          >
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                    
                    {/* Variable Insertion Buttons */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => insertVariable('{{firstName}}')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition font-medium"
                        title="Insert {{firstName}} - Example: Adam"
                      >
                        + First Name
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable('{{lastName}}')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition font-medium"
                        title="Insert {{lastName}} - Example: Smith"
                      >
                        + Last Name
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable('{{email}}')}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition font-medium"
                        title="Insert {{email}} - Example: john@example.com"
                      >
                        + Email
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariable('{{goesBy}}')}
                        className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition font-medium"
                        title="Insert {{goesBy}} - Preferred name"
                      >
                        + Preferred Name
                      </button>
                    </div>
                    
                    <textarea
                      rows={10}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi {{firstName}},&#10;&#10;This is your personalized message..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    />
                    
                    {/* Live Preview */}
                    {message && (message.includes('{{firstName}}') || message.includes('{{lastName}}') || message.includes('{{email}}') || message.includes('{{goesBy}}')) && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                        <div className="text-sm text-gray-600 font-medium mb-2">📧 Live Preview:</div>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border">
                          {message
                            .replace(/\{\{firstName\}\}/g, 'Adam')
                            .replace(/\{\{lastName\}\}/g, 'Smith')
                            .replace(/\{\{email\}\}/g, 'adam.smith@example.com')
                            .replace(/\{\{goesBy\}\}/g, 'Adam')
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            
            {/* Preview & Send Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={async () => {
                  try {
                    await saveCampaignContent();
                    navigate(`/campaign-preview?campaignId=${campaignId}&listId=${listId}`);
                  } catch (err) {
                    setError("Failed to save campaign content");
                  }
                }}
                disabled={!campaignId || !listId || !subject.trim() || !message.trim()}
                className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                👁️ Preview Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
