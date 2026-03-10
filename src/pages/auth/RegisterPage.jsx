import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { useAuth } from '@hooks/useAuth';
import { registerSchema } from '@utils/schemas';
import AuthHeader from '@components/auth/AuthHeader';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (formData) => {
    await registerUser(formData);
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-slideUp">
        <Card className="auth-card">
          <AuthHeader
            title="Create Account"
            subtitle="Complete your details to get started"
          />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Phone Number"
              id="phoneNumber"
              type="tel"
              placeholder="Enter 10-digit phone number"
              error={errors.phoneNumber?.message}
              helperText="This number will be used for OTP login"
              required
              maxLength={10}
              autoComplete="tel-national"
              inputMode="numeric"
              {...register('phoneNumber')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                id="firstName"
                type="text"
                placeholder="First name"
                error={errors.firstName?.message}
                required
                autoComplete="given-name"
                {...register('firstName')}
              />

              <Input
                label="Last Name"
                id="lastName"
                type="text"
                placeholder="Last name"
                error={errors.lastName?.message}
                required
                autoComplete="family-name"
                {...register('lastName')}
              />
            </div>

            <Input
              label="City"
              id="city"
              type="text"
              placeholder="Enter your city"
              error={errors.city?.message}
              required
              autoComplete="address-level2"
              {...register('city')}
            />

            <Input
              label="Pincode"
              id="pincode"
              type="text"
              placeholder="Enter 6-digit pincode"
              error={errors.pincode?.message}
              required
              maxLength={6}
              autoComplete="postal-code"
              inputMode="numeric"
              {...register('pincode')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            >
              Register
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
