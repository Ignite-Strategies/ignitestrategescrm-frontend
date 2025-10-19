import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrgId } from "../lib/org";
import api from "../lib/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "member"
  });

  useEffect(() => {
    loadAdmins();
  }, [orgId]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/org/${orgId}`);
      setAdmins(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading admins:", error);
      setLoading(false);
    }
  };

  const handleEdit = (admin) => {
    setEditingId(admin.id);
    setEditForm({
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      email: admin.email || "",
      phone: admin.phone || "",
      role: admin.role
    });
  };

  const handleSaveEdit = async (adminId) => {
    try {
      await api.patch(`/admin/${adminId}`, editForm);
      setEditingId(null);
      loadAdmins();
    } catch (error) {
      console.error("Error updating admin:", error);
      alert("Failed to update admin");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (adminId) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    
    try {
      await api.delete(`/admin/${adminId}`);
      loadAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin`, {
        ...addForm,
        orgId,
        status: "active"
      });
      setShowAddForm(false);
      setAddForm({ email: "", firstName: "", lastName: "", role: "member" });
      loadAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("Failed to add admin");
    }
  };

  const handleStatusToggle = async (admin) => {
    try {
      const newStatus = admin.status === "active" ? "deactivated" : "active";
      await api.patch(`/admin/${admin.id}`, { status: newStatus });
      loadAdmins();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-2xl text-slate-600">Loading admins...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">⚙️</div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Admin Settings</h1>
                <p className="text-slate-600 mt-2">Manage team members and permissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition shadow-lg"
            >
              {showAddForm ? "Cancel" : "+ Add Admin"}
            </button>
          </div>
        </div>

        {/* Add Admin Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Admin</h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition"
              >
                Add Admin
              </button>
            </form>
          </div>
        )}

        {/* Admins List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b">
            <h2 className="text-xl font-bold text-slate-900">
              Team Members ({admins.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {admins.map((admin) => (
              <div key={admin.id} className="p-6 hover:bg-slate-50 transition">
                {editingId === admin.id ? (
                  /* EDIT MODE */
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                        <input
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(admin.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {admin.firstName?.[0] || admin.email?.[0] || "?"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {admin.firstName && admin.lastName 
                            ? `${admin.firstName} ${admin.lastName}`
                            : admin.email || "No Name"}
                        </h3>
                        <p className="text-sm text-slate-600">{admin.email}</p>
                        {admin.phone && <p className="text-xs text-slate-500">{admin.phone}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            admin.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                            admin.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {admin.role}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            admin.status === 'active' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {admin.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusToggle(admin)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                          admin.status === 'active'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(admin)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {admins.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Admins Yet</h3>
            <p className="text-slate-600">Add your first team member to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

