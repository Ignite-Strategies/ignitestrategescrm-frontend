/**
 * EVENT CONFIG
 * Single source of truth for all events across the app
 * 
 * Usage:
 * import { EVENTS, EVENT_OPTIONS } from '../config/eventConfig';
 */

export const EVENTS = {
  BROS_AND_BREWS: {
    id: 'cmggljv7z0002nt28gckp1jpe',
    name: 'Bros & Brews',
    status: 'upcoming'
  }
  // Add more events here as needed
};

/**
 * Dropdown options for event selection
 * Used in EditableFieldComponent and other forms
 */
export const EVENT_OPTIONS = [
  { 
    value: EVENTS.BROS_AND_BREWS.id, 
    label: EVENTS.BROS_AND_BREWS.name 
  },
  { 
    value: '', 
    label: 'None' 
  }
];

/**
 * Get event name by ID
 */
export const getEventName = (eventId) => {
  const event = Object.values(EVENTS).find(e => e.id === eventId);
  return event ? event.name : 'None';
};

export default EVENTS;


