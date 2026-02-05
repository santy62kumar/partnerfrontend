// stores/checklistStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { checklistApi } from '../api/checklistApi';

/**
 * Zustand Store for Checklist Management
 * 
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Batch update tracking
 * - Automatic state synchronization
 * - Error handling with rollback
 */

const useChecklistStore = create(
  devtools(
    (set, get) => ({
      // ==================== State ====================
      
      // Current checklist data
      checklist: null,
      items: [],
      stats: {
        totalItems: 0,
        checkedCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        completionPercentage: 0,
      },
      
      // Job information
      jobId: null,
      jobTitle: '',
      
      // UI state
      isLoading: false,
      isSaving: false,
      error: null,
      
      // Dirty tracking for batch updates
      dirtyItems: new Set(),
      pendingChanges: new Map(), // itemId -> changes object
      
      // Backup for rollback on error
      itemsBackup: [],
      
      // ==================== Actions ====================
      
      /**
       * Fetch complete checklist with all items
       */
      fetchChecklist: async (jobId, checklistId) => {
        set({ isLoading: true, error: null });
        
        try {
          const data = await checklistApi.getChecklist(jobId, checklistId);
          console.log('Fetched checklist data:', data);
          
          set({
            checklist: data.checklist,
            items: data.items,
            stats: {
              totalItems: data.total_items,
              checkedCount: data.checked_count,
              pendingCount: data.pending_count,
              approvedCount: data.approved_count,
              completionPercentage: data.completion_percentage,
            },
            jobId: data.job_id,
            jobTitle: data.job_title,
            isLoading: false,
            // Clear dirty state on fresh fetch
            dirtyItems: new Set(),
            pendingChanges: new Map(),
          });
        } catch (error) {
          set({
            error: error.response?.data?.detail || 'Failed to fetch checklist',
            isLoading: false,
          });
          throw error;
        }
      },
      
      /**
       * Update a single item (optimistic)
       * Changes are tracked but not saved until saveChanges() is called
       */
      updateItem: (itemId, changes) => {
        const { items, pendingChanges, dirtyItems } = get();
        
        // Create backup before first change
        if (dirtyItems.size === 0) {
          set({ itemsBackup: [...items] });
        }
        
        // Update items array (optimistic)
        const updatedItems = items.map(item => {
          if (item.id === itemId) {
            return { ...item, ...changes };
          }
          return item;
        });
        
        // Track changes
        const newDirtyItems = new Set(dirtyItems);
        newDirtyItems.add(itemId);
        
        const newPendingChanges = new Map(pendingChanges);
        const existingChanges = newPendingChanges.get(itemId) || {};
        newPendingChanges.set(itemId, { ...existingChanges, ...changes });
        
        // Recalculate stats
        const newStats = calculateStats(updatedItems);
        
        set({
          items: updatedItems,
          dirtyItems: newDirtyItems,
          pendingChanges: newPendingChanges,
          stats: newStats,
        });
      },
      
      /**
       * Save all pending changes (batch update)
       */
//       /**

saveChanges: async () => {
  const { jobId, checklist, pendingChanges, items, itemsBackup } = get();
  
  if (pendingChanges.size === 0) {
    return;
  }
  
  set({ isSaving: true, error: null });
  
  const updates = Array.from(pendingChanges.entries()).map(([id, changes]) => ({
    checklist_item_id: id,
    ...changes,
  }));
  
  try {
    const response = await checklistApi.batchUpdate(
      jobId,
      checklist.id,
      { updates }
    );
    
    // ✅ Keep optimistic items, just update stats from server
    set({
      items: items,  // Keep current items (already updated optimistically)
      stats: {
        totalItems: response.total_items,
        checkedCount: response.checked_count,
        pendingCount: response.pending_count,
        approvedCount: response.approved_count,
        completionPercentage: response.completion_percentage
      },
      dirtyItems: new Set(),
      pendingChanges: new Map(),
      itemsBackup: [],
      isSaving: false,
    });
    
    return response;
  } catch (error) {
    // Rollback on error
    set({
      items: itemsBackup,
      stats: calculateStats(itemsBackup),
      dirtyItems: new Set(),
      pendingChanges: new Map(),
      error: error.response?.data?.detail || 'Failed to save changes',
      isSaving: false,
    });
    throw error;
  }
},

      
      /**
       * Discard all pending changes
       */
      discardChanges: () => {
        const { itemsBackup } = get();
        
        if (itemsBackup.length > 0) {
          set({
            items: itemsBackup,
            stats: calculateStats(itemsBackup),
            dirtyItems: new Set(),
            pendingChanges: new Map(),
            itemsBackup: [],
          });
        }
      },
      
      /**
       * Toggle checkbox for an item
       */
      toggleCheckbox: (itemId) => {
        const { items } = get();
        const item = items.find(i => i.id === itemId);
        
        if (item) {
          get().updateItem(itemId, { checked: !item.checked });
        }
      },
      
      /**
       * Update item status
       */
      updateStatus: (itemId, status) => {
        get().updateItem(itemId, { status });
      },
      
      /**
       * Update item comment
       */
      updateComment: (itemId, comment) => {
        get().updateItem(itemId, { comment });
      },
      
      /**
       * Upload document for an item
       */
      uploadDocument: async (itemId, file, comment = null) => {
        const { jobId, checklist } = get();
        
        set({ isSaving: true, error: null });
        
        try {
          const response = await checklistApi.uploadDocument(
            jobId,
            checklist.id,
            itemId,
            file,
            comment
          );
          
          // Update the specific item with new document link
          const { items } = get();
          const updatedItems = items.map(item => {
            if (item.id === itemId) {
              return response.item;
            }
            return item;
          });
          
          set({
            items: updatedItems,
            stats: calculateStats(updatedItems),
            isSaving: false,
          });
          
          return response;
        } catch (error) {
          set({
            error: error.response?.data?.detail || 'Failed to upload document',
            isSaving: false,
          });
          throw error;
        }
      },
      
      /**
       * Check if there are unsaved changes
       */
      hasUnsavedChanges: () => {
        return get().dirtyItems.size > 0;
      },
      
      /**
       * Get count of unsaved changes
       */
      getUnsavedCount: () => {
        return get().dirtyItems.size;
      },
      
      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
      
      /**
       * Reset store (cleanup)
       */
      resetStore: () => {
        set({
          checklist: null,
          items: [],
          stats: {
            totalItems: 0,
            checkedCount: 0,
            pendingCount: 0,
            approvedCount: 0,
            completionPercentage: 0,
          },
          jobId: null,
          jobTitle: '',
          isLoading: false,
          isSaving: false,
          error: null,
          dirtyItems: new Set(),
          pendingChanges: new Map(),
          itemsBackup: [],
        });
      },
    }),
    { name: 'ChecklistStore' }
  )
);

// ==================== Helper Functions ====================

/**
 * Calculate statistics from items array
 */
/**
 * Calculate statistics from items array
 */
function calculateStats(items) {
  const total = items.length;
  
  if (total === 0) {
    return {
      totalItems: 0,
      checkedCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      completionPercentage: 0,
    };
  }
  
  const checked = items.filter(item => item.checked).length;
  const pending = items.filter(item => item.checked && !item.is_approved).length;  // ✅ Fixed: pending = checked but not approved
  const approved = items.filter(item => item.is_approved).length;  // ✅ Fixed: use is_approved instead of status
  
  const completionPercentage = Math.round((approved / total) * 100);
  
  return {
    totalItems: total,
    checkedCount: checked,
    pendingCount: pending,
    approvedCount: approved,
    completionPercentage,
  };
}

// ==================== Selectors ====================

/**
 * Selector hooks for optimized re-renders
 */

export const useChecklist = () => useChecklistStore(state => state.checklist);
export const useItems = () => useChecklistStore(state => state.items);
export const useStats = () => useChecklistStore(state => state.stats);
export const useIsLoading = () => useChecklistStore(state => state.isLoading);
export const useIsSaving = () => useChecklistStore(state => state.isSaving);
export const useError = () => useChecklistStore(state => state.error);
export const useHasUnsavedChanges = () => useChecklistStore(state => state.hasUnsavedChanges());
export const useUnsavedCount = () => useChecklistStore(state => state.getUnsavedCount());

export default useChecklistStore;