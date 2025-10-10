import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function CampaignWizard() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    campaignName: "",
    contactListId: "",
    templateId: "",
    subject: "",
    message: ""
  });
  
  const [contactLists, setContactLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      const [listsResponse, templatesResponse, campaignsResponse] = await Promise.all([
        api.get(`/contact-lists?orgId=${orgId}`),
        api.get(`/templates?orgId=${orgId}`),
        api.get(`/campaigns?orgId=${orgId}`)
      ]);
      
      setContactLists(listsResponse.data);
      setTemplates(templatesResponse.data);
      setCampaigns(campaignsResponse.data);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelect = (template) => {
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      subject: template.subject,
      message: template.body
    }));
    setStep(3);
  };

  const handleLaunch = async () => {
    if (!formData.campaignName || !formData.contactListId || !formData.subject || !formData.message) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create campaign
      const campaignResponse = await api.post("/campaigns", {
        orgId,
        name: formData.campaignName,
        description: `Quick launch campaign`,
        contactListId: formData.contactListId
      });

      const campaignId = campaignResponse.data.id;

      // Create first sequence
      await api.post("/sequences", {
        campaignId,
        name: "Launch Email",
        subject: formData.subject,
        html: formData.message,
        delayDays: 0,
        order: 1
      });

      // Send the sequence
      const sequencesResponse = await api.get(`/sequences?campaignId=${campaignId}`);
      const sequenceId = sequencesResponse.data[0].id;
      
      await api.post(`/sequences/${sequenceId}/send`);

      alert(`🚀 Campaign "${formData.campaignName}" launched successfully!`);
      
      // Reset form and reload data
      setFormData({
        campaignName: "",
        contactListId: "",
        templateId: "",
        subject: "",
        message: ""
      });
      setStep(1);
      loadData(); // Reload campaigns to show the new one
    } catch (err) {
      console.error("Error launching campaign:", err);
      setError(err.response?.data?.error || "Failed to launch campaign");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedContactList = () => {
    return contactLists.find(list => list.id === formData.contactListId);
  };

  const getSelectedTemplate = () => {
    return templates.find(template => template.id === formData.templateId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Launch Campaign</h1>
            <p className="text-gray-600">Let's get your bulk email campaign up and running!</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum <= step ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      stepNum < step ? "bg-indigo-600" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Step 1: Campaign Name & Audience */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Campaign Name & Audience</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    name="campaignName"
                    value={formData.campaignName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Bros & Brews 2025 Launch"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Target Audience *
                  </label>
                  
                  {contactLists.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 mb-4">No contact lists found</p>
                      <button
                        onClick={() => navigate("/contact-lists")}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Create Contact List
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contactLists.map(list => (
                        <div
                          key={list.id}
                          onClick={() => setFormData(prev => ({ ...prev, contactListId: list.id }))}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                            formData.contactListId === list.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{list.name}</h3>
                              <p className="text-sm text-gray-600">{list.description || "No description"}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-indigo-600">{list.totalContacts || 0}</span>
                            <span className="text-sm text-gray-500">contacts</span>
                          </div>
                          {formData.contactListId === list.id && (
                            <div className="mt-3 flex items-center text-indigo-600">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium">Selected</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.campaignName || !formData.contactListId}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  Next: Choose Template →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Template */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Choose Template</h2>
                <p className="text-gray-600 mb-6">Pick a template or start from scratch</p>

                {templates.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-4">No templates yet</p>
                    <button
                      onClick={() => navigate("/templates")}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Create Template
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 text-left transition"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-2"><strong>Subject:</strong> {template.subject}</p>
                        <p className="text-sm text-gray-500">{template.body.substring(0, 100)}...</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Start from Scratch
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Subject & Message */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Subject & Message</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your email subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    rows="8"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="<p>Hi {{firstName}},</p><p>We're excited to invite you...</p>"
                    required
                  ></textarea>
                  <p className="mt-2 text-xs text-gray-500">
                    Use {{firstName}}, {{lastName}}, {{email}} for personalization
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!formData.subject || !formData.message}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  Next: Launch →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Launch */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Launch Campaign</h2>

                <div className="p-6 bg-gray-50 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Campaign Summary:</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {formData.campaignName}</p>
                    <p><strong>Audience:</strong> {getSelectedContactList()?.name} ({getSelectedContactList()?.totalContacts} contacts)</p>
                    <p><strong>Subject:</strong> {formData.subject}</p>
                    <p><strong>Template:</strong> {getSelectedTemplate()?.name || "Custom message"}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-800">Ready to launch?</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This will send your email to {getSelectedContactList()?.totalContacts} contacts immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleLaunch}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {loading ? "Launching..." : "🚀 Launch Campaign"}
                </button>
              </div>
            </div>
          )}

          {/* Campaign List at Bottom */}
          <div className="mt-12 border-t pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Campaigns</h3>
            
            {campaigns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No campaigns yet. Create your first one above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => navigate(`/campaignsequences/${campaign.id}`)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">{campaign.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {campaign.contactList?.name} • {campaign.contactList?.totalContacts || 0} contacts
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      {campaign.sequences?.length || 0} sequences • 
                      Created {new Date(campaign.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
