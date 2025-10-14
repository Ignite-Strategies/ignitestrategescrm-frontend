import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, isSignedIn, getGmailAccessToken } from "../lib/googleAuth";

/**
 * Sequence.jsx - Step 3: Build Your Message & Send
 * Everything hydrates here: campaign, contact list, message body
 * Future: timing controls, follow-ups, etc.
 */
export default function Sequence() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  
  // Get IDs from URL
  const campaignId = searchParams.get('campaignId');
  const listId = searchParams.get('listId');
  
  // Data states
  const [campaign, setCampaign] = useState(null);
  const [contactList, setContactList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  
  // Form states
  const [sequenceName, setSequenceName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!campaignId || !listId) {
      setError("Missing campaign or list ID. Please start from Campaign Creator.");
      setLoading(false);
      return;
    }
    
    loadCampaignData();
    loadContactListData();
    loadContacts();
    checkGmailAuth();
  }, [campaignId, listId]);

  const loadCampaignData = async () => {
    try {
      const response = await api.get(`/campaigns/${campaignId}?orgId=${orgId}`);
      setCampaign(response.data);
      setSequenceName(`${response.data.name} - Sequence 1`);
    } catch (err) {
      console.error("Error loading campaign:", err);
      setError("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const loadContactListData = async () => {
    try {
      const response = await api.get(`/contact-lists/${listId}`);
      setContactList(response.data);
    } catch (err) {
      console.error("Error loading contact list:", err);
      setError("Failed to load contact list");
    }
  };

  const loadContacts = async () => {
    try {
      const response = await api.get(`/contact-lists/${listId}/contacts`);
      setContacts(response.data);
      console.log(`✅ Loaded ${response.data.length} contacts`);
    } catch (err) {
      console.error("Error loading contacts:", err);
    }
  };

  const checkGmailAuth = () => {
    const token = getGmailAccessToken();
    const gmailEmail = localStorage.getItem('gmailEmail');
    setGmailAuthenticated(!!token && !!gmailEmail);
  };

  const handleGmailAuth = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.accessToken) {
        setGmailAuthenticated(true);
        alert(`✅ Gmail authenticated! You can now send emails via ${result.email}`);
      }
    } catch (error) {
      console.error('❌ Gmail authentication failed:', error);
      alert('❌ Gmail authentication failed. Please try again.');
    }
  };

  const insertToken = (token) => {
    const textarea = document.querySelector('textarea[name="message"]');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const tokenText = `{{${token}}}`;
    const newText = message.substring(0, start) + tokenText + message.substring(end);
    setMessage(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tokenText.length, start + tokenText.length);
    }, 0);
  };

  const handleSendSequence = async () => {
    if (!sequenceName || !subject || !message) {
      setError("Please fill in all fields");
      return;
    }

    if (!gmailAuthenticated) {
      setError("Please connect Gmail first");
      return;
    }

    if (contacts.length === 0) {
      setError("No contacts in this list");
      return;
    }

    setSending(true);
    setError("");

    try {
      // 1. Create the sequence
      console.log("📝 Creating sequence...");
      const sequenceResponse = await api.post("/sequences", {
        campaignId,
        name: sequenceName,
        subject,
        html: message,
        delayDays: 0,
        order: 1
      });

      const sequenceId = sequenceResponse.data.id;
      console.log("✅ Sequence created:", sequenceId);

      // 2. Link campaign to contact list if not already linked
      if (!campaign.contactListId) {
        await api.patch(`/campaigns/${campaignId}`, {
          contactListId: listId
        });
        console.log("✅ Campaign linked to contact list");
      }

      // 3. Confirm send
      const confirmed = confirm(
        `🚀 Ready to launch!\n\n` +
        `Campaign: ${campaign.name}\n` +
        `Recipients: ${contacts.length} contacts\n` +
        `Subject: ${subject}\n\n` +
        `Send now?`
      );

      if (!confirmed) {
        alert("✅ Sequence saved as draft. You can send it later from Campaign Dashboard.");
        navigate("/campaignhome");
        return;
      }

      // 4. Send via Gmail API
      console.log("📤 Sending via Gmail...");
      
      const contactPayload = contacts.map(contact => ({
        id: contact.id,
        firstName: contact.firstName || "Friend",
        lastName: contact.lastName || "",
        email: contact.email
      }));

      const gmailResponse = await api.post("/enterprise-gmail/send-sequence", {
        sequenceId,
        contacts: contactPayload,
        delaySeconds: 2
      });

      console.log("✅ Emails sent:", gmailResponse.data);
      
      alert(
        `🎉 Campaign Launched!\n\n` +
        `✅ ${contacts.length} emails sent successfully\n\n` +
        `Check your Gmail Sent folder to verify.`
      );

      // Clear localStorage
      localStorage.removeItem('currentCampaignId');
      localStorage.removeItem('currentCampaignName');

      navigate("/campaignhome");

    } catch (err) {
      console.error("❌ Error sending sequence:", err);
      setError(err.response?.data?.error || "Failed to send sequence");
      alert(`❌ Failed to send: ${err.response?.data?.error || err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/campaign-creator")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Campaign Creator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header with Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-indigo-600">Step 3: Build Your Message</span>
              <span className="text-sm text-gray-500">100% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: '100%' }}></div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">✉️ Build Your Sequence</h1>
            <p className="text-gray-600">Everything's ready - now craft your message and launch!</p>
          </div>

          {/* Campaign & List Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Campaign</p>
              <p className="text-lg font-semibold text-gray-900">{campaign?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Contact List</p>
              <p className="text-lg font-semibold text-gray-900">
                {contactList?.name} ({contacts.length} contacts)
              </p>
            </div>
          </div>

          {/* Gmail Auth Status */}
          <div className="mb-6 p-4 bg-white border-2 border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${gmailAuthenticated ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <svg className={`w-5 h-5 ${gmailAuthenticated ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Gmail Status</p>
                  <p className="text-sm text-gray-600">
                    {gmailAuthenticated 
                      ? `Connected as ${localStorage.getItem('gmailEmail')}` 
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              {!gmailAuthenticated && (
                <button
                  onClick={handleGmailAuth}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Connect Gmail
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Message Builder */}
          <div className="space-y-6">
            {/* Sequence Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sequence Name
              </label>
              <input
                type="text"
                value={sequenceName}
                onChange={(e) => setSequenceName(e.target.value)}
                placeholder="e.g., Initial Outreach"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter your email subject line"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Message *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => insertToken('firstName')}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition font-medium"
                  >
                    + First Name
                  </button>
                  <button
                    type="button"
                    onClick={() => insertToken('lastName')}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition font-medium"
                  >
                    + Last Name
                  </button>
                </div>
              </div>
              
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                placeholder="Hi {{firstName}},&#10;&#10;Your personalized message goes here...&#10;&#10;Best regards,&#10;Your Name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                required
              />

              {/* Live Preview */}
              {message && message.includes('{{') && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">PREVIEW:</p>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {message
                      .replace(/\{\{firstName\}\}/g, contacts[0]?.firstName || 'John')
                      .replace(/\{\{lastName\}\}/g, contacts[0]?.lastName || 'Doe')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <button
              onClick={() => navigate(`/contact-list-manager?campaignId=${campaignId}`)}
              className="px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-semibold"
            >
              ← Back to Lists
            </button>
            <button
              onClick={handleSendSequence}
              disabled={sending || !gmailAuthenticated || !subject || !message}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-lg shadow-lg flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Launch Campaign
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Ready to launch?</h4>
                <p className="text-sm text-blue-800">
                  Click "Launch Campaign" to send your emails. They'll be sent from your connected Gmail account with personalized variables replaced for each recipient.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

