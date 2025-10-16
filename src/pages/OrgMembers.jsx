/**
 * ⚠️ DEPRECATED - Uses old Supporter model (MongoDB)
 * 
 * TODO: Refactor to OrgMembersDisplay.jsx
 * - Should display Contacts with hasOrgMember = true
 * - Should use /contacts API (Prisma) not /supporters (MongoDB)
 * - Part of "Org Upload UX" refactor
 * 
 * See: DEPRECATION-STATUS.md in backend
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import EditableFieldComponent from "../components/EditableFieldComponent";

export default function OrgMembers() {
  const orgId = getOrgId();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [topEngagers, setTopEngagers] = useState([]);
  const [engagementStats, setEngagementStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    inactive: 0
  });
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    loadContacts();
  }, [orgId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdowns({});
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const loadContacts = async () => {
    try {
      // Load org members with engagementValue
      const response = await api.get(`/orgmembers?orgId=${orgId}`);
      const members = response.data.members || response.data || [];
      console.log('✅ Loaded org members:', members.length);
      
      setContacts(members);
      
      // Load events for dropdown
      const eventsResponse = await api.get(`/events/${orgId}/events`);
      const orgEvents = eventsResponse.data || [];
      setEvents(orgEvents);
      
      // Calculate engagement stats (using new value system: 1-4)
      const stats = {
        total: members.length,
        high: members.filter(m => m.engagementValue === 4).length,
        medium: members.filter(m => m.engagementValue === 3).length,
        low: members.filter(m => m.engagementValue === 2).length,
        inactive: members.filter(m => !m.engagementValue).length  // Only count truly null/undefined as inactive
      };
      setEngagementStats(stats);
      
      // Get top engagers (high engagement + recent activity)
      const topEngagers = members
        .filter(m => m.engagementValue === 4)
        .slice(0, 5)
        .map(member => ({
          ...member,
          displayName: member.goesBy || member.firstName,
          engagementScore: 95 // Mock score for now
        }));
      setTopEngagers(topEngagers);
      
    } catch (error) {
      console.error("Error loading org members:", error);
    }
  };

  const handleDelete = async (contactId, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove their contact record and all related data. This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/contacts/${contactId}`);
      alert(`${name} has been removed from your org members.`);
      loadContacts();
    } catch (error) {
      alert("Error deleting contact: " + error.message);
    }
  };

  const handleFieldUpdate = (updatedMember) => {
    setContacts(prev => prev.map(contact => 
      contact.id === updatedMember.id ? updatedMember : contact
    ));
  };

  // Dropdown functions
  const toggleDropdown = (contactId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [contactId]: !prev[contactId]
    }));
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns({});
  };

  // Delete functions
  const handleDeleteOrgMember = async (orgMemberId, name) => {
    if (!confirm(`Remove ${name} from the organization? They will still exist as a contact.`)) {
      return;
    }

    try {
      await api.delete(`/orgmembers/${orgMemberId}`);
      alert(`${name} has been removed from the organization.`);
      loadContacts();
    } catch (error) {
      alert("Error removing org member: " + error.message);
    }
  };

  const handleDeleteContact = async (contactId, name) => {
    if (!confirm(`Permanently delete ${name}? This will remove them from ALL events and organizations. This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/contacts/${contactId}`);
      alert(`${name} has been permanently deleted.`);
      loadContacts();
    } catch (error) {
      alert("Error deleting contact: " + error.message);
    }
  };

  const engagementOptions = [
    { value: 1, label: 'Undetermined' },
    { value: 2, label: 'Low' },
    { value: 3, label: 'Medium' },
    { value: 4, label: 'High' }
  ];

  const leadershipRoleOptions = [
    { value: 'None', label: 'None' },
    { value: 'Project Lead', label: 'Project Lead' },
    { value: 'Committee', label: 'Committee' },
    { value: 'Board', label: 'Board' }
  ];

  // Helper function to format phone numbers
  const formatPhone = (phone) => {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as 555-555-5555
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // If not 10 digits, return as-is
    return phone;
  };

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return;
    
    const contactNames = filteredContacts
      .filter(c => selectedContacts.has(c.id))
      .map(c => `${c.firstName} ${c.lastName}`)
      .join(', ');
    
    if (!confirm(`Are you sure you want to delete ${selectedContacts.size} org members?\n\n${contactNames}\n\nThis will remove their contact records and all related data. This cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedContacts).map(contactId => 
        api.delete(`/contacts/${contactId}`)
      );
      
      await Promise.all(deletePromises);
      alert(`Successfully deleted ${selectedContacts.size} org members.`);
      setSelectedContacts(new Set());
      loadContacts();
    } catch (error) {
      alert("Error deleting org members: " + error.message);
    }
  };


  const filteredContacts = contacts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-indigo-600 transition"
          >
            Main Dashboard
          </button>
          <span>→</span>
          <button
            onClick={() => navigate("/org-dashboard")}
            className="hover:text-indigo-600 transition"
          >
            Org Dashboard
          </button>
          <span>→</span>
          <span className="text-gray-900 font-medium">Org Members</span>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Org Members</h1>
            <p className="text-gray-600 mt-2">
              Your organization's master contact list ({contacts.length} org members)
            </p>
          </div>
                  <div className="flex gap-3 flex-wrap">
                    {selectedContacts.size > 0 && (
                      <>
                        <button
                          onClick={() => navigate("/create-list", { state: { selectedContacts: Array.from(selectedContacts) } })}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add to List ({selectedContacts.size})
                        </button>
                        <button
                          onClick={() => navigate("/campaignhome")}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Campaign ({selectedContacts.size})
                        </button>
                        <button
                          onClick={handleBulkDelete}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete ({selectedContacts.size})
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate("/orgmembermanual")}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Member
                    </button>
                    <button
                      onClick={() => navigate("/org-members/upload")}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload CSV
                    </button>
                    <button
                      onClick={() => navigate("/contacts")}
                      className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                      Contacts
                    </button>
                  </div>
        </div>

        {/* Top Engagers Cards */}
        {topEngagers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Top Engagers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topEngagers.map((engager, index) => (
                <div key={engager.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="text-xs text-yellow-600 font-semibold">
                      {engager.engagementScore}%
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {engager.displayName}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {engager.email}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      High
                    </span>
                    <button
                      onClick={() => navigate(`/contact/${engager.contactId}`)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">{engagementStats.total}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{engagementStats.high}</div>
            <div className="text-sm text-gray-600">High Engagement</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">{engagementStats.medium}</div>
            <div className="text-sm text-gray-600">Medium Engagement</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">{engagementStats.low}</div>
            <div className="text-sm text-gray-600">Low Engagement</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
            <div className="text-2xl font-bold text-gray-600">{engagementStats.inactive}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search org members..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goes By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Years w/ Org</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leadership Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Upcoming Events</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() => navigate(`/contact/${contact.contactId}`)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                      >
                        {contact.firstName} {contact.lastName}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableFieldComponent
                        value={contact.goesBy}
                        field="goesBy"
                        orgMemberId={contact.orgMemberId}
                        onUpdate={handleFieldUpdate}
                        placeholder="Nickname"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableFieldComponent
                        value={contact.email}
                        field="email"
                        orgMemberId={contact.orgMemberId}
                        type="email"
                        onUpdate={handleFieldUpdate}
                        placeholder="email@example.com"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableFieldComponent
                        value={contact.phone}
                        field="phone"
                        orgMemberId={contact.orgMemberId}
                        type="tel"
                        onUpdate={handleFieldUpdate}
                        placeholder="555-555-5555"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableFieldComponent
                        value={contact.yearsWithOrganization}
                        field="yearsWithOrganization"
                        orgMemberId={contact.orgMemberId}
                        type="number"
                        onUpdate={handleFieldUpdate}
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableFieldComponent
                        value={contact.leadershipRole || 'None'}
                        field="leadershipRole"
                        orgMemberId={contact.orgMemberId}
                        options={leadershipRoleOptions}
                        onUpdate={handleFieldUpdate}
                        placeholder="None"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableFieldComponent
                        value={contact.engagementValue || 1}
                        field="engagementValue"
                        orgMemberId={contact.orgMemberId}
                        options={engagementOptions}
                        onUpdate={handleFieldUpdate}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableFieldComponent
                        value={contact.eventId}
                        field="eventId"
                        contactId={contact.contactId}
                        type="select"
                        onUpdate={loadContacts}
                        options={[
                          { value: '', label: 'None' },
                          ...events.map(event => ({
                            value: event.id,
                            label: event.name
                          }))
                        ]}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate("/send-email", { state: { recipient: contact.email, recipientName: `${contact.firstName} ${contact.lastName}` } })}
                          className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-xs font-medium transition"
                          title="Send 1:1 Email"
                        >
                          Email
                        </button>
                        
                        {/* Delete dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(contact.id);
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-xs font-medium transition"
                            title="Delete Options"
                          >
                            Delete
                          </button>
                          
                          {openDropdowns[contact.id] && (
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOrgMember(contact.orgMemberId, `${contact.firstName} ${contact.lastName}`);
                                  closeAllDropdowns();
                                }}
                                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Remove from Organization
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteContact(contact.contactId, `${contact.firstName} ${contact.lastName}`);
                                  closeAllDropdowns();
                                }}
                                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete Contact Entirely
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {contacts.length === 0 ? "No org members yet. Upload a CSV to get started." : "No org members match your search."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

