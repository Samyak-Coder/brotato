import { create } from 'zustand'

export const useLost = create((set) => ({
  lost: false,
  updateToWin: () => set({ lost: true }),
  updateToLost: () => set({ lost: false }),
}))