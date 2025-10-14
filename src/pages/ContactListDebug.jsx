import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Debug Contact List Manager - Let's see what's actually happening
 */
export default function ContactListDebug() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  
  useEffect(() => {
    loadLists();
  }, [orgId]);
  
  const loadLists = async () => {
    try {
      setLoading(true);
      setError("");
      setDebugInfo(`Loading lists for orgId: ${orgId}`);
      
      console.log("🔍 DEBUG: Loading contact lists...");
      console.log("🔍 DEBUG: orgId:", orgId);
      
      const response = await api.get(`/contact-lists?orgId=${orgId}`);
      
      console.log("🔍 DEBUG: API Response:", response);
      console.log("🔍 DEBUG: Response data:", response.data);
      console.log("🔍 DEBUG: Response status:", response.status);
      
      setLists(response.data || []);
      setDebugInfo(`Loaded ${response.data?.length || 0} lists. Raw response: ${JSON.stringify(response.data, null, 2)}`);
      
    } catch (err) {
      console.error("❌ DEBUG: Error loading lists:", err);
      setError(`Failed to load contact lists: ${err.message}`);
      setDebugInfo(`Error: ${JSON.stringify(err, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteList = async (listId) => {
    if (!window.confirm(`Are you sure you want to delete list ${listId}?`)) return;
    
    try {
      console.log("🗑️ DEBUG: Deleting list:", listId);
      await api.delete(`/contact-lists/${listId}`);
      
      // Reload lists
      await loadLists();
      setDebugInfo(`Deleted list ${listId} and reloaded`);
      
    } catch (err) {
      console.error("❌ DEBUG: Error deleting list:", err);
      setError(`Failed to delete list: ${err.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact lists...</p>
          <p className="text-sm text-gray-500 mt-2">{debugInfo}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">🔍 Contact List Debug</h1>
            <div className="flex gap-2">
              <button
                onClick={loadLists}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh
              </button>
              <button
                onClick={() => navigate("/contact-list-manager")}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Manager
              </button>
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="bg-gray-50 rounded p-4 mb-4">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
          
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {/* Org ID */}
          <div className="bg-blue-50 rounded p-4 mb-4">
            <p className="text-blue-700"><strong>Org ID:</strong> {orgId}</p>
          </div>
        </div>
        
        {/* Lists */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Contact Lists ({lists.length})</h2>
          
          {lists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No contact lists found</p>
              <button
                onClick={() => navigate("/contact-list-builder")}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Create First List
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {lists.map((list, index) => (
                <div key={list.id || index} className="border rounded p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{list.name}</h3>
                      <p className="text-sm text-gray-600">ID: {list.id}</p>
                      <p className="text-sm text-gray-600">Type: {list.type}</p>
                      <p className="text-sm text-gray-600">Description: {list.description}</p>
                      <p className="text-sm text-gray-600">Total Contacts: {list.totalContacts || 0}</p>
                      <p className="text-sm text-gray-600">Active: {list.isActive ? 'Yes' : 'No'}</p>
                      <p className="text-sm text-gray-600">Created: {list.createdAt}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Raw Data */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-600">Raw Data</summary>
                    <pre className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(list, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
