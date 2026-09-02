// components/Checklist/UnsavedChangesBar.jsx
import React, { useState } from 'react';
import useChecklistStore from '../../store/checklistStore';
import { ExclamationTriangleIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';

const UnsavedChangesBar = () => {
  const hasUnsavedChanges = useChecklistStore(state => state.hasUnsavedChanges());
  const unsavedCount = useChecklistStore(state => state.getUnsavedCount());
  const isSaving = useChecklistStore(state => state.isSaving);
  const saveChanges = useChecklistStore(state => state.saveChanges);
  const discardChanges = useChecklistStore(state => state.discardChanges);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  if (!hasUnsavedChanges) {
    return null;
  }

  const handleSave = async () => {
    try {
      await saveChanges();
    } catch {
      // Error is already set in the store for display
    }
  };

  const handleDiscardConfirm = () => {
    discardChanges();
    setShowDiscardDialog(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-warning/10 border-t-2 border-warning shadow-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-warning flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  You have {unsavedCount} unsaved {unsavedCount === 1 ? 'change' : 'changes'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Don't forget to save your changes before leaving this page
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDiscardDialog(true)}
                disabled={isSaving}
              >
                Discard
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Discard Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard all {unsavedCount} unsaved {unsavedCount === 1 ? 'change' : 'changes'}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDiscardConfirm}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UnsavedChangesBar;
