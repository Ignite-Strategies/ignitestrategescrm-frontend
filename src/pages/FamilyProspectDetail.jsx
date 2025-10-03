import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import EditableField from "../components/EditableField";

export default function FamilyProspectDetail() {
  const { prospectId } = useParams();
  const navigate = useNavigate();
  const [prospect, setProspect] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProspect();
  }, [prospectId]);

  const loadProspect = async () => {
    try {
      const response = await api.get(`/family-prospects/${prospectId}`);
      setProspect(response.data);
    } catch (error) {
      console.error("Error loading prospect:", error);
      alert("Error loading prospect: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldUpdate = (updatedProspect) => {
    setProspect(updatedProspect);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prospect details...</p>
        </div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Prospect Not Found</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {prospect.firstName} {prospect.lastName}
              </h1>
              <p className="text-gray-600 mt-1">Family Prospect Details</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <EditableField
                    value={prospect.firstName}
                    field="firstName"
                    prospectId={prospect._id}
                    onUpdate={handleFieldUpdate}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <EditableField
                    value={prospect.lastName}
                    field="lastName"
                    prospectId={prospect._id}
                    onUpdate={handleFieldUpdate}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <EditableField
                    value={prospect.email}
                    field="email"
                    prospectId={prospect._id}
                    onUpdate={handleFieldUpdate}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <EditableField
                    value={prospect.phone}
                    field="phone"
                    prospectId={prospect._id}
                    onUpdate={handleFieldUpdate}
                  />
                </div>
              </div>
            </div>

            {/* Relationship Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Relationship Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">How do you know them?</label>
                  <EditableField
                    value={prospect.relationshipToMember}
                    field="relationshipToMember"
                    prospectId={prospect._id}
                    type="select"
                    options={[
                      { value: "friend", label: "Friend" },
                      { value: "co_worker", label: "Co-worker" },
                      { value: "neighbor", label: "Neighbor" },
                      { value: "family_member", label: "Family Member" },
                      { value: "spouse", label: "Spouse" },
                      { value: "acquaintance", label: "Acquaintance" },
                      { value: "other", label: "Other" }
                    ]}
                    onUpdate={handleFieldUpdate}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">How did you meet?</label>
                  <EditableField
                    value={prospect.howDidYouMeet}
                    field="howDidYouMeet"
                    prospectId={prospect._id}
                    type="select"
                    options={[
                      { value: "work", label: "Work" },
                      { value: "neighborhood", label: "Neighborhood" },
                      { value: "gym", label: "Gym" },
                      { value: "church", label: "Church" },
                      { value: "school", label: "School" },
                      { value: "mutual_friend", label: "Mutual Friend" },
                      { value: "social_media", label: "Social Media" },
                      { value: "event", label: "Event" },
                      { value: "other", label: "Other" }
                    ]}
                    onUpdate={handleFieldUpdate}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Interest</label>
                  <EditableField
                    value={prospect.eventInterest}
                    field="eventInterest"
                    prospectId={prospect._id}
                    type="select"
                    options={[
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" }
                    ]}
                    onUpdate={handleFieldUpdate}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <EditableField
                    value={prospect.notes}
                    field="notes"
                    prospectId={prospect._id}
                    type="textarea"
                    onUpdate={handleFieldUpdate}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Member Who Invited */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">F3 Member Connection</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                <span className="font-semibold">Invited by:</span> {prospect.memberName || "Unknown F3 Member"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
