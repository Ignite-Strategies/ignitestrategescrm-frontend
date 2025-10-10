import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CampaignHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Dashboard</h1>
              <p className="text-gray-600">Send campaigns and personal outreach</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Main Campaign Hub */}
          <div className="mb-12">
            
            {/* 📢 Broadcast Campaign */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition cursor-pointer mb-8"
                 onClick={() => navigate("/campaigns")}>
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-indigo-500 text-white rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 3v12m0 0l-3-3m3 3l3-3" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">📢 Launch Campaign</h2>
                  <p className="text-lg text-gray-600">Send emails to your contact lists</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  Select Contact List
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  Choose Template
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  Customize Message
                </div>
                <div className="flex items-center text-sm text-indigo-600 font-semibold">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  Send to 500+ people
                </div>
              </div>
              
              <div className="mt-6 text-right">
                <span className="inline-flex items-center text-indigo-600 font-semibold">
                  Start Campaign →
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* 📝 Templates */}
            <button
              onClick={() => navigate("/templates")}
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">📝 Templates</h3>
                  <p className="text-sm text-gray-600">Email templates</p>
                </div>
              </div>
              <p className="text-sm text-purple-700">Create reusable email templates</p>
            </button>

            {/* 👥 Contact Lists */}
            <button
              onClick={() => navigate("/contact-lists")}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">👥 Contact Lists</h3>
                  <p className="text-sm text-gray-600">Manage lists</p>
                </div>
              </div>
              <p className="text-sm text-blue-700">Create and manage contact lists</p>
            </button>

            {/* 📊 Analytics */}
            <button
              onClick={() => navigate("/email/analytics")}
              className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">📊 Analytics</h3>
                  <p className="text-sm text-gray-600">Email performance</p>
                </div>
              </div>
              <p className="text-sm text-orange-700">Track opens, clicks, and engagement</p>
            </button>

            {/* 📧 Personal Email */}
            <button
              onClick={() => navigate("/email/outreach")}
              className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">📧 Personal Email</h3>
                  <p className="text-sm text-gray-600">Send 1:1 email</p>
                </div>
              </div>
              <p className="text-sm text-emerald-700">Send personal emails manually</p>
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
