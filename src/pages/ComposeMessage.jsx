import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, getGmailAccessToken, isSignedIn, signOutUser } from "../lib/googleAuth";

export default function ComposeMessage() {
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState({
    title: "",
    audience: null,
    template: null,
    subject: "",
    body: "",
    scheduleType: "now", // "now" or "schedule"
    scheduledDate: "",
    scheduledTime: "",
    autoFollowUp: false,
    followUpDays: 4
  });
  const [templates, setTemplates] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkGmailAuth();
  }, []);

  const checkGmailAuth = () => {
    const authenticated = isSignedIn();
    setGmailAuthenticated(authenticated);
    if (authenticated) {
      setUserEmail(localStorage.getItem('userEmail') || '');
    }
  };

  const loadTemplates = async () => {
    try {
      const orgId = getOrgId();
      const response = await api.get(`/templates?orgId=${orgId}`);
      setTemplates(response.data);
    } catch (error) {
      console.error("Error loading templates:", error);
      // Don't show error to user, just log it
    }
  };

  const loadContactLists = async () => {
    try {
      const orgId = getOrgId();
      const response = await api.get(`/contact-lists?orgId=${orgId}`);
      setContactLists(response.data);
    } catch (error) {
      console.error("Error loading contact lists:", error);
      // Don't show error to user, just log it
    }
  };

  const updateCampaignData = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (template) => {
    updateCampaignData("template", template);
    updateCampaignData("subject", template.subject);
    updateCampaignData("body", template.body);
  };

  const handleAudienceSelect = (list) => {
    updateCampaignData("audience", list);
  };

  const handleGmailAuth = async () => {
    setLoading(true);
    
    try {
      console.log("Starting Gmail auth from ComposeMessage...");
      
      // Use the working Google Auth directly
      const result = await signInWithGoogle();
      console.log("Gmail auth result:", result);
      setUserEmail(result.email);
      setGmailAuthenticated(true);
      alert(`Authenticated with ${result.email}! You can now send emails.`);
    } catch (error) {
      console.error("Gmail auth error:", error);
      alert("Failed to authenticate with Gmail. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    // Check if Gmail is authenticated
    if (!gmailAuthenticated) {
      alert("Please authenticate with Gmail first to send emails.");
      return;
    }

    setLoading(true);
    try {
      // Get contacts from selected list
      const listResponse = await api.get(`/contact-lists/${campaignData.audience._id}/contacts`);
      const contacts = listResponse.data;

      // Prepare recipients with variables
      const recipients = contacts.map(contact => ({
        email: contact.email,
        variables: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          fullName: `${contact.firstName} ${contact.lastName}`,
          goesBy: contact.goesBy || contact.firstName,
          // Add more variables as needed
        }
      }));

      // Send bulk email
      const emailResponse = await api.post("/email/send-bulk", {
        recipients,
        subject: campaignData.subject,
        body: campaignData.body,
        templateId: campaignData.template?._id,
        campaignTitle: campaignData.title,
        scheduleType: campaignData.scheduleType,
        scheduledDate: campaignData.scheduledDate,
        scheduledTime: campaignData.scheduledTime,
        autoFollowUp: campaignData.autoFollowUp,
        followUpDays: campaignData.followUpDays
      });

      alert(`Email sent successfully from ${userEmail}! ${emailResponse.data.totalSent} emails sent.`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Campaign</h1>
              <p className="text-gray-600">Create and send targeted email campaigns</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Gmail Authentication Status */}
          <div className="mb-8 p-4 rounded-lg border">
            {gmailAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Gmail Authenticated</span>
                  <span className="text-gray-600">({userEmail})</span>
                </div>
                <button
                  onClick={handleGmailAuth}
                  disabled={loading}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {loading ? "Re-authenticating..." : "Re-authenticate"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Gmail Not Authenticated</span>
                  <span className="text-gray-600">Sign in to send emails</span>
                </div>
                <button
                  onClick={handleGmailAuth}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : "Authenticate Gmail"}
                </button>
              </div>
            )}
          </div>

          {/* Apollo-style Campaign Builder */}
          <div className="space-y-8">
            {/* 1. Campaign Title */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Campaign Title</h3>
              <input
                type="text"
                value={campaignData.title}
                onChange={(e) => updateCampaignData("title", e.target.value)}
                placeholder="Enter campaign title (e.g., 'Q1 Fundraising Campaign')"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 2. Audience Selection */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Audience</h3>
              {campaignData.audience ? (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h4 className="font-medium text-gray-900">{campaignData.audience.name}</h4>
                    <p className="text-sm text-gray-600">{campaignData.audience.contacts?.length || 0} contacts</p>
                  </div>
                  <button
                    onClick={() => updateCampaignData("audience", null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      loadContactLists();
                      // Show contact list modal
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-gray-600">Select Contact List</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate("/contact-lists")}
                    className="text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    + Create New List
                  </button>
                </div>
              )}
            </div>

            {/* 3. Template Selection */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Template</h3>
              {campaignData.template ? (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h4 className="font-medium text-gray-900">{campaignData.template.name}</h4>
                    <p className="text-sm text-gray-600">{campaignData.template.subject}</p>
                  </div>
                  <button
                    onClick={() => updateCampaignData("template", null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      loadTemplates();
                      // Show template modal
                    }}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-600">Choose Template</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate("/templates/create")}
                    className="text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    + Create New Template
                  </button>
                </div>
              )}
            </div>

            {/* 4. Message Content */}
            {(campaignData.template || campaignData.subject || campaignData.body) && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                    <input
                      type="text"
                      value={campaignData.subject}
                      onChange={(e) => updateCampaignData("subject", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                    <textarea
                      rows={8}
                      value={campaignData.body}
                      onChange={(e) => updateCampaignData("body", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Write your email message here (HTML supported)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Send Options */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Send Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">When to Send</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="now"
                        checked={campaignData.scheduleType === "now"}
                        onChange={(e) => updateCampaignData("scheduleType", e.target.value)}
                        className="mr-2"
                      />
                      Send Now
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="schedule"
                        checked={campaignData.scheduleType === "schedule"}
                        onChange={(e) => updateCampaignData("scheduleType", e.target.value)}
                        className="mr-2"
                      />
                      Schedule for Later
                    </label>
                  </div>
                </div>

                {campaignData.scheduleType === "schedule" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={campaignData.scheduledDate}
                        onChange={(e) => updateCampaignData("scheduledDate", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        value={campaignData.scheduledTime}
                        onChange={(e) => updateCampaignData("scheduledTime", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={campaignData.autoFollowUp}
                      onChange={(e) => updateCampaignData("autoFollowUp", e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-follow up if no response</span>
                  </label>
                  {campaignData.autoFollowUp && (
                    <div className="mt-2 ml-6">
                      <label className="block text-sm text-gray-600 mb-1">Follow up after</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={campaignData.followUpDays}
                          onChange={(e) => updateCampaignData("followUpDays", parseInt(e.target.value))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          min="1"
                          max="30"
                        />
                        <span className="text-sm text-gray-600">days</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSend}
                disabled={loading || !gmailAuthenticated || !campaignData.title || !campaignData.audience || !campaignData.subject || !campaignData.body}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : campaignData.scheduleType === "now" ? "Send Campaign" : "Schedule Campaign"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}