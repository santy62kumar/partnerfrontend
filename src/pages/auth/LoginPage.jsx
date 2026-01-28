import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { useAuth } from '@hooks/useAuth';
import { validators } from '@utils/validators';
import { APP_NAME } from '@utils/constants';
import { IoPhonePortraitOutline } from 'react-icons/io5';
import AuthHeader from '../../components/auth/AuthHeader';

const LoginPage = () => {
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPhoneNumber(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validators.phone(phoneNumber);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setLoading(true);
    await login(phoneNumber);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary-grey-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        

        <Card>
        <AuthHeader subtitle="Please login to continue" />
          <form onSubmit={handleSubmit}>
            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={handleChange}
              error={error}
              required
              maxLength={10}
              leftIcon={<IoPhonePortraitOutline size={20} />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Send OTP
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-primary-grey-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#3D1D1C] font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-xs text-primary-grey-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;