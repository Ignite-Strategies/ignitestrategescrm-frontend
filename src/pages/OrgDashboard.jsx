import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function OrgDashboard() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [org, setOrg] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    highEngagement: 0,
    mediumEngagement: 0,
    lowEngagement: 0
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedOrg, setEditedOrg] = useState({
    name: '',
    mission: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load org details
      const orgRes = await api.get(`/orgs/${orgId}`);
      setOrg(orgRes.data);
      setEditedOrg({
        name: orgRes.data.name || '',
        mission: orgRes.data.mission || '',
        description: orgRes.data.description || ''
      });
      
      // 🔥 HYDRATION RULE: Always hydrate OrgMembers to localStorage when landing on OrgDashboard
      const orgMembersRes = await api.get(`/orgmembers?orgId=${orgId}`);
      const members = orgMembersRes.data.members || [];
      
      // Cache to localStorage
      localStorage.setItem(`org_${orgId}_members`, JSON.stringify(members));
      console.log('✅ ORG DASHBOARD HYDRATION: Cached', members.length, 'org members');
      
      // Calculate stats
      const activeMembers = members.filter(m => m.engagementValue && m.engagementValue > 1);
      const inactiveMembers = members.filter(m => !m.engagementValue || m.engagementValue === 1);
      const highEngagement = members.filter(m => m.engagementValue === 4);
      const mediumEngagement = members.filter(m => m.engagementValue === 3);
      const lowEngagement = members.filter(m => m.engagementValue === 2);
      
      setStats({
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        inactiveMembers: inactiveMembers.length,
        highEngagement: highEngagement.length,
        mediumEngagement: mediumEngagement.length,
        lowEngagement: lowEngagement.length
      });
      
    } catch (error) {
      console.error("Error loading org dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrg = async () => {
    try {
      await api.patch(`/orgs/${orgId}`, editedOrg);
      setOrg({ ...org, ...editedOrg });
      setEditMode(false);
      alert('✅ Organization details updated!');
    } catch (error) {
      console.error('Error saving org:', error);
      alert('❌ Failed to save organization details');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate("/dashboard")}
              className="hover:text-indigo-600 transition"
            >
              Main Dashboard
            </button>
            <span>→</span>
            <span className="text-gray-900 font-medium">Organization Dashboard</span>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1">
              {editMode ? (
                <div>
                  <input
                    type="text"
                    value={editedOrg.name}
                    onChange={(e) => setEditedOrg({...editedOrg, name: e.target.value})}
                    className="text-3xl font-bold text-gray-900 mb-2 border-b-2 border-indigo-500 focus:outline-none w-full"
                    placeholder="Organization Name"
                  />
                  <input
                    type="text"
                    value={editedOrg.mission}
                    onChange={(e) => setEditedOrg({...editedOrg, mission: e.target.value})}
                    className="text-gray-600 border-b border-gray-300 focus:outline-none w-full"
                    placeholder="Mission Statement"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    🏢 {org?.name || 'Organization'}
                  </h1>
                  <p className="text-gray-600">{org?.mission || 'No mission statement'}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {editMode ? (
                <>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedOrg({
                        name: org?.name || '',
                        mission: org?.mission || '',
                        description: org?.description || ''
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOrg}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    💾 Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 border border-indigo-300 rounded-lg text-indigo-700 hover:bg-indigo-50 transition"
                  >
                    ✏️ Edit Org
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Org Description */}
          {editMode ? (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization Description</label>
              <textarea
                value={editedOrg.description}
                onChange={(e) => setEditedOrg({...editedOrg, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Tell your story - what does your organization do?"
              />
            </div>
          ) : org?.description && (
            <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-gray-700">{org.description}</p>
            </div>
          )}

          {/* Stats Overview */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📊 Membership Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Members */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                    <p className="text-sm text-gray-600">Total Members</p>
                  </div>
                </div>
              </div>

              {/* Active Members */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
                    <p className="text-sm text-gray-600">Active Members</p>
                  </div>
                </div>
              </div>

              {/* Inactive Members */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.inactiveMembers}</p>
                    <p className="text-sm text-gray-600">Inactive Members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Breakdown */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">🔥 Engagement Levels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* High Engagement */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <span className="text-xl font-bold">🔥</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.highEngagement}</p>
                    <p className="text-sm text-gray-600">High Engagement</p>
                  </div>
                </div>
              </div>

              {/* Medium Engagement */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <span className="text-xl font-bold">⚡</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.mediumEngagement}</p>
                    <p className="text-sm text-gray-600">Medium Engagement</p>
                  </div>
                </div>
              </div>

              {/* Low Engagement */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <span className="text-xl font-bold">❄️</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.lowEngagement}</p>
                    <p className="text-sm text-gray-600">Low Engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Member Management */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">👥 Member Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* View All Members - PRIMARY */}
              <button
                onClick={() => navigate("/org-members")}
                className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition text-left border-2 border-indigo-500"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">👥 See Members</h3>
                    <p className="text-sm text-indigo-100">{stats.totalMembers} members</p>
                  </div>
                </div>
                <p className="text-sm text-indigo-100">View & edit member details</p>
              </button>

              {/* Upload Members */}
              <button
                onClick={() => navigate("/org-members/upload")}
                className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition text-left"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📤 Upload Members</h3>
                    <p className="text-sm text-gray-600">Bulk import</p>
                  </div>
                </div>
                <p className="text-sm text-emerald-700">Upload members via CSV</p>
              </button>

              {/* Add Manually */}
              <button
                onClick={() => navigate("/org-members/manual")}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition text-left"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">➕ Add Member</h3>
                    <p className="text-sm text-gray-600">Single entry</p>
                  </div>
                </div>
                <p className="text-sm text-blue-700">Add one member at a time</p>
              </button>
            </div>
          </div>

          {/* Communications & Features */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📧 Communications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Send Newsletter */}
              <button
                onClick={() => {
                  // Navigate to email campaigns page
                  navigate("/contact-lists");
                  alert("💡 Create a contact list of your members, then send them a newsletter!");
                }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition text-left"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📧 Send Newsletter</h3>
                    <p className="text-sm text-gray-600">Email all members</p>
                  </div>
                </div>
                <p className="text-sm text-purple-700">Create & send newsletters to your org</p>
              </button>

              {/* Announcements (Coming Soon) */}
              <button
                onClick={() => alert("🚧 Announcements feature coming soon!\n\nThis will let you post updates that all members see when they log in.")}
                className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition text-left relative"
              >
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">Soon</span>
                </div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📢 Announcements</h3>
                    <p className="text-sm text-gray-600">Post updates</p>
                  </div>
                </div>
                <p className="text-sm text-orange-700">Post announcements for your members</p>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-indigo-900 mb-1">💡 Organization Members</h4>
                <p className="text-sm text-indigo-800">
                  These are your core organization members - the people who make things happen! Track their engagement, leadership roles, and involvement in events.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

