"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, MapPin } from "lucide-react"

export default function Locations() {
  const { locations, addLocation, updateLocation, deleteLocation } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", address: "" })

  const handleAddLocation = () => {
    if (formData.name && formData.address) {
      const newLocation = {
        id: Date.now().toString(),
        name: formData.name,
        address: formData.address,
        createdAt: new Date().toISOString().split("T")[0],
      }
      addLocation(newLocation)
      setFormData({ name: "", address: "" })
    }
  }

  const handleUpdateLocation = (id: string) => {
    updateLocation(id, formData)
    setEditingId(null)
    setFormData({ name: "", address: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-8 h-8" />
            Locations & Warehouses
          </h2>
          <p className="text-muted-foreground mt-1">Manage your godowns and storage locations</p>
        </div>
      </div>

      {/* Add Location Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? "Edit Location" : "Add New Location"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Location Name</label>
              <Input
                placeholder="e.g., Main Warehouse"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!editingId}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input
                placeholder="e.g., Delhi, India"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              {editingId ? (
                <>
                  <Button onClick={() => handleUpdateLocation(editingId)} className="flex-1">
                    Update
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      setFormData({ name: "", address: "" })
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddLocation} className="flex-1">
                  Add Location
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Address</th>
                  <th className="text-left py-3 px-4 font-semibold">Created</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} className="border-b border-border hover:bg-muted">
                    <td className="py-3 px-4 font-medium">{location.name}</td>
                    <td className="py-3 px-4">{location.address}</td>
                    <td className="py-3 px-4 text-muted-foreground">{location.createdAt}</td>
                    <td className="text-center py-3 px-4 flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setFormData({ name: location.name, address: location.address })
                          setEditingId(location.id)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteLocation(location.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {locations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No locations added yet. Create your first warehouse!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
