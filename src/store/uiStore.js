import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // State
  sidebarOpen: true,
  modalOpen: false,
  modalContent: null,
  modalTitle: '',

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (title, content) => set({
    modalOpen: true,
    modalTitle: title,
    modalContent: content,
  }),

  closeModal: () => set({
    modalOpen: false,
    modalTitle: '',
    modalContent: null,
  }),
}));