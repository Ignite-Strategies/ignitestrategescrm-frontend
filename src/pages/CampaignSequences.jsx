import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function CampaignSequences() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  
  const [campaign, setCampaign] = useState(null);
  const [sequences, setSequences] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedSequences, setSelectedSequences] = useState(new Set());
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [activeTab, setActiveTab] = useState("emails");
  const [showAddSequence, setShowAddSequence] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    html: "",
    delayDays: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [contactFilter, setContactFilter] = useState("all");

  useEffect(() => {
    loadCampaign();
    loadSequences();
    loadContacts();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const orgId = getOrgId();
      const response = await api.get(`/campaigns/${campaignId}?orgId=${orgId}`);
      setCampaign(response.data);
    } catch (err) {
      console.error("Error loading campaign:", err);
      setError("Failed to load campaign");
    }
  };

  const loadSequences = async () => {
    console.log(`📋 Loading sequences for campaign ${campaignId}`);
    try {
      const orgId = getOrgId();
      const response = await api.get(`/sequences?campaignId=${campaignId}&orgId=${orgId}`);
      console.log("✅ Sequences loaded:", response.data);
      setSequences(response.data);
    } catch (err) {
      console.error("❌ Error loading sequences:", err);
      console.error("❌ Error details:", err.response?.data);
      setError(`Failed to load sequences: ${err.response?.data?.error || err.message}`);
    }
  };

  const loadContacts = async () => {
    try {
      if (campaign?.contactListId) {
        const response = await api.get(`/contact-lists/${campaign.contactListId}/contacts`);
        setContacts(response.data);
      }
    } catch (err) {
      console.error("Error loading contacts:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSequence = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/sequences", {
        campaignId,
        ...formData,
        order: sequences.length + 1
      });
      setSequences([...sequences, response.data]);
      setFormData({ name: "", subject: "", html: "", delayDays: 0 });
      setShowAddSequence(false);
    } catch (err) {
      console.error("Error adding sequence:", err);
      setError(err.response?.data?.error || "Failed to add sequence");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSequence = async (sequenceId) => {
    setLoading(true);
    setError("");
    try {
      await api.post(`/sequences/${sequenceId}/send`);
      loadSequences(); // Refresh to get updated status
      alert("Sequence sent successfully!");
    } catch (err) {
      console.error("Error sending sequence:", err);
      setError(err.response?.data?.error || "Failed to send sequence");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSequence = async (sequenceId, currentStatus) => {
    const newStatus = currentStatus === 'sent' ? 'paused' : 'sent';
    console.log(`🔄 Toggling sequence ${sequenceId} from ${currentStatus} to ${newStatus}`);
    
    try {
      const response = await api.patch(`/sequences/${sequenceId}`, { status: newStatus });
      console.log("✅ Toggle response:", response.data);
      loadSequences();
      alert(`✅ Sequence ${newStatus === 'sent' ? 'activated' : 'paused'} successfully!`);
    } catch (err) {
      console.error("❌ Error toggling sequence:", err);
      console.error("❌ Error details:", err.response?.data);
      setError(`Failed to update sequence status: ${err.response?.data?.error || err.message}`);
      alert(`❌ Failed to toggle sequence: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSelectSequence = (sequenceId) => {
    const newSelected = new Set(selectedSequences);
    if (newSelected.has(sequenceId)) {
      newSelected.delete(sequenceId);
    } else {
      newSelected.add(sequenceId);
    }
    setSelectedSequences(newSelected);
  };

  const handleEditSequence = (sequenceId) => {
    console.log(`✏️ Editing sequence ${sequenceId}`);
    // Navigate to sequence creator to edit this sequence
    navigate(`/sequence-creator?editId=${sequenceId}`);
  };

  const handleSelectAll = () => {
    if (selectedSequences.size === filteredSequences.length) {
      setSelectedSequences(new Set());
    } else {
      setSelectedSequences(new Set(filteredSequences.map(s => s.id)));
    }
  };

  const handleSelectContact = (contactId) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  // Filter sequences
  const filteredSequences = sequences.filter(seq => {
    const matchesSearch = seq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seq.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || seq.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get contact status counts
  const getContactStatusCounts = () => {
    const counts = {
      total: contacts.length,
      cold: 0,
      replied: 0,
      interested: 0,
      notInterested: 0,
      unresponsive: 0,
      doNotContact: 0,
      badData: 0,
      changedJob: 0,
      open: 0,
      openDeal: 0
    };
    
    // TODO: Implement actual status logic based on email events
    // For now, return placeholder counts
    return counts;
  };

  const statusCounts = getContactStatusCounts();

  if (!campaign) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <nav className="text-sm text-gray-500 mb-1">
              <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate("/campaignhome")}>Campaigns</span>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{campaign.name}</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {campaign.name}
              <svg className="w-5 h-5 ml-2 text-gray-400 hover:text-yellow-500 cursor-pointer" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </h1>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            Share
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: "emails", label: "Emails" },
              { id: "contacts", label: "Contacts" },
              { id: "analytics", label: "Analytics" },
              { id: "settings", label: "Settings" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tab Content */}
      <div className="px-6 py-6">
        
        {/* Emails Tab */}
        {activeTab === "emails" && (
          <div>
            {/* Controls */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Sequences</option>
                  <option value="draft">Draft</option>
                  <option value="sending">Sending</option>
                  <option value="sent">Sent</option>
                  <option value="paused">Paused</option>
                </select>
                
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                  Show Filters
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search sequences..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                  Sort
                </button>
                
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                  View Options
                </button>
              </div>
            </div>

            {/* Apollo-Style Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedSequences.size === filteredSequences.length && filteredSequences.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIVATE</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DELAY</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DELIVERED</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OPENED</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLICKED</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REPLIED</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSequences.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-4 py-12 text-center text-gray-500">
                          {searchTerm || filterStatus !== "all" 
                            ? "No sequences match your filters" 
                            : "No sequences yet. Create your first sequence!"
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredSequences.map((sequence) => (
                        <tr key={sequence.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedSequences.has(sequence.id)}
                              onChange={() => handleSelectSequence(sequence.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-500">
                              {sequence.status === 'sent' ? '✅ Sent' : '📝 Draft'}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{sequence.name}</div>
                              <div className="text-sm text-gray-500">{sequence.subject}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {sequence.delayDays} days
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              sequence.status === 'sent' ? 'bg-green-100 text-green-800' :
                              sequence.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                              sequence.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {sequence.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {sequence.sequenceContacts?.filter(sc => sc.status === 'delivered').length || 0}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {sequence.sequenceContacts?.filter(sc => sc.openedAt).length || 0}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {sequence.sequenceContacts?.filter(sc => sc.clickedAt).length || 0}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {sequence.sequenceContacts?.filter(sc => sc.status === 'responded').length || 0}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-500">
                                {sequence.status === 'sent' ? '✅ Sent' : '📝 Draft'}
                              </div>
                              <button 
                                onClick={() => handleEditSequence(sequence.id)}
                                className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition"
                              >
                                Edit
                              </button>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Sequence Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAddSequence(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                + Add New Sequence
              </button>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <div>
            {/* Contact Status Bar */}
            <div className="mb-6">
              <div className="flex items-center gap-6 mb-4">
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                  Show Filters
                </button>
                
                <div className="flex items-center gap-4 text-sm">
                  <button 
                    onClick={() => setContactFilter("all")}
                    className={`px-3 py-1 rounded-full ${contactFilter === "all" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    Total ({statusCounts.total})
                  </button>
                  <button 
                    onClick={() => setContactFilter("cold")}
                    className={`px-3 py-1 rounded-full ${contactFilter === "cold" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    Cold ({statusCounts.cold})
                  </button>
                  <button 
                    onClick={() => setContactFilter("replied")}
                    className={`px-3 py-1 rounded-full ${contactFilter === "replied" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    Replied ({statusCounts.replied})
                  </button>
                  <button 
                    onClick={() => setContactFilter("interested")}
                    className={`px-3 py-1 rounded-full ${contactFilter === "interested" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    Interested ({statusCounts.interested})
                  </button>
                  <button 
                    onClick={() => setContactFilter("unresponsive")}
                    className={`px-3 py-1 rounded-full ${contactFilter === "unresponsive" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    Unresponsive ({statusCounts.unresponsive})
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                  onChange={handleSelectAllContacts}
                  className="rounded border-gray-300"
                />
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600" title="Stop">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600" title="Pause">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600" title="Play">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600" title="More">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No contacts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                            onChange={handleSelectAllContacts}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAST EMAIL</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RESPONSE</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedContacts.has(contact.id)}
                              onChange={() => handleSelectContact(contact.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 mr-3">
                                {contact.firstName?.[0]}{contact.lastName?.[0]}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {contact.firstName} {contact.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">{contact.email}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Cold
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">Never</td>
                          <td className="px-4 py-4 text-sm text-gray-500">-</td>
                          <td className="px-4 py-4">
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500">Detailed analytics coming soon!</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Settings</h3>
            <p className="text-gray-500">Campaign configuration coming soon!</p>
          </div>
        )}
      </div>

      {/* Add Sequence Modal */}
      {showAddSequence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Sequence</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sequence Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Initial Invite"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delay Days</label>
                <input
                  type="number"
                  name="delayDays"
                  value={formData.delayDays}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Email subject line"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Body (HTML)</label>
                <textarea
                  name="html"
                  value={formData.html}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Email content with HTML. Use {{firstName}} for personalization."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddSequence(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSequence}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {loading ? "Adding..." : "Add Sequence"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}