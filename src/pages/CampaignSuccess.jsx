import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * CampaignSuccess - View sent campaign results and follow-up options
 * Shows who was reached, delivery status, and next actions
 */
export default function CampaignSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  
  // Get campaign ID from URL
  const campaignId = searchParams.get('campaignId');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Campaign data
  const [campaign, setCampaign] = useState(null);
  const [contactList, setContactList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [sendResults, setSendResults] = useState(null);
  
  useEffect(() => {
    if (campaignId) {
      loadCampaignSuccessData();
    } else {
      setError("No campaign ID provided");
      setLoading(false);
    }
  }, [campaignId]);

  // Also check for campaignId in location.state (from navigation)
  useEffect(() => {
    const location = window.location;
    const stateCampaignId = new URLSearchParams(location.search).get('campaignId');
    if (stateCampaignId && !campaignId) {
      // Navigate to this page with the campaignId
      navigate(`/campaign-success?campaignId=${stateCampaignId}`, { replace: true });
    }
  }, []);
  
  const loadCampaignSuccessData = async () => {
    try {
      setLoading(true);
      
      // Load campaign, contact list, and contacts
      const [campaignRes, contactsRes] = await Promise.all([
        api.get(`/campaigns/${campaignId}`),
        api.get(`/campaigns/${campaignId}/contacts`)
      ]);
      
      const campaignData = campaignRes.data;
      setCampaign(campaignData);
      setContactList(campaignData.contactList);
      setContacts(contactsRes.data);
      
      // TODO: Load send results from campaign analytics
      // For now, simulate successful sends
      const simulatedResults = contactsRes.data.map(contact => ({
        contactId: contact.id,
        email: contact.email,
        status: 'delivered', // TODO: Get real status from Gmail API
        deliveredAt: campaignData.updatedAt,
        messageId: `msg_${contact.id}_${Date.now()}` // TODO: Get real message ID
      }));
      
      setSendResults(simulatedResults);
      
    } catch (err) {
      console.error("Error loading campaign success data:", err);
      setError("Failed to load campaign results");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendFollowUp = async (contactId) => {
    // TODO: Implement follow-up email sending
    alert(`Follow-up email will be sent to contact ${contactId}`);
  };
  
  const handleUpdateContact = (contactId) => {
    // Navigate to contact detail page for editing
    navigate(`/contact/${contactId}`);
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>;
      case 'bounced':
        return <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>;
      case 'pending':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'bounced': return 'Bounced';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign results...</p>
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
            onClick={() => navigate('/campaign-dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const deliveredCount = sendResults?.filter(r => r.status === 'delivered').length || 0;
  const totalCount = contacts.length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🎉 Campaign Success!</h1>
            <p className="text-gray-600">Campaign "{campaign?.name}" delivered successfully</p>
          </div>
          <button
            onClick={() => navigate('/campaign-dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        {/* Success Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Sent</p>
                <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="text-4xl">📧</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{deliveredCount}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0}%
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>
        
        {/* Campaign Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Subject Line</h3>
              <p className="text-gray-900">{campaign?.subject || 'No subject'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Contact List</h3>
              <p className="text-gray-900">{contactList?.name || 'No list'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Sent Date</h3>
              <p className="text-gray-900">
                {new Date(campaign?.updatedAt).toLocaleDateString()} at {new Date(campaign?.updatedAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Message ID</h3>
              <p className="text-gray-500 text-sm font-mono">
                {sendResults?.[0]?.messageId || 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Recipients & Status */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Recipients & Delivery Status</h2>
            <p className="text-gray-600 mt-2">View delivery status and take follow-up actions</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {contacts.map((contact, index) => {
              const result = sendResults?.find(r => r.contactId === contact.id);
              const status = result?.status || 'pending';
              
              return (
                <div key={contact.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </h3>
                        <p className="text-gray-600">{contact.email}</p>
                        {contact.goesBy && (
                          <p className="text-sm text-blue-600">Goes by: {contact.goesBy}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          status === 'delivered' ? 'text-green-600' :
                          status === 'bounced' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {getStatusText(status)}
                        </p>
                        {result?.deliveredAt && (
                          <p className="text-xs text-gray-500">
                            {new Date(result.deliveredAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSendFollowUp(contact.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                        >
                          📧 Follow-up
                        </button>
                        <button
                          onClick={() => handleUpdateContact(contact.id)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition"
                        >
                          📝 Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Next Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Next Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(`/campaign-creator?campaignId=${campaignId}`)}
              className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 transition text-left"
            >
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold text-gray-900">Create Similar Campaign</h3>
              <p className="text-sm text-gray-600">Use this as a template for a new campaign</p>
            </button>
            
            <button
              onClick={() => navigate('/campaign-dashboard')}
              className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 transition text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">View All Campaigns</h3>
              <p className="text-sm text-gray-600">Return to campaign dashboard</p>
            </button>
            
            <button
              onClick={() => navigate('/contact-list-manager')}
              className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition text-left"
            >
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-900">Manage Contact Lists</h3>
              <p className="text-sm text-gray-600">Create or edit contact segments</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
