import React, { useState } from 'react';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import { verificationApi } from '@api/verificationApi';
import { validators } from '@utils/validators';
import { formatters } from '@utils/formatters';
import { useToast } from '@hooks/useToast';
import { IoCheckmarkCircleOutline, IoLockClosedOutline } from 'react-icons/io5';

/**
 * Bank Verification Component
 * Second step in verification process
 */
const BankVerification = ({ onSuccess, isBankVerified, canProceed }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    accountNumber: '',
    ifsc: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'ifsc' ? formatters.uppercase(value) : value;
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const accountValidation = validators.accountNumber(formData.accountNumber);
    if (!accountValidation.valid) {
      newErrors.accountNumber = accountValidation.message;
    }

    const ifscValidation = validators.ifsc(formData.ifsc);
    if (!ifscValidation.valid) {
      newErrors.ifsc = ifscValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await verificationApi.verifyBank(
        formData.accountNumber,
        formData.ifsc
      );
      toast.success('Bank details verified successfully!');
      onSuccess();
    } catch (err) {
      const message = err.message || 'Bank verification failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!canProceed) {
    return (
      <Card>
        <div className="text-center py-8">
          <IoLockClosedOutline
            size={64}
            className="text-primary-grey-400 mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-primary-grey-900 mb-2">
            Complete Previous Step
          </h3>
          <p className="text-primary-grey-600">
            Please verify your PAN first to proceed with bank verification.
          </p>
        </div>
      </Card>
    );
  }

  if (isBankVerified) {
    return (
      <Card>
        <div className="text-center py-8">
          <IoCheckmarkCircleOutline
            size={64}
            className="text-[#3D1D1C] mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-primary-grey-900 mb-2">
            Bank Details Verified
          </h3>
          <p className="text-primary-grey-600">
            Your bank details have been verified successfully.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Bank Details Verification">
      <form onSubmit={handleSubmit}>
        <p className="text-sm text-primary-grey-600 mb-4">
          Add your bank account details to receive payments. Your information is secure and encrypted.
        </p>

        <Input
          label="Account Number"
          name="accountNumber"
          type="text"
          placeholder="Enter your account number"
          value={formData.accountNumber}
          onChange={handleChange}
          error={errors.accountNumber}
          required
          helperText="9-18 digit account number"
        />

        <Input
          label="IFSC Code"
          name="ifsc"
          type="text"
          placeholder="ABCD0123456"
          value={formData.ifsc}
          onChange={handleChange}
          error={errors.ifsc}
          required
          maxLength={11}
          helperText="11-character IFSC code (e.g., ABCD0123456)"
        />

        <div className="bg-[#3D1D1C]/50 border border-[#3D1D1C]/200 rounded-lg p-3 mb-4">
          <p className="text-xs text-[#3D1D1C]/800">
            <strong>Note:</strong> IFSC code will be automatically converted to uppercase format.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Verify Bank Details
        </Button>
      </form>
    </Card>
  );
};

export default BankVerification;