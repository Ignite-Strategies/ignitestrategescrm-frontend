import { useNavigate, useLocation } from "react-router-dom";
import { getOrgId } from "../lib/org";

/**
 * Global Navigation Component
 * Appears on every page for easy navigation
 */
export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = getOrgId();

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const navItems = [
    { path: '/campaign-home', label: '🏠 Campaigns', icon: '🏠' },
    { path: '/contact-list-manager', label: '📋 Contact Lists', icon: '📋' },
    { path: '/org-members', label: '👥 Org Members', icon: '👥' },
    { path: '/events', label: '📅 Events', icon: '📅' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/campaign-home')}
              className="flex items-center space-x-2 text-xl font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>🚀</span>
              <span>F3 CRM</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.icon}</span>
              </button>
            ))}
            
            {/* Spacer */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* Quick Actions */}
            <button
              onClick={() => navigate('/campaign-creator')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + New Campaign
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
