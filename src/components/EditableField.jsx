import { useState } from 'react';
import api from '../lib/api';

export default function EditableField({ 
  value, 
  field, 
  supporterId, 
  type = 'text',
  options = null,
  onUpdate 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/supporters/${supporterId}`, {
        field,
        value: editValue
      });
      
      onUpdate(response.data.supporter);
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
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
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

    // Text input
    return (
      <input
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        autoFocus
        disabled={loading}
      />
    );
  }

  // Get display value (label for dropdowns, value for text)
  const getDisplayValue = () => {
    if (options) {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value || '-';
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
