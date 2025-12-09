"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function Dashboard() {
  const { materials, purchaseBills, salesBills, ledgerEntries } = useStore()

  // Calculate metrics
  const totalStockValue = materials.reduce((sum, m) => sum + m.total, 0)
  const totalMaterials = materials.length
  const totalPurchases = purchaseBills.reduce((sum, b) => sum + b.totalAmount, 0)
  const totalSales = salesBills.reduce((sum, b) => sum + b.totalAmount, 0)

  // Monthly sales data
  // Generate last 6 months and aggregate data from bills (no dummy data)
  const now = new Date()
  const monthsList = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString(undefined, { month: "short" }) }
  })

  const monthlyData = monthsList.map(({ year, month, label }) => {
    const sales = salesBills
      .filter((b) => {
        const d = new Date(b.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    const purchases = purchaseBills
      .filter((b) => {
        const d = new Date(b.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    return { month: label, sales, purchases }
  })

  const topMaterials = materials.slice(0, 5).map((m) => ({
    name: m.name.slice(0, 10),
    value: m.quantity,
  }))

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalStockValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMaterials}</div>
            <p className="text-xs text-muted-foreground mt-1">Types in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalPurchases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{purchaseBills.length} bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{salesBills.length} bills</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Sales vs Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                <Bar dataKey="purchases" fill="#82ca9d" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topMaterials}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topMaterials.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ledgerEntries
              .slice(-5)
              .reverse()
              .map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">{entry.partyName}</p>
                  </div>
                  <div
                    className={`text-sm font-bold ${entry.type === "sales" || entry.type === "income" ? "text-green-600" : "text-red-600"}`}
                  >
                    {entry.type === "sales" || entry.type === "income" ? "+" : "-"}₹{entry.amount.toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
