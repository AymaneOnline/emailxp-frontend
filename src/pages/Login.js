import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, reset } from '../store/slices/authSlice';
import Spinner from '../components/Spinner';
import { H1, H2, H3, Body, Small } from '../components/ui/Typography';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const { email, password, remember } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess && user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password, remember };
    dispatch(login(userData));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      {/* Brand */}
      <div className="mb-8 text-center select-none">
        <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-primary-red rounded-md">
          <H1 className="text-3xl sm:text-4xl hover:opacity-90 transition mb-0">Email<span className="text-primary-red">XP</span></H1>
        </Link>
      </div>

      {/* Heading */}
      <H2 className="text-2xl sm:text-3xl mb-6 tracking-tight">WELCOME BACK!</H2>

      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 sm:p-10 mx-auto">
          <H3 className="text-center mb-8">Log in to your account</H3>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-5">
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
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-red focus:ring-primary-red text-sm"
                  placeholder="name@example.com"
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={onChange}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-primary-red focus:ring-primary-red text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setFormData(prev => ({ ...prev, remember: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-primary-red focus:ring-primary-red"
                />
                <Small className="text-gray-700 mb-0">Remember me</Small>
              </label>
              <button
                type="button"
                onClick={() =>
                  toast.info('Forgot password functionality not yet implemented.')
                }
                className="text-gray-600 hover:text-primary-red transition font-medium"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-red hover:bg-custom-red-hover text-white font-semibold rounded-md py-3 text-sm tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
            >
              Log in
            </button>

            {/* Separator */}
            <div className="relative flex items-center justify-center">
              <span className="h-px bg-gray-200 w-full"></span>
              <Small className="px-4 uppercase tracking-wider text-gray-500 bg-white mb-0">or</Small>
              <span className="h-px bg-gray-200 w-full"></span>
            </div>

            <button
              type="button"
              onClick={() => toast.info('Google login not yet implemented.')}
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
              Log in with Google
            </button>

            <Body className="text-center text-gray-700 mb-0">
              Don't have a EmailXP account?{' '}
              <Link
                to="/register"
                className="font-semibold text-black hover:underline"
              >
                Sign up
              </Link>
            </Body>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
