import React, { useState } from 'react';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { verificationApi } from '@api/verificationApi';
import { validators } from '@utils/validators';
import { formatters } from '@utils/formatters';
import { useToast } from '@hooks/useToast';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';

/**
 * PAN Verification Component
 * First step in verification process
 */
const PANVerification = ({ onSuccess, isPanVerified }) => {
  const toast = useToast();
  const [pan, setPan] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = formatters.uppercase(e.target.value);
    setPan(value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validators.pan(pan);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setLoading(true);
    try {
      // await verificationApi.verifyPan(pan);
      const panResponse = await verificationApi.verifyPan(pan);
      console.log("PAN Verification Response:", panResponse);
      toast.success('PAN verified successfully!');
      onSuccess();
    } catch (err) {
      const message = err.message || 'PAN verification failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (isPanVerified) {
    return (
      <Card>
        <div className="text-center py-8">
          <IoCheckmarkCircleOutline
            size={64}
            className="text-[#3D1D1C] mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-primary-grey-900 mb-2">
            PAN Verified Successfully
          </h3>
          <p className="text-primary-grey-600">
            Your PAN has been verified. Proceed to the next step.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="PAN Verification">
      <form onSubmit={handleSubmit}>
        <p className="text-sm text-primary-grey-600 mb-4">
          Please enter your PAN number to verify your identity. Make sure it matches your official documents.
        </p>

        <Input
          label="PAN Number"
          name="pan"
          type="text"
          placeholder="ABCDE1234F"
          value={pan}
          onChange={handleChange}
          error={error}
          required
          maxLength={10}
          helperText="Enter 10-character PAN (e.g., ABCDE1234F)"
        />

        <div className="bg-[#3D1D1C]/50 border border-[#3D1D1C]/200 rounded-lg p-3 mb-4">
          <p className="text-xs text-[#3D1D1C]/800">
            <strong>Note:</strong> Your PAN will be automatically converted to uppercase format.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={pan.length !== 10}
        >
          Verify PAN
        </Button>
      </form>
    </Card>
  );
};

export default PANVerification;