import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * ContactListBuilder - UNIFIED Contact List Creation Hub
 * Main entry point for all list creation methods
 */
export default function ContactListBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  
  // Get campaignId from URL params
  const campaignId = searchParams.get('campaignId');
  const isInCampaignFlow = !!campaignId;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Data state
  const [orgMembers, setOrgMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [allAttendees, setAllAttendees] = useState([]);
  const [paidAttendees, setPaidAttendees] = useState([]);
  
  // REMOVED: Auto-load on mount - we'll load on click instead
  
  const loadOrgMembers = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('📞 Loading org members...');
      const response = await api.get(`/orgmembers?orgId=${orgId}`);
      
      // Handle both array and object response formats
      const orgMembers = Array.isArray(response.data) 
        ? response.data 
        : response.data.members || [];
      
      setOrgMembers(orgMembers);
      console.log('✅ Loaded org members:', orgMembers.length);
      
      return orgMembers; // Return the data so we can use it immediately
      
    } catch (err) {
      console.error("Error loading org members:", err);
      setError("Failed to load org members");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const loadEventAttendees = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('📅 Loading event attendees...');
      const response = await api.get(`/orgs/${orgId}/attendees`);
      
      const attendees = response.data || [];
      setAllAttendees(attendees);
      console.log('✅ Loaded event attendees:', attendees.length);
      
      return attendees; // Return the data so we can use it immediately
      
    } catch (err) {
      console.error("Error loading event attendees:", err);
      setError("Failed to load event attendees");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const loadPaidAttendees = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('💰 Loading paid attendees...');
      const response = await api.get(`/orgs/${orgId}/attendees?stage=paid`);
      
      const attendees = response.data || [];
      setPaidAttendees(attendees);
      console.log('✅ Loaded paid attendees:', attendees.length);
      
      return attendees; // Return the data so we can use it immediately
      
    } catch (err) {
      console.error("Error loading paid attendees:", err);
      setError("Failed to load paid attendees");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleUseList = async (listType, listData) => {
    setLoading(true);
    setError("");
    
    try {
      let response;
      
      switch (listType) {
        case 'org_members':
          // Create the contact list and assign to campaign
          response = await api.post("/contact-lists", {
            orgId,
            name: "All Org Members",
            description: "All organization members",
            type: "smart",
            smartListType: "all_org_members",
            contactCount: orgMembers.length
          });
          break;
          
        case 'all_attendees':
          response = await api.post("/contact-lists", {
            orgId,
            name: "All Event Attendees",
            description: "All contacts from all event pipelines",
            type: "smart", 
            smartListType: "all_event_attendees",
            contactCount: allAttendees.length
          });
          break;
          
        case 'paid_attendees':
          response = await api.post("/contact-lists", {
            orgId,
            name: "Paid Event Attendees", 
            description: "All contacts who have paid across all events",
            type: "smart",
            smartListType: "paid_event_attendees", 
            contactCount: paidAttendees.length
          });
          break;
      }
      
      const listId = response.data.id;
      alert(`✅ Smart list "${listData.name}" created!`);
      
      // Navigate based on flow
      if (isInCampaignFlow) {
        navigate(`/campaign-creator?campaignId=${campaignId}&listId=${listId}`);
      } else {
        navigate('/contact-list-manager');
      }
      
    } catch (err) {
      console.error("Error creating smart list:", err);
      setError(err.response?.data?.error || "Failed to create smart list");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Create A List for Better Targeting</h1>
              <p className="text-gray-600">We'll help you filter and create lists so you can create smart campaigns</p>
              {isInCampaignFlow && (
                <p className="text-sm text-indigo-600 mt-1">
                  Campaign: <span className="font-semibold">{localStorage.getItem('currentCampaignName') || 'Unnamed'}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => {
                if (isInCampaignFlow) {
                  navigate(`/contact-list-manager?campaignId=${campaignId}`);
                } else {
                  navigate("/contact-list-manager");
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>
          
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {/* Main Section - Smart Lists */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose a list we've built and filled for you based on set criteria</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Org Members */}
              <div className="p-8 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 transition group">
                <div className="text-6xl mb-4 text-center">👥</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Org Members</h3>
                <p className="text-gray-600 mb-4 text-center">All organization members and supporters</p>
                
                <div className="text-3xl font-bold text-indigo-600 mb-6 text-center">
                  {orgMembers.length > 0 ? `${orgMembers.length} contacts` : "Click to load"}
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      if (orgMembers.length === 0) {
                        const members = await loadOrgMembers();
                        if (members.length > 0) {
                          navigate(`/contact-list-view?type=org_members${campaignId ? `&campaignId=${campaignId}` : ''}`);
                        }
                      } else {
                        navigate(`/contact-list-view?type=org_members${campaignId ? `&campaignId=${campaignId}` : ''}`);
                      }
                    }}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
                  >
                    {loading ? "🔄 Loading contacts..." : orgMembers.length > 0 ? "View & Modify" : "Load & View"}
                  </button>
                  <button
                    onClick={async () => {
                      if (orgMembers.length === 0) {
                        const members = await loadOrgMembers();
                        if (members.length > 0) {
                          handleUseList('org_members', { name: 'All Org Members' });
                        }
                      } else {
                        handleUseList('org_members', { name: 'All Org Members' });
                      }
                    }}
                    disabled={loading}
                    className="w-full px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-medium text-sm"
                  >
                    {loading ? "Loading..." : orgMembers.length > 0 ? "Use as Is" : "Load & Use"}
                  </button>
                </div>
              </div>

              {/* All Event Attendees */}
              <div className="p-8 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition group">
                <div className="text-6xl mb-4 text-center">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Event Attendees</h3>
                <p className="text-gray-600 mb-4 text-center">All contacts from all event pipelines</p>
                
                <div className="text-3xl font-bold text-purple-600 mb-6 text-center">
                  {allAttendees.length > 0 ? `${allAttendees.length} contacts` : "Click to load"}
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      if (allAttendees.length === 0) {
                        const attendees = await loadEventAttendees();
                        if (attendees.length > 0) {
                          navigate(`/contact-list-view?type=all_attendees${campaignId ? `&campaignId=${campaignId}` : ''}`);
                        }
                      } else {
                        navigate(`/contact-list-view?type=all_attendees${campaignId ? `&campaignId=${campaignId}` : ''}`);
                      }
                    }}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium"
                  >
                    {loading ? "🔄 Loading contacts..." : allAttendees.length > 0 ? "View & Modify" : "Load & View"}
                  </button>
                  <button
                    onClick={async () => {
                      if (allAttendees.length === 0) {
                        const attendees = await loadEventAttendees();
                        if (attendees.length > 0) {
                          handleUseList('all_attendees', { name: 'All Event Attendees' });
                        }
                      } else {
                        handleUseList('all_attendees', { name: 'All Event Attendees' });
                      }
                    }}
                    disabled={loading}
                    className="w-full px-6 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium text-sm"
                  >
                    {loading ? "Loading..." : allAttendees.length > 0 ? "Use as Is" : "Load & Use"}
                  </button>
                </div>
              </div>

              {/* Paid Event Attendees */}
              <div className="p-8 border-2 border-green-200 rounded-lg hover:border-green-400 transition group">
                <div className="text-6xl mb-4 text-center">💰</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Paid Attendees</h3>
                <p className="text-gray-600 mb-4 text-center">All contacts who have paid across all events</p>
                
                <div className="text-3xl font-bold text-green-600 mb-6 text-center">
                  {paidAttendees.length > 0 ? `${paidAttendees.length} contacts` : "Click to load"}
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      if (paidAttendees.length === 0) {
                        const attendees = await loadPaidAttendees();
                        if (attendees.length > 0) {
                          navigate(`/contact-list-view?type=paid_attendees${campaignId ? `&campaignId=${campaignId}` : ''}`);
                        }
                      } else {
                        navigate(`/contact-list-view?type=paid_attendees${campaignId ? `&campaignId=${campaignId}` : ''}`);
                      }
                    }}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                  >
                    {loading ? "🔄 Loading contacts..." : paidAttendees.length > 0 ? "View & Modify" : "Load & View"}
                  </button>
                  <button
                    onClick={async () => {
                      if (paidAttendees.length === 0) {
                        const attendees = await loadPaidAttendees();
                        if (attendees.length > 0) {
                          handleUseList('paid_attendees', { name: 'Paid Event Attendees' });
                        }
                      } else {
                        handleUseList('paid_attendees', { name: 'Paid Event Attendees' });
                      }
                    }}
                    disabled={loading}
                    className="w-full px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium text-sm"
                  >
                    {loading ? "Loading..." : paidAttendees.length > 0 ? "Use as Is" : "Load & Use"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Need to Create a Unique List */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Need to Create a Unique List</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Contacts */}
              <button
                onClick={() => navigate("/org-members/upload")}
                className="p-8 border-2 border-blue-300 rounded-lg hover:border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 text-center transition group shadow-sm"
              >
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">📤 Upload Contacts</h3>
                <p className="text-gray-600 mb-4">Import contacts from a spreadsheet</p>
                <span className="text-sm text-blue-600 font-semibold">🚀 Live Now →</span>
              </button>

              {/* Select Your Filters */}
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 text-center opacity-60 cursor-not-allowed">
                <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">🔍 Select Your Filters</h3>
                <p className="text-gray-500 mb-4">Build custom lists with advanced filtering</p>
                <span className="text-sm text-gray-500 font-semibold">🚧 Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}