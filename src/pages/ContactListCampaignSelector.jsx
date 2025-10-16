import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * ContactListCampaignSelector - Super Simple
 * 
 * Shows:
 * - All your lists
 * - All your campaigns
 * 
 * Flow:
 * - Want new list? → Go to ContactListBuilder
 * - Want to attach list to campaign? → Pick campaign → Go to CampaignCreator
 */
export default function ContactListCampaignSelector() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [lists, setLists] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);
  
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
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedList ? 'Pick Campaign' : 'Contact Lists'}
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedList 
                  ? `Attach "${selectedList.name}" to a campaign`
                  : 'Select a list to use in your campaigns'}
              </p>
            </div>
            <button
              onClick={() => selectedList ? setSelectedList(null) : navigate('/campaignhome')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {selectedList ? '← Back to Lists' : '← Back'}
            </button>
          </div>
        </div>
        
        {!selectedList ? (
          /* LISTS VIEW */
          <>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Contact Lists</h2>
                <button
                  onClick={() => navigate('/contact-list-builder')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  + Create New List
                </button>
              </div>
              
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
                    <div 
                      key={list.id} 
                      className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 transition cursor-pointer"
                      onClick={() => setSelectedList(list)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{list.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{list.description || 'No description'}</p>
                      
                      <div className="text-2xl font-bold text-indigo-600">
                        {list.totalContacts || 0} contacts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* CAMPAIGN PICKER VIEW */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Select Campaign for "{selectedList.name}"
              </h2>
              <p className="text-gray-600">
                {selectedList.totalContacts} contacts • {selectedList.type}
              </p>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
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
        )}
      </div>
    </div>
  );
}

