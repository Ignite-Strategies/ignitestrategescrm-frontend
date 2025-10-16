import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, getGmailAccessToken, isGmailAuthenticated } from "../lib/googleAuth";

/**
 * CampaignCreator - Clean 3-Step Flow with Preview
 * 1. Name → 2. Pick List → 3. Write Message → Preview & Send
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
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // Load data on mount or when params change
  useEffect(() => {
    console.log('🎯 CampaignCreator loaded with params:', { campaignId, listId });
    loadData();
  }, [campaignId, listId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check Gmail auth
      checkGmailAuth();
      
      // Load campaign data if we have a campaignId
      if (campaignId) {
        await loadCampaignData();
      }
      
      // Load contact list if we have a listId
      if (listId) {
        await loadContactList();
        await loadContacts();
      }
      
      // Load available lists for selection
      await loadAvailableLists();
      
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load campaign data");
    } finally {
      setLoading(false);
    }
  };
  
  const checkGmailAuth = () => {
    const authenticated = isGmailAuthenticated();
    const email = localStorage.getItem('gmailEmail');
    setGmailAuthenticated(authenticated);
    setUserEmail(email || '');
  };
  
  const loadCampaignData = async () => {
    try {
      const response = await api.get(`/campaigns/${campaignId}`);
      const campaign = response.data;
      
      setCampaignName(campaign.name);
      if (campaign.subject) setSubject(campaign.subject);
      if (campaign.body) setMessage(campaign.body);
      
      console.log('✅ Campaign data loaded:', campaign.name);
    } catch (err) {
      console.error("Error loading campaign:", err);
      if (err.response?.status === 404) {
        // Campaign deleted, start fresh
        setSearchParams({});
        setError("");
      }
    }
  };
  
  const loadAvailableLists = async () => {
    try {
      const [listsRes, campaignsRes] = await Promise.all([
        api.get(`/contact-lists?orgId=${orgId}`),
        api.get(`/campaigns?orgId=${orgId}`)
      ]);
      
      // Show which campaigns are using each list (but don't block reuse!)
      const enrichedLists = listsRes.data.map(list => {
        const linkedCampaigns = campaignsRes.data.filter(c => c.contactListId === list.id);
        return {
          ...list,
          linkedCampaigns,  // Show info, don't block
          usageCount: linkedCampaigns.length,
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
      if (err.response?.status === 404) {
        setError('Contact list no longer exists. Please select a new list.');
      }
    }
  };
  
  const loadContacts = async () => {
    if (!listId) return;
    
    try {
      const response = await api.get(`/contact-lists/${listId}/contacts`);
      setContacts(response.data);
      console.log('✅ Loaded contacts:', response.data.length);
    } catch (err) {
      console.error("Error loading contacts:", err);
      setContacts([]);
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
      
      // Update URL with campaignId
      setSearchParams({ campaignId: campaign.id });
      
    } catch (err) {
      console.error("❌ Error creating campaign:", err);
      setError(err.response?.data?.error || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectList = async (list) => {
    if (!campaignId) {
      setError("Please create your campaign first (Step 1)");
      return;
    }
    
    setLoading(true);
    try {
      // Link list to campaign
      await api.patch(`/campaigns/${campaignId}`, {
        contactListId: list.id
      });
      
      // Update URL with listId
      setSearchParams({ campaignId, listId: list.id });
      
    } catch (err) {
      console.error("Error assigning list:", err);
      setError(err.response?.data?.error || "Failed to assign list");
    } finally {
      setLoading(false);
    }
  };
  
  const insertVariable = (variable) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = message.substring(0, start) + variable + message.substring(end);
      setMessage(newText);
      
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
  
  const handlePreview = async () => {
    try {
      // If no campaign yet, create it first
      if (!campaignId) {
        if (!campaignName.trim()) {
          setError("Please enter a campaign name first");
          return;
        }
        await handleCreateCampaign();
        // Wait for campaign to be created, then save and navigate
        setTimeout(async () => {
          const newCampaignId = new URLSearchParams(window.location.search).get('campaignId');
          if (newCampaignId) {
            await api.patch(`/campaigns/${newCampaignId}`, { subject, body: message });
            navigate(`/campaign-preview?campaignId=${newCampaignId}`);
          }
        }, 500);
        return;
      }
      
      await saveCampaignContent();
      navigate(`/campaign-preview?campaignId=${campaignId}`);
    } catch (err) {
      setError("Failed to save campaign content");
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
                      setSearchParams({});
                      setCampaignName("");
                      setContactList(null);
                      setContacts([]);
                      setSubject("");
                      setMessage("");
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                  >
                    Start New
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Enter campaign name (e.g. 'Q4 Newsletter')"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && campaignName.trim()) {
                        handleCreateCampaign();
                      }
                    }}
                  />
                  <button
                    onClick={handleCreateCampaign}
                    disabled={loading || !campaignName.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Campaign"}
                  </button>
                </div>
              )}
            </div>
            
            {/* 2. Pick a List */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Pick a Contact List</h3>
                
                {!campaignId && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Please create your campaign first (Step 1) before selecting a list
                    </p>
                  </div>
                )}
                
                {contactList ? (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div>
                      <h4 className="font-medium text-gray-900">{contactList.name}</h4>
                      <p className="text-sm text-gray-600">{contacts.length} contacts</p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchParams({ campaignId });
                        setContactList(null);
                        setContacts([]);
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                    >
                      Change List
                    </button>
                  </div>
                ) : campaignId ? (
                  <div className="space-y-4">
                    {/* Available Lists */}
                    {availableLists.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">📋 Available Lists</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {availableLists.map(list => (
                            <button
                              key={list.id}
                              onClick={() => handleSelectList(list)}
                              disabled={loading}
                              className="p-4 border-2 border-gray-200 rounded-lg text-left transition hover:border-indigo-400 hover:bg-indigo-50"
                            >
                              <div className="font-semibold text-gray-900">
                                {list.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {list.contactCount || 0} contacts
                                {list.usageCount > 0 && (
                                  <span className="ml-2 text-blue-600">
                                    • Used by {list.usageCount} campaign(s)
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Create New List Button - Goes to Dashboard */}
                    <div className="pt-4 border-t">
                      <button
                        onClick={() => navigate(`/contact-list-manager?campaignId=${campaignId}`)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-indigo-400 hover:bg-indigo-50 transition"
                      >
                        <div className="text-2xl mb-2">➕</div>
                        <div className="font-semibold text-gray-900">Manage & Create Lists</div>
                        <div className="text-sm text-gray-600">Create or select from all your lists</div>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            
            {/* 3. Write Message */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Write Your Message</h3>
              
              {/* Gmail Auth Status */}
              {!gmailAuthenticated && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 font-medium">Gmail authentication required to send</p>
                    <p className="text-sm text-yellow-600">Authenticate with your Gmail account</p>
                  </div>
                  <button
                    onClick={handleGmailAuth}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    Connect Gmail
                  </button>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Subject Line */}
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
                
                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Message Body</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => insertVariable('{{firstName}}')}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                      >
                        + First Name
                      </button>
                      <button
                        onClick={() => insertVariable('{{lastName}}')}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                      >
                        + Last Name
                      </button>
                      <button
                        onClick={() => insertVariable('{{goesBy}}')}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                      >
                        + Goes By
                      </button>
                      <button
                        onClick={() => insertVariable('{{email}}')}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                      >
                        + Email
                      </button>
                    </div>
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
                      <div className="text-sm text-gray-600 font-medium mb-2">👁️ Live Preview (with sample data):</div>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border">
                        {message
                          .replace(/\{\{firstName\}\}/g, contacts[0]?.firstName || 'John')
                          .replace(/\{\{lastName\}\}/g, contacts[0]?.lastName || 'Smith')
                          .replace(/\{\{email\}\}/g, contacts[0]?.email || 'john.smith@example.com')
                          .replace(/\{\{goesBy\}\}/g, contacts[0]?.goesBy || contacts[0]?.firstName || 'John')
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Preview Button */}
            {campaignId && listId && subject && message && (
              <div className="flex justify-end gap-4">
                <button
                  onClick={handlePreview}
                  disabled={!subject.trim() || !message.trim()}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  👁️‍🗨️ Preview & Send Campaign
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
