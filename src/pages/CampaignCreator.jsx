import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, getGmailAccessToken } from "../lib/googleAuth";

/**
 * CampaignCreator - ALL-IN-ONE Campaign Builder
 * Progressive disclosure: Name → List → Message → Send
 * Everything hydrates inline - no more page hopping!
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
  
  // UI states
  const [step, setStep] = useState(1); // 1=name, 2=list, 3=message
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  
  // Hydrate on mount
  useEffect(() => {
    // If we have campaignId and listId, jump to step 3
    if (campaignId && listId) {
      setStep(3);
      loadContactList();
      loadContacts();
    } else if (campaignId) {
      setStep(2);
      loadAvailableLists();
    }
    
    checkGmailAuth();
  }, []);
  
  const loadAvailableLists = async () => {
    try {
      const [listsRes, campaignsRes] = await Promise.all([
        api.get(`/contact-lists?orgId=${orgId}`),
        api.get(`/campaigns?orgId=${orgId}`)
      ]);
      
      // Enrich with campaign status
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
      setError("Failed to load contact lists");
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
  
  const checkGmailAuth = () => {
    const token = getGmailAccessToken();
    setGmailAuthenticated(!!token);
  };
  
  // STEP 1: Create campaign
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
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
      
      // Move to step 2
      setStep(2);
      loadAvailableLists();
      
    } catch (err) {
      console.error("❌ Error creating campaign:", err);
      setError(err.response?.data?.error || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };
  
  // STEP 2: Pick list
  const handleSelectList = async (list) => {
    setLoading(true);
    try {
      // Assign list to campaign
      await api.patch(`/campaigns/${campaignId}`, {
        contactListId: list.id
      });
      
      setListId(list.id);
      localStorage.setItem('listId', list.id);
      
      await loadContactList();
      await loadContacts();
      
      // Move to step 3
      setStep(3);
      
    } catch (err) {
      console.error("Error assigning list:", err);
      setError(err.response?.data?.error || "Failed to assign list");
    } finally {
      setLoading(false);
    }
  };
  
  // STEP 3: Send campaign
  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Please fill in subject and message");
      return;
    }
    
    if (!gmailAuthenticated) {
      setError("Please authenticate with Gmail first");
      return;
    }
    
    setSending(true);
    setError("");
    
    try {
      // Send via personal Gmail endpoint
      await api.post('/email/personal', {
        campaignId,
        subject,
        message,
        contacts: contacts.map(c => c.email)
      });
      
      // Update campaign status
      await api.patch(`/campaigns/${campaignId}`, {
        status: 'sent'
      });
      
      alert(`✅ Campaign sent to ${contacts.length} contacts!`);
      
      // Clear localStorage and go home
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
  
  const handleGmailAuth = async () => {
    try {
      await signInWithGoogle();
      checkGmailAuth();
      alert('✅ Gmail authenticated!');
    } catch (error) {
      console.error('Gmail auth failed:', error);
      alert('❌ Gmail authentication failed');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">🚀 Campaign Builder</h1>
              <button
                onClick={() => navigate("/campaignhome")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ← Back
              </button>
            </div>
            
            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</div>
                <span className="font-medium">Name</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded">
                <div className={`h-1 rounded transition-all ${step >= 2 ? 'bg-indigo-600 w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</div>
                <span className="font-medium">List</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded">
                <div className={`h-1 rounded transition-all ${step >= 3 ? 'bg-indigo-600 w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>3</div>
                <span className="font-medium">Send</span>
              </div>
            </div>
          </div>
          
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {/* STEP 1: Campaign Name */}
          {step === 1 && (
            <form onSubmit={handleCreateCampaign} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name *</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Spring Fundraiser 2025"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !campaignName.trim()}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
              >
                {loading ? "Creating..." : "Save & Continue →"}
              </button>
            </form>
          )}
          
          {/* STEP 2: Pick List */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">📋 Select Contact List</h2>
                <p className="text-gray-600">Campaign: <span className="font-semibold">{campaignName}</span></p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableLists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => handleSelectList(list)}
                    disabled={loading}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-400 text-left transition disabled:opacity-50"
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{list.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{list.description || "No description"}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{list.totalContacts} contacts</span>
                      {list.inUse && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">In Use</span>}
                      {list.assigned && !list.inUse && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Assigned</span>}
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ← Back to Name
              </button>
            </div>
          )}
          
          {/* STEP 3: Compose & Send */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">✉️ Compose Your Message</h2>
                <p className="text-gray-600">
                  Campaign: <span className="font-semibold">{campaignName}</span> · 
                  List: <span className="font-semibold">{contactList?.name}</span> ({contacts.length} contacts)
                </p>
              </div>
              
              {/* Gmail Auth */}
              {!gmailAuthenticated && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 mb-3">⚠️ Gmail authentication required to send emails</p>
                  <button
                    onClick={handleGmailAuth}
                    className="px-4 py-2 bg-white border border-yellow-300 rounded-lg text-yellow-800 hover:bg-yellow-50"
                  >
                    🔐 Authenticate with Gmail
                  </button>
                </div>
              )}
              
              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  required
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(2);
                    setListId(null);
                    localStorage.removeItem('listId');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  ← Change List
                </button>
                
                <button
                  onClick={handleSend}
                  disabled={sending || !gmailAuthenticated || !subject.trim() || !message.trim()}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
                >
                  {sending ? "Sending..." : `📨 Send to ${contacts.length} contacts`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
