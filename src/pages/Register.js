import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, reset } from '../store/slices/authSlice';
import Spinner from '../components/Spinner';
import { H1, H2, H3, Body, Small } from '../components/ui/Typography';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    password2: '',
  });

  const { firstName, lastName, email, password, password2 } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess && user) {
      // Do NOT auto-send verification email; user will trigger manually from checklist
      navigate('/dashboard');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const deriveCompanyName = () => {
    // Strategy: Use first + last if present else email prefix; fallback 'My Organization'
    const base = `${firstName} ${lastName}`.trim() || (email.includes('@') ? email.split('@')[0] : 'My Organization');
    // Capitalize each word
    return base.split(/[-_.\s]+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Workspace';
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (password !== password2) { toast.error('Passwords do not match'); return; }
    if (!firstName.trim()) { toast.error('First name is required'); return; }
    if (!lastName.trim()) { toast.error('Last name is required'); return; }
    const companyOrOrganization = deriveCompanyName();
    const userData = { companyOrOrganization, name: `${firstName.trim()} ${lastName.trim()}`.trim(), email, password };
    dispatch(register(userData));
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-4 py-12">
      {/* Brand */}
      <div className="text-center select-none mb-8">
        <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-primary-red rounded-md">
          <H1 className="text-3xl sm:text-4xl hover:opacity-90 transition mb-0">Email<span className="text-primary-red">XP</span></H1>
        </Link>
      </div>

      {/* Main heading + sub */}
      <div className="text-center mb-10">
        <H2 className="text-2xl sm:text-3xl mb-2 tracking-tight">Create Your Account</H2>
  <Body className="text-gray-600 mb-0">Start sending powerful email campaigns today.</Body>
      </div>

      {/* Card */}
      <div className="w-full max-w-3xl">
        <div className="mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-8 sm:p-10 max-w-2xl">
          <div className="text-center mb-6">
            <H3 className="text-base mb-0">Sign Up</H3>
            <Small className="mt-2 text-gray-600">Fill in your details to create an account</Small>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-800 mb-1"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={onChange}
                  placeholder="John"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-red focus:ring-primary-red"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-800 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={onChange}
                  placeholder="Doe"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-red focus:ring-primary-red"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={onChange}
                placeholder="you@example.com"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-red focus:ring-primary-red"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={onChange}
                placeholder="••••••••"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-red focus:ring-primary-red"
              />
            </div>
            <div>
              <label
                htmlFor="password2"
                className="block text-sm font-medium text-gray-800 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                value={password2}
                onChange={onChange}
                placeholder="••••••••"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-red focus:ring-primary-red"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-red hover:bg-custom-red-hover text-white font-semibold rounded-md py-3 text-sm tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
            >
              Create Account
            </button>

            {/* Separator */}
            <div className="relative flex items-center justify-center">
              <span className="h-px bg-gray-200 w-full" />
              <Small className="px-4 uppercase tracking-wider text-gray-500 bg-white mb-0">or</Small>
              <span className="h-px bg-gray-200 w-full" />
            </div>

            <button
              type="button"
              onClick={() => toast.info('Google signup not yet implemented.')}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 bg-white">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#EA4335"
                    d="M12 10.8v3.7h5.2c-.2 1.2-.9 2.2-2 2.9l3.2 2.5c1.9-1.7 3-4.1 3-6.9 0-.7-.1-1.4-.2-2.1H12z"
                  />
                  <path
                    fill="#34A853"
                    d="M6.6 14.3l-.9.7-2.6 2c1.7 3.4 5.2 5.7 9.2 5.7 2.8 0 5.2-.9 6.9-2.5l-3.2-2.5c-.9.6-2 1-3.7 1-3 0-5.6-2-6.5-4.7z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M3.1 6.7C2.4 8.1 2 9.5 2 11s.4 2.9 1.1 4.3c0 0 3.5-2.7 3.5-2.7-.2-.6-.3-1.2-.3-1.6 0-.6.1-1.1.3-1.6L3.1 6.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 4.8c1.5 0 2.9.5 4 1.6l3-3C16.9 1.9 14.5 1 12 1 8 1 4.5 3.3 3.1 6.7l3.6 2.7C7.2 6.8 9.9 4.8 12 4.8z"
                  />
                </svg>
              </span>
              Sign up with Google
            </button>

            <Body className="text-center text-gray-700 mb-0">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-black hover:underline"
              >
                Log In
              </Link>
            </Body>
            <Small className="text-center leading-relaxed text-gray-500 mt-2 block mb-0">
              By submitting this form, you agree to the{' '}
              <span
                className="underline cursor-pointer"
                onClick={() => toast.info('Terms not implemented.')}
              >
                Terms of Service
              </span>{' '}
              and{' '}
              <span
                className="underline cursor-pointer"
                onClick={() => toast.info('Privacy Policy not implemented.')}
              >
                Privacy Policy
              </span>
              .
            </Small>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
