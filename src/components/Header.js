// emailxp/frontend/src/components/Header.js (Example update)

import React from 'react';
import { FaSignInAlt, FaSignOutAlt, FaUser, FaEnvelopeOpenText, FaUsers, FaCopy, FaChartLine } from 'react-icons/fa'; // <--- ADD FaChartLine
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <header className='flex justify-between items-center p-4 mb-6 border-b-2 border-gray-200'>
      <div className='flex items-center'>
        <Link to='/' className='text-3xl font-bold text-gray-800 flex items-center'>
          <FaEnvelopeOpenText className='mr-2 text-blue-600' /> EmailXpress
        </Link>
        {user && (
          <nav className='ml-8'>
            <ul className='flex space-x-6'>
              <li>
                <Link to='/campaigns' className='text-gray-700 hover:text-blue-600 flex items-center text-lg'>
                  <FaEnvelopeOpenText className='mr-1' /> Campaigns
                </Link>
              </li>
              <li>
                <Link to='/lists' className='text-gray-700 hover:text-blue-600 flex items-center text-lg'>
                  <FaUsers className='mr-1' /> Lists
                </Link>
              </li>
              <li>
                <Link to='/templates' className='text-gray-700 hover:text-blue-600 flex items-center text-lg'>
                  <FaCopy className='mr-1' /> Templates
                </Link>
              </li>
              {/* --- NEW DASHBOARD LINK --- */}
              <li>
                <Link to='/dashboard' className='text-gray-700 hover:text-blue-600 flex items-center text-lg'>
                  <FaChartLine className='mr-1' /> Dashboard
                </Link>
              </li>
              {/* --- END NEW DASHBOARD LINK --- */}
            </ul>
          </nav>
        )}
      </div>

      <div className='flex items-center'>
        <ul className='flex space-x-4'>
          {user ? (
            <>
              <li className='flex items-center text-gray-700 text-lg'>
                Hello, {user.name}!
              </li>
              <li>
                <button
                  className='flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-lg'
                  onClick={onLogout}
                >
                  <FaSignOutAlt className='mr-1' /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to='/login'
                  className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg'
                >
                  <FaSignInAlt className='mr-1' /> Login
                </Link>
              </li>
              <li>
                <Link
                  to='/register'
                  className='flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-lg'
                >
                  <FaUser className='mr-1' /> Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}

export default Header;