import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function ViewForm() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/forms/${formId}`);
      setForm(res.data);
    } catch (error) {
      console.error("Error loading form:", error);
      setError("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/forms/create?editId=${formId}`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      return;
    }
    
    try {
      await api.delete(`/forms/${formId}`);
      navigate("/forms");
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("Failed to delete form");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The form you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/forms")}
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700 transition"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{form.internalName || form.name}</h1>
              <p className="text-gray-600 mt-1">Form Details & Configuration</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleEdit}
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition"
              >
                ✏️ Edit Form
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        {/* Form Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Basic Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Internal Name</label>
                <p className="text-gray-900">{form.internalName || form.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Public Title</label>
                <p className="text-gray-900">{form.publicTitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Slug</label>
                <p className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">{form.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Event</label>
                <p className="text-gray-900">{form.event?.name || "Unknown Event"}</p>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚙️ Configuration</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Audience Type</label>
                <p className="text-gray-900 capitalize">{form.audienceType?.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Target Stage</label>
                <p className="text-gray-900 capitalize">{form.targetStage?.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  form.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Submissions</label>
                <p className="text-gray-900">{form.submissionCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Fields */}
        {form.customFields && form.customFields.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Custom Fields</h2>
            <div className="space-y-4">
              {form.customFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{field.label}</h3>
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Type:</span>
                      <span className="ml-2 text-gray-900 capitalize">{field.fieldType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Required:</span>
                      <span className="ml-2 text-gray-900">{field.isRequired ? 'Yes' : 'No'}</span>
                    </div>
                    {field.placeholder && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-500">Placeholder:</span>
                        <span className="ml-2 text-gray-900">{field.placeholder}</span>
                      </div>
                    )}
                    {field.options && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-500">Options:</span>
                        <div className="mt-1">
                          {JSON.parse(field.options).map((option, i) => (
                            <span key={i} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                              {option.label || option}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Fields */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📝 Standard Fields</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${form.collectName ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-gray-900">Full Name</span>
            </div>
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${form.collectEmail ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-gray-900">Email Address</span>
            </div>
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${form.collectPhone ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-gray-900">Phone Number</span>
            </div>
          </div>
        </div>

        {/* Form URL */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">🔗 Form URL</h2>
          <div className="flex items-center justify-between bg-white p-3 rounded-lg">
            <code className="text-gray-700 flex-1 truncate">
              https://ticketing.f3capitalimpact.org/forms/{form.slug}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://ticketing.f3capitalimpact.org/forms/${form.slug}`);
                alert("Form URL copied to clipboard!");
              }}
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition"
            >
              📋 Copy URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
