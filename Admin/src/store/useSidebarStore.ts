import { create } from 'zustand'

interface SidebarStore {
  isOpen: boolean
  isMobileMenuOpen: boolean
  activePage: string
  toggle: () => void
  toggleMobileMenu: () => void
  setOpen: (open: boolean) => void
  setActivePage: (page: string) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  isMobileMenuOpen: false,
  activePage: 'dashboard',
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setActivePage: (page) => set({ 
    activePage: page,
    isMobileMenuOpen: false // Close menu when page changes
  }),
}))
