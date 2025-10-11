import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ContactManageHome() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [stats, setStats] = useState({
    totalContacts: 0,
    orgMembers: 0,
    prospects: 0
  });
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      // Load contacts
      const contactsResponse = await api.get(`/orgs/${orgId}/org-members`);
      const allContacts = contactsResponse.data || [];
      
      // Calculate stats
      const orgMembers = allContacts.filter(c => c.firebaseId); // Has login = org member
      const prospects = allContacts.filter(c => !c.firebaseId); // No login = prospect
      
      setStats({
        totalContacts: allContacts.length,
        orgMembers: orgMembers.length,
        prospects: prospects.length
      });

      // Load contact lists
      const listsResponse = await api.get(`/contact-lists?orgId=${orgId}`);
      setLists(listsResponse.data || []);
      
    } catch (err) {
      console.error("Error loading contact data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Management</h1>
              <p className="text-gray-600">Your central hub for all contacts and lists</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Stats Overview */}
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Contacts */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
                    <p className="text-sm text-gray-600">Total Contacts</p>
                  </div>
                </div>
              </div>

              {/* Org Members */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.orgMembers}</p>
                    <p className="text-sm text-gray-600">Org Members</p>
                  </div>
                </div>
              </div>

              {/* Most Active (Placeholder) */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">—</p>
                    <p className="text-sm text-gray-600">Most Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Upload Contacts */}
              <button
                onClick={() => navigate("/contacteventmanual")}
                className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition text-left"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">🎯 Upload Contacts</h3>
                    <p className="text-sm text-gray-600">Quick import</p>
                  </div>
                </div>
                <p className="text-sm text-emerald-700">Name, email, phone → map to pipeline</p>
              </button>

              {/* See List */}
              <button
                onClick={() => navigate("/org-members")}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition text-left"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📋 See List</h3>
                    <p className="text-sm text-gray-600">View all contacts</p>
                  </div>
                </div>
                <p className="text-sm text-blue-700">Browse and manage all contacts</p>
              </button>

              {/* Create List */}
              <button
                onClick={() => navigate("/contact-lists")}
                className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition text-left"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📝 Create List</h3>
                    <p className="text-sm text-gray-600">Segment contacts</p>
                  </div>
                </div>
                <p className="text-sm text-purple-700">Create targeted contact lists</p>
              </button>
            </div>
          </div>

          {/* Contact Lists */}
          <div className="border-t pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Contact Lists</h3>
            
            {lists.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No contact lists yet</p>
                <button
                  onClick={() => navigate("/contact-lists")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Create Your First List
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    onClick={() => navigate(`/contact-lists`)}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{list.name}</h4>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {list.totalContacts || 0}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{list.description || "No description"}</p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {list.type || "manual"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="border-t pt-8 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">More Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Org Members Upload */}
              <button
                onClick={() => navigate("/org-members/upload")}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition text-left flex items-center"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">🏢 Upload Org Members</h4>
                  <p className="text-sm text-gray-600">Detailed upload for internal team</p>
                </div>
              </button>

              {/* Manual Entry */}
              <button
                onClick={() => navigate("/org-members/manual")}
                className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition text-left flex items-center"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">➕ Add Manually</h4>
                  <p className="text-sm text-gray-600">Enter single contact</p>
                </div>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">💡 Simple Upload Flow</h4>
                <p className="text-sm text-blue-800">
                  Upload your contacts first, then choose where to assign them. You can assign to multiple places: Org Members, Events, Campaigns, or all of the above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


