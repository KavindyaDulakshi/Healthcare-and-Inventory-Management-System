"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Pill,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  Clock,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Package,
  Activity,
  HeartPulse,
  CornerDownRight,
  TrendingUp
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function DashboardPage() {
  const router = useRouter();
  const {
    medicines,
    patients,
    doctors,
    appointments,
    billing,
    stockTransactions,
    dispenseMedicine,
    updateMedicine,
    addAppointment
  } = useHealthcare();

  const [mounted, setMounted] = useState(false);
  
  // Dispense Form States
  const [isDispenseOpen, setIsDispenseOpen] = useState(false);
  const [dispenseMedId, setDispenseMedId] = useState("");
  const [dispensePatId, setDispensePatId] = useState("");
  const [dispenseDocId, setDispenseDocId] = useState("");
  const [dispenseQty, setDispenseQty] = useState(1);
  const [dispenseNotes, setDispenseNotes] = useState("");
  const [dispenseError, setDispenseError] = useState("");
  
  // Restock Form States
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockMedId, setRestockMedId] = useState("");
  const [restockQty, setRestockQty] = useState(100);

  // Quick Appointment States
  const [isAppointOpen, setIsAppointOpen] = useState(false);
  const [appPatId, setAppPatId] = useState("");
  const [appDocId, setAppDocId] = useState("");
  const [appDate, setAppDate] = useState("");
  const [appTime, setAppTime] = useState("");
  const [appNotes, setAppNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stats Calculations
  const totalMedicines = medicines.reduce((acc, curr) => acc + (curr.quantity > 0 ? 1 : 0), 0);
  const lowStockCount = medicines.filter((m) => m.status === "low-stock").length;
  const expiredCount = medicines.filter((m) => m.status === "expired" || m.status === "out-of-stock").length;
  const totalPatients = patients.length;
  
  const todayStr = "2026-06-09";
  const todaysAppointments = appointments.filter((a) => a.date === todayStr);
  
  const totalRevenue = billing
    .filter((inv) => inv.status === "paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Chart Data: Category Distribution
  const categoryData = medicines.reduce((acc: { name: string; value: number }[], curr) => {
    const found = acc.find((c) => c.name === curr.category);
    if (found) {
      found.value += curr.quantity;
    } else {
      acc.push({ name: curr.category, value: curr.quantity });
    }
    return acc;
  }, []);

  const COLORS = ["#2563EB", "#10B981", "#06B6D4", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Chart Data: Revenue History
  const revenueHistory = [
    { month: "Jan", revenue: 4500 },
    { month: "Feb", revenue: 5200 },
    { month: "Mar", revenue: 4900 },
    { month: "Apr", revenue: 6300 },
    { month: "May", revenue: 5800 },
    { month: "Jun", revenue: totalRevenue + 1200 } // current month + baseline
  ];

  // Chart Data: Inventory Consumption (simulated weekly top items usage)
  const usageData = medicines.slice(0, 5).map((m) => ({
    name: m.name.split(" ")[0],
    quantity: m.quantity > 500 ? 120 : m.quantity > 100 ? 45 : 12
  }));

  // Handle actions
  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    setDispenseError("");
    
    if (!dispenseMedId || !dispensePatId || !dispenseDocId) {
      setDispenseError("Please select all medicine, patient, and doctor fields.");
      return;
    }

    const selectedMed = medicines.find((m) => m.id === dispenseMedId);
    if (!selectedMed) return;

    if (selectedMed.quantity < dispenseQty) {
      setDispenseError(`Insufficient stock. Only ${selectedMed.quantity} units available.`);
      return;
    }

    const success = dispenseMedicine(dispenseMedId, dispenseQty, dispensePatId, dispenseDocId, dispenseNotes);
    if (success) {
      setIsDispenseOpen(false);
      // Reset form fields
      setDispenseMedId("");
      setDispensePatId("");
      setDispenseDocId("");
      setDispenseQty(1);
      setDispenseNotes("");
    } else {
      setDispenseError("Dispense transaction failed.");
    }
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockMedId) return;
    
    const selectedMed = medicines.find((m) => m.id === restockMedId);
    if (!selectedMed) return;
    
    updateMedicine(restockMedId, { quantity: selectedMed.quantity + Number(restockQty) });
    setIsRestockOpen(false);
    setRestockMedId("");
    setRestockQty(100);
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appPatId || !appDocId || !appDate || !appTime) return;

    const patientObj = patients.find((p) => p.id === appPatId);
    const doctorObj = doctors.find((d) => d.id === appDocId);

    addAppointment({
      patientId: appPatId,
      patientName: patientObj?.name || "New Patient",
      doctorId: appDocId,
      doctorName: doctorObj?.name || "New Doctor",
      date: appDate,
      time: appTime,
      notes: appNotes
    });

    setIsAppointOpen(false);
    setAppPatId("");
    setAppDocId("");
    setAppDate("");
    setAppTime("");
    setAppNotes("");
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, Dr. Sarah 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here is a clinical analytics digest for your facility today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl gap-2 text-xs" onClick={() => router.push("/reports")}>
            <TrendingUp className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
          <Button className="rounded-xl gap-2 text-xs" onClick={() => setIsAppointOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>New Appointment</span>
          </Button>
        </div>
      </div>

      {/* Grid: Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Total Medicines */}
        <Card className="rounded-2xl border-border bg-card p-5 flex flex-col gap-2 hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">+12.5%</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-black">{totalMedicines}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Available Medicines</span>
          </div>
        </Card>

        {/* Low Stock Medicines */}
        <Card className="rounded-2xl border-border bg-card p-5 flex flex-col gap-2 hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-warning/10 text-warning p-2.5 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
            {lowStockCount > 0 && (
              <span className="text-[10px] bg-warning/15 text-warning font-bold px-2 py-0.5 rounded-full">Alert</span>
            )}
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-black text-warning">{lowStockCount}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Low Stock Items</span>
          </div>
        </Card>

        {/* Expired / Critical Stock */}
        <Card className="rounded-2xl border-border bg-card p-5 flex flex-col gap-2 hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-danger/10 text-danger p-2.5 rounded-xl">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-[10px] bg-danger/15 text-danger font-bold px-2 py-0.5 rounded-full">-2.1%</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-black text-danger">{expiredCount}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Expired / Critical Items</span>
          </div>
        </Card>

        {/* Total Patients */}
        <Card className="rounded-2xl border-border bg-card p-5 flex flex-col gap-2 hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-accent/10 text-accent p-2.5 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">+4.2%</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-black">{totalPatients}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Active Patients</span>
          </div>
        </Card>

        {/* Today's Appointments */}
        <Card className="rounded-2xl border-border bg-card p-5 flex flex-col gap-2 hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-[10px] bg-primary/15 text-primary font-bold px-2 py-0.5 rounded-full">Today</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-black">{todaysAppointments.length}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Today's Appointments</span>
          </div>
        </Card>

        {/* Revenue Summary */}
        <Card className="rounded-2xl border-border bg-card p-5 flex flex-col gap-2 hover:translate-y-[-2px] transition-all">
          <div className="flex justify-between items-start">
            <div className="bg-secondary/10 text-secondary p-2.5 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">+8.9%</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-black">${totalRevenue.toFixed(0)}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Monthly Revenue</span>
          </div>
        </Card>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Analytics Curve */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Visual trend of clinical billing invoices ($)</CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-lg">H1 2026</Badge>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
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
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Inventory Split</CardTitle>
            <CardDescription>Stock distribution by type</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between pt-4">
            {mounted ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-foreground)",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 w-full flex items-center justify-center text-xs text-muted-foreground">Loading split...</div>
            )}
            
            {/* Custom Pie Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-border/40">
              {categoryData.slice(0, 4).map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate font-semibold text-foreground/80">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Widgets & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Low Stock & Expiring list widget */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Critical Inventory</CardTitle>
            <CardDescription>Items needing replenishment or check</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {medicines.filter((m) => m.status === "low-stock" || m.status === "out-of-stock" || m.status === "expired").length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
                All medicines adequately stocked.
              </div>
            ) : (
              medicines
                .filter((m) => m.status === "low-stock" || m.status === "out-of-stock" || m.status === "expired")
                .slice(0, 4)
                .map((m) => (
                  <div key={m.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground">Supplier: {m.supplier}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold">{m.quantity} left</span>
                      <Badge variant={m.status === "expired" || m.status === "out-of-stock" ? "danger" : "warning"}>
                        {m.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions / Activities */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Warehouse Operations</CardTitle>
            <CardDescription>Recent actions logged by staff</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {stockTransactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex gap-3 text-xs border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <div className={cn(
                  "p-2 rounded-lg shrink-0 h-fit mt-0.5",
                  tx.type === "in" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                )}>
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{tx.medicineName}</span>
                    <span className="text-[10px] text-muted-foreground/85">
                      {tx.type === "in" ? "+" : "-"}{tx.quantity}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-normal">{tx.reference}</p>
                  <span className="text-[10px] font-semibold text-muted-foreground/80 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {tx.operator}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Operations widget */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Execute clinical workflows instantly</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button
              className="w-full justify-start gap-2.5 rounded-xl text-xs py-5"
              onClick={() => setIsDispenseOpen(true)}
            >
              <Package className="h-4.5 w-4.5" />
              <div className="flex flex-col items-start">
                <span className="font-bold">Dispense Prescription</span>
                <span className="text-[10px] font-normal opacity-80">Log drug distribution to patient</span>
              </div>
            </Button>
            
            <Button
              variant="secondary"
              className="w-full justify-start gap-2.5 rounded-xl text-xs py-5"
              onClick={() => setIsRestockOpen(true)}
            >
              <Plus className="h-4.5 w-4.5" />
              <div className="flex flex-col items-start">
                <span className="font-bold">Restock Medicine</span>
                <span className="text-[10px] font-normal opacity-85">Add inbound supplier quantity</span>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-2.5 rounded-xl text-xs py-5"
              onClick={() => setIsAppointOpen(true)}
            >
              <Calendar className="h-4.5 w-4.5 text-primary" />
              <div className="flex flex-col items-start">
                <span className="font-bold">Book Appointment</span>
                <span className="text-[10px] font-normal text-muted-foreground">Reserve time with specialist</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DISPENSE PRESCRIPTION DIALOG MODAL */}
      <Dialog
        isOpen={isDispenseOpen}
        onClose={() => setIsDispenseOpen(false)}
        title="Dispense Prescription"
        description="Decrements drug stock levels and appends it to patient medical history records."
      >
        <form onSubmit={handleDispense} className="flex flex-col gap-4">
          {dispenseError && (
            <div className="bg-danger/10 text-danger border border-danger/20 p-2.5 rounded-lg text-xs font-semibold">
              {dispenseError}
            </div>
          )}

          <Select
            label="Select Medicine"
            options={[
              { value: "", label: "-- Choose Drug --" },
              ...medicines
                .filter((m) => m.quantity > 0)
                .map((m) => ({ value: m.id, label: `${m.name} (Stock: ${m.quantity})` }))
            ]}
            value={dispenseMedId}
            onChange={(e: any) => setDispenseMedId(e.target.value)}
          />

          <Select
            label="Select Patient"
            options={[
              { value: "", label: "-- Choose Patient --" },
              ...patients.map((p) => ({ value: p.id, label: `${p.name} (Age: ${p.age})` }))
            ]}
            value={dispensePatId}
            onChange={(e: any) => setDispensePatId(e.target.value)}
          />

          <Select
            label="Attending Doctor"
            options={[
              { value: "", label: "-- Attending Staff --" },
              ...doctors.map((d) => ({ value: d.id, label: d.name }))
            ]}
            value={dispenseDocId}
            onChange={(e: any) => setDispenseDocId(e.target.value)}
          />

          <Input
            type="number"
            label="Quantity to Dispense"
            value={dispenseQty}
            min={1}
            onChange={(e: any) => setDispenseQty(Number(e.target.value))}
          />

          <Input
            type="text"
            label="Prescription Notes / Diagnosis"
            placeholder="e.g. 1 tab twice daily for cough"
            value={dispenseNotes}
            onChange={(e: any) => setDispenseNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsDispenseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Confirm & Dispense
            </Button>
          </div>
        </form>
      </Dialog>

      {/* RESTOCK MEDICINE DIALOG MODAL */}
      <Dialog
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title="Restock Inbound Medicine"
        description="Replenish drug counts in clinic warehouse inventory catalog."
      >
        <form onSubmit={handleRestock} className="flex flex-col gap-4">
          <Select
            label="Select Medicine to Restock"
            options={[
              { value: "", label: "-- Choose Medicine --" },
              ...medicines.map((m) => ({ value: m.id, label: `${m.name} (Current: ${m.quantity})` }))
            ]}
            value={restockMedId}
            onChange={(e: any) => setRestockMedId(e.target.value)}
          />

          <Input
            type="number"
            label="Inbound Quantity"
            value={restockQty}
            min={1}
            onChange={(e: any) => setRestockQty(Number(e.target.value))}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsRestockOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" className="rounded-lg">
              Confirm Restock
            </Button>
          </div>
        </form>
      </Dialog>

      {/* QUICK BOOK APPOINTMENT MODAL */}
      <Dialog
        isOpen={isAppointOpen}
        onClose={() => setIsAppointOpen(false)}
        title="Schedule Clinic Appointment"
        description="Log an appointment slot for a clinic patient with a medical practitioner."
      >
        <form onSubmit={handleAddAppointment} className="flex flex-col gap-4">
          <Select
            label="Select Patient"
            options={[
              { value: "", label: "-- Choose Patient --" },
              ...patients.map((p) => ({ value: p.id, label: p.name }))
            ]}
            value={appPatId}
            onChange={(e: any) => setAppPatId(e.target.value)}
          />

          <Select
            label="Assign Doctor"
            options={[
              { value: "", label: "-- Choose Specialist --" },
              ...doctors.map((d) => ({ value: d.id, label: `${d.name} (${d.department})` }))
            ]}
            value={appDocId}
            onChange={(e: any) => setAppDocId(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Appointment Date"
              value={appDate}
              onChange={(e: any) => setAppDate(e.target.value)}
            />
            <Input
              type="text"
              label="Time (e.g. 10:00 AM)"
              placeholder="10:00 AM"
              value={appTime}
              onChange={(e: any) => setAppTime(e.target.value)}
            />
          </div>

          <Input
            type="text"
            label="Consultation Reason / Notes"
            placeholder="e.g. Heart murmur follow-up"
            value={appNotes}
            onChange={(e: any) => setAppNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAppointOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Schedule Appointment
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
