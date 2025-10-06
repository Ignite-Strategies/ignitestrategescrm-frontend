import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Tasks() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [eventId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksRes = await api.get(`/events/${eventId}/tasks`);
      
      // Group tasks by category
      const grouped = (tasksRes.data || []).reduce((acc, task) => {
        if (!acc[task.category]) acc[task.category] = [];
        acc[task.category].push(task);
        return acc;
      }, {});
      
      setTasks(grouped);
      
      // Calculate stats
      const allTasks = tasksRes.data || [];
      const completed = allTasks.filter(t => t.completed).length;
      setStats({
        total: allTasks.length,
        completed,
        percentage: allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0
      });
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks({});
      setStats({ total: 0, completed: 0, percentage: 0 });
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      await api.patch(`/events/tasks/${taskId}/toggle`);
      await loadTasks();
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const categoryColors = {
    design: "blue",
    marketing: "purple",
    tech: "green",
    logistics: "orange",
    finance: "emerald"
  };

  const categoryIcons = {
    design: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
    marketing: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
    tech: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    logistics: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    finance: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Tasks</h1>
              <p className="text-gray-600 mt-1">Your event management checklist</p>
            </div>
            <button
              onClick={() => navigate(`/event/${eventId}/pipelines`)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Event
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* No Tasks Yet - Show Funnel */}
        {stats && stats.total === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Let's Build Your Task List!</h2>
            <p className="text-gray-600 mb-8">Choose how you want to set up your event tasks</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Option 1: Baseline Survey */}
              <button
                onClick={() => navigate(`/event/${eventId}/setup`)}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-xl hover:from-purple-600 hover:to-purple-700 transition text-left"
              >
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2">Baseline Survey</h3>
                <p className="text-purple-100 text-sm">Answer questions to get personalized task suggestions</p>
              </button>

              {/* Option 2: Pick Sample Tasks */}
              <button
                onClick={() => navigate(`/event/${eventId}/task-suggestions`)}
                className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-8 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition text-left"
              >
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-2">Pick Sample Tasks</h3>
                <p className="text-indigo-100 text-sm">Choose from our curated task list</p>
              </button>

              {/* Option 3: Create Your Own */}
              <button
                onClick={() => {
                  // TODO: Create custom task modal
                  alert("Custom task creation coming soon!");
                }}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition text-left"
              >
                <div className="text-4xl mb-4">✏️</div>
                <h3 className="text-xl font-bold mb-2">Create Your Own</h3>
                <p className="text-emerald-100 text-sm">Build a custom task list from scratch</p>
              </button>
            </div>
          </div>
        ) : null}

        {/* Progress Overview */}
        {stats && stats.total > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Progress</h2>
                <p className="text-gray-600">{stats.completed} of {stats.total} tasks complete</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-indigo-600">{stats.percentComplete}%</p>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all"
                style={{ width: `${stats.percentComplete}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tasks by Category */}
        <div className="space-y-6">
          {Object.entries(tasks).map(([category, categoryTasks]) => {
            const color = categoryColors[category] || "gray";
            return (
              <div key={category} className="bg-white rounded-lg shadow">
                <div className={`bg-${color}-50 border-b border-${color}-100 px-6 py-4 rounded-t-lg`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                      <svg className={`w-5 h-5 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryIcons[category]} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
                      <p className="text-sm text-gray-600">
                        {categoryTasks.filter(t => t.completed).length} / {categoryTasks.length} complete
                      </p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {categoryTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 hover:bg-gray-50 transition ${task.completed ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="mt-1"
                        >
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                            task.completed
                              ? `bg-${color}-600 border-${color}-600`
                              : `border-gray-300 hover:border-${color}-500`
                          }`}>
                            {task.completed && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                        <div className="flex-1">
                          <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          {task.priority && (
                            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                              task.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority} priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Generate Tasks Button if empty */}
        {Object.keys(tasks).length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Yet</h3>
            <p className="text-gray-600 mb-6">Generate a smart task list to get started with your event planning</p>
            <button
              onClick={generateTasks}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Generate Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

