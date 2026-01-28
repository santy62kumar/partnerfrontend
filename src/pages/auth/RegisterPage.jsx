import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { useAuth } from '@hooks/useAuth';
import { validators } from '@utils/validators';
import { APP_NAME } from '@utils/constants';
import AuthHeader from '@components/auth/AuthHeader';

const RegisterPage = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    city: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const phoneValidation = validators.phone(formData.phoneNumber);
    if (!phoneValidation.valid) {
      newErrors.phoneNumber = phoneValidation.message;
    }

    const firstNameValidation = validators.name(formData.firstName);
    if (!firstNameValidation.valid) {
      newErrors.firstName = firstNameValidation.message;
    }

    const lastNameValidation = validators.name(formData.lastName);
    if (!lastNameValidation.valid) {
      newErrors.lastName = lastNameValidation.message;
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    const pincodeValidation = validators.pincode(formData.pincode);
    if (!pincodeValidation.valid) {
      newErrors.pincode = pincodeValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    await register(formData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary-grey-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        

        <Card>
          <AuthHeader subtitle="Create your account" />
            <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              required
              maxLength={10}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />

              <Input
                label="Last Name"
                name="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              label="City"
              name="city"
              type="text"
              placeholder="Enter your city"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              required
            />

            <Input
              label="Pincode"
              name="pincode"
              type="text"
              placeholder="Enter 6-digit pincode"
              value={formData.pincode}
              onChange={handleChange}
              error={errors.pincode}
              required
              maxLength={6}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Register
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-primary-grey-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#3D1D1C] font-medium hover:underline"
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