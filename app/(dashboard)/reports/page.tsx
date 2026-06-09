"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import {
  FileText,
  Printer,
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  HeartPulse,
  Filter
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

export default function ReportsPage() {
  const { medicines, patients, billing, suppliers, appointments } = useHealthcare();
  const [mounted, setMounted] = useState(false);
  const [reportType, setReportType] = useState<"all" | "inventory" | "revenue" | "clinical">("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Summary statistics
  const totalStockVal = medicines.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const totalRevenue = billing.filter((i) => i.status === "paid").reduce((acc, curr) => acc + curr.amount, 0);
  const outstandingBal = billing.filter((i) => i.status === "unpaid").reduce((acc, curr) => acc + curr.amount, 0);
  
  // Data processing: Clinic activity
  const clinicActivityData = [
    { month: "Jan", appointments: 45, checkups: 120 },
    { month: "Feb", appointments: 50, checkups: 135 },
    { month: "Mar", appointments: 68, checkups: 150 },
    { month: "Apr", appointments: 74, checkups: 180 },
    { month: "May", appointments: 88, checkups: 195 },
    { month: "Jun", appointments: appointments.length * 5, checkups: patients.length * 8 }
  ];

  // Data processing: Revenue VS Outstanding
  const financialData = [
    { name: "Jan", revenue: 4200, outstanding: 800 },
    { name: "Feb", revenue: 5100, outstanding: 450 },
    { name: "Mar", revenue: 4900, outstanding: 1100 },
    { name: "Apr", revenue: 6200, outstanding: 700 },
    { name: "May", revenue: 5800, outstanding: 600 },
    { name: "Jun", revenue: totalRevenue, outstanding: outstandingBal }
  ];

  // Data processing: Category value
  const categorySummary = medicines.reduce((acc: { category: string; value: number; count: number }[], curr) => {
    const found = acc.find((c) => c.category === curr.category);
    if (found) {
      found.value += curr.quantity * curr.unitPrice;
      found.count += 1;
    } else {
      acc.push({ category: curr.category, value: curr.quantity * curr.unitPrice, count: 1 });
    }
    return acc;
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Clinical Reports & Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">Exportable metrics, logistics audit dashboards, and operational indices.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Report filters */}
          <div className="flex items-center bg-card border border-border p-1 rounded-xl shadow-xs">
            <button
              onClick={() => setReportType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                reportType === "all" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setReportType("inventory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                reportType === "inventory" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Warehouse
            </button>
            <button
              onClick={() => setReportType("revenue")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                reportType === "revenue" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Financial
            </button>
          </div>

          <Button variant="outline" className="rounded-xl gap-2 text-xs" onClick={handlePrint}>
            <Printer className="h-4.5 w-4.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Overview stats */}
      {reportType === "all" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pharmacy Asset Valuation</span>
            <span className="text-2xl font-black text-primary">${totalStockVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5 text-secondary" /> Mapped pharmaceutical valuation
            </span>
          </Card>

          <Card className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Settled Receipts</span>
            <span className="text-2xl font-black text-secondary">${totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5 text-secondary" /> Cleared invoice billing totals
            </span>
          </Card>

          <Card className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Outstanding Billings</span>
            <span className="text-2xl font-black text-warning">${outstandingBal.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-1">
              <TrendingDown className="h-3.5 w-3.5 text-danger" /> Outstanding clinical invoices
            </span>
          </Card>

          <Card className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Clinical Consultations</span>
            <span className="text-2xl font-black text-accent">{appointments.length}</span>
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-1">
              <Activity className="h-3.5 w-3.5 text-accent" /> Total checkups logged in calendar
            </span>
          </Card>
        </div>
      )}

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue VS Outstanding (Financial Report) */}
        {(reportType === "all" || reportType === "revenue") && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Analysis</CardTitle>
              <CardDescription>Paid receipts vs Outstanding accounts receivables ($)</CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-4">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-foreground)",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Paid Revenue" />
                    <Bar dataKey="outstanding" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Outstanding" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Loading curves...</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Clinical consult trends */}
        {(reportType === "all" || reportType === "clinical") && (
          <Card>
            <CardHeader>
              <CardTitle>Clinical Activities</CardTitle>
              <CardDescription>Roster appointments vs general checkup logs</CardDescription>
            </CardHeader>
            <CardContent className="h-80 pt-4">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={clinicActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCheck" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-foreground)",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Area type="monotone" dataKey="appointments" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApp)" name="Appointments" />
                    <Area type="monotone" dataKey="checkups" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCheck)" name="Dossier Audits" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Loading trends...</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabular details: Category details */}
      {(reportType === "all" || reportType === "inventory") && (
        <Card className="rounded-2xl border-border bg-card overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle>Warehouse Category Breakdown</CardTitle>
            <CardDescription>Total valuation index divided by pharmaceutical subcategories</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Unique Batches</TableHead>
                  <TableHead>Total Stock Value</TableHead>
                  <TableHead>Logistics Index</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorySummary.map((sum) => (
                  <TableRow key={sum.category}>
                    <TableCell className="font-bold text-xs">{sum.category}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{sum.count} items</TableCell>
                    <TableCell className="text-xs font-semibold text-primary">${sum.value.toFixed(2)}</TableCell>
                    <TableCell>
                      {/* CSS progress bar */}
                      <div className="w-full max-w-[140px] bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full"
                          style={{
                            width: `${Math.min(100, (sum.value / totalStockVal) * 100 || 0)}%`
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

    </div>
  );
}
