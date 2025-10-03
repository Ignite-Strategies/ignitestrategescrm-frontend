import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function OrgUsers() {
  const orgId = getOrgId();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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

  const downloadTemplate = () => {
    const template = `name,email,phone,type,tags
John Doe,john@example.com,555-1234,individual,"f3:ao,monthly_donor"
Jane Smith,jane@example.com,555-5678,individual,"volunteer"
Acme Corp,contact@acme.com,555-9999,corporate,"sponsor,local_business"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supporters_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(`/orgs/${orgId}/supporters/csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert(`Success! Inserted: ${response.data.inserted}, Updated: ${response.data.updated}`);
      loadContacts();
    } catch (error) {
      const errorMsg = error.response?.data?.details 
        ? `Errors found:\n${error.response.data.details.map(e => `Line ${e.line}: ${e.error}`).join('\n')}`
        : error.message;
      alert("Error uploading CSV:\n" + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Organization's Supporters</h1>
            <p className="text-gray-600 mt-2 max-w-3xl">
              Take the time to ingest your members—those who give for official membership, 
              regularly donate, or just support your cause on a routine basis.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Return to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Upload Supporters via CSV</h3>
              <button
                onClick={downloadTemplate}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                📥 Download Template
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 mb-2 font-semibold">Required Fields:</p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4">
                <li>• <code className="bg-blue-100 px-1 rounded">name</code> - Full name</li>
                <li>• <code className="bg-blue-100 px-1 rounded">email</code> - Email address (must be unique)</li>
              </ul>
              <p className="text-sm text-blue-900 mt-3 mb-2 font-semibold">Optional Fields:</p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4">
                <li>• <code className="bg-blue-100 px-1 rounded">phone</code> - Phone number</li>
                <li>• <code className="bg-blue-100 px-1 rounded">type</code> - individual | family | corporate | foundation</li>
                <li>• <code className="bg-blue-100 px-1 rounded">tags</code> - Tags in quotes: "f3:ao,monthly_donor"</li>
              </ul>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
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

