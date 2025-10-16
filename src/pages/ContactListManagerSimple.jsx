import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * ContactListManager - SIMPLE VERSION
 * Just shows lists and lets you pick which campaign to attach
 */
export default function ContactListManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  
  const campaignId = searchParams.get('campaignId');
  const isInCampaignFlow = !!campaignId;
  
  const [lists, setLists] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);
  const [showCampaignPicker, setShowCampaignPicker] = useState(false);
  
  useEffect(() => {
    loadData();
  }, [orgId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [listsRes, campaignsRes] = await Promise.all([
        api.get(`/contact-lists?orgId=${orgId}`),
        api.get(`/campaigns?orgId=${orgId}`)
      ]);
      
      setLists(listsRes.data || []);
      setCampaigns(campaignsRes.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseList = async (list) => {
    if (isInCampaignFlow) {
      // Direct attach to campaign in URL
      try {
        await api.patch(`/campaigns/${campaignId}`, {
          contactListId: list.id
        });
        navigate(`/campaign-creator?campaignId=${campaignId}&listId=${list.id}`);
      } catch (err) {
        alert('Failed to attach list: ' + err.message);
      }
    } else {
      // Show campaign picker
      setSelectedList(list);
      setShowCampaignPicker(true);
    }
  };
  
  const handleAttachToCampaign = async (campaign) => {
    try {
      await api.patch(`/campaigns/${campaign.id}`, {
        contactListId: selectedList.id
      });
      navigate(`/campaign-creator?campaignId=${campaign.id}&listId=${selectedList.id}`);
    } catch (err) {
      alert('Failed to attach list: ' + err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading your lists...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isInCampaignFlow ? 'Pick Your Contact List' : 'Contact Lists'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isInCampaignFlow 
                  ? 'Select a list for your campaign' 
                  : 'Manage your contact lists'}
              </p>
            </div>
            <button
              onClick={() => navigate(isInCampaignFlow ? `/campaign-creator?campaignId=${campaignId}` : '/campaignhome')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back
            </button>
          </div>
          
          {/* Create New List Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(isInCampaignFlow ? `/contact-list-builder?campaignId=${campaignId}` : '/contact-list-builder')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              + Create New List
            </button>
          </div>
          
          {/* Lists Grid */}
          {lists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No contact lists yet</p>
              <button
                onClick={() => navigate('/contact-list-builder')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Your First List
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map(list => (
                <div key={list.id} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 transition">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{list.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{list.description || 'No description'}</p>
                  
                  <div className="text-2xl font-bold text-indigo-600 mb-4">
                    {list.totalContacts || 0} contacts
                  </div>
                  
                  <button
                    onClick={() => handleUseList(list)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {isInCampaignFlow ? 'Use This List' : 'Use in Campaign'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Campaign Picker Modal */}
      {showCampaignPicker && selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Select Campaign for "{selectedList.name}"
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedList.totalContacts} contacts ready to go
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCampaignPicker(false);
                    setSelectedList(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No campaigns yet</p>
                  <button
                    onClick={() => navigate('/campaign-creator')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create Your First Campaign
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(campaign => (
                    <button
                      key={campaign.id}
                      onClick={() => handleAttachToCampaign(campaign)}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {campaign.contactList 
                              ? `Currently: ${campaign.contactList.name}`
                              : 'No list assigned'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </button>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => navigate('/campaign-creator')}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 text-center"
                    >
                      <div className="text-2xl mb-2">➕</div>
                      <div className="font-semibold text-gray-900">Create New Campaign</div>
                      <div className="text-sm text-gray-600">Start fresh with this list</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

