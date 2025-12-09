// Global state management for inventory system
import { create } from "zustand"

export interface Location {
  id: string
  name: string
  address: string
  createdAt: string
}

export interface Material {
  id: string
  name: string
  unit: string
  quantity: number
  rate: number
  total: number
}

export interface StockLocation {
  locationId: string
  quantity: number
}

export interface MaterialStock {
  id: string
  materialId: string
  locations: StockLocation[]
  totalQuantity: number
}

export interface PurchaseBill {
  id: string
  billNo: string
  date: string
  locationId?: string
  supplier: string
  items: Array<{
    materialId: string
    quantity: number
    rate: number
    amount: number
  }>
  totalAmount: number
  notes: string
}

export interface SalesBill {
  id: string
  billNo: string
  date: string
  locationId?: string
  customer: string
  items: Array<{
    materialId: string
    quantity: number
    rate: number
    amount: number
  }>
  totalAmount: number
  notes: string
}

export interface StockTransfer {
  id: string
  date: string
  fromLocationId: string
  toLocationId: string
  materialId: string
  quantity: number
  notes: string
}

export interface LedgerEntry {
  id: string
  date: string
  type: "purchase" | "sales" | "expense" | "income"
  description: string
  amount: number
  partyName: string
  billNo?: string
  locationId?: string
}

export interface ReceivableBill {
  id: string
  billNo: string
  date: string
  customer: string
  amount: number
  dueDate: string
  status: "pending" | "partially_paid" | "fully_paid"
  amountPaid: number
  notes: string
}

export interface PayableBill {
  id: string
  billNo: string
  date: string
  supplier: string
  amount: number
  dueDate: string
  status: "pending" | "partially_paid" | "fully_paid"
  amountPaid: number
  notes: string
}

interface StoreState {
  locations: Location[]
  materials: Material[]
  materialStocks: MaterialStock[]
  purchaseBills: PurchaseBill[]
  salesBills: SalesBill[]
  stockTransfers: StockTransfer[]
  ledgerEntries: LedgerEntry[]
  receivableBills: ReceivableBill[]
  payableBills: PayableBill[]

  // Location management
  addLocation: (location: Location) => void
  updateLocation: (id: string, location: Partial<Location>) => void
  deleteLocation: (id: string) => void

  addMaterial: (material: Material) => void
  updateMaterial: (id: string, material: Partial<Material>) => void
  deleteMaterial: (id: string) => void

  getStockByLocation: (materialId: string, locationId: string) => number
  updateStockLocation: (materialId: string, locationId: string, quantity: number) => void
  addStockTransfer: (transfer: StockTransfer) => void

  addPurchaseBill: (bill: PurchaseBill) => void
  deletePurchaseBill: (id: string) => void

  addSalesBill: (bill: SalesBill) => void
  deleteSalesBill: (id: string) => void

  addLedgerEntry: (entry: LedgerEntry) => void
  deleteLedgerEntry: (id: string) => void

  addReceivableBill: (bill: ReceivableBill) => void
  updateReceivableBill: (id: string, bill: Partial<ReceivableBill>) => void
  deleteReceivableBill: (id: string) => void

  addPayableBill: (bill: PayableBill) => void
  updatePayableBill: (id: string, bill: Partial<PayableBill>) => void
  deletePayableBill: (id: string) => void

  exportData: () => string
  importData: (data: string) => void
}

