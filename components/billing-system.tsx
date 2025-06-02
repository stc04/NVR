"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, CreditCard, Calendar, AlertTriangle, CheckCircle, Clock, Download, Send, Plus } from "lucide-react"
import type { Payment, Invoice } from "@/types"

export function BillingSystem() {
  const [activeTab, setActiveTab] = useState<"payments" | "invoices" | "reports">("payments")
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    // Load data from localStorage
    const savedPayments = localStorage.getItem("payments")
    const savedInvoices = localStorage.getItem("invoices")

    if (savedPayments) {
      setPayments(JSON.parse(savedPayments))
    }

    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices))
    }
  }, [])

  const savePayments = (updatedPayments: Payment[]) => {
    setPayments(updatedPayments)
    localStorage.setItem("payments", JSON.stringify(updatedPayments))
  }

  const saveInvoices = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices)
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices))
  }

  const addPayment = () => {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      tenantName: "New Tenant",
      unitId: "A-001",
      amount: 125,
      dueDate: new Date().toISOString().split("T")[0],
      status: "pending",
      invoiceNumber: `INV-${Date.now()}`,
    }
    savePayments([...payments, newPayment])
  }

  const addInvoice = () => {
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      tenantName: "New Tenant",
      unitId: "A-001",
      amount: 125,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "draft",
      items: [{ description: "Monthly Rent", amount: 125 }],
    }
    saveInvoices([...invoices, newInvoice])
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)
  const overdueAmount = payments.filter((p) => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Billing & Payments</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage invoices, payments, and financial reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={addInvoice} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">${totalRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">${pendingAmount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Overdue</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">${overdueAmount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {totalRevenue + pendingAmount + overdueAmount > 0
                    ? Math.round((totalRevenue / (totalRevenue + pendingAmount + overdueAmount)) * 100)
                    : 0}
                  %
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {(["payments", "invoices", "reports"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{payment.tenantName}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Unit {payment.unitId} • {payment.invoiceNumber}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Due: {payment.dueDate}
                          {payment.paidDate && ` • Paid: ${payment.paidDate}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">${payment.amount}</p>
                        {payment.method && (
                          <p className="text-xs text-slate-500 dark:text-slate-500 capitalize">
                            {payment.method.replace("_", " ")}
                          </p>
                        )}
                      </div>
                      <Badge className={getPaymentStatusColor(payment.status)}>
                        {getPaymentStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                      {payment.status === "overdue" && (
                        <Button size="sm" variant="destructive">
                          <Send className="w-4 h-4 mr-2" />
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No payments recorded</p>
                <Button onClick={addPayment}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {invoice.tenantName} • Unit {invoice.unitId}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Issued: {invoice.issueDate} • Due: {invoice.dueDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">${invoice.amount}</p>
                      </div>
                      <Badge className={getPaymentStatusColor(invoice.status)}>
                        {getPaymentStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        {invoice.status === "draft" && (
                          <Button size="sm">
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No invoices created</p>
                <Button onClick={addInvoice}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-slate-500 dark:text-slate-400">Revenue Chart - Connect to analytics service</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">Payment method analytics will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
