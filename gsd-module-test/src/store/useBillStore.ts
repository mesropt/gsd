import { create } from 'zustand'
import type { AppState, AppActions } from '../types'

const initialState: AppState = {
  people: [],
  items: [],
  tip: { mode: 'percent', value: 0, splitMethod: 'equal' },
  tax: { mode: 'percent', value: 0, splitMethod: 'equal' },
}

export const useBillStore = create<AppState & AppActions>()((set) => ({
  ...initialState,

  addPerson: (name) =>
    set((state) => ({
      people: [...state.people, { id: crypto.randomUUID(), name }],
    })),

  removePerson: (id) =>
    set((state) => ({
      people: state.people.filter((p) => p.id !== id),
      items: state.items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((pid) => pid !== id),
      })),
    })),

  addItem: (label, priceCents) =>
    set((state) => ({
      items: [
        ...state.items,
        { id: crypto.randomUUID(), label, price: priceCents, assignedTo: [] },
      ],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  assignItem: (itemId, assignedTo) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, assignedTo } : i
      ),
    })),

  setTip: (config) =>
    set((state) => ({ tip: { ...state.tip, ...config } })),

  setTax: (config) =>
    set((state) => ({ tax: { ...state.tax, ...config } })),

  resetBill: () => set(initialState),
}))
