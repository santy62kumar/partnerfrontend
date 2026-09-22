import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import Input from '@components/common/Input';
import { useAuth } from '@hooks/useAuth';
import { otpSchema } from '@utils/schemas';
import { APP_NAME } from '@utils/constants';
import AuthHeader from '../../components/auth/AuthHeader';

const OTPPage = () => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, phoneNumber: storedPhoneNumber } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState('');
  const [timer, setTimer] = useState(60);

  const {
    handleSubmit,
    register,
    control,
    setFocus,
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

  const onSubmit = async ({ otp }) => {
    const result = await verifyOtp(otp);
    if (!result.success) {
      setError('otp', { message: result.fieldErrors?.otp || result.error });
      setValue('otp', '');
      setFocus('otp');
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendError('');
    const result = await resendOtp();
    setResendLoading(false);
    if (result.success) {
      setTimer(60);
      setValue('otp', '');
      clearErrors('otp');
      setFocus('otp');
    } else {
      setResendError(result.fieldErrors?.phone_number || result.error);
    }
  };

  const otpComplete = /^\d{6}$/.test(useWatch({ control, name: 'otp' }));

  return (
    <div className="auth-page">
      <div className="auth-container animate-slideUp">
        <Card className="auth-card">
          <AuthHeader
            title="OTP Verification"
            subtitle={`Enter the 6-digit code sent to ${storedPhoneNumber || 'your phone'}`}
          />
          <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
            <Input
              label="Verification code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="6-digit code"
              autoFocus
              required
              disabled={isSubmitting}
              error={errors.otp?.message}
              helperText="You can type or paste the code from your SMS."
              {...register('otp', { setValueAs: (value) => value.trim() })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              loadingLabel="Verifying…"
              disabled={!otpComplete || resendLoading}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                loading={resendLoading}
                disabled={isSubmitting}
                loadingLabel="Sending…"
              >
                Resend OTP
              </Button>
            )}
            {resendError ? <p role="alert" className="mt-2 text-sm text-destructive">{resendError}</p> : null}
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
            >
              ← Back to Login
            </Button>
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
