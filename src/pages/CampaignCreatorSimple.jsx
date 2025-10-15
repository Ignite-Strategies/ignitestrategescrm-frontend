import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { getGmailAccessToken } from "../lib/googleAuth";

/**
 * SIMPLE Campaign Creator - Just the basics!
 * 1. Campaign Name → Save
 * 2. Pick a List → Simple selection
 * 3. Message → Send
 */
export default function CampaignCreatorSimple() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  // SIMPLE STATE
  const [campaignName, setCampaignName] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  
  useEffect(() => {
    checkGmailAuth();
  }, []);
  
  const checkGmailAuth = () => {
    const token = getGmailAccessToken();
    setGmailAuthenticated(!!token);
  };
  
  const handleSend = async () => {
    if (!campaignName || !selectedList || !subject || !message) {
      alert("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      // Create campaign
      const campaignRes = await api.post("/campaigns", {
        orgId,
        name: campaignName,
        subject,
        body: message,
        status: "draft"
      });
      
      console.log("✅ Campaign created:", campaignRes.data.id);
      
      // Navigate to preview
      navigate(`/campaign-preview?campaignId=${campaignRes.data.id}&listType=${selectedList.type}`);
      
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Failed to create campaign: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Campaign</h1>
          <p className="text-gray-600">Simple 3-step campaign creation</p>
        </div>
        
        {/* STEP 1: Campaign Name */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Campaign Name</h2>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Enter campaign name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* STEP 2: Pick a List */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Pick a List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedList({ name: 'All Org Members', type: 'org_members' })}
              className={`p-4 border-2 rounded-lg text-left transition ${
                selectedList?.type === 'org_members' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold">All Org Members</div>
              <div className="text-sm text-gray-600">All organization members</div>
            </button>
            
            <button
              onClick={() => setSelectedList({ name: 'Event Attendees', type: 'event_attendees' })}
              className={`p-4 border-2 rounded-lg text-left transition ${
                selectedList?.type === 'event_attendees' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-semibold">Event Attendees</div>
              <div className="text-sm text-gray-600">All event attendees</div>
            </button>
          </div>
        </div>
        
        {/* STEP 3: Message */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">3. Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi {{firstName}},&#10;&#10;This is your message..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
        
        {/* SEND BUTTON */}
        <div className="bg-white p-6 rounded-lg shadow">
          <button
            onClick={handleSend}
            disabled={!campaignName || !selectedList || !subject || !message || !gmailAuthenticated}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gmailAuthenticated ? '🚀 Send Campaign' : '❌ Gmail Not Connected'}
          </button>
        </div>
      </div>
    </div>
  );
}
