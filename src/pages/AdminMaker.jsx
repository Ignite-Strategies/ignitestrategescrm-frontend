import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function AdminMaker() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔧 Creating new admin:", formData);
      
      // Create Contact record first
      const contactRes = await api.post("/contacts", {
        orgId: orgId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: null
      });
      
      const contact = contactRes.data;
      console.log("✅ Contact created:", contact.id);
      
      // Create OrgMember record
      const orgMemberRes = await api.post("/orgmembers", {
        orgId: orgId,
        contactId: contact.id,
        role: "admin",
        firebaseId: null, // They'll sign up with Firebase later
        photoURL: null
      });
      
      const orgMember = orgMemberRes.data;
      console.log("✅ OrgMember created:", orgMember.id);
      
      // Create Admin record
      const adminRes = await api.post("/admins", {
        orgId: orgId,
        contactId: contact.id,
        role: "admin",
        permissions: {
          canCreateForms: true,
          canEditForms: true,
          canDeleteForms: false,
          canManageUsers: false,
          canViewAnalytics: true
        },
        isActive: true
      });
      
      const admin = adminRes.data;
      console.log("✅ Admin created:", admin.id);
      
      // Success!
      alert(`✅ Admin created successfully!\n\nName: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\n\nThey can now sign in with their Google account.`);
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: ""
      });
      
    } catch (err) {
      console.error("❌ Error creating admin:", err);
      setError("Failed to create admin: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Admin</h1>
          <p className="text-gray-600 mt-2">Add a new administrator to your organization</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.smith@example.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                They'll use this email to sign in with Google
              </p>
            </div>

            {/* Admin Permissions Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Admin Permissions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Can create and edit forms</li>
                <li>✅ Can view analytics</li>
                <li>❌ Cannot delete forms</li>
                <li>❌ Cannot manage other users</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Admin...
                  </>
                ) : (
                  "Create Admin"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">How it works:</h3>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li>1. We create their profile in the system</li>
            <li>2. They receive an email invitation (if configured)</li>
            <li>3. They sign in with their Google account</li>
            <li>4. They're automatically linked to their admin profile</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
