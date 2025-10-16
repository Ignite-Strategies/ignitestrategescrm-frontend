import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { getGmailAccessToken, isGmailAuthenticated } from "../lib/googleAuth";

/**
 * CampaignPreview - Final Review Before Send
 * Shows everything locked in: campaign, list, subject, message
 * Displays actual recipients and preview of personalized messages
 */
export default function CampaignPreview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  
  // Get params from URL
  const campaignId = searchParams.get('campaignId');
  const listId = searchParams.get('listId');
  
  // State
  const [campaign, setCampaign] = useState(null);
  const [contactList, setContactList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [selectedContactIndex, setSelectedContactIndex] = useState(0);
  
  useEffect(() => {
    if (!campaignId) {
      setError("Missing campaign ID");
      setLoading(false);
      return;
    }
    
    loadCampaignData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);
  
  const loadCampaignData = async () => {
    try {
      console.log('🔄 Starting campaign preview load...');
      
      // STEP 1: Save any unsaved content from localStorage
      const previewSubject = localStorage.getItem('previewSubject');
      const previewMessage = localStorage.getItem('previewMessage');
      
      if (previewSubject || previewMessage) {
        console.log('💾 Saving unsaved content from creator...');
        await api.patch(`/campaigns/${campaignId}`, {
          subject: previewSubject || undefined,
          body: previewMessage || undefined
        });
        console.log('✅ Content saved!');
        
        // Clear localStorage
        localStorage.removeItem('previewSubject');
        localStorage.removeItem('previewMessage');
      }
      
      // STEP 2: Hydrate everything from backend
      console.log('🔄 Hydrating campaign data via campaignId:', campaignId);
      
      const [campaignRes, contactsRes] = await Promise.all([
        api.get(`/campaigns/${campaignId}`), // Gets campaign + contactList
        api.get(`/campaigns/${campaignId}/contacts`) // Gets all contacts via campaignId
      ]);
      
      const campaignData = campaignRes.data;
      
      // NULL CHECK: Campaign not found
      if (!campaignData) {
        setError("Sorry bro - campaign not found");
        setLoading(false);
        return;
      }
      
      // NULL CHECK: No contact list attached
      if (!campaignData.contactList) {
        setError("Sorry bro - no contact list attached to this campaign");
        setLoading(false);
        return;
      }
      
      // NULL CHECK: No contacts in list
      if (!contactsRes.data || contactsRes.data.length === 0) {
        setError("Sorry bro - no contacts found in this list");
        setLoading(false);
        return;
      }
      
      setCampaign(campaignData);
      setContactList(campaignData.contactList);
      setContacts(contactsRes.data);
      
      // Load subject and body from campaign
      setSubject(campaignData.subject || "No Subject");
      setMessage(campaignData.body || "No message content");
      
      console.log('✅ Campaign hydrated:', {
        campaign: campaignData.name,
        list: campaignData.contactList?.name,
        contacts: contactsRes.data.length,
        hasSubject: !!campaignData.subject,
        hasBody: !!campaignData.body
      });
      
      setGmailAuthenticated(isGmailAuthenticated());
      
    } catch (err) {
      console.error("Error loading campaign data:", err);
      setError(`Sorry bro - ${err.response?.data?.error || err.message || "Failed to load campaign data"}`);
    } finally {
      setLoading(false);
    }
  };
  
  const getPersonalizedMessage = (contact) => {
    return message
      .replace(/\{\{firstName\}\}/g, contact.firstName || '')
      .replace(/\{\{lastName\}\}/g, contact.lastName || '')
      .replace(/\{\{email\}\}/g, contact.email || '')
      .replace(/\{\{goesBy\}\}/g, contact.goesBy || contact.firstName || '');
  };
  
  const getPersonalizedSubject = (contact) => {
    return subject
      .replace(/\{\{firstName\}\}/g, contact.firstName || '')
      .replace(/\{\{lastName\}\}/g, contact.lastName || '')
      .replace(/\{\{email\}\}/g, contact.email || '')
      .replace(/\{\{goesBy\}\}/g, contact.goesBy || contact.firstName || '');
  };
  
  const handleSend = async () => {
    // DOUBLE-CLICK PROTECTION! 🚨
    if (sending) {
      console.log('⚠️ Already sending, ignoring duplicate click');
      return;
    }
    
    if (!gmailAuthenticated) {
      setError("Gmail authentication required");
      return;
    }
    
    console.log('🚀 Starting campaign send...');
    setSending(true);
    setError("");
    
    try {
      // Send via Enterprise Gmail API
      console.log('📧 Sending campaign via Gmail API...');
      await api.post('/enterprise-gmail/send-campaign', {
        campaignId,
        subject,
        message,
        contactListId: listId
      });
      
      // Update campaign status
      console.log('✅ Campaign sent! Updating status...');
      await api.patch(`/campaigns/${campaignId}`, {
        status: 'sent'
      });
      
      console.log('✅ Campaign complete!');
      alert(`✅ Campaign sent to ${contacts.length} contacts!`);
      navigate('/campaignhome');
      
    } catch (err) {
      console.error("❌ Error sending campaign:", err);
      const errorMsg = err.response?.data?.error || "Failed to send campaign";
      
      // Check if it's a Gmail auth error
      if (errorMsg.includes("authentication") || errorMsg.includes("Gmail")) {
        setError("⚠️ Gmail authentication expired! Please reconnect Gmail and try again.");
        
        // Clear the expired token
        localStorage.removeItem('gmailAccessToken');
        setGmailAuthenticated(false);
        
        // Ask user to reconnect
        if (window.confirm("Gmail authentication expired. Click OK to reconnect now.")) {
          window.location.href = '/campaignhome'; // Redirect to auth page
        }
      } else {
        setError(errorMsg);
      }
    } finally {
      setSending(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign preview...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/campaign-creator')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Campaign Creator
          </button>
        </div>
      </div>
    );
  }
  
  const selectedContact = contacts[selectedContactIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl">
          
          {/* Header */}
          <div className="flex justify-between items-center p-8 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Campaign Preview</h1>
              <p className="text-gray-600">Final review before sending your campaign</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(listId ? `/campaign-creator?campaignId=${campaignId}&listId=${listId}` : `/campaign-creator?campaignId=${campaignId}`)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                ← Back to Edit
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !gmailAuthenticated}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : `🚀 Send to ${contacts.length} contacts`}
              </button>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {/* Main Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left: Campaign Details */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Campaign Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{campaign?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Contact List:</span>
                      <p className="text-gray-900">{contactList?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Recipients:</span>
                      <p className="text-gray-900 font-semibold">{contacts.length} contacts</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        campaign?.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        campaign?.status === 'sent' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign?.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Email Content */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Subject:</span>
                      <p className="text-gray-900 font-medium">{subject}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Message Preview:</span>
                      <div className="text-sm text-gray-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                        {message.substring(0, 200)}{message.length > 200 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Gmail Status */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Status</h3>
                  <div className="flex items-center gap-3">
                    {gmailAuthenticated ? (
                      <>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">Gmail Connected</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-red-700 font-medium">Gmail Not Connected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right: Recipients & Preview */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Recipients List */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipients ({contacts.length})</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {contacts.map((contact, index) => (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedContactIndex(index)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          index === selectedContactIndex
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
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
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Email Preview */}
                {selectedContact && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Preview for: {selectedContact.firstName} {selectedContact.lastName}
                    </h3>
                    
                    <div className="bg-white border rounded-lg overflow-hidden">
                      {/* Email Header */}
                      <div className="bg-gray-100 px-4 py-3 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">To: {selectedContact.email}</p>
                            <p className="text-sm text-gray-600">Subject: {getPersonalizedSubject(selectedContact)}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Email Body */}
                      <div className="p-6">
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                          {getPersonalizedMessage(selectedContact)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
