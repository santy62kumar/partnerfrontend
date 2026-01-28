// src/pages/SubmitPage.jsx

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
      
      // Clear bucket after successful submission
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-[#3D1D1C] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Requisite Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your site requisite has been created and saved.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/site-requisite-history')}
              className="px-6 py-3 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors"
            >
              View History
            </button>
            <button
              onClick={() => {
                clearBucket();
                navigate('/site-requisite');
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Create New Requisite
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/site-requisite/bucket')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Submit Site Requisite
          </h1>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Requisite Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sales Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sales Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={salesOrder}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Cabinet Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cabinet Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cabinetPosition}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* SR POC */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SR POC (Point of Contact)
                  </label>
                  <input
                    type="text"
                    value={srPoc}
                    onChange={(e) => setSrPoc(e.target.value)}
                    placeholder="Enter POC name or email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/500"
                  />
                  {/* <p className="mt-1 text-xs text-gray-500">
                    Optional: Specify a point of contact for this requisite
                  </p> */}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/site-requisite/bucket')}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back to Bucket
                  </button>
                  <button
                    type="submit"
                    disabled={loading || bucket.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Requisite
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold text-gray-900">{bucket.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sales Order:</span>
                  <span className="font-semibold text-gray-900">{salesOrder || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cabinet:</span>
                  <span className="font-semibold text-gray-900">{cabinetPosition || 'N/A'}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Items to Submit:
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {bucket.map((item, index) => (
                    <div key={item.product_name} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-700">
                          {index + 1}. {item.product_name}
                        </span>
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                      </div>
                      {item.responsible_department && (
                        <div className="text-gray-500">
                          Dept: {item.responsible_department}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPage;