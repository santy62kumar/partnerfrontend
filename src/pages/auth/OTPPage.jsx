import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { useAuth } from '@hooks/useAuth';
import { otpSchema } from '@utils/schemas';
import { APP_NAME } from '@utils/constants';
import AuthHeader from '../../components/auth/AuthHeader';

const OTPPage = () => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, phoneNumber: storedPhoneNumber } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  const {
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  useEffect(() => {
    if (!storedPhoneNumber) {
      navigate('/login');
    }
  }, [storedPhoneNumber, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const syncOtpValue = (newDigits) => {
    const value = newDigits.join('');
    setValue('otp', value, { shouldValidate: value.length === 6 });
    if (value.length < 6) clearErrors('otp');
  };

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    syncOtpValue(newDigits);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newDigits = pastedData.split('');
    while (newDigits.length < 6) newDigits.push('');
    setDigits(newDigits);
    syncOtpValue(newDigits);
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const onSubmit = async ({ otp }) => {
    const result = await verifyOtp(otp);
    if (!result.success) {
      setError('otp', { message: result.error });
      setDigits(['', '', '', '', '', '']);
      setValue('otp', '');
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    await resendOtp();
    setResendLoading(false);
    setTimer(60);
    setDigits(['', '', '', '', '', '']);
    setValue('otp', '');
    clearErrors('otp');
    inputRefs.current[0]?.focus();
  };

  const otpComplete = digits.join('').length === 6;

  return (
    <div className="auth-page">
      <div className="auth-container animate-slideUp">
        <Card className="auth-card">
          <AuthHeader
            title="OTP Verification"
            subtitle="Enter the 6-digit code sent to your phone"
          />
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <div className="flex gap-2 justify-center" role="group" aria-label="One-time password input">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`OTP digit ${index + 1} of 6`}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.otp
                        ? 'border-destructive focus:border-destructive focus:ring-destructive'
                        : 'border-input focus:border-ring focus:ring-ring'
                    }`}
                  />
                ))}
              </div>
              {errors.otp && (
                <p role="alert" className="mt-2 text-sm text-destructive text-center">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={!otpComplete}
            >
              Verify OTP
            </Button>
          </form>

          <div className="mt-6 text-center">
            {timer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend OTP in <span className="font-semibold">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm text-primary font-medium hover:underline disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {APP_NAME} • Secure verification flow
        </p>
      </div>
    </div>
  );
};

export default OTPPage;