export const useStore = create<StoreState>((set, get) => {
  const savedData = typeof window !== "undefined" ? localStorage.getItem("inventory-data") : null
  const initialState = savedData
    ? JSON.parse(savedData)
    : {
        locations: [],
        materials: [],
        materialStocks: [],
        purchaseBills: [],
        salesBills: [],
        stockTransfers: [],
        ledgerEntries: [],
        receivableBills: [],
        payableBills: [],
      }

  const saveToStorage = (state: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "inventory-data",
        JSON.stringify({
          locations: state.locations,
          materials: state.materials,
          materialStocks: state.materialStocks,
          purchaseBills: state.purchaseBills,
          salesBills: state.salesBills,
          stockTransfers: state.stockTransfers,
          ledgerEntries: state.ledgerEntries,
          receivableBills: state.receivableBills,
          payableBills: state.payableBills,
        }),
      )
    }
  }

  return {
    ...initialState,

    addLocation: (location) =>
      set((state) => {
        const newState = { ...state, locations: [...state.locations, location] }
        saveToStorage(newState)
        return newState
      }),

    updateLocation: (id, updates) =>
      set((state) => {
        const newState = {
          ...state,
          locations: state.locations.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }
        saveToStorage(newState)
        return newState
      }),

    deleteLocation: (id) =>
      set((state) => {
        const newState = {
          ...state,
          locations: state.locations.filter((l) => l.id !== id),
          materialStocks: state.materialStocks.map((ms) => ({
            ...ms,
            locations: ms.locations.filter((sl) => sl.locationId !== id),
          })),
        }
        saveToStorage(newState)
        return newState
      }),

    addMaterial: (material) =>
      set((state) => {
        const newState = { ...state, materials: [...state.materials, material] }
        saveToStorage(newState)
        return newState
      }),

    updateMaterial: (id, updates) =>
      set((state) => {
        const newState = {
          ...state,
          materials: state.materials.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }
        saveToStorage(newState)
        return newState
      }),

    deleteMaterial: (id) =>
      set((state) => {
        const newState = {
          ...state,
          materials: state.materials.filter((m) => m.id !== id),
          materialStocks: state.materialStocks.filter((ms) => ms.materialId !== id),
        }
        saveToStorage(newState)
        return newState
      }),

    getStockByLocation: (materialId, locationId) => {
      const state = get()
      const stock = state.materialStocks.find((ms) => ms.materialId === materialId)
      if (!stock) return 0
      const loc = stock.locations.find((sl) => sl.locationId === locationId)
      return loc ? loc.quantity : 0
    },

    updateStockLocation: (materialId, locationId, quantity) =>
      set((state) => {
        let found = false
        const updatedStocks = state.materialStocks.map((ms) => {
          if (ms.materialId === materialId) {
            found = true
            const updatedLocations = ms.locations.map((sl) => (sl.locationId === locationId ? { ...sl, quantity } : sl))
            const hasLocation = updatedLocations.some((sl) => sl.locationId === locationId)
            if (!hasLocation) {
              updatedLocations.push({ locationId, quantity })
            }
            const totalQuantity = updatedLocations.reduce((sum, sl) => sum + sl.quantity, 0)
            return { ...ms, locations: updatedLocations, totalQuantity }
          }
          return ms
        })

        if (!found) {
          updatedStocks.push({
            id: Date.now().toString(),
            materialId,
            locations: [{ locationId, quantity }],
            totalQuantity: quantity,
          })
        }

        const newState = { ...state, materialStocks: updatedStocks }
        saveToStorage(newState)
        return newState
      }),

    addStockTransfer: (transfer) =>
      set((state) => {
        const fromStock = state.materialStocks.find((ms) => ms.materialId === transfer.materialId)
        if (!fromStock) return state

        const updatedStocks = state.materialStocks.map((ms) => {
          if (ms.materialId === transfer.materialId) {
            const updatedLocations = ms.locations.map((sl) => {
              if (sl.locationId === transfer.fromLocationId) {
                return { ...sl, quantity: Math.max(0, sl.quantity - transfer.quantity) }
              }
              if (sl.locationId === transfer.toLocationId) {
                return { ...sl, quantity: sl.quantity + transfer.quantity }
              }
              return sl
            })
            const totalQuantity = updatedLocations.reduce((sum, sl) => sum + sl.quantity, 0)
            return { ...ms, locations: updatedLocations, totalQuantity }
          }
          return ms
        })

        const newState = {
          ...state,
          materialStocks: updatedStocks,
          stockTransfers: [...state.stockTransfers, transfer],
        }
        saveToStorage(newState)
        return newState
      }),

    addPurchaseBill: (bill) =>
      set((state) => {
        // add bill
        const purchaseBills = [...state.purchaseBills, bill]

        // update materials quantities and totals
        const materials = state.materials.map((m) => ({ ...m })) // shallow clone
        bill.items.forEach((item) => {
          const idx = materials.findIndex((mm) => mm.id === item.materialId)
          if (idx > -1) {
            const prev = materials[idx]
            const newQty = prev.quantity + Number(item.quantity)
            const newRate = Number(item.rate) || prev.rate
            materials[idx] = {
              ...prev,
              quantity: newQty,
              rate: newRate,
              total: newQty * newRate,
            }
          }
        })

        // update materialStocks (per-location if provided)
        const materialStocks = state.materialStocks.map((ms) => ({ ...ms, locations: ms.locations.map((l) => ({ ...l })) }))
        bill.items.forEach((item) => {
          let ms = materialStocks.find((s) => s.materialId === item.materialId)
          if (!ms) {
            ms = {
              id: Date.now().toString() + Math.random().toString(36).slice(2),
              materialId: item.materialId,
              locations: [],
              totalQuantity: 0,
            }
            materialStocks.push(ms)
          }
          if (bill.locationId) {
            const loc = ms.locations.find((l) => l.locationId === bill.locationId)
            if (loc) {
              loc.quantity = loc.quantity + Number(item.quantity)
            } else {
              ms.locations.push({ locationId: bill.locationId, quantity: Number(item.quantity) })
            }
          }
          // always update totalQuantity
          ms.totalQuantity = ms.locations.reduce((s, l) => s + l.quantity, 0)
          // if no locations tracked, keep totalQuantity additive
          if (ms.locations.length === 0) {
            ms.totalQuantity = (ms.totalQuantity || 0) + Number(item.quantity)
          }
        })

        const newState = { ...state, purchaseBills, materials, materialStocks }
        saveToStorage(newState)
        return newState
      }),

    deletePurchaseBill: (id) =>
      set((state) => {
        const bill = state.purchaseBills.find((b) => b.id === id)
        if (!bill) {
          const newState = { ...state, purchaseBills: state.purchaseBills.filter((b) => b.id !== id) }
          saveToStorage(newState)
          return newState
        }

        // revert materials
        const materials = state.materials.map((m) => ({ ...m }))
        bill.items.forEach((item) => {
          const idx = materials.findIndex((mm) => mm.id === item.materialId)
          if (idx > -1) {
            const prev = materials[idx]
            const newQty = Math.max(0, prev.quantity - Number(item.quantity))
            materials[idx] = {
              ...prev,
              quantity: newQty,
              total: newQty * prev.rate,
            }
          }
        })

        // revert materialStocks
        const materialStocks = state.materialStocks.map((ms) => ({ ...ms, locations: ms.locations.map((l) => ({ ...l })) }))
        bill.items.forEach((item) => {
          const ms = materialStocks.find((s) => s.materialId === item.materialId)
          if (ms) {
            if (bill.locationId) {
              const loc = ms.locations.find((l) => l.locationId === bill.locationId)
              if (loc) {
                loc.quantity = Math.max(0, loc.quantity - Number(item.quantity))
              }
            } else {
              // no location info — try to reduce totalQuantity conservatively
            }
            ms.totalQuantity = ms.locations.reduce((s, l) => s + l.quantity, 0)
          }
        })

        const newState = {
          ...state,
          purchaseBills: state.purchaseBills.filter((b) => b.id !== id),
          materials,
          materialStocks,
        }
        saveToStorage(newState)
        return newState
      }),

    addSalesBill: (bill) =>
      set((state) => {
        // add bill
        const salesBills = [...state.salesBills, bill]

        // update materials quantities and totals (decrement)
        const materials = state.materials.map((m) => ({ ...m }))
        bill.items.forEach((item) => {
          const idx = materials.findIndex((mm) => mm.id === item.materialId)
          if (idx > -1) {
            const prev = materials[idx]
            const newQty = Math.max(0, prev.quantity - Number(item.quantity))
            materials[idx] = {
              ...prev,
              quantity: newQty,
              total: newQty * prev.rate,
            }
          }
        })

        // update materialStocks (per-location if provided)
        const materialStocks = state.materialStocks.map((ms) => ({ ...ms, locations: ms.locations.map((l) => ({ ...l })) }))
        bill.items.forEach((item) => {
          let ms = materialStocks.find((s) => s.materialId === item.materialId)
          if (!ms) {
            ms = {
              id: Date.now().toString() + Math.random().toString(36).slice(2),
              materialId: item.materialId,
              locations: [],
              totalQuantity: 0,
            }
            materialStocks.push(ms)
          }
          if (bill.locationId) {
            const loc = ms.locations.find((l) => l.locationId === bill.locationId)
            if (loc) {
              loc.quantity = Math.max(0, loc.quantity - Number(item.quantity))
            } else {
              // if no location entry, assume 0 and set to 0 (cannot go negative)
              ms.locations.push({ locationId: bill.locationId, quantity: 0 })
            }
          }
          ms.totalQuantity = ms.locations.reduce((s, l) => s + l.quantity, 0)
          if (ms.locations.length === 0) {
            ms.totalQuantity = Math.max(0, (ms.totalQuantity || 0) - Number(item.quantity))
          }
        })

        const newState = { ...state, salesBills, materials, materialStocks }
        saveToStorage(newState)
        return newState
      }),

    deleteSalesBill: (id) =>
      set((state) => {
        const bill = state.salesBills.find((b) => b.id === id)
        if (!bill) {
          const newState = { ...state, salesBills: state.salesBills.filter((b) => b.id !== id) }
          saveToStorage(newState)
          return newState
        }

        // revert materials (add back)
        const materials = state.materials.map((m) => ({ ...m }))
        bill.items.forEach((item) => {
          const idx = materials.findIndex((mm) => mm.id === item.materialId)
          if (idx > -1) {
            const prev = materials[idx]
            const newQty = prev.quantity + Number(item.quantity)
            materials[idx] = {
              ...prev,
              quantity: newQty,
              total: newQty * prev.rate,
            }
          }
        })

        // revert materialStocks (add back to location if present)
        const materialStocks = state.materialStocks.map((ms) => ({ ...ms, locations: ms.locations.map((l) => ({ ...l })) }))
        bill.items.forEach((item) => {
          const ms = materialStocks.find((s) => s.materialId === item.materialId)
          if (ms) {
            if (bill.locationId) {
              const loc = ms.locations.find((l) => l.locationId === bill.locationId)
              if (loc) {
                loc.quantity = loc.quantity + Number(item.quantity)
              } else {
                ms.locations.push({ locationId: bill.locationId, quantity: Number(item.quantity) })
              }
            }
            ms.totalQuantity = ms.locations.reduce((s, l) => s + l.quantity, 0)
          }
        })

        const newState = {
          ...state,
          salesBills: state.salesBills.filter((b) => b.id !== id),
          materials,
          materialStocks,
        }
        saveToStorage(newState)
        return newState
      }),

    addLedgerEntry: (entry) =>
      set((state) => {
        const newState = { ...state, ledgerEntries: [...state.ledgerEntries, entry] }
        saveToStorage(newState)
        return newState
      }),

    deleteLedgerEntry: (id) =>
      set((state) => {
        const newState = { ...state, ledgerEntries: state.ledgerEntries.filter((e) => e.id !== id) }
        saveToStorage(newState)
        return newState
      }),

    addReceivableBill: (bill) =>
      set((state) => {
        const newState = { ...state, receivableBills: [...state.receivableBills, bill] }
        saveToStorage(newState)
        return newState
      }),

    updateReceivableBill: (id, updates) =>
      set((state) => {
        const newState = {
          ...state,
          receivableBills: state.receivableBills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }
        saveToStorage(newState)
        return newState
      }),

    deleteReceivableBill: (id) =>
      set((state) => {
        const newState = { ...state, receivableBills: state.receivableBills.filter((b) => b.id !== id) }
        saveToStorage(newState)
        return newState
      }),

    addPayableBill: (bill) =>
      set((state) => {
        const newState = { ...state, payableBills: [...state.payableBills, bill] }
        saveToStorage(newState)
        return newState
      }),

    updatePayableBill: (id, updates) =>
      set((state) => {
        const newState = {
          ...state,
          payableBills: state.payableBills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }
        saveToStorage(newState)
        return newState
      }),

    deletePayableBill: (id) =>
      set((state) => {
        const newState = { ...state, payableBills: state.payableBills.filter((b) => b.id !== id) }
        saveToStorage(newState)
        return newState
      }),

    exportData: () => {
      const state = get()
      return JSON.stringify(
        {
          locations: state.locations,
          materials: state.materials,
          materialStocks: state.materialStocks,
          purchaseBills: state.purchaseBills,
          salesBills: state.salesBills,
          stockTransfers: state.stockTransfers,
          ledgerEntries: state.ledgerEntries,
          receivableBills: state.receivableBills,
          payableBills: state.payableBills,
        },
        null,
        2,
      )
    },

    importData: (data) => {
      try {
        const parsed = JSON.parse(data)
        set((state) => {
          const newState = { ...state, ...parsed }
          saveToStorage(newState)
          return newState
        })
      } catch (error) {
        console.error("Error importing data:", error)
      }
    },
  }
})
