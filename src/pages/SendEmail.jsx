import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { connectGmail, isGmailConnected } from "../lib/googleAuth";

export default function SendEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listId = searchParams.get("listId");
  const orgId = getOrgId();
  
  const [contacts, setContacts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // Email data
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    checkGmailAuth();
    if (listId) {
      loadContacts();
    }
  }, [listId]);

  const checkGmailAuth = () => {
    const authenticated = isSignedIn();
    setGmailAuthenticated(authenticated);
    if (authenticated) {
      setUserEmail(localStorage.getItem('userEmail') || '');
    }
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contact-lists/${listId}/contacts`);
      setContacts(response.data);
    } catch (err) {
      console.error("Error loading contacts:", err);
      alert("Failed to load contacts");
      navigate("/contact-lists");
    } finally {
      setLoading(false);
    }
  };

  const handleGmailAuth = async () => {
    setSending(true);
    try {
      const result = await signInWithGoogle();
      setUserEmail(result.email);
      setGmailAuthenticated(true);
      alert(`Authenticated with ${result.email}!`);
    } catch (error) {
      console.error("Gmail auth error:", error);
      alert("Failed to authenticate with Gmail.");
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    if (!gmailAuthenticated) {
      alert("Please authenticate with Gmail first");
      return;
    }

    if (!subject.trim() || !body.trim()) {
      alert("Please enter subject and message");
      return;
    }

    const currentContact = contacts[currentIndex];
    
    if (!currentContact.email) {
      alert(`${currentContact.firstName} ${currentContact.lastName} has no email address. Skipping...`);
      handleNext();
      return;
    }

    setSending(true);
    try {
      // Personalize the message
      const personalizedSubject = subject
        .replace(/{{firstName}}/g, currentContact.firstName)
        .replace(/{{lastName}}/g, currentContact.lastName)
        .replace(/{{goesBy}}/g, currentContact.goesBy || currentContact.firstName);
      
      const personalizedBody = body
        .replace(/{{firstName}}/g, currentContact.firstName)
        .replace(/{{lastName}}/g, currentContact.lastName)
        .replace(/{{goesBy}}/g, currentContact.goesBy || currentContact.firstName);

      // Send email
      await api.post("/email/send", {
        to: currentContact.email,
        subject: personalizedSubject,
        body: personalizedBody
      });

      setSentCount(sentCount + 1);
      
      // Success - move to next
      setTimeout(() => {
        handleNext();
      }, 500);
      
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Try again?");
    } finally {
      setSending(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < contacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All done!
      alert(`🎉 Campaign complete! Sent ${sentCount + 1} emails.`);
      navigate("/email");
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">No contacts found in this list.</p>
          <button
            onClick={() => navigate("/contact-lists")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Contact Lists
          </button>
        </div>
      </div>
    );
  }

  const currentContact = contacts[currentIndex];
  const progress = ((currentIndex + 1) / contacts.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Send Emails</h1>
              <p className="text-gray-600">Review and send to each contact</p>
            </div>
            <button
              onClick={() => navigate("/contact-lists")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">
                Contact {currentIndex + 1} of {contacts.length}
              </p>
              <p className="text-sm font-medium text-indigo-600">
                {sentCount} sent
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Gmail Auth Status */}
          {!gmailAuthenticated && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-yellow-800 font-medium">Please authenticate with Gmail to send emails</span>
                </div>
                <button
                  onClick={handleGmailAuth}
                  disabled={sending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Authenticate Gmail
                </button>
              </div>
            </div>
          )}

          {/* Current Contact Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-indigo-200">
            <h2 className="text-sm font-medium text-indigo-600 mb-2">SENDING TO:</h2>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {currentContact.goesBy || currentContact.firstName} {currentContact.lastName}
            </h3>
            <p className="text-gray-600">{currentContact.email}</p>
            {currentContact.phone && (
              <p className="text-gray-500 text-sm mt-1">{currentContact.phone}</p>
            )}
          </div>

          {/* Email Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Quick question about the event"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder={`Hi ${currentContact.goesBy || currentContact.firstName},\n\nYour message here...`}
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 Use {'{{firstName}}'}, {'{{goesBy}}'}, {'{{lastName}}'} - they'll be replaced automatically
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Skip This Person
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleSend}
                disabled={sending || !gmailAuthenticated || !subject.trim() || !body.trim()}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "✓ Send & Next"}
              </button>
            </div>
          </div>

          {/* Preview of personalization */}
          {(subject.includes('{{') || body.includes('{{')) && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Preview (personalized):</h4>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {subject
                    .replace(/{{firstName}}/g, currentContact.firstName)
                    .replace(/{{lastName}}/g, currentContact.lastName)
                    .replace(/{{goesBy}}/g, currentContact.goesBy || currentContact.firstName)}
                </p>
                <p className="whitespace-pre-wrap">
                  {body
                    .replace(/{{firstName}}/g, currentContact.firstName)
                    .replace(/{{lastName}}/g, currentContact.lastName)
                    .replace(/{{goesBy}}/g, currentContact.goesBy || currentContact.firstName)
                    .substring(0, 200)}...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

