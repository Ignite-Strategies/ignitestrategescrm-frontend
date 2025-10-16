import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, isGmailAuthenticated } from "../lib/googleAuth";

/**
 * CampaignCreatorV2 - REBUILT FROM SCRATCH
 * NO URL PARAMS EVER! Pure state management
 */
export default function CampaignCreatorV2() {
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = getOrgId();

  // Pure state - no URL pollution
  const [campaignId, setCampaignId] = useState(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [contactList, setContactList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [availableLists, setAvailableLists] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);

  // On mount: check if we came from another page with state
  useEffect(() => {
    const stateCampaignId = location.state?.campaignId;
    if (stateCampaignId) {
      console.log("📦 Received campaignId from navigation state:", stateCampaignId);
      setCampaignId(stateCampaignId);
    }
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load campaign data when campaignId changes
  useEffect(() => {
    if (campaignId) {
      loadCampaignData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      checkGmailAuth();
      await loadAvailableLists();
    } catch (err) {
      console.error("Error loading initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkGmailAuth = () => {
    const authenticated = isGmailAuthenticated();
    setGmailAuthenticated(authenticated);
  };

  const loadCampaignData = async () => {
    try {
      console.log("🔄 Loading campaign:", campaignId);
      const response = await api.get(`/campaigns/${campaignId}`);
      const campaign = response.data;

      setCampaignName(campaign.name);
      setCampaignDescription(campaign.description || "");
      setSubject(campaign.subject || "");
      setMessage(campaign.body || "");

      // Load contact list if attached
      if (campaign.contactListId) {
        await loadContactList(campaign.contactListId);
        await loadContacts(campaign.contactListId);
      }

      console.log("✅ Campaign loaded:", campaign.name);
    } catch (err) {
      console.error("Error loading campaign:", err);
      setError("Failed to load campaign");
    }
  };

  const loadAvailableLists = async () => {
    try {
      const response = await api.get(`/contact-lists?orgId=${orgId}`);
      setAvailableLists(response.data);
    } catch (err) {
      console.error("Error loading lists:", err);
    }
  };

  const loadContactList = async (listId) => {
    try {
      const response = await api.get(`/contact-lists/${listId}`);
      setContactList(response.data);
    } catch (err) {
      console.error("Error loading contact list:", err);
    }
  };

  const loadContacts = async (listId) => {
    try {
      const response = await api.get(`/contact-lists/${listId}/contacts`);
      setContacts(response.data);
      console.log("✅ Loaded contacts:", response.data.length);
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
        description: campaignDescription.trim() || `Campaign created ${new Date().toLocaleDateString()}`,
        status: "draft",
      });

      const campaign = response.data;
      console.log("✅ Campaign created:", campaign.id);
      setCampaignId(campaign.id);
      alert(`✅ Campaign "${campaignName}" created!`);
    } catch (err) {
      console.error("Error creating campaign:", err);
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
      // Attach list to campaign
      await api.patch(`/campaigns/${campaignId}`, {
        contactListId: list.id,
      });

      // Load the list and contacts
      await loadContactList(list.id);
      await loadContacts(list.id);
      
      alert(`✅ List "${list.name}" attached!`);
    } catch (err) {
      console.error("Error assigning list:", err);
      setError(err.response?.data?.error || "Failed to assign list");
    } finally {
      setLoading(false);
    }
  };

  const handleGmailAuth = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      checkGmailAuth();
      alert("✅ Gmail authenticated!");
    } catch (err) {
      console.error("Gmail auth error:", err);
      setError("Failed to authenticate with Gmail");
    } finally {
      setLoading(false);
    }
  };

  const insertToken = (token) => {
    setMessage((prev) => prev + `{{${token}}}`);
  };

  const handlePreview = async () => {
    if (!campaignId) {
      setError("Please create your campaign first (Step 1)");
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setError("Please fill in subject and message");
      return;
    }

    try {
      setLoading(true);
      console.log("💾 Saving campaign content...");

      // Save content
      await api.patch(`/campaigns/${campaignId}`, {
        subject,
        body: message,
      });

      console.log("✅ Content saved!");
      console.log("🎯 Navigating to preview with state...");

      // Navigate with state (NO URL PARAMS!)
      navigate("/preview-test", { state: { campaignId } });
    } catch (err) {
      console.error("Save failed:", err);
      setError(`Failed to save: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  const handleStartNew = () => {
    setCampaignId(null);
    setCampaignName("");
    setCampaignDescription("");
    setContactList(null);
    setContacts([]);
    setSubject("");
    setMessage("");
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📧 Campaign Builder V2
            </h1>
            <p className="text-gray-600">Clean slate - no param pollution!</p>
          </div>
          <button
            onClick={() => navigate("/campaignhome")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Gmail Auth Warning */}
        {!gmailAuthenticated && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-yellow-800">
                ⚠️ Gmail not connected. Connect to send campaigns.
              </span>
              <button
                onClick={handleGmailAuth}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Connect Gmail
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Campaign Name */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            1. Campaign Name
          </h2>

          {campaignId ? (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <h4 className="font-medium text-gray-900">{campaignName}</h4>
                <p className="text-sm text-gray-600">ID: {campaignId}</p>
              </div>
              <button
                onClick={handleStartNew}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
              >
                Start New
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter campaign name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleCreateCampaign}
                disabled={!campaignName.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                Create Campaign
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Pick List */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            2. Pick a Contact List
          </h2>

          {contactList ? (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <h4 className="font-medium text-gray-900">{contactList.name}</h4>
                <p className="text-sm text-gray-600">{contacts.length} contacts</p>
              </div>
              <button
                onClick={() => {
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
              {availableLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleSelectList(list)}
                      className="p-4 border rounded-lg text-left hover:bg-gray-50"
                    >
                      <h4 className="font-medium text-gray-900">{list.name}</h4>
                      <p className="text-sm text-gray-600">
                        {list.type === "smart" ? "🔮 Smart List" : "📋 Custom List"}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No lists available. Create one first!</p>
              )}
              <button
                onClick={() => navigate("/contact-list-builder")}
                className="w-full px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
              >
                + Create New List
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Create a campaign first (Step 1)</p>
          )}
        </div>

        {/* Step 3: Write Message */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            3. Write Your Message
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={!campaignId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message Body
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => insertToken("firstName")}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  disabled={!campaignId}
                >
                  + First Name
                </button>
                <button
                  onClick={() => insertToken("lastName")}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  disabled={!campaignId}
                >
                  + Last Name
                </button>
                <button
                  onClick={() => insertToken("goesBy")}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  disabled={!campaignId}
                >
                  + Goes By
                </button>
                <button
                  onClick={() => insertToken("email")}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  disabled={!campaignId}
                >
                  + Email
                </button>
              </div>
              <textarea
                placeholder="Hi {{firstName}},&#10;&#10;This is your personalized message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                disabled={!campaignId}
              />
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <button
            onClick={handlePreview}
            disabled={!campaignId || !subject.trim() || !message.trim()}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-lg font-medium"
          >
            {!campaignId
              ? "Create Campaign First"
              : !subject.trim() || !message.trim()
              ? "Fill in Subject & Message"
              : "Preview Campaign →"}
          </button>
        </div>
      </div>
    </div>
  );
}

