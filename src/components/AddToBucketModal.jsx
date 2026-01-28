// src/components/AddToBucketModal.jsx

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const AddToBucketModal = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    issue_description: '',
    responsible_department: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      product_name: item.product_name,
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add to Bucket</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={item.product_name}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/50"
              required
            />
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Description
            </label>
            <textarea
              rows="3"
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              placeholder="Describe the issue or requirement..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/50"
            />
          </div>

          {/* Responsible Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsible Department
            </label>
            <input
              type="text"
              value={formData.responsible_department}
              onChange={(e) => setFormData({ ...formData, responsible_department: e.target.value })}
              placeholder="e.g., Production, Quality, Maintenance"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/50"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add to Bucket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToBucketModal;