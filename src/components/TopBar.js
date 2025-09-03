import React, { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../store/slices/authSlice'; // Assuming these actions are needed for logout

import {
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function TopBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Get user from Redux store

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/settings'); // Navigate to the profile settings page
  };

  const handleSettingsClick = () => {
    alert('General settings not implemented yet!'); // Keep alert for now
  };

  return (
    // The main container for the top bar. Background is white as requested.
    <div className="flex justify-end items-center py-4 px-6 bg-white shadow-sm rounded-xl border border-gray-200 mb-8">
      {/* The title will NOT be here, it remains in each individual page component */}

      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <button className="relative rounded-full p-1 text-gray-600 hover:text-primary-red focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-gray-50">
          <span className="sr-only">View notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
          <span className="absolute -top-0 -right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-primary-red rounded-full">1</span>
        </button>

        {/* User Avatar and Info */}
        <div className="flex items-center space-x-2">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <UserCircleIcon className="h-8 w-8 rounded-full text-gray-600" />
          )}
          <div>
            <p className="text-sm font-medium text-dark-gray">{user?.name || 'Username'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'user@email.com'}</p>
          </div>
        </div>

        {/* User Dropdown Menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center text-gray-600 hover:text-primary-red focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-gray-50">
            <span className="sr-only">Open user menu</span>
            <ChevronDownIcon className="h-5 w-5 ml-1" aria-hidden="true" />
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
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleProfileClick}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'block w-full text-left px-4 py-2 text-sm text-dark-gray'
                    )}
                  >
                    Your Profile
                  </button>
                )}
              </Menu.Item>
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
                    Sign out
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
