import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Building2, FolderOpen, MapPin, UserCircle2, BadgeCheck, AlertCircle, Clock } from 'lucide-react';
import BOMTreeNode from '../components/BOMTreeNode';
import AddToBucketModal from '../components/AddToBucketModal';
import useRequisiteStore from '../store/requisiteStore';
import { bomAPI } from '../api/bomApi';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

const SiteRequisitePage = () => {
  const navigate = useNavigate();
  const [salesOrder, setSalesOrder] = useState('');
  const [cabinetPosition, setCabinetPosition] = useState('');
  const [allCabinets, setAllCabinets] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsError, setDetailsError] = useState('');

  const { bomData, setBOMData, addToBucket, bucket, soDetails } = useRequisiteStore();

  const formatOrderState = (value) => {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized) return '';

    const labels = {
      draft: 'Quotation',
      sent: 'Quotation Sent',
      sale: 'Confirmed',
      done: 'Locked',
      cancel: 'Cancelled',
    };

    return labels[normalized] || normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleFetchBOM = async (e) => {
    e.preventDefault();
    const normalizedSalesOrder = salesOrder.trim();
    const normalizedCabinetPosition = allCabinets ? 'ALL' : cabinetPosition.trim();

    if (!normalizedSalesOrder || !normalizedCabinetPosition) {
      setError('Sales order and cabinet position are required.');
      return;
    }

    setLoading(true);
    setError('');
    setDetailsError('');

    try {
      const [data, details] = await Promise.allSettled([
        bomAPI.fetchBOM(normalizedSalesOrder, normalizedCabinetPosition),
        bomAPI.lookupSO(normalizedSalesOrder),
      ]);

      if (data.status === 'rejected') {
        throw data.reason;
      }

      setSalesOrder(normalizedSalesOrder);
      setCabinetPosition(normalizedCabinetPosition);
      const resolvedDetails = details.status === 'fulfilled' ? details.value : null;
      setBOMData(data.value, normalizedSalesOrder, normalizedCabinetPosition, resolvedDetails);

      if (details.status === 'rejected') {
        setDetailsError(details.reason?.message || details.reason?.data?.detail || 'Failed to fetch sales order details from Odoo.');
      }
    } catch (err) {
      setError(err?.message || err?.data?.detail || 'Failed to fetch BOM data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBucket = (item) => {
    setSelectedItem(item);
  };

  const handleSaveToBucket = (itemData) => {
    addToBucket(itemData);
    setSelectedItem(null);
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Site Requisite</h1>
          <p className="text-muted-foreground mt-1">Search and manage BOM for your site</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/site-requisite-history')}
            className="h-11 px-6"
          >
            <Clock className="w-5 h-5 mr-2" />
            History
          </Button>
          <Button
            onClick={() => navigate('/site-requisite/bucket')}
            className="relative h-11 px-6 shadow-sm"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Bucket
            {bucket.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-background">
                {bucket.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Search Form */}
      <Card className="mb-8 border-border/80 shadow-sm transition-all hover:shadow-md">
        <CardContent className="pt-6">
          <form onSubmit={handleFetchBOM} className="flex flex-col sm:flex-row items-end gap-5">
            <div className="flex-1 w-full space-y-2">
              <Label htmlFor="salesOrder">Sales Order</Label>
              <Input
                id="salesOrder"
                name="salesOrder"
                placeholder="Enter Sales Order"
                value={salesOrder}
                onChange={(e) => setSalesOrder(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="cabinetPosition">Cabinet Position</Label>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={allCabinets}
                    onChange={(e) => setAllCabinets(e.target.checked)}
                  />
                  All cabinets
                </label>
              </div>
              <Input
                id="cabinetPosition"
                name="cabinetPosition"
                placeholder="Enter Cabinet Position"
                value={allCabinets ? 'ALL' : cabinetPosition}
                onChange={(e) => setCabinetPosition(e.target.value)}
                disabled={allCabinets}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto mt-4 sm:mt-0 h-10 px-6"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>

          {error && (
            <div className="mt-5 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          {detailsError && (
            <div className="mt-4 flex items-start gap-3 rounded-md border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">SO details not available yet</p>
                <p className="mt-1">{detailsError} Fetch the SO details successfully before submitting the site requisite.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SO Details */}
      {soDetails && (
        <Card className="mb-6 border-border/80 shadow-sm animate-slideUp">
          <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sales Order Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4 px-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {soDetails.customer_name && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Customer</p>
                    <p className="font-medium text-foreground">{soDetails.customer_name}</p>
                  </div>
                </div>
              )}
              {soDetails.project_name && (
                <div className="flex items-start gap-2">
                  <FolderOpen className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Project</p>
                    <p className="font-medium text-foreground">{soDetails.project_name}</p>
                  </div>
                </div>
              )}
              {soDetails.client_order_ref && (
                <div className="flex items-start gap-2">
                  <UserCircle2 className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">SO POC</p>
                    <p className="font-medium text-foreground">{soDetails.client_order_ref}</p>
                  </div>
                </div>
              )}
              {soDetails.order_state && (
                <div className="flex items-start gap-2">
                  <BadgeCheck className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Order Status</p>
                    <p className="font-medium text-foreground">{formatOrderState(soDetails.order_state)}</p>
                  </div>
                </div>
              )}
              {(soDetails.address_line_1 || soDetails.city) && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Delivery Address</p>
                    <p className="font-medium text-foreground">
                      {[soDetails.address_line_1, soDetails.address_line_2, soDetails.city, soDetails.state, soDetails.pincode]
                        .filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* BOM Tree */}
      {bomData.length > 0 && (
        <Card className="border-border/80 shadow-sm mb-8 animate-slideUp">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle className="text-lg">BOM Hierarchy</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {bomData.map((item, index) => (
                <BOMTreeNode
                  key={`${item.product_name}-${index}`}
                  node={item}
                  onAddToBucket={handleAddToBucket}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add to Bucket Modal */}
      {selectedItem && (
        <AddToBucketModal
          item={selectedItem}
          onSave={handleSaveToBucket}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default SiteRequisitePage;
