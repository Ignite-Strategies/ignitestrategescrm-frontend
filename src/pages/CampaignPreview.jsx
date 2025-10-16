import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import api from "../lib/api";
import { isGmailAuthenticated } from "../lib/googleAuth";

/**
 * CampaignPreview - SIMPLE VERSION
 * Accepts campaignId from params OR location.state, cleans URL
 * 1. Rehydrate from backend
 * 2. Show message preview
 * 3. Show contacts
 * 4. Send button
 */
export default function CampaignPreview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // State (campaignId in state, not URL!)
  const [campaignId, setCampaignId] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  
  // On mount: grab from state OR param, clean URL
  useEffect(() => {
    // Priority 1: location.state (clean approach from V2)
    const stateCampaignId = location.state?.campaignId;
    if (stateCampaignId) {
      console.log("📦 CampaignPreview: Got campaignId from state:", stateCampaignId);
      setCampaignId(stateCampaignId);
      return;
    }
    
    // Priority 2: URL param (backward compat), but CLEAN IT!
    const paramCampaignId = searchParams.get('campaignId');
    if (paramCampaignId) {
      console.log("🧹 CampaignPreview: Found param, grabbing and cleaning URL...");
      setCampaignId(paramCampaignId);
      setSearchParams({}); // CLEAR THE URL!
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Load data when campaignId is set
  useEffect(() => {
    if (!campaignId) {
      setLoading(false);
      return;
    }
    
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);
  
  const loadEverything = async () => {
    try {
      console.log('🔄 Rehydrating campaign from backend...');
      
      // Load campaign + contacts in parallel
      const [campaignRes, contactsRes] = await Promise.all([
        api.get(`/campaigns/${campaignId}`),
        api.get(`/campaigns/${campaignId}/contacts`)
      ]);
      
      const campaignData = campaignRes.data;
      const contactsData = contactsRes.data || [];
      
      // Null checks
      if (!campaignData) {
        setError("Campaign not found");
        setLoading(false);
        return;
      }
      
      if (!campaignData.contactList) {
        setError("No contact list attached to campaign");
        setLoading(false);
        return;
      }
      
      if (contactsData.length === 0) {
        setError("No contacts in list");
        setLoading(false);
        return;
      }
      
      setCampaign(campaignData);
      setContacts(contactsData);
      setGmailAuthenticated(isGmailAuthenticated());
      
      console.log('✅ Loaded:', {
        campaign: campaignData.name,
        list: campaignData.contactList.name,
        contacts: contactsData.length
      });
      
    } catch (err) {
      console.error('❌ Load failed:', err);
      setError(err.response?.data?.error || err.message || "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };
  
  const getPreviewMessage = (contact) => {
    if (!campaign?.body) return "";
    
    return campaign.body
      .replace(/\{\{firstName\}\}/g, contact.firstName || '')
      .replace(/\{\{lastName\}\}/g, contact.lastName || '')
      .replace(/\{\{email\}\}/g, contact.email || '')
      .replace(/\{\{goesBy\}\}/g, contact.goesBy || contact.firstName || '');
  };
  
  const handleSend = async () => {
    if (sending) return; // Prevent double-click
    
    if (!gmailAuthenticated) {
      alert("Please connect Gmail first!");
      return;
    }
    
    if (!window.confirm(`Send to ${contacts.length} contacts?`)) {
      return;
    }
    
    setSending(true);
    
    try {
      console.log('🚀 Sending campaign...');
      
      await api.post('/enterprise-gmail/send-campaign', {
        campaignId,
        subject: campaign.subject,
        message: campaign.body,
        contactListId: campaign.contactListId
      });
      
      // Update status
      await api.patch(`/campaigns/${campaignId}`, {
        status: 'sent'
      });
      
      alert(`✅ Campaign sent to ${contacts.length} contacts!`);
      navigate('/campaignhome');
      
    } catch (err) {
      console.error('❌ Send failed:', err);
      alert(`Failed to send: ${err.response?.data?.error || err.message}`);
    } finally {
      setSending(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }
  
  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Campaign not found"}</p>
          <button
            onClick={() => navigate('/campaign-creator')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Creator
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📧 Campaign Preview
              </h1>
              <p className="text-gray-600">{campaign.name}</p>
            </div>
            <button
              onClick={() => navigate('/campaign-creator', { state: { campaignId } })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ← Back to Edit
            </button>
          </div>
          
          {/* Campaign Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Contact List</p>
                <p className="text-lg font-semibold text-gray-900">{campaign.contactList?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recipients</p>
                <p className="text-lg font-semibold text-indigo-600">{contacts.length} contacts</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {campaign.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Email Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Preview</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Subject:</span> {campaign.subject || "No Subject"}
                </p>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-3">Preview with first contact:</p>
                <div className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded border">
                  {contacts.length > 0 ? getPreviewMessage(contacts[0]) : campaign.body}
                </div>
              </div>
            </div>
          </div>
          
          {/* Contacts List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Recipients ({contacts.length})
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-50 p-4 rounded-lg">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-white rounded border"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                  </div>
                  {contact.goesBy && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Goes by: {contact.goesBy}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Send Button */}
          <div className="flex items-center justify-between">
            <div>
              {gmailAuthenticated ? (
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Gmail Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Gmail Not Connected</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSend}
              disabled={sending || !gmailAuthenticated}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : `🚀 Send to ${contacts.length} Contacts`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
