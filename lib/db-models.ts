import type { ObjectId } from "mongodb"

export const Collections = {
  LOCATIONS: "locations",
  MATERIALS: "materials",
  MATERIAL_STOCKS: "material_stocks",
  PURCHASE_BILLS: "purchase_bills",
  SALES_BILLS: "sales_bills",
  STOCK_TRANSFERS: "stock_transfers",
  LEDGER_ENTRIES: "ledger_entries",
  RECEIVABLE_BILLS: "receivable_bills",
  PAYABLE_BILLS: "payable_bills",
}

export interface LocationDoc {
  _id?: ObjectId
  id: string
  name: string
  address: string
  createdAt: string
}

export interface MaterialDoc {
  _id?: ObjectId
  id: string
  name: string
  unit: string
  quantity: number
  rate: number
  total: number
}

export interface MaterialStockDoc {
  _id?: ObjectId
  id: string
  materialId: string
  locations: Array<{ locationId: string; quantity: number }>
  totalQuantity: number
}

export interface PurchaseBillDoc {
  _id?: ObjectId
  id: string
  billNo: string
  date: string
  locationId: string
  supplier: string
  items: Array<{ materialId: string; quantity: number; rate: number; amount: number }>
  totalAmount: number
  notes: string
}

export interface SalesBillDoc {
  _id?: ObjectId
  id: string
  billNo: string
  date: string
  locationId: string
  customer: string
  items: Array<{ materialId: string; quantity: number; rate: number; amount: number }>
  totalAmount: number
  notes: string
}

export interface StockTransferDoc {
  _id?: ObjectId
  id: string
  date: string
  fromLocationId: string
  toLocationId: string
  materialId: string
  quantity: number
  notes: string
}

export interface LedgerEntryDoc {
  _id?: ObjectId
  id: string
  date: string
  type: "purchase" | "sales" | "expense" | "income"
  description: string
  amount: number
  partyName: string
  billNo?: string
  locationId?: string
}

export interface ReceivableBillDoc {
  _id?: ObjectId
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

export interface PayableBillDoc {
  _id?: ObjectId
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
