import React, { Fragment, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../store/slices/authSlice'; // Assuming these actions are needed for logout
import { markAsRead, markAllRead, removeAllNotifications } from '../store/slices/uiSlice';

import {
  BellIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function TopBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Get user from Redux store
  const notifications = useSelector((state) => (state.ui && state.ui.notifications) || []);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/settings'); // Navigate to the profile settings page
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    // The main container for the top bar. Background is white as requested.
  <div className="flex justify-end items-center h-16 px-6 bg-white border-b border-gray-200">
      {/* The title will NOT be here, it remains in each individual page component */}

      <div className="flex items-center">
        {/* Notification Icon */}
        <div className="relative mr-4">
          <button
            onClick={() => setShowNotifications((s) => !s)}
            aria-haspopup="true"
            aria-expanded={showNotifications}
            className="relative rounded-full p-1 text-gray-600 hover:text-primary-red focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-0 -right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-primary-red rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Simple notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 shadow-lg rounded-md z-20">
                <div className="flex items-center justify-between p-3">
                  <p className="text-sm font-semibold text-gray-800">Notifications</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => dispatch(markAllRead())}
                      className="text-xs text-gray-600 hover:underline"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={() => dispatch(removeAllNotifications())}
                      className="text-xs text-gray-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="max-h-56 overflow-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No notifications</div>
                  ) : (
                    notifications
                      .slice()
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .slice(0, 20)
                      .map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            // mark read and navigate if URL provided
                            dispatch(markAsRead(n.id));
                            setShowNotifications(false);
                            if (n.url) navigate(n.url);
                          }}
                          className={`w-full text-left p-3 text-sm flex flex-col ${!n.read ? 'bg-gray-50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-800 truncate">{n.title}</div>
                            <div className="text-xs text-gray-400 ml-2">{timeAgo(n.createdAt)}</div>
                          </div>
                          <div className="text-gray-500 text-xs mt-1 truncate">{n.body}</div>
                        </button>
                      ))
                  )}
                </div>
            </div>
          )}
        </div>

        {/* User Info (avatar removed) */}
	<div className="flex items-center mr-2">
          <div className="flex flex-col items-end text-right leading-tight">
            <p className="text-sm font-medium text-dark-gray truncate max-w-[180px]">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate max-w-[180px]">{user?.email || ''}</p>
          </div>
        </div>

        {/* User Dropdown Menu */}
  <Menu as="div" className="relative">
          <Menu.Button className="flex items-center text-gray-600 hover:text-primary-red focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-gray-50">
            <span className="sr-only">Open user menu</span>
            <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {/* Your Profile removed per request */}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleSettingsClick}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'block w-full text-left px-4 py-2 text-sm text-dark-gray'
                    )}
                  >
                    Settings
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'block w-full text-left px-4 py-2 text-sm text-dark-gray'
                    )}
                  >
                    Log out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}

export default TopBar;
