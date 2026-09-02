import React, { useState } from 'react';
import {
  ChevronDown,
  ShoppingCart,
  Trash2,
  Edit2,
  X,
  Check
} from 'lucide-react';
import useRequisiteStore from '../store/requisiteStore';
import { Badge } from '@components/ui/badge';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog';

const DEPARTMENTS = [
  { value: '', label: 'None' },
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'quality', label: 'Quality' },
  { value: 'sale', label: 'Sale' },
  { value: 'fulfillment', label: 'Fulfillment' },
  { value: 'other', label: 'Other' },
];

const BucketPage = () => {
  const { bucket, removeFromBucket, updateBucketItem, salesOrder, cabinetPosition } = useRequisiteStore();
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: 1,
    responsible_department: '',
  });
  const [itemToRemove, setItemToRemove] = useState(null);

  const handleEdit = (item) => {
    setEditingItem(item.product_name);
    setEditForm({
      quantity: item.quantity || 1,
      responsible_department: item.responsible_department || '',
    });
  };

  const handleSaveEdit = (productName) => {
    updateBucketItem(productName, {
      quantity: editForm.quantity,
      responsible_department: editForm.responsible_department || null,
    });
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({
      quantity: 1,
      responsible_department: '',
    });
  };

  const handleRemoveConfirm = () => {
    if (itemToRemove) {
      removeFromBucket(itemToRemove);
      setItemToRemove(null);
    }
  };

  return (
    <>
      <div className="animate-fadeIn max-w-6xl mx-auto pb-10">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Selected Items
          </h2>
          {salesOrder && cabinetPosition && (
            <p className="text-sm text-muted-foreground font-medium bg-secondary/50 inline-block px-3 py-1 rounded-full border border-border mt-2">
              SO: <span className="text-foreground">{salesOrder}</span> | Cabinet: <span className="text-foreground">{cabinetPosition}</span>
            </p>
          )}
        </div>

        {bucket.length > 0 && (
          <>
            {/* Selected Items */}
            <Card className="border-border/80 shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-secondary/40">
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="min-w-48">Product Name</TableHead>
                      <TableHead className="w-28">Quantity</TableHead>
                      <TableHead className="w-44">Component Status</TableHead>
                      <TableHead className="w-36">Department</TableHead>
                      <TableHead className="min-w-48">Issue Description</TableHead>
                      <TableHead className="text-right w-36">Actions</TableHead>
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
                              onChange={(e) => setEditForm({ ...editForm, quantity: Number.parseFloat(e.target.value) || 0 })}
                              className="w-20 h-8"
                            />
                          ) : (
                            <span className="text-foreground font-medium">{item.quantity || 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                            value={item.component_status || ''}
                            onChange={(e) => updateBucketItem(item.product_name, { component_status: e.target.value || null })}
                            className="flex h-9 w-full appearance-none rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            aria-label={`Component status for ${item.product_name}`}
                          >
                            <option value="">Select status</option>
                            {item.component_status && !['damaged', 'missing'].includes(item.component_status) && (
                              <option value={item.component_status}>{item.component_status}</option>
                            )}
                            <option value="damaged">Damaged</option>
                            <option value="missing">Missing</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          {editingItem === item.product_name ? (
                            <div className="relative">
                              <select
                                value={editForm.responsible_department}
                                onChange={(e) => setEditForm({ ...editForm, responsible_department: e.target.value })}
                                className="flex h-8 w-full appearance-none rounded-md border border-input bg-background px-2 pr-7 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              >
                                {DEPARTMENTS.map((d) => (
                                  <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          ) : (
                            item.responsible_department
                              ? <Badge variant="outline" className="capitalize">{item.responsible_department}</Badge>
                              : <span className="text-muted-foreground/50 italic text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <textarea
                            value={item.issue_description || ''}
                            onChange={(e) => updateBucketItem(item.product_name, { issue_description: e.target.value })}
                            rows={2}
                            className="flex min-h-14 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Describe the issue..."
                            aria-label={`Issue description for ${item.product_name}`}
                          />
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
                                  onClick={() => setItemToRemove(item.product_name)}
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

              <div className="bg-secondary/30 px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground font-medium">
                  Total Items: <span className="font-bold text-foreground ml-1">{bucket.length}</span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Remove Item Confirmation */}
      <Dialog open={itemToRemove !== null} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
            <DialogDescription>
              Remove <span className="font-medium">"{itemToRemove}"</span> from this requisite?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setItemToRemove(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveConfirm}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BucketPage;
