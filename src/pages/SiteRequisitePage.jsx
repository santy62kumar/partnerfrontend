import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import BOMTreeNode from '../components/BOMTreeNode';
import AddToBucketModal from '../components/AddToBucketModal';
import useRequisiteStore from '../store/requisiteStore';
import { bomAPI } from '../api/bomApi';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import Input from '@components/common/Input';

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
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-montserrat text-primary-grey-900">Site Requisite</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/site-requisite/bucket')}
          className="relative"
        >
          <ShoppingCart className="w-5 h-5" />
          Bucket
          {bucket.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {bucket.length}
            </span>
          )}
        </Button>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <form onSubmit={handleFetchBOM} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Sales Order"
              name="salesOrder"
              placeholder="Enter Sales Order"
              value={salesOrder}
              onChange={(e) => setSalesOrder(e.target.value)}
              required
            />
          </div>
          <div className="flex-1">
            <Input
              label="Cabinet Position"
              name="cabinetPosition"
              placeholder="Enter Cabinet Position"
              value={cabinetPosition}
              onChange={(e) => setCabinetPosition(e.target.value)}
              required
            />
          </div>
          <div className="self-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              <Search className="w-5 h-5" />
              Search
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
      </Card>

      {/* BOM Tree */}
      {bomData.length > 0 && (
        <Card title="BOM Hierarchy">
          <div className="space-y-1">
            {bomData.map((item, index) => (
              <BOMTreeNode
                key={`${item.product_name}-${index}`}
                node={item}
                onAddToBucket={handleAddToBucket}
              />
            ))}
          </div>
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