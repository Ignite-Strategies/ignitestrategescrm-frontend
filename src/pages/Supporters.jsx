import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import EditableField from "../components/EditableField";

export default function Supporters() {
  const orgId = getOrgId();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState(new Set());

  useEffect(() => {
    loadContacts();
  }, [orgId]);

  const loadContacts = async () => {
    try {
      const response = await api.get(`/orgs/${orgId}/supporters`);
      setContacts(response.data);
    } catch (error) {
      console.error("Error loading supporters:", error);
    }
  };

  const handleDelete = async (supporterId, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/supporters/${supporterId}`);
      alert(`${name} has been removed from your supporters.`);
      loadContacts();
    } catch (error) {
      alert("Error deleting supporter: " + error.message);
    }
  };

  const handleFieldUpdate = (updatedSupporter) => {
    setContacts(prev => prev.map(contact => 
      contact._id === updatedSupporter._id ? updatedSupporter : contact
    ));
  };

  const engagementOptions = [
    { value: 'general', label: 'General' },
    { value: 'member', label: 'Member' },
    { value: 'donor', label: 'Donor' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'sponsor', label: 'Sponsor' },
    { value: 'partner', label: 'Partner' }
  ];

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
      setSelectedContacts(new Set(filteredContacts.map(c => c._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return;
    
    const contactNames = filteredContacts
      .filter(c => selectedContacts.has(c._id))
      .map(c => `${c.firstName} ${c.lastName}`)
      .join(', ');
    
    if (!confirm(`Are you sure you want to delete ${selectedContacts.size} supporters?\n\n${contactNames}\n\nThis cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedContacts).map(contactId => 
        api.delete(`/supporters/${contactId}`)
      );
      
      await Promise.all(deletePromises);
      alert(`Successfully deleted ${selectedContacts.size} supporters.`);
      setSelectedContacts(new Set());
      loadContacts();
    } catch (error) {
      alert("Error deleting supporters: " + error.message);
    }
  };


  const filteredContacts = contacts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Supporters</h1>
            <p className="text-gray-600 mt-2">
              Your organization's master contact list ({contacts.length} supporters)
            </p>
          </div>
                  <div className="flex gap-3">
                    {selectedContacts.size > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                      >
                        Delete Selected ({selectedContacts.size})
                      </button>
                    )}
                    <button
                      onClick={() => navigate("/supporters/upload")}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                      + Upload CSV
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                      Dashboard
                    </button>
                  </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search supporters..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact._id)}
                        onChange={() => handleSelectContact(contact._id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() => navigate(`/contact/${contact._id}`)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                      >
                        {contact.firstName} {contact.lastName}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableField
                        value={contact.goesBy}
                        field="goesBy"
                        supporterId={contact._id}
                        onUpdate={handleFieldUpdate}
                        placeholder="Nickname"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableField
                        value={contact.email}
                        field="email"
                        supporterId={contact._id}
                        type="email"
                        onUpdate={handleFieldUpdate}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableField
                        value={contact.phone}
                        field="phone"
                        supporterId={contact._id}
                        type="tel"
                        onUpdate={handleFieldUpdate}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableField
                        value={contact.employer}
                        field="employer"
                        supporterId={contact._id}
                        onUpdate={handleFieldUpdate}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <EditableField
                        value={contact.categoryOfEngagement || "general"}
                        field="categoryOfEngagement"
                        supporterId={contact._id}
                        options={engagementOptions}
                        onUpdate={handleFieldUpdate}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(contact._id, `${contact.firstName} ${contact.lastName}`)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {contacts.length === 0 ? "No supporters yet. Upload a CSV to get started." : "No supporters match your search."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

