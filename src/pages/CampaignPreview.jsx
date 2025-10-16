import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";
import { isGmailAuthenticated } from "../lib/googleAuth";

/**
 * CampaignPreview - NUCLEAR REBUILD
 * 1. Get campaignId from state
 * 2. Load campaign
 * 3. Show preview
 * 4. Send button
 * THAT'S IT!
 */
export default function CampaignPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignId = location.state?.campaignId;

  const [campaign, setCampaign] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [gmailAuth, setGmailAuth] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      alert("No campaign ID - going back");
      navigate('/campaign-creator');
      return;
    }

    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEverything = async () => {
    try {
      console.log('🔄 Loading campaign:', campaignId);

      // Load campaign + contacts
      const [campaignRes, contactsRes] = await Promise.all([
        api.get(`/campaigns/${campaignId}`),
        api.get(`/campaigns/${campaignId}/contacts`)
      ]);

      setCampaign(campaignRes.data);
      setContacts(contactsRes.data || []);
      setGmailAuth(isGmailAuthenticated());

      console.log('✅ Loaded:', {
        campaign: campaignRes.data.name,
        contacts: contactsRes.data?.length || 0
      });

    } catch (err) {
      console.error('❌ Load failed:', err);
      alert('Failed to load campaign');
      navigate('/campaign-creator');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewMessage = () => {
    if (!campaign?.body || !contacts[0]) return "";

    const firstContact = contacts[0];
    
    console.log('🔍 Preview Debug:', {
      body: campaign.body,
      goesBy: firstContact.goesBy,
      firstName: firstContact.firstName
    });
    
    const result = campaign.body
      .replace(/\{\{firstName\}\}/g, firstContact.firstName || '')
      .replace(/\{\{lastName\}\}/g, firstContact.lastName || '')
      .replace(/\{\{email\}\}/g, firstContact.email || '')
      .replace(/\{\{goesBy\}\}/g, firstContact.goesBy || firstContact.firstName || '');
    
    console.log('✅ Preview Result:', result);
    return result;
  };

  const handleSend = async () => {
    if (!gmailAuth) {
      alert("Connect Gmail first!");
      return;
    }

    if (!window.confirm(`Send to ${contacts.length} contacts?`)) {
      return;
    }

    setSending(true);

    try {
      console.log('🚀 Sending...');

      await api.post('/enterprise-gmail/send-campaign', {
        campaignId,
        subject: campaign.subject,
        message: campaign.body,
        contactListId: campaign.contactListId
      });

      await api.patch(`/campaigns/${campaignId}`, {
        status: 'sent'
      });

      alert(`✅ Sent to ${contacts.length} contacts!`);
      navigate('/campaignhome');

    } catch (err) {
      console.error('❌ Send failed:', err);
      alert(`Failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">Campaign not found</p>
          <button
            onClick={() => navigate('/campaign-creator')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📧 Campaign Preview
            </h1>
            <p className="text-gray-600">{campaign.name}</p>
          </div>
          <button
            onClick={() => navigate('/campaign-creator', { state: { campaignId } })}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Edit
          </button>
        </div>

        {/* Campaign Info */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
              <div className="text-sm text-gray-600">Recipients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{campaign.status}</div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {gmailAuth ? "✓" : "✗"}
              </div>
              <div className="text-sm text-gray-600">Gmail Auth</div>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Email Preview</h2>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">Subject:</div>
            <div className="font-medium text-gray-900">{campaign.subject}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">
              Preview with first contact ({contacts[0]?.firstName || 'No contact'}):
            </div>
            <div className="p-4 bg-gray-50 rounded border whitespace-pre-wrap">
              {getPreviewMessage()}
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Contacts ({contacts.length})
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {contacts.slice(0, 10).map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                  {contact.goesBy && (
                    <span className="text-sm text-gray-600 ml-2">({contact.goesBy})</span>
                  )}
                </div>
                <span className="text-sm text-gray-600">{contact.email}</span>
              </div>
            ))}
            {contacts.length > 10 && (
              <div className="text-sm text-gray-500 text-center py-2">
                + {contacts.length - 10} more contacts
              </div>
            )}
          </div>
        </div>

        {/* Send Button */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-6">
          <div>
            {gmailAuth ? (
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Ready to send</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">Connect Gmail to send</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !gmailAuth}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : `🚀 Send to ${contacts.length} Contacts`}
          </button>
        </div>
      </div>
    </div>
  );
}
