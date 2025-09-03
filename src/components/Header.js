// emailxp/frontend/src/components/Header.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleAuthClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-sm py-4">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
                <Disclosure.Button
                  className="relative inline-flex items-center justify-center rounded-md p-2 text-dark-gray hover:text-primary-red focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-red"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="text-2xl font-bold text-dark-gray">
                    Email<span className="text-primary-red">XP</span>
                  </Link>
                </div>
                <div className="hidden md:ml-6 md:block">
                    <div className="flex space-x-6 text-gray-600 font-medium">
                        <button className="hover:text-primary-red transition duration-300">Features</button>
                        <button className="hover:text-primary-red transition duration-300">Pricing</button>
                        <button className="hover:text-primary-red transition duration-300">Testimonials</button>
                        <button className="hover:text-primary-red transition duration-300">FAQ</button>
                    </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
                <div className="hidden md:flex space-x-4 items-center">
                  {user ? (
                    <button 
                      onClick={handleAuthClick}
                      className="text-gray-600 hover:text-primary-red transition duration-300"
                    >
                      Dashboard
                    </button>
                  ) : (
                    <Link to="/login" className="text-gray-600 hover:text-primary-red transition duration-300">
                      Login
                    </Link>
                  )}
                  {user ? (
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="bg-primary-red text-white px-6 py-2 rounded-lg shadow-md hover:bg-custom-red-hover transition duration-300"
                    >
                      Go to App
                    </button>
                  ) : (
                    <Link to="/register" className="bg-primary-red text-white px-6 py-2 rounded-lg shadow-md hover:bg-custom-red-hover transition duration-300">
                      Sign up
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className={`md:hidden bg-white py-2 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="flex flex-col items-center space-y-2 text-gray-600 font-medium">
                <Disclosure.Button as="button" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-100 w-full text-center text-gray-600">Features</Disclosure.Button>
                <Disclosure.Button as="button" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-100 w-full text-center text-gray-600">Pricing</Disclosure.Button>
                <Disclosure.Button as="button" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-100 w-full text-center text-gray-600">Testimonials</Disclosure.Button>
                <Disclosure.Button as="button" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-100 w-full text-center text-gray-600">FAQ</Disclosure.Button>
                {user ? (
                  <Disclosure.Button 
                    as="button" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleAuthClick();
                    }} 
                    className="text-gray-600 hover:bg-gray-100 block rounded-md px-3 py-2 text-base font-medium w-full text-center"
                  >
                    Dashboard
                  </Disclosure.Button>
                ) : (
                  <Disclosure.Button as={Link} to="/login" className="text-gray-600 hover:bg-gray-100 block rounded-md px-3 py-2 text-base font-medium w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>Login</Disclosure.Button>
                )}
                {user ? (
                  <Disclosure.Button 
                    as="button" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/dashboard');
                    }} 
                    className="bg-primary-red text-white px-6 py-2 rounded-lg shadow-md hover:bg-custom-red-hover transition duration-300 w-3/4 text-center block"
                  >
                    Go to App
                  </Disclosure.Button>
                ) : (
                  <Disclosure.Button as={Link} to="/register" className="bg-primary-red text-white px-6 py-2 rounded-lg shadow-md hover:bg-custom-red-hover transition duration-300 w-3/4 text-center block" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Disclosure.Button>
                )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

export default Header;