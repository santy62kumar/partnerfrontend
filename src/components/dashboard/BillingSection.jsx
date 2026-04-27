import React from 'react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { useBilling, useRequestInvoice } from '@hooks/useQueryHooks';
import { useToast } from '@hooks/useToast';
import { IoReceiptOutline, IoCheckmarkCircleOutline, IoTimeOutline, IoCloseCircleOutline, IoPrintOutline } from 'react-icons/io5';
import { dashboardApi } from '@api/dashboardApi';

const BillingSection = ({ job }) => {
  const toast = useToast();
  const { data: billing, isLoading } = useBilling(job?.id);
  const { mutateAsync: requestInvoice, isPending } = useRequestInvoice(job?.id);
  const [downloading, setDownloading] = React.useState(false);

  const invoiceRequest = billing?.invoice_request;
  const status = invoiceRequest?.status;

  const handleRequest = async () => {
    try {
      await requestInvoice();
      toast.success('Invoice request submitted');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to submit invoice request');
    }
  };

  const handleDownloadInvoice = async () => {
    if (!job?.id) return;
    setDownloading(true);
    try {
      await dashboardApi.downloadInvoice(job.id, job.name);
      toast.success('Bill downloaded');
    } catch (err) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to download bill');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Card title="Billing">
        <p className="text-sm text-muted-foreground">Loading billing information…</p>
      </Card>
    );
  }

  return (
    <Card
      title="Billing"
      headerRight={<IoReceiptOutline size={18} className="text-muted-foreground" />}
    >
      {!invoiceRequest && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            No invoice request yet. Submit a request to generate your invoice.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRequest}
            disabled={isPending}
          >
            {isPending ? 'Submitting…' : 'Request Invoice'}
          </Button>
        </div>
      )}

      {status === 'pending' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <IoTimeOutline size={18} />
            <p className="text-sm font-medium">Invoice request pending admin approval</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Requested on {new Date(invoiceRequest.requested_at).toLocaleDateString('en-IN')}
          </p>
        </div>
      )}

      {status === 'rejected' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <IoCloseCircleOutline size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Invoice request rejected</p>
              {invoiceRequest.rejection_reason && (
                <p className="text-xs mt-1">{invoiceRequest.rejection_reason}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequest}
            disabled={isPending}
          >
            {isPending ? 'Submitting…' : 'Re-request Invoice'}
          </Button>
        </div>
      )}

      {status === 'approved' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
            <IoCheckmarkCircleOutline size={18} />
            <p className="text-sm font-medium">Invoice approved</p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadInvoice}
              disabled={downloading}
            >
              <IoPrintOutline size={16} />
              {downloading ? 'Downloading...' : 'Download Bill XLSX'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BillingSection;
