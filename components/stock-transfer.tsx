"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Plus } from "lucide-react"

export default function StockTransfer() {
  const { locations, materials, materialStocks, addStockTransfer, stockTransfers } = useStore()
  const [formData, setFormData] = useState({
    materialId: "",
    fromLocationId: "",
    toLocationId: "",
    quantity: 0,
    notes: "",
  })

  const handleTransfer = () => {
    if (formData.materialId && formData.fromLocationId && formData.toLocationId && formData.quantity) {
      const transfer = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        ...formData,
        quantity: Number(formData.quantity),
      }
      addStockTransfer(transfer)
      setFormData({ materialId: "", fromLocationId: "", toLocationId: "", quantity: 0, notes: "" })
    }
  }

  const selectedMaterial = materials.find((m) => m.id === formData.materialId)
  const currentStock = materialStocks.find((ms) => ms.materialId === formData.materialId)
  const fromLocationStock =
    currentStock?.locations.find((sl) => sl.locationId === formData.fromLocationId)?.quantity || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ArrowRight className="w-8 h-8" />
            Stock Transfer
          </h2>
          <p className="text-muted-foreground mt-1">Transfer stock between locations</p>
        </div>
      </div>

      {/* Transfer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Transfer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Material</label>
              <Select value={formData.materialId} onValueChange={(v) => setFormData({ ...formData, materialId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">From Location</label>
              <Select
                value={formData.fromLocationId}
                onValueChange={(v) => setFormData({ ...formData, fromLocationId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select from location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromLocationStock > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {fromLocationStock} {selectedMaterial?.unit}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">To Location</label>
              <Select
                value={formData.toLocationId}
                onValueChange={(v) => setFormData({ ...formData, toLocationId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select to location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Quantity ({selectedMaterial?.unit})</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Add notes for this transfer"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Button onClick={handleTransfer} className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Transfer Stock
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Material</th>
                  <th className="text-left py-3 px-4 font-semibold">From</th>
                  <th className="text-left py-3 px-4 font-semibold">To</th>
                  <th className="text-right py-3 px-4 font-semibold">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {stockTransfers.map((transfer) => {
                  const material = materials.find((m) => m.id === transfer.materialId)
                  const fromLoc = locations.find((l) => l.id === transfer.fromLocationId)
                  const toLoc = locations.find((l) => l.id === transfer.toLocationId)
                  return (
                    <tr key={transfer.id} className="border-b border-border hover:bg-muted">
                      <td className="py-3 px-4">{transfer.date}</td>
                      <td className="py-3 px-4">{material?.name}</td>
                      <td className="py-3 px-4">{fromLoc?.name}</td>
                      <td className="py-3 px-4">{toLoc?.name}</td>
                      <td className="text-right py-3 px-4">
                        {transfer.quantity} {material?.unit}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{transfer.notes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {stockTransfers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No transfers yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
