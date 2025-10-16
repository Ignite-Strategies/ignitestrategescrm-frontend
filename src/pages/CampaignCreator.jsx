import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, isGmailAuthenticated } from "../lib/googleAuth";

/**
 * CampaignCreator - Clean rebuild
 * Accepts campaignId from state OR params (backward compat), but cleans URL
 */
export default function CampaignCreator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const orgId = getOrgId();

  // Check if we're loading an existing campaign (no ghost flash!)
  const incomingCampaignId = location.state?.campaignId || searchParams.get("campaignId");

  // Pure state - no URL pollution
  const [campaignId, setCampaignId] = useState(null);
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [contactList, setContactList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [availableLists, setAvailableLists] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(!!incomingCampaignId); // Start loading if campaignId present!
  const [error, setError] = useState("");
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  
  // PDF Attachment state
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // On mount: grab campaignId from state OR params, clean URL
  useEffect(() => {
    // Priority 1: location.state (clean approach)
    const stateCampaignId = location.state?.campaignId;
    if (stateCampaignId) {
      console.log("📦 Received campaignId from state:", stateCampaignId);
      setCampaignId(stateCampaignId);
      // Don't call loadInitialData here - let the campaignId useEffect handle it
      return;
    }
    
    // Priority 2: URL param (backward compat), but CLEAN IT!
    const paramCampaignId = searchParams.get("campaignId");
    if (paramCampaignId) {
      console.log("🧹 Found param, grabbing and cleaning URL...");
      setCampaignId(paramCampaignId);
      setSearchParams({}); // CLEAR THE URL!
      // Don't call loadInitialData here - let the campaignId useEffect handle it
      return;
    }
    
    // Only load initial data if no campaignId (new campaign flow)
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load campaign data when campaignId is set
  useEffect(() => {
    if (campaignId) {
      console.log("🔄 campaignId changed, loading data...");
      setError(""); // CLEAR ANY PREVIOUS ERRORS!
      setLoading(true); // Show loading state
      loadInitialData(); // Load lists first
      loadCampaignData(); // Then load campaign
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
      const [listsRes, campaignsRes] = await Promise.all([
        api.get(`/contact-lists?orgId=${orgId}`),
        api.get(`/campaigns?orgId=${orgId}`)
      ]);
      
      const lists = listsRes.data || [];
      const campaigns = campaignsRes.data || [];
      
      // Add conflict detection to lists
      const enrichedLists = lists.map(list => {
        const linkedCampaigns = campaigns.filter(c => c.contactListId === list.id);
        const draftCampaigns = linkedCampaigns.filter(c => c.status === 'draft');
        const sentCampaigns = linkedCampaigns.filter(c => c.status === 'sent');
        const activeCampaigns = linkedCampaigns.filter(c => c.status === 'active');
        
        // Determine conflict level
        let conflictLevel = 'none';
        let conflictMessage = '';
        
        if (draftCampaigns.length > 0) {
          conflictLevel = 'draft';
          conflictMessage = `⚠️ In draft campaign${draftCampaigns.length > 1 ? 's' : ''}: ${draftCampaigns.map(c => c.name).join(', ')}`;
        } else if (sentCampaigns.length > 0) {
          conflictLevel = 'sent';
          conflictMessage = `🚨 Sent in campaign${sentCampaigns.length > 1 ? 's' : ''}: ${sentCampaigns.map(c => c.name).join(', ')}`;
        } else if (activeCampaigns.length > 0) {
          conflictLevel = 'active';
          conflictMessage = `🔄 Active in campaign${activeCampaigns.length > 1 ? 's' : ''}: ${activeCampaigns.map(c => c.name).join(', ')}`;
        }
        
        return {
          ...list,
          campaignStatus: {
            assigned: draftCampaigns.length > 0,
            used: sentCampaigns.length > 0 || activeCampaigns.length > 0,
            totalCampaigns: linkedCampaigns.length,
            draftCampaigns,
            sentCampaigns,
            activeCampaigns,
            conflictLevel,
            conflictMessage
          }
        };
      });
      
      setAvailableLists(enrichedLists);
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
      // No alert - just flow to next step!
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
      
      // No alert - UI updates automatically!
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
      // No alert - status shows in UI!
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
      console.log("🎯 Navigating to REAL preview with state...");

      // Navigate to REAL preview with state (NO URL PARAMS!)
      navigate("/campaign-preview", { state: { campaignId, attachments } });
    } catch (err) {
      console.error("Save failed:", err);
      setError(`Failed to save: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  // Handle PDF file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log('📎 File selected:', file);
    
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    
    console.log('📎 File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // Only allow PDFs
    if (file.type !== 'application/pdf') {
      console.log('❌ Not a PDF file:', file.type);
      setError('Please select a PDF file');
      return;
    }
    
    // Check file size (max 5MB for backend compatibility)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      setError('File size must be less than 5MB for backend compatibility');
      return;
    }
    
    try {
      setUploadingFile(true);
      setError("");
      console.log('📎 Starting file upload...');
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Content = e.target.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
        
        const newAttachment = {
          filename: file.name,
          contentType: 'application/pdf',
          content: base64Content
        };
        
        console.log('📎 Adding attachment:', newAttachment.filename);
        setAttachments(prev => {
          const updated = [...prev, newAttachment];
          console.log('📎 Updated attachments:', updated.length);
          return updated;
        });
        setUploadingFile(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('❌ Error uploading file:', err);
      setError('Failed to upload file');
      setUploadingFile(false);
    }
  };
  
  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
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
              📧 Create Campaign
            </h1>
            <p className="text-gray-600">Build and send your email campaign</p>
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
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a Contact List
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Choose from your existing lists or create a new one. We'll show you which lists are available and which are in use.
                  </p>
                  <button
                    onClick={() => navigate("/contact-list-manager")}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    📋 Manage Contact Lists
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

        {/* Step 4: PDF Attachments */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            4. Add PDF Attachments (Optional)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach PDF Files (Flyers, Documents, etc.)
              </label>
              
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {uploadingFile ? "Uploading..." : "Click to upload PDF files"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Max 10MB per file</span>
                </label>
              </div>
              
              {/* Attached Files List */}
              {attachments.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Attached Files:</h3>
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{attachment.filename}</span>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

