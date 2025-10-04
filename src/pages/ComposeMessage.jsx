import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, getGmailAccessToken, isSignedIn, clearAllGoogleAuth } from "../lib/googleAuth";

export default function ComposeMessage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Template, 2: Audience, 3: Compose, 4: Send
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [composeData, setComposeData] = useState({
    subject: "",
    body: "",
    variables: {}
  });
  const [loading, setLoading] = useState(false);
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadTemplates();
    loadContactLists();
    checkGmailAuth();
  }, []);

  const checkGmailAuth = () => {
    const authenticated = isSignedIn();
    setGmailAuthenticated(authenticated);
    if (authenticated) {
      setUserEmail(localStorage.getItem('userEmail') || '');
    }
  };

  const loadTemplates = async () => {
    try {
      const orgId = getOrgId();
      const response = await api.get(`/templates?orgId=${orgId}`);
      setTemplates(response.data);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const loadContactLists = async () => {
    try {
      const orgId = getOrgId();
      const response = await api.get(`/contact-lists?orgId=${orgId}`);
      setContactLists(response.data);
    } catch (error) {
      console.error("Error loading contact lists:", error);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setComposeData({
      subject: template.subject,
      body: template.body,
      variables: {}
    });
    setStep(2);
  };

  const handleListSelect = (list) => {
    setSelectedList(list);
    setStep(3);
  };

  const handleComposeChange = (field, value) => {
    setComposeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGmailAuth = async () => {
    try {
      // Clear any existing auth first to force account selection
      await clearAllGoogleAuth();
      
      const { email, accessToken } = await signInWithGoogle();
      setUserEmail(email);
      setGmailAuthenticated(true);
      alert(`Authenticated with ${email}! You can now send emails.`);
    } catch (error) {
      console.error("Gmail auth error:", error);
      alert("Failed to authenticate with Gmail. Please try again.");
    }
  };

  const handleSend = async () => {
    // Check if Gmail is authenticated
    if (!gmailAuthenticated) {
      alert("Please authenticate with Gmail first to send emails.");
      return;
    }

    setLoading(true);
    try {
      // Get contacts from selected list
      const listResponse = await api.get(`/contact-lists/${selectedList._id}/contacts`);
      const contacts = listResponse.data;

      // Prepare recipients with variables
      const recipients = contacts.map(contact => ({
        email: contact.email,
        variables: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          fullName: `${contact.firstName} ${contact.lastName}`,
          goesBy: contact.goesBy || contact.firstName,
          // Add more variables as needed
        }
      }));

      // Send bulk email
      const emailResponse = await api.post("/email/send-bulk", {
        recipients,
        subject: composeData.subject,
        body: composeData.body,
        templateId: selectedTemplate?._id,
        variables: composeData.variables
      });

      alert(`Email sent successfully from ${userEmail}! ${emailResponse.data.totalSent} emails sent.`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Error sending email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Compose Message</h1>
              <p className="text-gray-600">Send targeted emails to your contacts</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Gmail Authentication Status */}
          <div className="mb-8 p-4 rounded-lg border">
            {gmailAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Gmail Authenticated</span>
                  <span className="text-gray-600">({userEmail})</span>
                </div>
                <button
                  onClick={handleGmailAuth}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                >
                  Switch Account
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Gmail Not Authenticated</span>
                  <span className="text-gray-600">Sign in to send emails</span>
                </div>
                <button
                  onClick={handleGmailAuth}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Authenticate Gmail
                </button>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum 
                      ? "bg-indigo-600 text-white" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNum ? "bg-indigo-600" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Choose Template */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose Your Template</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    onClick={() => handleTemplateSelect(template)}
                    className="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 hover:shadow-md transition cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                    <div className="text-sm text-gray-500">
                      <p><strong>Subject:</strong> {template.subject}</p>
                      <p className="mt-1"><strong>Used:</strong> {template.usageCount} times</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/templates")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  + Create New Template
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Audience */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose Your Audience</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactLists.map((list) => (
                  <div
                    key={list._id}
                    onClick={() => handleListSelect(list)}
                    className="border border-gray-200 rounded-lg p-6 hover:border-indigo-500 hover:shadow-md transition cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{list.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{list.description}</p>
                    <div className="text-sm text-gray-500">
                      <p><strong>Contacts:</strong> {list.totalContacts}</p>
                      <p><strong>Type:</strong> {list.type}</p>
                      <p><strong>Last Updated:</strong> {new Date(list.lastUpdated).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/lists")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  + Create New List
                </button>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  ← Back to Templates
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Compose */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Compose Your Message</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => handleComposeChange("subject", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter email subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Body
                  </label>
                  <textarea
                    rows={12}
                    value={composeData.body}
                    onChange={(e) => handleComposeChange("body", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your message... Use {{firstName}} for personalization"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Available Variables:</h4>
                  <div className="text-sm text-blue-800">
                    <p><code>{{firstName}}</code> - Contact's first name</p>
                    <p><code>{{lastName}}</code> - Contact's last name</p>
                    <p><code>{{fullName}}</code> - Full name</p>
                    <p><code>{{goesBy}}</code> - Preferred name/nickname</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  ← Back to Audience
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Preview & Send →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Preview & Send */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Preview & Send</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Email Preview:</h3>
                <div className="bg-white border border-gray-200 rounded p-4">
                  <p className="text-sm text-gray-600 mb-2">To: {selectedList?.totalContacts} contacts</p>
                  <p className="font-semibold mb-2">Subject: {composeData.subject}</p>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: composeData.body }}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  ← Back to Compose
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : `Send to ${selectedList?.totalContacts} Contacts`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
