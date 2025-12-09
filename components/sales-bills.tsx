"use client"

import { useState } from "react"
import { useStore, type SalesBill } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Eye } from "lucide-react"

export default function SalesBills() {
  const { materials, salesBills, addSalesBill, deleteSalesBill, addLedgerEntry } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedBill, setSelectedBill] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    billNo: "",
    customer: "",
    items: [{ materialId: "", quantity: 0, rate: 0 }],
    notes: "",
  })

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialId: "", quantity: 0, rate: 0 }],
    })
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  }

  const handleSaveBill = () => {
    if (formData.billNo && formData.customer && formData.items.length > 0) {
      const bill: SalesBill = {
        id: Date.now().toString(),
        billNo: formData.billNo,
        date: new Date().toISOString().split("T")[0],
        customer: formData.customer,
        items: formData.items.map((item) => ({
          ...item,
          materialId: item.materialId,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.quantity) * Number(item.rate),
        })),
        totalAmount: calculateTotal(),
        notes: formData.notes,
      }

      addSalesBill(bill)
      addLedgerEntry({
        id: Date.now().toString(),
        date: bill.date,
        type: "sales",
        description: `Sales Bill ${bill.billNo}`,
        amount: bill.totalAmount,
        partyName: bill.customer,
        billNo: bill.billNo,
      })

      setFormData({ billNo: "", customer: "", items: [{ materialId: "", quantity: 0, rate: 0 }], notes: "" })
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Sales Bills</h2>
          <p className="text-muted-foreground mt-1">Record sales transactions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Sales Bill
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Sales Bill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Bill No</label>
                <Input
                  placeholder="e.g., SB-001"
                  value={formData.billNo}
                  onChange={(e) => setFormData({ ...formData, billNo: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  placeholder="Customer name"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Items</h3>
                <Button size="sm" variant="outline" onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <select
                      className="border border-border rounded px-2 py-1"
                      value={item.materialId}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[index].materialId = e.target.value
                        setFormData({ ...formData, items: newItems })
                      }}
                    >
                      <option value="">Select Material</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[index].quantity = Number(e.target.value)
                        setFormData({ ...formData, items: newItems })
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => {
                        const newItems = [...formData.items]
                        newItems[index].rate = Number(e.target.value)
                        setFormData({ ...formData, items: newItems })
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">₹{(item.quantity * item.rate).toLocaleString()}</span>
                      {formData.items.length > 1 && (
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right border-t border-border pt-4">
              <p className="text-lg font-bold">Total: ₹{calculateTotal().toLocaleString()}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Additional notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBill}>Save Bill</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sales Bill Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Bill No</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold">Items</th>
                  <th className="text-right py-3 px-4 font-semibold">Total Amount (₹)</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {salesBills.map((bill) => (
                  <tr key={bill.id} className="border-b border-border hover:bg-muted">
                    <td className="py-3 px-4 font-medium">{bill.billNo}</td>
                    <td className="py-3 px-4">{new Date(bill.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{bill.customer}</td>
                    <td className="text-right py-3 px-4">{bill.items.length}</td>
                    <td className="text-right py-3 px-4 font-semibold">₹{bill.totalAmount.toLocaleString()}</td>
                    <td className="text-center py-3 px-4 flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedBill(selectedBill === bill.id ? null : bill.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteSalesBill(bill.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {salesBills.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No sales bills yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedBill && (
        <Card>
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
          </CardHeader>
          <CardContent>
            {salesBills.find((b) => b.id === selectedBill) && (
              <div className="space-y-4">
                {salesBills
                  .find((b) => b.id === selectedBill)
                  ?.items.map((item, i) => (
                    <div key={i} className="flex justify-between p-2 bg-muted rounded">
                      <span>{materials.find((m) => m.id === item.materialId)?.name}</span>
                      <span>
                        {item.quantity} @ ₹{item.rate} = ₹{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
