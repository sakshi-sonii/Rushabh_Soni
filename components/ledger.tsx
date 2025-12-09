"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Download, FileText } from "lucide-react"

export default function Ledger() {
  const {
    ledgerEntries,
    addLedgerEntry,
    deleteLedgerEntry,
    receivableBills,
    addReceivableBill,
    updateReceivableBill,
    deleteReceivableBill,
    payableBills,
    addPayableBill,
    updatePayableBill,
    deletePayableBill,
    exportData,
  } = useStore()

  const [activeTab, setActiveTab] = useState<"ledger" | "receivable" | "payable">("ledger")
  const [showForm, setShowForm] = useState(false)

  // Ledger entry state
  const [formData, setFormData] = useState({
    type: "income" as "purchase" | "sales" | "expense" | "income",
    description: "",
    amount: 0,
    partyName: "",
  })

  const [receivableForm, setReceivableForm] = useState({
    billNo: "",
    customer: "",
    amount: 0,
    dueDate: "",
    notes: "",
  })

  const [payableForm, setPayableForm] = useState({
    billNo: "",
    supplier: "",
    amount: 0,
    dueDate: "",
    notes: "",
  })

  const handleAddEntry = () => {
    if (formData.description && formData.amount && formData.partyName) {
      addLedgerEntry({
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        type: formData.type,
        description: formData.description,
        amount: Number(formData.amount),
        partyName: formData.partyName,
      })
      setFormData({ type: "income", description: "", amount: 0, partyName: "" })
      setShowForm(false)
    }
  }

  const handleAddReceivable = () => {
    if (receivableForm.billNo && receivableForm.customer && receivableForm.amount && receivableForm.dueDate) {
      addReceivableBill({
        id: Date.now().toString(),
        billNo: receivableForm.billNo,
        date: new Date().toISOString().split("T")[0],
        customer: receivableForm.customer,
        amount: Number(receivableForm.amount),
        dueDate: receivableForm.dueDate,
        status: "pending",
        amountPaid: 0,
        notes: receivableForm.notes,
      })
      setReceivableForm({ billNo: "", customer: "", amount: 0, dueDate: "", notes: "" })
      setShowForm(false)
    }
  }

  const handleAddPayable = () => {
    if (payableForm.billNo && payableForm.supplier && payableForm.amount && payableForm.dueDate) {
      addPayableBill({
        id: Date.now().toString(),
        billNo: payableForm.billNo,
        date: new Date().toISOString().split("T")[0],
        supplier: payableForm.supplier,
        amount: Number(payableForm.amount),
        dueDate: payableForm.dueDate,
        status: "pending",
        amountPaid: 0,
        notes: payableForm.notes,
      })
      setPayableForm({ billNo: "", supplier: "", amount: 0, dueDate: "", notes: "" })
      setShowForm(false)
    }
  }

  // Calculate totals
  const totalIncome = ledgerEntries
    .filter((e) => e.type === "sales" || e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpense = ledgerEntries
    .filter((e) => e.type === "purchase" || e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0)

  const balance = totalIncome - totalExpense

  const totalReceivable = receivableBills.reduce((sum, b) => sum + b.amount, 0)
  const totalReceived = receivableBills.reduce((sum, b) => sum + b.amountPaid, 0)
  const pendingReceivable = totalReceivable - totalReceived

  const totalPayable = payableBills.reduce((sum, b) => sum + b.amount, 0)
  const totalPaid = payableBills.reduce((sum, b) => sum + b.amountPaid, 0)
  const pendingPayable = totalPayable - totalPaid

  const handleReceivePayment = (billId: string, amount: number) => {
    const bill = receivableBills.find((b) => b.id === billId)
    if (bill) {
      const newAmountPaid = Math.min(bill.amountPaid + amount, bill.amount)
      const status = newAmountPaid === 0 ? "pending" : newAmountPaid >= bill.amount ? "fully_paid" : "partially_paid"
      updateReceivableBill(billId, { amountPaid: newAmountPaid, status })
    }
  }

  const handleMakePayment = (billId: string, amount: number) => {
    const bill = payableBills.find((b) => b.id === billId)
    if (bill) {
      const newAmountPaid = Math.min(bill.amountPaid + amount, bill.amount)
      const status = newAmountPaid === 0 ? "pending" : newAmountPaid >= bill.amount ? "fully_paid" : "partially_paid"
      updatePayableBill(billId, { amountPaid: newAmountPaid, status })
    }
  }

  const handleExport = () => {
    const data = exportData()
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data))
    element.setAttribute("download", `inventory-backup-${new Date().toISOString().split("T")[0]}.json`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Ledger & Accounting</h2>
          <p className="text-muted-foreground mt-1">Track financial transactions, receivables & payables</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Entry
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "ledger"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Ledger
        </button>
        <button
          onClick={() => setActiveTab("receivable")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "receivable"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Receivables
        </button>
        <button
          onClick={() => setActiveTab("payable")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "payable"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Payables
        </button>
      </div>

      {/* Ledger Tab */}
      {activeTab === "ledger" && (
        <>
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add Ledger Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select
                      className="w-full border border-border rounded px-3 py-2"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="purchase">Purchase</option>
                      <option value="sales">Sales</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Party Name</label>
                    <Input
                      placeholder="Customer/Supplier"
                      value={formData.partyName}
                      onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Transaction description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount (₹)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry}>Add Entry</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">₹{totalExpense.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ₹{balance.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ledger Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 font-semibold">Party</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount (₹)</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <tr key={entry.id} className="border-b border-border hover:bg-muted">
                          <td className="py-3 px-4">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                entry.type === "sales" || entry.type === "income"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {entry.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">{entry.description}</td>
                          <td className="py-3 px-4">{entry.partyName}</td>
                          <td
                            className={`text-right py-3 px-4 font-semibold ${
                              entry.type === "sales" || entry.type === "income" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {entry.type === "sales" || entry.type === "income" ? "+" : "-"}₹
                            {entry.amount.toLocaleString()}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Button size="sm" variant="ghost" onClick={() => deleteLedgerEntry(entry.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {ledgerEntries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No ledger entries yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "receivable" && (
        <>
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add Receivable Bill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Bill No.</label>
                    <Input
                      placeholder="e.g., REC-001"
                      value={receivableForm.billNo}
                      onChange={(e) => setReceivableForm({ ...receivableForm, billNo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Customer Name</label>
                    <Input
                      placeholder="Customer name"
                      value={receivableForm.customer}
                      onChange={(e) => setReceivableForm({ ...receivableForm, customer: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount (₹)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={receivableForm.amount}
                      onChange={(e) => setReceivableForm({ ...receivableForm, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={receivableForm.dueDate}
                      onChange={(e) => setReceivableForm({ ...receivableForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Input
                      placeholder="Additional notes"
                      value={receivableForm.notes}
                      onChange={(e) => setReceivableForm({ ...receivableForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddReceivable}>Add Bill</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Receivable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">₹{totalReceivable.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Amount Received</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">₹{totalReceived.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Receivable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">₹{pendingReceivable.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Receivable Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Bill No.</th>
                      <th className="text-left py-3 px-4 font-semibold">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount (₹)</th>
                      <th className="text-right py-3 px-4 font-semibold">Paid (₹)</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivableBills.map((bill) => (
                      <tr key={bill.id} className="border-b border-border hover:bg-muted">
                        <td className="py-3 px-4 font-medium">{bill.billNo}</td>
                        <td className="py-3 px-4">{bill.customer}</td>
                        <td className="py-3 px-4">{new Date(bill.dueDate).toLocaleDateString()}</td>
                        <td className="text-right py-3 px-4">₹{bill.amount.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-green-600 font-semibold">
                          ₹{bill.amountPaid.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              bill.status === "fully_paid"
                                ? "bg-green-100 text-green-800"
                                : bill.status === "partially_paid"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {bill.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 space-x-1">
                          {bill.status !== "fully_paid" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReceivePayment(bill.id, bill.amount - bill.amountPaid)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteReceivableBill(bill.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {receivableBills.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No receivable bills yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "payable" && (
        <>
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add Payable Bill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Bill No.</label>
                    <Input
                      placeholder="e.g., PAY-001"
                      value={payableForm.billNo}
                      onChange={(e) => setPayableForm({ ...payableForm, billNo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Supplier Name</label>
                    <Input
                      placeholder="Supplier name"
                      value={payableForm.supplier}
                      onChange={(e) => setPayableForm({ ...payableForm, supplier: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount (₹)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={payableForm.amount}
                      onChange={(e) => setPayableForm({ ...payableForm, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={payableForm.dueDate}
                      onChange={(e) => setPayableForm({ ...payableForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Input
                      placeholder="Additional notes"
                      value={payableForm.notes}
                      onChange={(e) => setPayableForm({ ...payableForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPayable}>Add Bill</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Payable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">₹{totalPayable.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Amount Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">₹{pendingPayable.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payable Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Bill No.</th>
                      <th className="text-left py-3 px-4 font-semibold">Supplier</th>
                      <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount (₹)</th>
                      <th className="text-right py-3 px-4 font-semibold">Paid (₹)</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payableBills.map((bill) => (
                      <tr key={bill.id} className="border-b border-border hover:bg-muted">
                        <td className="py-3 px-4 font-medium">{bill.billNo}</td>
                        <td className="py-3 px-4">{bill.supplier}</td>
                        <td className="py-3 px-4">{new Date(bill.dueDate).toLocaleDateString()}</td>
                        <td className="text-right py-3 px-4">₹{bill.amount.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-green-600 font-semibold">
                          ₹{bill.amountPaid.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              bill.status === "fully_paid"
                                ? "bg-green-100 text-green-800"
                                : bill.status === "partially_paid"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {bill.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 space-x-1">
                          {bill.status !== "fully_paid" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMakePayment(bill.id, bill.amount - bill.amountPaid)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deletePayableBill(bill.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payableBills.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No payable bills yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
