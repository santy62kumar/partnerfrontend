import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import useRequisiteStore from '../store/requisiteStore';
import { bomAPI } from '../api/bomApi';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

const SubmitPage = () => {
  const navigate = useNavigate();
  const { bucket, salesOrder, cabinetPosition, clearBucket } = useRequisiteStore();

  const [srPoc, setSrPoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bucket.length === 0) {
      setError('Bucket is empty. Please add items before submitting.');
      return;
    }

    if (!salesOrder || !cabinetPosition) {
      setError('Sales order and cabinet position are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        sales_order: salesOrder,
        cabinet_position: cabinetPosition,
        sr_poc: srPoc || null,
        items: bucket
      };

      await bomAPI.submitRequisite(payload);
      setSuccess(true);

      setTimeout(() => {
        clearBucket();
        navigate('/site-requisite-history');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit requisite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 animate-fadeIn">
        <Card className="border-border/80 shadow-md p-2 max-w-md w-full text-center">
          <CardContent className="pt-8 pb-4 px-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6 animate-bounce-slight">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-3">
              Requisite Submitted!
            </h2>
            <p className="text-muted-foreground mb-8">
              Your site requisite has been created and saved successfully.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={() => navigate('/site-requisite-history')}
                size="lg"
                className="w-full"
              >
                View History
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearBucket();
                  navigate('/site-requisite');
                }}
                size="lg"
                className="w-full"
              >
                Create New Requisite
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/site-requisite/bucket')}
          className="h-10 w-10 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold font-heading text-foreground flex items-center gap-3">
          Submit Site Requisite
        </h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Submission Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="border-border/80 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6 font-heading">
                Requisite Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sales Order */}
                <div className="space-y-2">
                  <Label>
                    Sales Order <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={salesOrder}
                    disabled
                    className="bg-muted opacity-70"
                  />
                </div>

                {/* Cabinet Position */}
                <div className="space-y-2">
                  <Label>
                    Cabinet Position <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={cabinetPosition}
                    disabled
                    className="bg-muted opacity-70"
                  />
                </div>

                {/* SR POC */}
                <div className="space-y-2">
                  <Label>
                    SR POC (Point of Contact)
                  </Label>
                  <Input
                    type="text"
                    value={srPoc}
                    onChange={(e) => setSrPoc(e.target.value)}
                    placeholder="Enter POC name or email"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/site-requisite/bucket')}
                    size="lg"
                    className="flex-1"
                  >
                    Back to Bucket
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || bucket.length === 0}
                    size="lg"
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-1">
          <Card className="border-border/80 shadow-sm sticky top-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-5 font-heading">
                Summary
              </h2>

              <div className="space-y-3 mb-6 bg-secondary/30 p-4 rounded-md border border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-semibold text-foreground text-lg">{bucket.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Sales Order</span>
                  <span className="font-medium text-foreground">{salesOrder || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Cabinet</span>
                  <span className="font-medium text-foreground">{cabinetPosition || 'N/A'}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center justify-between">
                  Items to Submit
                  <span className="text-xs font-normal text-muted-foreground">{bucket.length} items</span>
                </h3>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {bucket.map((item, index) => (
                    <div key={item.product_name} className="text-xs bg-muted/40 p-3 rounded-md border border-border/50">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <span className="font-medium text-foreground break-words leading-tight">
                          {index + 1}. {item.product_name}
                        </span>
                        <div className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                          x{item.quantity}
                        </div>
                      </div>
                      {item.responsible_department && (
                        <div className="text-muted-foreground flex items-center gap-1 mt-1.5 pt-1.5 border-t border-border/30">
                          <span className="scale-75 origin-left">🏢</span> Dept: {item.responsible_department}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitPage;