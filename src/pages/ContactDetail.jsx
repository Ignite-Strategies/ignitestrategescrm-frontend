import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import EditableField from "../components/EditableField";

export default function ContactDetail() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContact();
  }, [contactId]);

  const loadContact = async () => {
    try {
      // For now, we'll get the contact from the supporters list
      // In the future, we could add a dedicated GET /supporters/:id endpoint
      const response = await api.get(`/orgs/${localStorage.getItem('orgId')}/supporters`);
      const foundContact = response.data.find(c => c._id === contactId);
      
      if (foundContact) {
        setContact(foundContact);
      } else {
        alert('Contact not found');
        navigate('/supporters');
      }
    } catch (error) {
      console.error('Error loading contact:', error);
      alert('Error loading contact: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldUpdate = (updatedContact) => {
    setContact(updatedContact);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/supporters/${contactId}`);
      alert(`${contact.firstName} ${contact.lastName} has been deleted.`);
      navigate('/supporters');
    } catch (error) {
      alert('Error deleting contact: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contact...</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact Not Found</h1>
          <button
            onClick={() => navigate('/supporters')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Supporters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate('/supporters')}
              className="text-indigo-600 hover:text-indigo-800 mb-4"
            >
              ← Back to Supporters
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {contact.firstName} {contact.lastName}
            </h1>
            {contact.goesBy && (
              <p className="text-lg text-gray-600">"{contact.goesBy}"</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Delete Contact
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <EditableField
                  value={contact.firstName}
                  field="firstName"
                  supporterId={contact._id}
                  onUpdate={handleFieldUpdate}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goes By</label>
                <EditableField
                  value={contact.goesBy}
                  field="goesBy"
                  supporterId={contact._id}
                  onUpdate={handleFieldUpdate}
                  placeholder="Nickname"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <EditableField
                  value={contact.lastName}
                  field="lastName"
                  supporterId={contact._id}
                  onUpdate={handleFieldUpdate}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <EditableField
                  value={contact.email}
                  field="email"
                  supporterId={contact._id}
                  type="email"
                  onUpdate={handleFieldUpdate}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <EditableField
                  value={contact.phone}
                  field="phone"
                  supporterId={contact._id}
                  type="tel"
                  onUpdate={handleFieldUpdate}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <EditableField
                  value={contact.street}
                  field="street"
                  supporterId={contact._id}
                  onUpdate={handleFieldUpdate}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <EditableField
                  value={contact.city}
                  field="city"
                  supporterId={contact._id}
                  onUpdate={handleFieldUpdate}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <EditableField
                  value={contact.state}
                  field="state"
                  supporterId={contact._id}
                  onUpdate={handleFieldUpdate}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <EditableField
                  value={contact.zip}
                  field="zip"
                  supporterId={contact._id}
                  onUpdate={handleFieldUpdate}
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
                <EditableField
                  value={contact.employer}
                  field="employer"
                  supporterId={contact._id}
                  onUpdate={handleFieldUpdate}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years With Organization</label>
                <EditableField
                  value={contact.yearsWithOrganization}
                  field="yearsWithOrganization"
                  supporterId={contact._id}
                  type="number"
                  onUpdate={handleFieldUpdate}
                />
              </div>
            </div>
          </div>

          {/* Engagement Category */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Category</label>
            <EditableField
              value={contact.categoryOfEngagement || "general"}
              field="categoryOfEngagement"
              supporterId={contact._id}
              options={[
                { value: 'general', label: 'General' },
                { value: 'member', label: 'Member' },
                { value: 'donor', label: 'Donor' },
                { value: 'volunteer', label: 'Volunteer' },
                { value: 'sponsor', label: 'Sponsor' },
                { value: 'partner', label: 'Partner' }
              ]}
              onUpdate={handleFieldUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
