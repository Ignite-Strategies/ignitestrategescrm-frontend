import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function OrgMembersCSVUpload() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [step, setStep] = useState(1); // 1: Upload

  const downloadTemplate = () => {
    const template = `First Name,Goes By,Last Name,Email,Phone,Street,City,State,Zip,Employer,Years With Organization`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Parse headers and save to localStorage for preview page
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(l => l.trim());
    const detectedHeaders = lines[0].split(',').map(h => h.trim());
    
    const fieldMapping = detectedHeaders.map(header => ({
      csvHeader: header,
      mappedField: mapHeaderToField(header)
    }));

    // Save file and mapping data for preview page
    localStorage.setItem('uploadFile', JSON.stringify({
      name: selectedFile.name,
      type: selectedFile.type,
      content: text
    }));
    localStorage.setItem('fieldMapping', JSON.stringify(fieldMapping));
    
    // Navigate to preview page
    navigate("/org-members/upload/preview");
  };

  const mapHeaderToField = (header) => {
    const normalized = header.toLowerCase().trim();
    const fieldMap = {
      'first name': 'firstName',
      'firstname': 'firstName',
      'fname': 'firstName',
      'goes by': 'goesBy',
      'goesby': 'goesBy',
      'nickname': 'goesBy',
      'preferred name': 'goesBy',
      'last name': 'lastName',
      'lastname': 'lastName',
      'lname': 'lastName',
      'email': 'email',
      'email address': 'email',
      'phone': 'phone',
      'phone number': 'phone',
      'street': 'street',
      'street address': 'street',
      'city': 'city',
      'state': 'state',
      'zip': 'zip',
      'zip code': 'zip',
      'employer': 'employer',
      'company': 'employer',
      'organization': 'employer',
      'years with organization': 'yearsWithOrganization',
      'years with org': 'yearsWithOrganization'
    };
    return fieldMap[normalized] || 'unmapped';
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Upload</span>
            </div>
            <div className={`h-px w-20 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Validate</span>
            </div>
            <div className={`h-px w-20 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🏢 Upload Your Core Team</h2>
            <p className="text-gray-600 mb-4">
              Add your internal team members: staff, board, volunteers, and core organizational members.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-blue-900">
                <strong>💡 Looking to add event attendees or prospects?</strong> Use the simple Contact Upload instead. 
                This form is for your core team with detailed organizational data.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Manual Entry */}
              <button
                onClick={() => navigate("/org-members/manual")}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 hover:shadow-lg transition text-left"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manually Enter</h3>
                <p className="text-sm text-gray-600">Add contacts one by one through the interface</p>
              </button>

              {/* CSV Upload */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 hover:shadow-lg transition">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV</h3>
                <p className="text-sm text-gray-600 mb-4">Bulk import from a CSV file</p>
                
                <div className="space-y-3">
                  <button
                    onClick={downloadTemplate}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
                  >
                    Download Template
                  </button>
                  
                  <label className="block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-indigo-400 transition cursor-pointer text-sm"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/org-members")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

