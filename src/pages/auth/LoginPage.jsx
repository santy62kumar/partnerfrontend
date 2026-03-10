import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { useAuth } from '@hooks/useAuth';
import { loginSchema } from '@utils/schemas';
import { IoPhonePortraitOutline } from 'react-icons/io5';
import AuthHeader from '@components/auth/AuthHeader';

const LoginPage = () => {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async ({ phoneNumber }) => {
    const result = await login(phoneNumber);
    if (!result.success) {
      setError('phoneNumber', { message: result.error || 'Login failed' });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-slideUp">
        <Card className="auth-card">
          <AuthHeader
            title="Welcome Back"
            subtitle="Please login to continue"
          />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
            <Input
              label="Phone Number"
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              error={errors.phoneNumber?.message}
              helperText="Use your 10-digit mobile number"
              required
              maxLength={10}
              autoComplete="tel-national"
              inputMode="numeric"
              leftIcon={<IoPhonePortraitOutline size={20} />}
              {...register('phoneNumber')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            >
              Send OTP
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-4 text-center">
          <p className="mt-1 text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
