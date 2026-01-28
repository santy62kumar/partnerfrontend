// src/pages/BucketPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Trash2, 
  Edit2, 
  Send,
  AlertCircle
} from 'lucide-react';
import useRequisiteStore from '../store/requisiteStore';

const BucketPage = () => {
  const navigate = useNavigate();
  const { bucket, removeFromBucket, updateBucketItem, salesOrder, cabinetPosition } = useRequisiteStore();
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: 1,
    issue_description: '',
    responsible_department: ''
  });

  const handleEdit = (item) => {
    setEditingItem(item.product_name);
    setEditForm({
      quantity: item.quantity || 1,
      issue_description: item.issue_description || '',
      responsible_department: item.responsible_department || ''
    });
  };

  const handleSaveEdit = (productName) => {
    updateBucketItem(productName, editForm);
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({
      quantity: 1,
      issue_description: '',
      responsible_department: ''
    });
  };

  const handleSubmit = () => {
    if (bucket.length === 0) {
      alert('Bucket is empty. Please add items before submitting.');
      return;
    }
    navigate('/site-requisite/bucket/submit');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/site-requisite')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-[#3D1D1C]" />
                Bucket List
              </h1>
              {salesOrder && cabinetPosition && (
                <p className="text-sm text-gray-600 mt-1">
                  SO: {salesOrder} | Cabinet: {cabinetPosition}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={bucket.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            Submit Requisite
          </button>
        </div>

        {/* Empty State */}
        {bucket.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Your bucket is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add items from the BOM tree to create a site requisite
            </p>
            <button
              onClick={() => navigate('/site-requisite')}
              className="px-6 py-2 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors"
            >
              Browse BOM Items
            </button>
          </div>
        ) : (
          <>
            {/* Info Banner */}
            {/* <div className="bg-[#3D1D1C]/50 border border-[#3D1D1C]/200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#3D1D1C] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#3D1D1C]/800">
                <p className="font-semibold mb-1">Review your items before submitting</p>
                <p>You can edit quantities, add issue descriptions, and assign responsible departments for each item.</p>
              </div>
            </div> */}

            {/* Bucket Items */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Issue Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Responsible Dept.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bucket.map((item, index) => (
                      <tr key={item.product_name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingItem === item.product_name ? (
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={editForm.quantity}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                quantity: parseFloat(e.target.value) || 0
                              })}
                              className="w-24 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/500"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">
                              {item.quantity || 1}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingItem === item.product_name ? (
                            <textarea
                              value={editForm.issue_description}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                issue_description: e.target.value
                              })}
                              rows="2"
                              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/500"
                              placeholder="Describe the issue..."
                            />
                          ) : (
                            <span className="text-sm text-gray-600">
                              {item.issue_description || (
                                <span className="text-gray-400 italic">Not specified</span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingItem === item.product_name ? (
                            <input
                              type="text"
                              value={editForm.responsible_department}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                responsible_department: e.target.value
                              })}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/500"
                              placeholder="Department name..."
                            />
                          ) : (
                            <span className="text-sm text-gray-600">
                              {item.responsible_department || (
                                <span className="text-gray-400 italic">Not assigned</span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editingItem === item.product_name ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.product_name)}
                                  className="px-3 py-1.5 bg-[#3D1D1C] text-white text-sm rounded hover:bg-[#3D1D1C]/80 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-2 text-[#3D1D1C] hover:bg-[#3D1D1C]/50 rounded transition-colors"
                                  title="Edit item"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Remove "${item.product_name}" from bucket?`)) {
                                      removeFromBucket(item.product_name);
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Total Items: <span className="font-semibold text-gray-900">{bucket.length}</span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-2 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Proceed to Submit
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BucketPage;