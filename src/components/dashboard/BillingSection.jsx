import React from 'react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import { useBilling, useRequestAdditionalInvoice, useRequestInvoice } from '@hooks/useQueryHooks';
import { useToast } from '@hooks/useToast';
import { IoReceiptOutline, IoCheckmarkCircleOutline, IoTimeOutline, IoCloseCircleOutline, IoPrintOutline } from 'react-icons/io5';
import { dashboardApi } from '@api/dashboardApi';
import StatusBadge from '@components/common/StatusBadge';
import { getApiErrorMessage, getApiFieldErrors } from '../../api/apiErrors';

const BillingSection = ({ job }) => {
  const toast = useToast();
  const { data: billing, isLoading, error, refetch } = useBilling(job?.id);
  const { mutateAsync: requestInvoice, isPending } = useRequestInvoice(job?.id);
  const { mutateAsync: requestAdditional, isPending: isAdditionalPending } = useRequestAdditionalInvoice(job?.id);
  const [downloadingId, setDownloadingId] = React.useState(null);
  const [showAdditionalForm, setShowAdditionalForm] = React.useState(false);
  const [completionPercentage, setCompletionPercentage] = React.useState('');
  const [invoiceNotes, setInvoiceNotes] = React.useState('');
  const [formError, setFormError] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState({});

  const invoiceRequest = billing?.invoice_request;
  const status = invoiceRequest?.status;

  const handleRequest = async () => {
    try {
      await requestInvoice();
      toast.success('Invoice request submitted');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDownloadInvoice = async (invoiceRequestId) => {
    if (!job?.id) return;
    setDownloadingId(invoiceRequestId);
    try {
      await dashboardApi.downloadInvoice(job.id, job.name, invoiceRequestId);
      toast.success('Bill downloaded');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAdditionalRequest = async () => {
    setFormError('');
    setFieldErrors({});
    const percentage = completionPercentage === '' ? undefined : Number(completionPercentage);
    if (percentage !== undefined && (!Number.isInteger(percentage) || percentage < 0 || percentage > 100)) {
      toast.error('Completion percentage must be a whole number from 0 to 100');
      return;
    }
    try {
      await requestAdditional({
        completion_percentage: percentage,
        notes: invoiceNotes.trim() || undefined,
      });
      setCompletionPercentage('');
      setInvoiceNotes('');
      setShowAdditionalForm(false);
      toast.success('Additional invoice request submitted');
    } catch (err) {
      const message = getApiErrorMessage(err);
      setFormError(message);
      setFieldErrors(getApiFieldErrors(err));
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <Card title="Billing">
        <p className="text-sm text-muted-foreground">Loading billing information…</p>
      </Card>
    );
  }

  if (error && !billing) {
    return (
      <Card title="Billing">
        <p className="mb-3 text-sm text-destructive">{getApiErrorMessage(error)}</p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>Retry</Button>
      </Card>
    );
  }

  return (
    <Card
      title="Billing"
      headerRight={<IoReceiptOutline size={18} className="text-muted-foreground" />}
    >
      {error ? <Card className="mb-4 border-warning/30 bg-warning/10" padding="p-3"><p className="text-sm text-warning">Showing saved billing data. {getApiErrorMessage(error)}</p></Card> : null}
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
          <div className="flex items-center gap-2 text-warning">
            <IoTimeOutline size={18} />
            <p className="text-sm font-medium">Invoice request pending admin approval</p>
            <StatusBadge tone="warning">Pending</StatusBadge>
          </div>
          <p className="text-xs text-muted-foreground">
            Requested on {new Date(invoiceRequest.requested_at).toLocaleDateString('en-IN')}
          </p>
        </div>
      )}

      {status === 'rejected' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-destructive">
            <IoCloseCircleOutline size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Invoice request rejected</p>
              {invoiceRequest.rejection_reason && (
                <p className="text-xs mt-1">{invoiceRequest.rejection_reason}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {status === 'approved' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-success">
            <IoCheckmarkCircleOutline size={18} />
            <p className="text-sm font-medium">Invoice approved</p>
            <StatusBadge tone="success">Approved</StatusBadge>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadInvoice(invoiceRequest.id)}
              disabled={downloadingId === invoiceRequest.id}
            >
              <IoPrintOutline size={16} />
              {downloadingId === invoiceRequest.id ? 'Downloading...' : 'Download Bill XLSX'}
            </Button>
          </div>
        </div>
      )}

      {invoiceRequest && (invoiceRequest.completion_percentage != null || invoiceRequest.notes) && (
        <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
          {invoiceRequest.completion_percentage != null && <p><span className="text-muted-foreground">Completion:</span> {invoiceRequest.completion_percentage}%</p>}
          {invoiceRequest.notes && <p className="mt-1 whitespace-pre-wrap"><span className="text-muted-foreground">Notes:</span> {invoiceRequest.notes}</p>}
        </div>
      )}

      {invoiceRequest && status !== 'pending' && (
        <div className="mt-4 border-t border-border pt-4">
          {!showAdditionalForm ? (
            <Button variant="outline" size="sm" onClick={() => setShowAdditionalForm(true)}>
              {status === 'rejected' ? 'Request again' : 'Request another invoice'}
            </Button>
          ) : (
            <div className="space-y-3">
              {formError ? <p role="alert" className="text-sm text-destructive">{formError}</p> : null}
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Completion percentage (optional)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={completionPercentage}
                  onChange={(event) => setCompletionPercentage(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                {fieldErrors.completion_percentage ? <span className="text-xs text-destructive">{fieldErrors.completion_percentage}</span> : null}
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Notes (optional)</span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={invoiceNotes}
                  onChange={(event) => setInvoiceNotes(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                {fieldErrors.notes ? <span className="text-xs text-destructive">{fieldErrors.notes}</span> : null}
              </label>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdditionalRequest} disabled={isAdditionalPending}>
                  {isAdditionalPending ? 'Submitting…' : 'Submit request'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowAdditionalForm(false)} disabled={isAdditionalPending}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {(billing?.invoice_requests || []).some(invoice => invoice.status === 'approved' && invoice.id !== invoiceRequest?.id) && (
        <div className="mt-4 space-y-2 border-t pt-4">
          <p className="text-sm font-medium">Previous approved invoices</p>
          <div className="flex flex-wrap gap-2">
            {(billing?.invoice_requests || [])
              .filter(invoice => invoice.status === 'approved' && invoice.id !== invoiceRequest?.id)
              .map(invoice => (
                <Button
                  key={invoice.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadInvoice(invoice.id)}
                  disabled={downloadingId === invoice.id}
                >
                  <IoPrintOutline size={16} />
                  {downloadingId === invoice.id ? 'Downloading...' : (invoice.invoice_number || `Invoice ${invoice.id}`)}
                </Button>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BillingSection;
