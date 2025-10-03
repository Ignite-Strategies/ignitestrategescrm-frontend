import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function EventCreate() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    date: "",
    location: "",
    ticketPrice: 0,
    revenueTarget: 0,
    costs: 0
  });

  const ticketsNeeded = formData.ticketPrice > 0 
    ? Math.ceil(Math.max((formData.revenueTarget || 0) - (formData.costs || 0), 0) / formData.ticketPrice)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(`/orgs/${orgId}/events`, {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        date: formData.date,
        location: formData.location,
        goals: {
          revenueTarget: parseFloat(formData.revenueTarget) || 0,
          ticketPrice: parseFloat(formData.ticketPrice) || 0,
          costs: parseFloat(formData.costs) || 0
        }
      });

      navigate(`/event/success/${response.data._id}`);
    } catch (error) {
      alert("Error creating event: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h1>
          <p className="text-gray-600 mb-8">Set up your event with goals and targets</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
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
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Downtown Brewery"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Calculator</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue Target ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.revenueTarget}
                    onChange={(e) => setFormData({ ...formData, revenueTarget: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costs ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={formData.costs}
                    onChange={(e) => setFormData({ ...formData, costs: e.target.value })}
                  />
                </div>
              </div>

              {ticketsNeeded > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-indigo-900 font-semibold text-lg">
                    🎯 You need to sell <span className="text-2xl">{ticketsNeeded}</span> tickets
                  </p>
                  <p className="text-indigo-700 text-sm mt-1">
                    Net target: ${(formData.revenueTarget - formData.costs).toLocaleString()} ÷ ${formData.ticketPrice} per ticket
                  </p>
                </div>
              )}
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

