import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function OrgMembersUploadPreview() {
  const navigate = useNavigate();
  const [orgId] = useState(() => localStorage.getItem('orgId'));
  const [file, setFile] = useState(() => {
    const savedFile = localStorage.getItem('uploadFile');
    return savedFile ? JSON.parse(savedFile) : null;
  });
  
  const [fieldMapping, setFieldMapping] = useState([]);
  const [csvPreviewData, setCsvPreviewData] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Load preview from backend
  useEffect(() => {
    const loadPreview = async () => {
      if (file && file.content) {
        const formData = new FormData();
        const blob = new Blob([file.content], { type: 'text/csv' });
        formData.append('file', blob, file.name);
        formData.append('uploadType', 'orgMember');
        formData.append('orgId', orgId);

        const response = await api.post('/contacts/upload/preview', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          const mappings = response.data.fieldMappingSuggestions.map(suggestion => ({
            csvHeader: suggestion.csvHeader,
            mappedField: suggestion.suggestedField
          }));
          setFieldMapping(mappings);
          
          const previewRows = response.data.preview.map(record => {
            return mappings.map(mapping => record[mapping.mappedField] || '');
          });
          setCsvPreviewData(previewRows);
        }
      }
    };

    loadPreview();
  }, [file, orgId]);

  const handleUpload = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      const blob = new Blob([file.content], { type: 'text/csv' });
      formData.append('file', blob, file.name);
      formData.append('uploadType', 'orgMember');
      formData.append('orgId', orgId);

      const response = await api.post('/contacts/upload/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        navigate('/org-members/upload/complete', { 
          state: { results: response.data } 
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!file) {
    return <div>No file found. Please go back and upload a file.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Preview & Import</h1>
          <p className="text-gray-600 mt-2">Review your data before importing</p>
        </div>

        {/* Field Mapping */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Field Mapping</h2>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CSV Column</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maps To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fieldMapping.map((field, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {field.csvHeader}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {field.mappedField}
                    </td>
                    <td className="px-4 py-3">
                      {field.mappedField === 'unmapped' ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Not Mapped
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ✓ Mapped
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Preview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Data Preview</h2>
          
          {csvPreviewData.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {fieldMapping.map((field, idx) => (
                      <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {field.csvHeader}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {csvPreviewData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-3 py-2 text-gray-700">
                          {cell || <span className="text-gray-400 italic">empty</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No data preview available</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/org-members/upload")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {uploading ? "Importing..." : "Import My Contacts"}
          </button>
        </div>

      </div>
    </div>
  );
}
