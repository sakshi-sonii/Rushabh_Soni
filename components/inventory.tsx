"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2 } from "lucide-react"

export default function Inventory() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", unit: "", quantity: 0, rate: 0 })

  const handleAddMaterial = () => {
    if (formData.name && formData.unit && formData.rate) {
      const newMaterial = {
        id: Date.now().toString(),
        name: formData.name,
        unit: formData.unit,
        quantity: Number(formData.quantity),
        rate: Number(formData.rate),
        total: Number(formData.quantity) * Number(formData.rate),
      }
      addMaterial(newMaterial)
      setFormData({ name: "", unit: "", quantity: 0, rate: 0 })
    }
  }

  const handleUpdateMaterial = (id: string) => {
    updateMaterial(id, {
      quantity: Number(formData.quantity),
      rate: Number(formData.rate),
      total: Number(formData.quantity) * Number(formData.rate),
    })
    setEditingId(null)
    setFormData({ name: "", unit: "", quantity: 0, rate: 0 })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground mt-1">Manage your stock in the godown</p>
        </div>
      </div>

      {/* Add Material Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? "Edit Material" : "Add New Material"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Material Name</label>
              <Input
                placeholder="e.g., Steel Rod"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input
                placeholder="e.g., kg, m, pcs"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rate (₹)</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              {editingId ? (
                <>
                  <Button onClick={() => handleUpdateMaterial(editingId)} className="flex-1">
                    Update
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      setFormData({ name: "", unit: "", quantity: 0, rate: 0 })
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddMaterial} className="flex-1">
                  Add Material
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Materials in Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Material Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Unit</th>
                  <th className="text-right py-3 px-4 font-semibold">Quantity</th>
                  <th className="text-right py-3 px-4 font-semibold">Rate (₹)</th>
                  <th className="text-right py-3 px-4 font-semibold">Total Value (₹)</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id} className="border-b border-border hover:bg-muted">
                    <td className="py-3 px-4">{material.name}</td>
                    <td className="py-3 px-4">{material.unit}</td>
                    <td className="text-right py-3 px-4">{material.quantity.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">₹{material.rate.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 font-semibold">₹{material.total.toLocaleString()}</td>
                    <td className="text-center py-3 px-4 flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setFormData({
                            name: material.name,
                            unit: material.unit,
                            quantity: material.quantity,
                            rate: material.rate,
                          })
                          setEditingId(material.id)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMaterial(material.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {materials.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No materials added yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
