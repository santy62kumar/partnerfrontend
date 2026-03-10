import React, { useState } from 'react';
import { verificationApi } from '@api/verificationApi';
import { validators } from '@utils/validators';
import { formatters } from '@utils/formatters';
import { useToast } from '@hooks/useToast';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

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
      <Card className="border-border/80 shadow-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
          <h3 className="text-xl font-semibold text-foreground mb-2">PAN Verified Successfully</h3>
          <p className="text-muted-foreground">Your PAN has been verified. Proceed to the next step.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-sm hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle className="text-xl">PAN Verification</CardTitle>
        <CardDescription>
          Please enter your PAN number to verify your identity. Make sure it matches your official documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pan">PAN Number</Label>
            <Input
              id="pan"
              name="pan"
              type="text"
              placeholder="ABCDE1234F"
              value={pan}
              onChange={handleChange}
              maxLength={10}
              required
              className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            {!error && <p className="text-xs text-muted-foreground mt-1">Enter 10-character PAN (e.g., ABCDE1234F)</p>}
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-primary font-medium">
              Note: Your PAN will be automatically converted to uppercase format.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="default"
            size="lg"
            disabled={loading || pan.length !== 10}
          >
            {loading ? "Verifying..." : "Verify PAN"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PANVerification;