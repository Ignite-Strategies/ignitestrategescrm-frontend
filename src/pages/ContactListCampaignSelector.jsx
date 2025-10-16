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
      
      const lists = listsRes.data || [];
      const campaigns = campaignsRes.data || [];
      
      // Enrich lists with campaign status
      const enrichedLists = lists.map(list => {
        const linkedCampaigns = campaigns.filter(c => c.contactListId === list.id);
        const draftCampaigns = linkedCampaigns.filter(c => c.status === 'draft');
        const sentCampaigns = linkedCampaigns.filter(c => c.status === 'sent');
        
        return {
          ...list,
          campaignStatus: {
            totalCampaigns: linkedCampaigns.length,
            draftCampaigns,
            sentCampaigns,
            assigned: linkedCampaigns.length > 0
          }
        };
      });
      
      setLists(enrichedLists);
      setCampaigns(campaigns);
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

  const handleDeleteList = async (listId) => {
    if (!confirm('Delete this list? This cannot be undone.')) return;
    try {
      await api.delete(`/contact-lists/${listId}`);
      loadData(); // Reload lists
    } catch (err) {
      alert('Failed to delete list: ' + err.message);
    }
  };

  const handleDuplicateList = async (list) => {
    try {
      await api.post('/contact-lists', {
        orgId,
        name: `${list.name} (Copy)`,
        description: list.description || `Copy of ${list.name}`,
        type: list.type,
        smartListType: list.smartListType
      });
      loadData(); // Reload lists
    } catch (err) {
      alert('Failed to duplicate list: ' + err.message);
    }
  };

  const handleUnassignList = async (list) => {
    if (!list.campaignStatus?.assigned) return;
    
    const campaignNames = list.campaignStatus.draftCampaigns.map(c => c.name).join(', ');
    if (!confirm(`Unassign "${list.name}" from campaign(s): ${campaignNames}?`)) return;
    
    try {
      // Unassign from all draft campaigns
      for (const campaign of list.campaignStatus.draftCampaigns) {
        await api.patch(`/campaigns/${campaign.id}`, {
          contactListId: null
        });
      }
      loadData(); // Reload lists
    } catch (err) {
      alert('Failed to unassign list: ' + err.message);
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
                      className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 transition"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{list.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{list.description || 'No description'}</p>
                      
                      <div className="text-2xl font-bold text-indigo-600 mb-4">
                        {list.totalContacts || 0} contacts
                      </div>
                      
                      {/* IN USE STATUS */}
                      {list.campaignStatus?.assigned && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            <span className="text-sm font-medium text-orange-800">In Use</span>
                          </div>
                          <div className="text-xs text-orange-700">
                            {list.campaignStatus.draftCampaigns.length > 0 && (
                              <div>Draft: {list.campaignStatus.draftCampaigns.map(c => c.name).join(', ')}</div>
                            )}
                            {list.campaignStatus.sentCampaigns.length > 0 && (
                              <div>Sent: {list.campaignStatus.sentCampaigns.map(c => c.name).join(', ')}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* SIMPLE COLORED BUTTONS */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedList(list);
                          }}
                          className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          Select
                        </button>
                        {list.campaignStatus?.assigned && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnassignList(list);
                            }}
                            className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                          >
                            Unassign
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                          className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateList(list);
                          }}
                          className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Duplicate
                        </button>
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

