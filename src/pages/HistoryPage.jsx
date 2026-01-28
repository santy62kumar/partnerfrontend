// src/pages/HistoryPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  User,
  Package,
  CheckCircle,
  Clock,
  Loader,
  FileText,
  Filter
} from 'lucide-react';
import { bomAPI } from '../api/bomApi';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await bomAPI.getHistory(100, 0);
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleUpdateStatus = async (soId, newStatus) => {
    try {
      await bomAPI.updateStatus(soId, newStatus);
      fetchHistory(); // Refresh the list
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.sales_order.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sr_poc?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/site-requisite')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#3D1D1C]" />
              Site Requisite History
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View and manage all submitted requisites
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by sales order or POC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D1D1C] appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Loader className="w-12 h-12 text-[#3D1D1C] mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading history...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-red-600 mb-4">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchHistory}
              className="mt-4 px-6 py-2 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No results found' : 'No history available'}
            </h2>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first site requisite'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/site-requisite')}
                className="px-6 py-2 bg-[#3D1D1C] text-white rounded-lg hover:bg-[#3D1D1C]/80 transition-colors"
              >
                Create Requisite
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredHistory.length} of {history.length} requisite{history.length !== 1 ? 's' : ''}
            </div>

            {/* History List */}
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <button className="mt-1">
                          {expandedItems.has(item.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.sales_order}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === 'completed' 
                                ? 'bg-[#3D1D1C]/10 text-[#3D1D1C]' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status === 'completed' ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Completed
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Created: {formatDate(item.created_date)}</span>
                            </div>
                            {item.sr_poc && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4" />
                                <span>POC: {item.sr_poc}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Package className="w-4 h-4" />
                              <span>{item.site_requisites.length} item{item.site_requisites.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle */}
                      <div className="ml-4">
                        <select
                          value={item.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(item.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/500"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItems.has(item.id) && (
                    <div className="border-t bg-gray-50 p-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Requisite Items</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Product Name</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Quantity</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Issue Description</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Department</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {item.site_requisites.map((req, index) => (
                              <tr key={req.id} className="bg-white">
                                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{req.product_name}</td>
                                <td className="px-4 py-3 text-gray-600">{req.quantity}</td>
                                <td className="px-4 py-3 text-gray-600">
                                  {req.issue_description || <span className="text-gray-400 italic">N/A</span>}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {req.responsible_department || <span className="text-gray-400 italic">N/A</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {item.closed_date && (
                        <div className="mt-4 text-xs text-gray-500">
                          Closed on: {formatDate(item.closed_date)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;