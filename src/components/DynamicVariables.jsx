import { useState } from "react";

/**
 * Dynamic Variables Picker - Professional token selector
 * Similar to the advanced email tools we saw
 */
export default function DynamicVariables({ onInsertVariable, isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("person");

  const variableCategories = {
    person: {
      label: "Person",
      variables: [
        { key: "firstName", label: "First Name", count: 1, icon: "👤" },
        { key: "lastName", label: "Last Name", count: 1, icon: "👤" },
        { key: "email", label: "Email", count: 1, icon: "📧" },
        { key: "phone", label: "Phone", count: 1, icon: "📞" },
        { key: "jobTitle", label: "Job Title", count: 1, icon: "💼" },
        { key: "company", label: "Company", count: 1, icon: "🏢" }
      ]
    },
    company: {
      label: "Company", 
      variables: [
        { key: "companyName", label: "Company Name", count: 1, icon: "🏢" },
        { key: "industry", label: "Industry", count: 1, icon: "🏭" },
        { key: "size", label: "Company Size", count: 1, icon: "👥" }
      ]
    },
    sender: {
      label: "Sender",
      variables: [
        { key: "senderName", label: "Your Name", count: 1, icon: "✍️" },
        { key: "senderEmail", label: "Your Email", count: 1, icon: "📧" },
        { key: "senderTitle", label: "Your Title", count: 1, icon: "💼" }
      ]
    },
    advanced: {
      label: "Advanced",
      variables: [
        { key: "currentDate", label: "Current Date", count: 1, icon: "📅" },
        { key: "currentTime", label: "Current Time", count: 1, icon: "🕐" },
        { key: "unsubscribe", label: "Unsubscribe Link", count: 1, icon: "🔗" }
      ]
    }
  };

  const filteredVariables = variableCategories[activeTab].variables.filter(variable =>
    variable.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Dynamic Variables</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {Object.entries(variableCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === key
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Variables List */}
        <div className="max-h-64 overflow-y-auto">
          <div className="p-4">
            <div className="text-sm text-gray-600 font-medium mb-3">
              Basic information
            </div>
            <div className="space-y-2">
              {filteredVariables.map((variable) => (
                <button
                  key={variable.key}
                  onClick={() => {
                    onInsertVariable(`{{${variable.key}}}`);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{variable.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{variable.label}</div>
                      <div className="text-xs text-gray-500">{{{variable.key}}}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-400 mr-2">{variable.count}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
