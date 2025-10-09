import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function Templates() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, [orgId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/templates?orgId=${orgId}`);
      setTemplates(response.data);
    } catch (err) {
      console.error("Error loading templates:", err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const getTemplatesByChannel = (channel) => {
    return templates.filter(t => {
      if (channel === "email") return t.subject; // Has subject = email
      if (channel === "slack") return !t.subject && t.body.length < 500; // No subject, shorter
      if (channel === "sms") return !t.subject && t.body.length < 160; // SMS length
      return false;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Templates</h1>
              <p className="text-gray-600">Set your message, send it, forget it, roll on. 💪</p>
            </div>
            <button
              onClick={() => navigate("/email")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Email Dashboard
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-3">Welcome to Templates</h2>
          <p className="text-white/90 text-lg mb-6">
            Set your message, send it, forget it, roll on. Let's get after it! 🔥
          </p>
          <p className="text-white/80">
            What template would you like to create?
          </p>
        </div>

        {/* Channel Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email Templates */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-indigo-600 p-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Templates</h3>
              <p className="text-white/80 text-sm">Track opens, clicks, and auto-follow up with SendGrid</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {getTemplatesByChannel("email").length} saved templates
              </p>
              <button
                onClick={() => navigate("/templates/email/create")}
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                + Create Email Template
              </button>
              {getTemplatesByChannel("email").length > 0 && (
                <button
                  onClick={() => navigate("/templates/email")}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  View All
                </button>
              )}
            </div>
          </div>

          {/* Slack Templates */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-purple-600 p-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Slack Templates</h3>
              <p className="text-white/80 text-sm">No integration yet - but hey, copy and paste! 📋</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {getTemplatesByChannel("slack").length} saved templates
              </p>
              <button
                onClick={() => navigate("/templates/slack/create")}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                + Create Slack Template
              </button>
              {getTemplatesByChannel("slack").length > 0 && (
                <button
                  onClick={() => navigate("/templates/slack")}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  View All
                </button>
              )}
            </div>
          </div>

          {/* SMS Templates */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-600 p-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">SMS Templates</h3>
              <p className="text-white/80 text-sm">No integration yet - but copy and paste works! 📱</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {getTemplatesByChannel("sms").length} saved templates
              </p>
              <button
                onClick={() => navigate("/templates/sms/create")}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                + Create SMS Template
              </button>
              {getTemplatesByChannel("sms").length > 0 && (
                <button
                  onClick={() => navigate("/templates/sms")}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  View All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip: SendGrid for Email Campaigns</h4>
              <p className="text-sm text-blue-800">
                Even for small lists (15+ emails), SendGrid gives you <strong>automatic tracking</strong> (opens, clicks, replies) 
                and <strong>auto-follow up</strong> if someone doesn't respond. Perfect for your AO leaders and event RSVPs!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}