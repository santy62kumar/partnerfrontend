import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { useAuth } from '@hooks/useAuth';
import { useAuthStore } from '@store/authStore';
import { validators } from '@utils/validators';
import { APP_NAME } from '@utils/constants';
import { formatters } from '@utils/formatters';
import AuthHeader from '../../components/auth/AuthHeader';

const OTPPage = () => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, phoneNumber: storedPhoneNumber } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  // Redirect if no phone number
  useEffect(() => {
    if (!storedPhoneNumber) {
      navigate('/login');
    }
  }, [storedPhoneNumber, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    const validation = validators.otp(otpValue);
    
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setLoading(true);
    const result = await verifyOtp(otpValue);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    await resendOtp();
    setResendLoading(false);
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-primary-grey-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        

        <Card>
        <AuthHeader subtitle="Enter the 6-digit code sent to your phone" />
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              {/* <label className="block text-sm font-medium text-primary-grey-700 mb-3 text-center">
                Enter 6-digit OTP
              </label> */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      error
                        ? 'border-primary-red focus:border-primary-red focus:ring-primary-red'
                        : 'border-primary-grey-300 focus:border-[#3D1D1C] focus:ring-[#3D1D1C]'
                    }`}
                  />
                ))}
              </div>
              {error && (
                <p className="mt-2 text-sm text-primary-red text-center">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={otp.join('').length !== 6}
            >
              Verify OTP
            </Button>
          </form>

          <div className="mt-6 text-center">
            {timer > 0 ? (
              <p className="text-sm text-primary-grey-600">
                Resend OTP in <span className="font-semibold">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm text-[#3D1D1C] font-medium hover:underline disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-primary-grey-600 hover:text-primary-grey-900"
            >
              ← Back to Login
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OTPPage;