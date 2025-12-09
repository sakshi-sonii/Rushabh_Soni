"use client"

import { useState } from "react"
import { LayoutDashboard, Package, FileText, TrendingUp, LogOut, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Dashboard from "@/components/dashboard"
import Inventory from "@/components/inventory"
import PurchaseBills from "@/components/purchase-bills"
import SalesBills from "@/components/sales-bills"
import Ledger from "@/components/ledger"
import Locations from "@/components/locations"
import StockTransfer from "@/components/stock-transfer"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "inventory" | "purchase" | "sales" | "ledger" | "locations" | "transfer"
  >("dashboard")

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "transfer", label: "Stock Transfer", icon: ArrowRight },
    { id: "purchase", label: "Purchase Bills", icon: FileText },
    { id: "sales", label: "Sales Bills", icon: FileText },
    { id: "ledger", label: "Ledger", icon: TrendingUp },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card shadow-sm">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">Inventory Pro</h1>
          <p className="text-sm text-muted-foreground mt-1">Business Management System</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-border">
          <Button variant="outline" className="w-full gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "locations" && <Locations />}
          {currentPage === "inventory" && <Inventory />}
          {currentPage === "transfer" && <StockTransfer />}
          {currentPage === "purchase" && <PurchaseBills />}
          {currentPage === "sales" && <SalesBills />}
          {currentPage === "ledger" && <Ledger />}
        </div>
      </main>
    </div>
  )
}
