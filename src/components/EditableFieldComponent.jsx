import { useState } from 'react';
import api from '../lib/api';

export default function EditableField({ 
  value, 
  field, 
  orgMemberId,  // For OrgMember updates
  supporterId,  // LEGACY: Keep for backward compatibility
  contactId,    // For Contact updates
  eventAttendeeId,  // For EventAttendee updates
  type = 'text',
  options = null,
  onUpdate,
  onSave,       // Alternative callback
  placeholder = ''
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (newValue = null) => {
    const valueToSave = newValue !== null ? newValue : editValue;
    if (valueToSave === value) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      let response;
      
      // Route to the correct endpoint based on what ID is provided
      if (eventAttendeeId) {
        // Update EventAttendee
        response = await api.patch(`/event-attendees/${eventAttendeeId}`, {
          [field]: valueToSave
        });
      } else if (contactId) {
        // Update Contact
        response = await api.patch(`/contacts/${contactId}`, {
          [field]: valueToSave
        });
      } else if (orgMemberId || supporterId) {
        // Update OrgMember
        const memberId = orgMemberId || supporterId;
        response = await api.patch(`/orgmembers/${memberId}`, {
          [field]: valueToSave
        });
      }
      
      // Call the appropriate callback
      if (onSave) {
        onSave();
      } else if (onUpdate) {
        onUpdate(response.data.member || response.data);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating field:', error);
      alert('Error updating field: ' + error.message);
      setEditValue(value || ''); // Reset to original value
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    if (options) {
      // Dropdown for engagement category
      return (
        <select
          value={editValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setEditValue(newValue);
            // Auto-save immediately for dropdowns when selection changes
            handleSave(newValue);
          }}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          autoFocus
          disabled={loading}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Text/Number input
    return (
      <input
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => handleSave()}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${type === 'number' ? 'w-16 min-w-16' : 'w-full'}`}
        autoFocus
        disabled={loading}
      />
    );
  }

  // Helper function to format phone numbers
  const formatPhone = (phone) => {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as 555-555-5555
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // If not 10 digits, return as-is
    return phone;
  };

  // Get display value (label for dropdowns, value for text)
  const getDisplayValue = () => {
    if (options) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value || '-';
    }
    if (type === 'tel' && value) {
      return formatPhone(value);
    }
    if (type === 'number' && value === 0) return '0';
    return value || '-';
  };

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
      title="Click to edit"
    >
      {getDisplayValue()}
    </span>
  );
}
