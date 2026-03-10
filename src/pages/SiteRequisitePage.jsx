import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const { bomData, setBOMData, addToBucket, bucket } = useRequisiteStore();

  const handleFetchBOM = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await bomAPI.fetchBOM(salesOrder, cabinetPosition);
      setBOMData(data, salesOrder, cabinetPosition);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch BOM data');
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
              <Label htmlFor="cabinetPosition">Cabinet Position</Label>
              <Input
                id="cabinetPosition"
                name="cabinetPosition"
                placeholder="Enter Cabinet Position"
                value={cabinetPosition}
                onChange={(e) => setCabinetPosition(e.target.value)}
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
        </CardContent>
      </Card>

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