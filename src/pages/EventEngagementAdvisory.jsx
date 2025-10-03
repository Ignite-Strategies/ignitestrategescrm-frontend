import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function EventEngagementAdvisory() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [goals, setGoals] = useState({
    totalFundraise: 0,
    costs: 0
  });
  
  const [audienceSegmentation, setAudienceSegmentation] = useState({
    members: {
      conversionRate: 0.25, // 25%
      targetCount: 0
    },
    friends: {
      conversionRate: 0.15, // 15%
      targetCount: 0
    },
    ads: {
      conversionRate: 0.05, // 5%
      targetCount: 0
    }
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
        setGoals(response.data.goals || { totalFundraise: 0, costs: 0 });
        setAudienceSegmentation(response.data.audienceSegmentation || {
          members: { conversionRate: 0.25, targetCount: 0 },
          friends: { conversionRate: 0.15, targetCount: 0 },
          ads: { conversionRate: 0.05, targetCount: 0 }
        });
      } catch (error) {
        console.error('Error loading event:', error);
        alert('Error loading event: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  // Calculations
  const netTarget = goals.totalFundraise - goals.costs;
  const ticketsNeeded = event?.hasTickets && event?.ticketCost > 0 
    ? Math.ceil(Math.max(netTarget, 0) / event.ticketCost)
    : 0;

  const totalOutreachTarget = audienceSegmentation.members.targetCount + 
                             audienceSegmentation.friends.targetCount + 
                             audienceSegmentation.ads.targetCount;

  const expectedRevenue = (audienceSegmentation.members.targetCount * audienceSegmentation.members.conversionRate * (event?.ticketCost || 0)) +
                         (audienceSegmentation.friends.targetCount * audienceSegmentation.friends.conversionRate * (event?.ticketCost || 0)) +
                         (audienceSegmentation.ads.targetCount * audienceSegmentation.ads.conversionRate * (event?.ticketCost || 0));

  const handleSave = async () => {
    try {
      await api.patch(`/events/${eventId}`, {
        goals,
        audienceSegmentation: {
          ...audienceSegmentation,
          totalOutreachTarget
        }
      });
      
      alert('Goals and audience segmentation saved!');
      navigate(`/event/${eventId}/pipelines`);
    } catch (error) {
      alert('Error saving: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading event...</div>;
  if (!event) return <div className="text-center py-8">Event not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Engagement Advisory</h1>
              <p className="text-gray-600">{event.name} - Set your goals and audience targets</p>
            </div>
            <button
              onClick={() => navigate(`/event/${eventId}/success`)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Event
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Goals Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Financial Goals</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Fundraising Target ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={goals.totalFundraise}
                    onChange={(e) => setGoals({ ...goals, totalFundraise: parseFloat(e.target.value) || 0 })}
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Costs ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={goals.costs}
                    onChange={(e) => setGoals({ ...goals, costs: parseFloat(e.target.value) || 0 })}
                    placeholder="2000"
                  />
                </div>
              </div>

              {/* Calculations Display */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">Calculations</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Net Target:</span>
                    <span className="font-semibold">${netTarget.toLocaleString()}</span>
                  </div>
                  {event.hasTickets && (
                    <div className="flex justify-between">
                      <span>Tickets Needed:</span>
                      <span className="font-semibold">{ticketsNeeded}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Audience Segmentation */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Audience Segmentation</h3>
              
              <div className="space-y-4">
                {/* Members */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">F3 Members</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Conversion Rate</label>
                      <div className="text-sm font-semibold text-green-600">25%</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Target Outreach</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        value={audienceSegmentation.members.targetCount}
                        onChange={(e) => setAudienceSegmentation({
                          ...audienceSegmentation,
                          members: { ...audienceSegmentation.members, targetCount: parseInt(e.target.value) || 0 }
                        })}
                        placeholder="50"
                      />
                    </div>
                  </div>
                </div>

                {/* Friends */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Friends & Spouses</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Conversion Rate</label>
                      <div className="text-sm font-semibold text-blue-600">15%</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Target Outreach</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        value={audienceSegmentation.friends.targetCount}
                        onChange={(e) => setAudienceSegmentation({
                          ...audienceSegmentation,
                          friends: { ...audienceSegmentation.friends, targetCount: parseInt(e.target.value) || 0 }
                        })}
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Ads */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Ad Placements</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Conversion Rate</label>
                      <div className="text-sm font-semibold text-orange-600">5%</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Target Outreach</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        value={audienceSegmentation.ads.targetCount}
                        onChange={(e) => setAudienceSegmentation({
                          ...audienceSegmentation,
                          ads: { ...audienceSegmentation.ads, targetCount: parseInt(e.target.value) || 0 }
                        })}
                        placeholder="200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Outreach Summary */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Outreach Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Outreach Target:</span>
                    <span className="font-semibold">{totalOutreachTarget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Revenue:</span>
                    <span className="font-semibold">${expectedRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goal Achievement:</span>
                    <span className={`font-semibold ${expectedRevenue >= goals.totalFundraise ? 'text-green-600' : 'text-red-600'}`}>
                      {((expectedRevenue / goals.totalFundraise) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={() => navigate(`/event/${eventId}/success`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Save & Continue to Pipeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
