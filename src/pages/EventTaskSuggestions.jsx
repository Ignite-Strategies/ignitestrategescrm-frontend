import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

export default function EventTaskSuggestions() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const surveyAnswers = location.state?.answers || {};
  
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Your exact task suggestions
  const SUGGESTED_TASKS = [
    {
      id: 1,
      title: "Hire graphic designer",
      description: "Find and onboard a designer for event branding - 1-pager",
      category: "design",
      priority: "high"
    },
    {
      id: 2,
      title: "Start posting videos",
      description: "Get momentum - share link in comments",
      category: "marketing",
      priority: "high"
    },
    {
      id: 3,
      title: "Website - get the landing page down",
      description: "Like 3 options as well",
      category: "marketing",
      priority: "high"
    },
    {
      id: 4,
      title: "Hire team to make the actual landing page good",
      description: "Get professional help for the website",
      category: "design",
      priority: "medium"
    },
    {
      id: 5,
      title: "Test Stripe",
      description: "Verify payment processing works end-to-end",
      category: "tech",
      priority: "high"
    },
    {
      id: 6,
      title: "Upload contacts in CRM",
      description: "Import your contact list and verify data",
      category: "tech",
      priority: "high"
    },
    {
      id: 7,
      title: "Post flyer on social media with link to website",
      description: "Share promotional content with registration link",
      category: "marketing",
      priority: "high"
    },
    {
      id: 8,
      title: "Book venue",
      description: "Confirm location, date, and capacity",
      category: "logistics",
      priority: "high",
      conditional: !surveyAnswers.venueReserved
    },
    {
      id: 9,
      title: "Initial announcement to key members",
      description: "Send first communication to your core team",
      category: "marketing",
      priority: "high",
      conditional: !surveyAnswers.announcementSent
    },
    {
      id: 10,
      title: "Set fundraising goal",
      description: "Determine target amount and ticket pricing",
      category: "finance",
      priority: "high"
    },
    {
      id: 11,
      title: "Create budget",
      description: "List all expenses and revenue sources",
      category: "finance",
      priority: "high"
    },
    {
      id: 12,
      title: "Recruit committee members",
      description: "Build your event team",
      category: "logistics",
      priority: "medium",
      conditional: !surveyAnswers.hasCommittee
    }
  ];

  // Filter tasks based on survey answers
  const relevantTasks = SUGGESTED_TASKS.filter(task => {
    if (task.conditional !== undefined) {
      return task.conditional;
    }
    return true;
  });

  const toggleTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAll = () => {
    setSelectedTasks(relevantTasks.map(t => t.id));
  };

  const clearAll = () => {
    setSelectedTasks([]);
  };

  const handleCreateTasks = async () => {
    if (selectedTasks.length === 0) {
      alert("Please select at least one task");
      return;
    }

    setLoading(true);
    try {
      const tasksToCreate = relevantTasks
        .filter(t => selectedTasks.includes(t.id))
        .map((task, index) => ({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          completed: false,
          orderIndex: index
        }));

      // Create each task
      for (const task of tasksToCreate) {
        await api.post(`/events/${eventId}/tasks`, task);
      }

      navigate(`/event/${eventId}/tasks`);
    } catch (error) {
      console.error("Error creating tasks:", error);
      alert("Failed to create tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    design: "blue",
    marketing: "purple",
    tech: "green",
    logistics: "orange",
    finance: "emerald"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suggested Tasks</h1>
              <p className="text-gray-600 mt-1">Select the tasks that are helpful for your event</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Selection Summary */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-indigo-900">
                {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'} selected
              </h2>
              <p className="text-indigo-700 text-sm">Choose the tasks that make sense for your event</p>
            </div>
            <button
              onClick={handleCreateTasks}
              disabled={selectedTasks.length === 0 || loading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : `Create ${selectedTasks.length} Task${selectedTasks.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relevantTasks.map((task) => {
            const isSelected = selectedTasks.includes(task.id);
            const color = categoryColors[task.category] || "gray";

            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`text-left p-6 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `border-${color}-500 bg-${color}-50`
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? `bg-${color}-600 border-${color}-600`
                      : "border-gray-300"
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex gap-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium bg-${color}-100 text-${color}-700 capitalize`}>
                        {task.category}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate(`/event/${eventId}/tasks`)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip - I'll add my own tasks later
          </button>
        </div>
      </div>
    </div>
  );
}

