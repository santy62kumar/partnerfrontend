import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import BOMTreeNode from '../components/BOMTreeNode';
import AddToBucketModal from '../components/AddToBucketModal';
import useRequisiteStore from '../store/requisiteStore';
import { bomAPI } from '../api/bomApi';

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Site Requisite</h1>
          <button
            onClick={() => navigate('/site-requisite/bucket')}
            className="flex items-center gap-2 px-4 py-2 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            Bucket
            {bucket.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {bucket.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleFetchBOM} className="flex gap-4">
            <input
              type="text"
              placeholder="Sales Order"
              value={salesOrder}
              onChange={(e) => setSalesOrder(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/500"
              required
            />
            <input
              type="text"
              placeholder="Cabinet Position"
              value={cabinetPosition}
              onChange={(e) => setCabinetPosition(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
        
        {/* BOM Tree */}
        {bomData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">BOM Hierarchy</h2>
            <div className="space-y-1">
              {bomData.map((item, index) => (
                <BOMTreeNode
                  key={`${item.product_name}-${index}`}
                  node={item}
                  onAddToBucket={handleAddToBucket}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
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