import React, { useState, useEffect } from 'react';
import { H1, H2, Body, Small } from '../components/ui/Typography';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { toast } from 'react-toastify';

function VerifyEmail() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [justSent, setJustSent] = useState(false);

  useEffect(() => {
    if (user?.isVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSend = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      const res = await authService.sendVerificationEmail();
      toast.success(res.message || 'Verification email sent.');
      setJustSent(true);
      setTimeout(() => setJustSent(false), 60000); // allow resend after 60s
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      <div className="text-center mb-8 select-none">
        <H1 className="text-3xl sm:text-4xl mb-0">Email<span className="text-primary-red">XP</span></H1>
      </div>
      <div className="w-full max-w-lg">
        <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-8 sm:p-10">
          <H2 className="text-2xl mb-4 text-center">Verify Your Email</H2>
          <Body className="text-gray-700 leading-relaxed mb-6 text-center">We've created your account. To unlock all features, please verify your email address. Click the button below and check your inbox (and spam folder) for a verification link.</Body>
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || justSent}
              className={`w-full py-3 rounded-md text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red
                ${isSending || justSent ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-red hover:bg-custom-red-hover'}`}
            >
              {isSending ? 'Sending...' : justSent ? 'Email Sent! Retry in 60s' : 'Send Verification Email'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full py-2 rounded-md text-sm font-medium text-gray-600 hover:text-primary-red transition"
            >
              Skip for now (limited access)
            </button>
          </div>
          <Small className="mt-8 text-gray-500 text-center">Need help? Contact support.</Small>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
