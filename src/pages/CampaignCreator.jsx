import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, getGmailAccessToken } from "../lib/googleAuth";

/**
 * CampaignCreator - Simple Vertical Flow
 * Name → List → Message → Send (all on one page, no wizards!)
 */
export default function CampaignCreator() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  // Campaign data
  const [campaignId, setCampaignId] = useState(localStorage.getItem('campaignId') || null);
  const [campaignName, setCampaignName] = useState(localStorage.getItem('currentCampaign') || "");
  
  // Contact list data
  const [listId, setListId] = useState(localStorage.getItem('listId') || null);
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
  
  // Hydrate on mount
  useEffect(() => {
    if (campaignId) {
      loadAvailableLists();
    }
    if (listId) {
      loadContactList();
      loadContacts();
    }
    checkGmailAuth();
  }, []);
  
  const checkGmailAuth = () => {
    const token = getGmailAccessToken();
    const email = localStorage.getItem('gmailEmail');
    setGmailAuthenticated(!!token);
    setUserEmail(email || '');
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
    }
  };
  
  const loadContacts = async () => {
    try {
      const response = await api.get(`/contact-lists/${listId}/contacts`);
      setContacts(response.data);
    } catch (err) {
      console.error("Error loading contacts:", err);
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
      setCampaignId(campaign.id);
      localStorage.setItem('campaignId', campaign.id);
      localStorage.setItem('currentCampaign', campaign.name);
      
      console.log("✅ Campaign created:", campaign.id);
      loadAvailableLists();
      
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
      
      setListId(list.id);
      localStorage.setItem('listId', list.id);
      setContactList(list);
      
      await loadContacts();
      
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
      
      await api.post('/email/personal', {
        campaignId,
        subject,
        message,
        contacts: contacts.map(c => c.email)
      });
      
      await api.patch(`/campaigns/${campaignId}`, {
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
            {campaignId && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Contact List</h3>
                {contactList ? (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div>
                      <h4 className="font-medium text-gray-900">{contactList.name}</h4>
                      <p className="text-sm text-gray-600">{contacts.length} contacts</p>
                    </div>
                    <button
                      onClick={() => {
                        setContactList(null);
                        setListId(null);
                        setContacts([]);
                        localStorage.removeItem('listId');
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Change
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
            )}
            
            {/* 3. Message Content */}
            {contactList && (
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
                    <textarea
                      rows={10}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Send Button */}
            {contactList && (
              <div className="flex justify-end">
                <button
                  onClick={handleSend}
                  disabled={sending || !subject.trim() || !message.trim()}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : `📨 Send to ${contacts.length} contacts`}
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
