import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function EventCreate() {
  const orgId = getOrgId();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    date: "",
    startTime: "",
    startPeriod: "PM",
    endTime: "",
    endPeriod: "PM",
    eventVenueName: "",
    eventStreet: "",
    eventCity: "",
    eventState: "",
    eventZip: "",
    hasTickets: false,
    ticketCost: 0,
    fundraisingGoal: 0,
    additionalExpenses: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Build time string from separate inputs (guided UX)
      const startTimeString = `${formData.startTime} ${formData.startPeriod}`;
      const endTimeString = formData.endTime ? `${formData.endTime} ${formData.endPeriod}` : null;
      const timeString = endTimeString ? `${startTimeString} - ${endTimeString}` : startTimeString;

      const response = await api.post(`/orgs/${orgId}/events`, {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        date: formData.date,
        time: timeString,
        eventVenueName: formData.eventVenueName,
        eventStreet: formData.eventStreet,
        eventCity: formData.eventCity,
        eventState: formData.eventState,
        eventZip: formData.eventZip,
        hasTickets: formData.hasTickets,
        ticketCost: parseFloat(formData.ticketCost) || 0,
        fundraisingGoal: parseFloat(formData.fundraisingGoal) || 0,
        additionalExpenses: parseFloat(formData.additionalExpenses) || 0
      });

      navigate(`/event/${response.data.id}/success`);
    } catch (error) {
      alert("Error creating event: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h1>
              <p className="text-gray-600">Set up your event with goals and targets</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Event Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Bros & Brews 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Join us for an evening of networking, craft beer, and community building..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        placeholder="6:00"
                        required
                      />
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.startPeriod}
                        onChange={(e) => setFormData({ ...formData, startPeriod: e.target.value })}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        placeholder="9:00"
                      />
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.endPeriod}
                        onChange={(e) => setFormData({ ...formData, endPeriod: e.target.value })}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Location</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.eventVenueName}
                    onChange={(e) => setFormData({ ...formData, eventVenueName: e.target.value })}
                    placeholder="Port City Brewing"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.eventStreet}
                    onChange={(e) => setFormData({ ...formData, eventStreet: e.target.value })}
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={formData.eventCity}
                      onChange={(e) => setFormData({ ...formData, eventCity: e.target.value })}
                      placeholder="Alexandria"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={formData.eventState}
                      onChange={(e) => setFormData({ ...formData, eventState: e.target.value })}
                      placeholder="VA"
                      maxLength="2"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={formData.eventZip}
                      onChange={(e) => setFormData({ ...formData, eventZip: e.target.value })}
                      placeholder="22314"
                      maxLength="5"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fundraising Goals */}
            <div className="border-t pt-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Fundraising Goals</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fundraising Goal
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        value={formData.fundraisingGoal}
                        onChange={(e) => setFormData({ ...formData, fundraisingGoal: e.target.value })}
                        placeholder="5000"
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Expenses
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        value={formData.additionalExpenses}
                        onChange={(e) => setFormData({ ...formData, additionalExpenses: e.target.value })}
                        placeholder="500"
                        min="0"
                        step="50"
                      />
                    </div>
                  </div>
                </div>

                {formData.fundraisingGoal > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Total Needed:</span> ${(parseFloat(formData.fundraisingGoal) + parseFloat(formData.additionalExpenses || 0)).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Options */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎟️ Ticket Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasTickets"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.hasTickets}
                    onChange={(e) => setFormData({ ...formData, hasTickets: e.target.checked })}
                  />
                  <label htmlFor="hasTickets" className="ml-2 block text-sm font-medium text-gray-700">
                    This event requires tickets
                  </label>
                </div>

                {formData.hasTickets && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ticket Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={formData.ticketCost}
                      onChange={(e) => setFormData({ ...formData, ticketCost: e.target.value })}
                      placeholder="25.00"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

