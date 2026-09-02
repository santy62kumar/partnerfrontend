import React, { useCallback, useEffect, useState } from 'react';
import { Package, CheckCircle2, AlertTriangle, Loader2, ClipboardCheck, ArrowLeft, ChevronRight, Clock } from 'lucide-react';
import { grnApi } from '../api/grnApi';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import StatusBadge from '../components/common/StatusBadge';
import { getApiErrorMessage } from '../api/apiErrors';

const GRNDetail = ({ grn, showBack, onBack, onUpdated }) => {
  const [received, setReceived] = useState(() => {
    const initial = {};
    grn.packages.forEach(p => { initial[p.id] = p.is_received; });
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showMissingAlert, setShowMissingAlert] = useState(false);

  const submitted = grn.status === 'submitted';

  const toggle = (pkgId) => {
    if (submitted) return;
    setReceived(prev => ({ ...prev, [pkgId]: !prev[pkgId] }));
  };

  const handleSubmit = async () => {
    const missing = grn.packages.filter(p => !received[p.id]);
    if (missing.length > 0) {
      setShowMissingAlert(true);
      return;
    }
    await doSubmit();
  };

  const doSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    setShowMissingAlert(false);
    try {
      const packages = grn.packages.map(p => ({
        package_id: p.id,
        is_received: received[p.id] ?? false,
      }));
      const updated = await grnApi.submit(grn.id, packages);
      onUpdated(updated);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const missingCount = grn.packages.filter(p => !received[p.id]).length;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to all GRNs">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Package className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site GRN</h1>
          <p className="text-sm text-muted-foreground">
            {grn.source_document}
            {grn.odoo_picking_name && grn.odoo_picking_name !== grn.source_document && (
              <> · {grn.odoo_picking_name}</>
            )}
          </p>
        </div>
      </div>

      {/* Status */}
      {submitted && (
        <Card className={grn.has_missing ? 'border-destructive/30 bg-destructive/10' : 'border-success/30 bg-success/10'}>
          <CardContent className="flex items-start gap-3 p-4">
          {grn.has_missing
            ? <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            : <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
          }
          <div>
            <p className={`font-semibold ${grn.has_missing ? 'text-destructive' : 'text-success'}`}>
              {grn.has_missing ? 'Submitted with missing packages' : 'All packages received'}
            </p>
            <p className="text-xs mt-0.5 text-muted-foreground">
              Submitted on {new Date(grn.submitted_at).toLocaleString()}
            </p>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Missing alert dialog */}
      {showMissingAlert && (
        <Card className="border-warning/30 bg-warning/10">
          <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-warning">
                {missingCount} package{missingCount !== 1 ? 's' : ''} not marked as received
              </p>
              <p className="text-sm text-warning-foreground mt-1">
                Submitting now will flag this GRN and alert the supervisor. Continue?
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowMissingAlert(false)}>
              Go back
            </Button>
            <Button variant="destructive" size="sm" onClick={() => doSubmit()} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit with missing'}
            </Button>
          </div>
          </CardContent>
        </Card>
      )}

      {/* Package list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Packages</span>
            <span className="text-sm font-normal text-muted-foreground">
              {grn.packages.filter(p => received[p.id]).length} / {grn.packages.length} received
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {grn.packages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No packages are attached to this GRN.</p>
          ) : grn.packages.map(pkg => {
            const isReceived = received[pkg.id] ?? false;
            return (
              <Button
                variant="outline"
                key={pkg.id}
                onClick={() => toggle(pkg.id)}
                disabled={submitted}
                className={`h-auto w-full justify-start gap-3 px-4 py-3 text-left ${
                  isReceived
                    ? 'border-success/30 bg-success/10 text-success hover:bg-success/15'
                    : 'border-border hover:border-primary/50'
                } ${submitted ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
              >
                <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isReceived ? 'bg-success border-success' : 'border-muted-foreground'
                }`}>
                  {isReceived && <CheckCircle2 className="h-3.5 w-3.5 text-success-foreground" />}
                </div>
                <span className="font-medium text-sm flex-1">{pkg.package_name}</span>
                {!isReceived && !submitted && (
                  <span className="text-xs text-muted-foreground">Tap to mark received</span>
                )}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Submit error */}
      {submitError && (
        <p role="alert" className="text-sm text-destructive text-center">{submitError}</p>
      )}

      {/* Submit button */}
      {!submitted && (
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            <><ClipboardCheck className="h-4 w-4" /> Submit GRN</>
          )}
        </Button>
      )}
    </div>
  );
};

const SiteGRNPage = () => {
  const [grns, setGrns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canRetry, setCanRetry] = useState(false);

  const loadGrns = useCallback(() => {
    setLoading(true);
    setError('');
    setCanRetry(false);
    grnApi.getAssigned()
      .then(data => {
        const list = Array.isArray(data) ? data : (data ? [data] : []);
        setGrns(list);
        setError('');
        if (list.length === 1) setSelectedId(list[0].id);
      })
      .catch(err => {
        const status = err?.status ?? err?.response?.status;
        if (status === 404) {
          setError('No pending GRN assigned to you.');
        } else {
          setError(getApiErrorMessage(err));
          setCanRetry(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadGrns, 0);
    return () => window.clearTimeout(timer);
  }, [loadGrns]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Loading your GRN...</p>
      </div>
    );
  }

  if (error && grns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Package className="h-12 w-12 opacity-30" />
        <p className="text-center max-w-sm">{error}</p>
        {canRetry && <Button variant="outline" onClick={loadGrns}>Try again</Button>}
      </div>
    );
  }

  const selected = grns.find(g => g.id === selectedId);

  if (!selected) {
    // List view: multiple deliveries pending under one or more source documents
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Package className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Site GRN</h1>
            <p className="text-sm text-muted-foreground">{grns.length} pending deliveries</p>
          </div>
        </div>
        {error ? (
          <Card className="border-warning/30 bg-warning/10"><CardContent role="alert" className="p-4 text-sm text-warning">Showing saved GRNs. {error}</CardContent></Card>
        ) : null}
        <div className="space-y-3">
          {grns.map(g => (
            <Button
              variant="outline"
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              className="h-auto w-full justify-start gap-3 px-4 py-3 text-left hover:border-primary/50"
            >
              {g.status === 'submitted'
                ? <StatusBadge tone="success"><CheckCircle2 className="h-3 w-3" /> Submitted</StatusBadge>
                : <StatusBadge tone="warning"><Clock className="h-3 w-3" /> Pending</StatusBadge>
              }
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {g.odoo_picking_name || g.source_document}
                </p>
                <p className="text-xs text-muted-foreground">
                  {g.source_document} · {g.packages.length} package{g.packages.length !== 1 ? 's' : ''}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <GRNDetail
      key={selected.id}
      grn={selected}
      showBack={grns.length > 1}
      onBack={() => setSelectedId(null)}
      onUpdated={updated => setGrns(prev => prev.map(g => (g.id === updated.id ? updated : g)))}
    />
  );
};

export default SiteGRNPage;
