import React, { useState } from 'react';
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
  Filter,
  AlertCircle
} from 'lucide-react';
import { useBOMHistory, useUpdateBOMStatus } from '@hooks/useQueryHooks';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: history = [], isLoading: loading, error, refetch } = useBOMHistory(100, 0);
  const updateStatusMutation = useUpdateBOMStatus();

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
      await updateStatusMutation.mutateAsync({ soId, status: newStatus });
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
    <div className="animate-fadeIn max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/site-requisite')}
          className="h-10 w-10 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-heading text-foreground flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Site Requisite History
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            View and manage all submitted requisites
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8 border-border/80 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by sales order or POC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full appearance-none rounded-md border border-input bg-background pl-10 pr-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <Loader className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground font-medium">Loading history...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-border/80 shadow-sm border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-foreground font-medium mb-1">Could not load history</p>
            <p className="text-sm text-muted-foreground mb-6">{error.message || 'Failed to fetch history'}</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredHistory.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2 font-heading">
              {searchTerm || statusFilter !== 'all' ? 'No results found' : 'No history available'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first site requisite'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => navigate('/site-requisite')} size="lg">
                Create Requisite
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4 text-sm font-medium text-muted-foreground">
            Showing <span className="text-foreground">{filteredHistory.length}</span> of {history.length} requisite{history.length !== 1 ? 's' : ''}
          </div>

          {/* History List */}
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="border-border/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 mt-1 shrink-0 p-0 text-muted-foreground hover:bg-secondary">
                        {expandedItems.has(item.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {item.sales_order}
                          </h3>
                          {item.status === 'completed' ? (
                            <Badge variant="default" className="bg-success hover:bg-success/90 text-white gap-1 px-2.5 py-0.5">
                              <CheckCircle className="w-3 h-3" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-warning text-warning-foreground bg-warning/10 gap-1 px-2.5 py-0.5">
                              <Clock className="w-3 h-3 text-warning" />
                              Pending
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary/70 shrink-0" />
                            <span className="truncate">Created: {formatDate(item.created_date)}</span>
                          </div>
                          {item.sr_poc && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="w-4 h-4 text-primary/70 shrink-0" />
                              <span className="truncate">POC: {item.sr_poc}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="w-4 h-4 text-primary/70 shrink-0" />
                            <span className="truncate">{item.site_requisites.length} item{item.site_requisites.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="shrink-0">
                      <div className="relative">
                        <select
                          value={item.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(item.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-9 w-[130px] appearance-none rounded-md border border-input bg-background pl-3 pr-8 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedItems.has(item.id) && (
                  <div className="border-t border-border/50 bg-secondary/20 p-5 mt-1 animate-slideUp">
                    <h4 className="font-semibold text-foreground mb-4 text-sm tracking-tight flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      Requisite Items
                    </h4>
                    <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Issue Description</TableHead>
                            <TableHead>Department</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {item.site_requisites.map((req, index) => (
                            <TableRow key={req.id}>
                              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                              <TableCell className="font-medium">{req.product_name}</TableCell>
                              <TableCell>{req.quantity}</TableCell>
                              <TableCell>
                                {req.issue_description || <span className="text-muted-foreground/60 italic text-sm">N/A</span>}
                              </TableCell>
                              <TableCell>
                                {req.responsible_department ? (
                                  <Badge variant="secondary" className="font-normal">{req.responsible_department}</Badge>
                                ) : (
                                  <span className="text-muted-foreground/60 italic text-sm">N/A</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {item.closed_date && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background border border-border rounded-md px-3 py-2 w-fit">
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                        Closed on: {formatDate(item.closed_date)}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryPage;