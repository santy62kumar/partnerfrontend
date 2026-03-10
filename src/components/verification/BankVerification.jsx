import React, { useState } from 'react';
import { verificationApi } from '@api/verificationApi';
import { validators } from '@utils/validators';
import { formatters } from '@utils/formatters';
import { useToast } from '@hooks/useToast';
import { CheckCircle2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

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
      <Card className="border-border/80 shadow-sm opacity-80 bg-secondary/10">
        <CardContent className="pt-8 pb-8 text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Previous Step Required</h3>
          <p className="text-muted-foreground border border-transparent">
            Please verify your PAN first to unlock bank verification.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isBankVerified) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="pt-8 pb-8 text-center flex flex-col items-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Bank Details Verified</h3>
          <p className="text-muted-foreground">Your bank information has been securely saved.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-sm hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle className="text-xl">Bank Details Verification</CardTitle>
        <CardDescription>
          Add your bank account details to receive payments. Your information is securely encrypted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                type="text"
                placeholder="Enter your account number"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                className={errors.accountNumber ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.accountNumber && <p className="text-xs text-destructive mt-1">{errors.accountNumber}</p>}
              {!errors.accountNumber && <p className="text-xs text-muted-foreground mt-1">9-18 digit account number</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC Code</Label>
              <Input
                id="ifsc"
                name="ifsc"
                type="text"
                placeholder="ABCD0123456"
                value={formData.ifsc}
                onChange={handleChange}
                maxLength={11}
                required
                className={errors.ifsc ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.ifsc && <p className="text-xs text-destructive mt-1">{errors.ifsc}</p>}
              {!errors.ifsc && <p className="text-xs text-muted-foreground mt-1">11-character IFSC code (e.g., ABCD0123456)</p>}
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-primary font-medium">
              Note: IFSC code will be automatically converted to uppercase format.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="default"
            size="lg"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Bank Details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankVerification;