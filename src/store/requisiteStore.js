import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRequisiteStore = create(
  persist(
    (set, get) => ({
      // BOM Data
      bomData: [],
      salesOrder: '',
      cabinetPosition: '',
      soDetails: null,
      
      // Bucket
      bucket: [],
      
      // Actions
      setBOMData: (data, salesOrder, cabinetPosition, soDetails = null) =>
        set({ bomData: data, salesOrder, cabinetPosition, soDetails }),

      setSODetails: (soDetails) =>
        set({ soDetails }),
      
      addToBucket: (item) =>
        set((state) => {
          // Check if item already exists
          const exists = state.bucket.find(
            (bucketItem) => bucketItem.product_name === item.product_name
          );

          if (exists) {
            return state; // Don't add duplicate
          }

          return {
            bucket: [...state.bucket, {
              product_name: item.product_name,
              quantity: item.quantity || 1,
              issue_description: item.issue_description || '',
              responsible_department: item.responsible_department || null,
              component_status: item.component_status || '',
            }]
          };
        }),
      
      removeFromBucket: (productName) =>
        set((state) => ({
          bucket: state.bucket.filter(
            (item) => item.product_name !== productName
          )
        })),
      
      updateBucketItem: (productName, updates) =>
        set((state) => ({
          bucket: state.bucket.map((item) =>
            item.product_name === productName
              ? { ...item, ...updates }
              : item
          )
        })),
      
      clearBucket: () => set({ bucket: [], bomData: [], salesOrder: '', cabinetPosition: '', soDetails: null }),
      
      getBucketCount: () => get().bucket.length,
    }),
    {
      name: 'requisite-storage',
      partialize: (state) => ({
        bucket: state.bucket,
        salesOrder: state.salesOrder,
        cabinetPosition: state.cabinetPosition,
        soDetails: state.soDetails
      })
    }
  )
);

export default useRequisiteStore;
