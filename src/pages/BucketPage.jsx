import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Edit2,
  Send,
  X,
  Check
} from 'lucide-react';
import useRequisiteStore from '../store/requisiteStore';
import { Card, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';

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
    <div className="animate-fadeIn max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/site-requisite')}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
              Bucket List
            </h1>
            {salesOrder && cabinetPosition && (
              <p className="text-sm text-muted-foreground mt-1 font-medium bg-secondary/50 inline-block px-3 py-1 rounded-full border border-border mt-2">
                SO: <span className="text-foreground">{salesOrder}</span> | Cabinet: <span className="text-foreground">{cabinetPosition}</span>
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={bucket.length === 0}
          size="lg"
          className="w-full sm:w-auto shadow-sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Requisite
        </Button>
      </div>

      {/* Empty State */}
      {bucket.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-6">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2 font-heading">
              Your bucket is empty
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Add items from the BOM hierarchy to create a site requisite and proceed to request parts.
            </p>
            <Button
              onClick={() => navigate('/site-requisite')}
              size="lg"
            >
              Browse BOM Items
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Bucket Items */}
          <Card className="border-border/80 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead className="min-w-[200px]">Product Name</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead className="min-w-[200px]">Issue Description</TableHead>
                    <TableHead className="w-[180px]">Resp. Dept.</TableHead>
                    <TableHead className="text-right w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bucket.map((item, index) => (
                    <TableRow key={item.product_name} className={editingItem === item.product_name ? "bg-primary/5" : ""}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.product_name}</TableCell>
                      <TableCell>
                        {editingItem === item.product_name ? (
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={editForm.quantity}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              quantity: parseFloat(e.target.value) || 0
                            })}
                            className="w-20 h-8"
                          />
                        ) : (
                          <span className="text-foreground font-medium">{item.quantity || 1}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.product_name ? (
                          <textarea
                            value={editForm.issue_description}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              issue_description: e.target.value
                            })}
                            rows={1}
                            className="flex min-h-[32px] w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Describe..."
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {item.issue_description || (
                              <span className="text-muted-foreground/50 italic">Not specified</span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.product_name ? (
                          <Input
                            type="text"
                            value={editForm.responsible_department}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              responsible_department: e.target.value
                            })}
                            className="h-8"
                            placeholder="Dept..."
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {item.responsible_department || (
                              <span className="text-muted-foreground/50 italic">Not assigned</span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {editingItem === item.product_name ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSaveEdit(item.product_name)}
                                className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 text-muted-foreground hover:bg-muted"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                title="Edit item"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (window.confirm(`Remove "${item.product_name}" from bucket?`)) {
                                    removeFromBucket(item.product_name);
                                  }
                                }}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="bg-secondary/30 px-6 py-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground font-medium">
                  Total Items: <span className="font-bold text-foreground ml-1">{bucket.length}</span>
                </div>
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  className="px-8 shadow-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Proceed to Submit
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default BucketPage;