// emailxp/frontend/src/components/Sidebar.js

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  ListChecks,
  Globe,
  Bot,
  Settings,
  Puzzle,
  Star,
} from 'lucide-react';

/**
 * Utility function to combine Tailwind CSS class names.
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * The application's sidebar navigation component, with a clean, shadcn/ui-inspired design.
 */
function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Campaigns', to: '/campaigns', icon: Send },
    { name: 'Subscribers', to: '/subscribers', icon: Users },
    { name: 'Forms', to: '/forms', icon: ListChecks },
    { name: 'Sites', to: '/sites', icon: Globe },
    { name: 'Automation', to: '/automation', icon: Bot },
    // No Groups, Tags, or similar here
  ];

  const bottomNavItems = [
    { name: 'Integrations', to: '/integrations', icon: Puzzle },
    { name: 'File manager', to: '/files', icon: ListChecks },
    { name: 'Templates', to: '/templates', icon: FileText },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    // Sidebar container. The 'dark' class is a placeholder for a potential dark mode.
    // We add custom CSS for the scrollbar to make it thinner and less intrusive.
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 shadow-lg p-6 flex flex-col justify-between h-screen overflow-y-auto">
      {/* Custom scrollbar styling */}
      <style>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: #d1d5db; /* gray-300 */
          border-radius: 4px;
        }
        .dark .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: #4b5563; /* gray-600 */
        }
      `}</style>
      
      <div>
        {/* Application Logo */}
        <NavLink to="/app" className="text-3xl font-bold text-gray-900 dark:text-white px-4 py-2">
          Email<span className="text-primary-red">XP</span>
        </NavLink>

        {/* Main navigation links */}
        <nav className="mt-8">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => classNames(
                    isActive || (item.name === 'Dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) 
                      ? 'bg-primary-red text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    "flex items-center px-4 py-3 rounded-md font-medium text-sm transition-colors duration-200"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Account Settings / Integrations / Upgrade Plan */}
      <div className="mt-auto space-y-2 pt-6 border-t border-gray-200 dark:border-gray-700">
        {bottomNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to} 
              className={({ isActive }) => classNames(
                isActive ? 'bg-primary-red text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                "flex items-center px-4 py-3 rounded-md font-medium text-sm transition-colors duration-200"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
        ))}
        <div className="mt-6 pt-2">
            <NavLink to="/upgrade-plan" className={({ isActive }) => classNames(
                isActive ? 'bg-primary-red-darker' : 'bg-primary-red',
                "block w-full px-4 py-3 rounded-lg text-white text-center font-semibold text-sm shadow-md hover:bg-custom-red-hover transition-colors duration-200 flex items-center justify-center space-x-2"
            )}>
              <Star className="w-4 h-4 mr-2" />
              <span>Upgrade plan</span>
            </NavLink>
            <p className="text-xs text-gray-500 mt-1 text-center">Free trial</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
