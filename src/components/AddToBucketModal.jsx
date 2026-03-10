import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';

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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Bucket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input
              type="text"
              value={item.product_name}
              disabled
              className="bg-muted opacity-70"
            />
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Issue Description</Label>
            <textarea
              rows={3}
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              placeholder="Describe the issue or requirement..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label>Responsible Department</Label>
            <Input
              type="text"
              value={formData.responsible_department}
              onChange={(e) => setFormData({ ...formData, responsible_department: e.target.value })}
              placeholder="e.g., Production, Quality, Maintenance"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Bucket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToBucketModal;