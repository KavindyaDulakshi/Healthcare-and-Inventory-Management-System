"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Plus,
  DollarSign,
  Printer,
  TrendingUp,
  CreditCard,
  AlertCircle,
  FileCheck2,
  Trash2,
  ChevronRight,
  Sparkles,
  Search
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Invoice, InvoiceItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const urlInvoiceId = searchParams.get("id") || "";

  const {
    billing,
    patients,
    addInvoice,
    updateInvoiceStatus
  } = useHealthcare();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // Invoice Form Fields
  const [formPatientId, setFormPatientId] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formItems, setFormItems] = useState<InvoiceItem[]>([{ name: "", quantity: 1, price: 0 }]);
  const [formError, setFormError] = useState("");

  // Sync selected invoice with query param
  useEffect(() => {
    if (urlInvoiceId) {
      setSelectedInvoiceId(urlInvoiceId);
    } else if (billing.length > 0 && !selectedInvoiceId) {
      setSelectedInvoiceId(billing[0].id);
    }
  }, [urlInvoiceId, billing]);

  const selectedInvoice = billing.find((i) => i.id === selectedInvoiceId) || billing[0];

  // Calculations
  const paidTotal = billing.filter((i) => i.status === "paid").reduce((acc, curr) => acc + curr.amount, 0);
  const unpaidTotal = billing.filter((i) => i.status === "unpaid").reduce((acc, curr) => acc + curr.amount, 0);
  const overdueTotal = billing.filter((i) => i.status === "overdue").reduce((acc, curr) => acc + curr.amount, 0);

  // Form handlers
  const handleAddItemRow = () => {
    setFormItems([...formItems, { name: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const handleItemFieldChange = (idx: number, field: keyof InvoiceItem, val: string | number) => {
    setFormItems(
      formItems.map((item, i) => {
        if (i === idx) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formPatientId || !formDueDate) {
      setFormError("Please select a patient and due date.");
      return;
    }

    const invalidItems = formItems.some((item) => !item.name.trim() || item.price <= 0 || item.quantity <= 0);
    if (invalidItems) {
      setFormError("Please enter valid item names, quantities, and prices.");
      return;
    }

    const patientObj = patients.find((p) => p.id === formPatientId);
    const totalAmount = formItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    addInvoice({
      patientId: formPatientId,
      patientName: patientObj?.name || "Unknown Patient",
      dueDate: formDueDate,
      amount: totalAmount,
      items: formItems
    });

    setIsGenerateOpen(false);
    // Reset Form
    setFormPatientId("");
    setFormDueDate("");
    setFormItems([{ name: "", quantity: 1, price: 0 }]);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter billing invoices
  const filteredInvoices = billing.filter(
    (b) =>
      b.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      b.patientName.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate diagnostic quotes, record payments, and print medical receipts.</p>
        </div>
        <Button className="rounded-xl gap-2 text-xs self-start" onClick={() => setIsGenerateOpen(true)}>
          <Plus className="h-4.5 w-4.5" />
          <span>Generate Invoice</span>
        </Button>
      </div>

      {/* Grid: Financial Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black">
              ${(paidTotal + unpaidTotal + overdueTotal).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">Total Receivables</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-secondary/10 text-secondary p-3 rounded-xl">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-secondary">${paidTotal.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Paid Receipts</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-warning/10 text-warning p-3 rounded-xl">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-warning">${unpaidTotal.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Pending Payments</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-danger/10 text-danger p-3 rounded-xl">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-danger">${overdueTotal.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Overdue Accounts</span>
          </div>
        </Card>
      </div>

      {/* Main Split Layout: Invoice List vs Detail Print Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Invoice Ledger list */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by invoice #, patient..."
              className="w-full bg-card rounded-xl pl-10 pr-4 py-2 text-sm border border-border focus:border-primary focus:bg-card focus:outline-hidden"
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
            />
          </div>

          <span className="text-xs font-bold text-muted-foreground">INVOICES REGISTRY ({filteredInvoices.length})</span>
          
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No invoices found matching query.
              </div>
            ) : (
              filteredInvoices.map((inv) => (
                <Card
                  key={inv.id}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                  className={`p-4 cursor-pointer hover:border-primary transition-all flex justify-between items-center ${
                    selectedInvoice?.id === inv.id
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/5 text-primary p-2 rounded-lg shrink-0">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight">{inv.patientName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono mt-1">
                        {inv.invoiceNumber} &middot; {inv.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">${inv.amount.toFixed(0)}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right: Invoice Receipt Preview (Interactive printing view) */}
        {selectedInvoice ? (
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-bold text-muted-foreground">RECEIPT PREVIEW</span>
              <div className="flex items-center gap-2">
                {selectedInvoice.status !== "paid" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-lg text-[10px] h-8 px-2.5 gap-1.5"
                    onClick={() => updateInvoiceStatus(selectedInvoice.id, "paid")}
                  >
                    <FileCheck2 className="h-4 w-4" />
                    <span>Record Payment</span>
                  </Button>
                )}
                {selectedInvoice.status === "paid" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-[10px] h-8 px-2.5 gap-1.5 text-warning"
                    onClick={() => updateInvoiceStatus(selectedInvoice.id, "unpaid")}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Mark Unpaid</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-8 px-2.5 gap-1.5" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </Button>
              </div>
            </div>

            {/* Print Area layout */}
            <Card id="invoice-print-area" className="p-8 text-left bg-card border border-border shadow-xs rounded-2xl print:border-0 print:shadow-none">
              
              {/* Receipt Top banner */}
              <div className="flex justify-between items-start border-b border-border pb-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/15 text-primary p-2 rounded-xl">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <span className="font-extrabold text-lg tracking-tight">MediCare Clinic Suite</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 leading-normal pl-1">
                    742 Evergreen Terrace, Suite 100<br />
                    Springfield, OR 97477<br />
                    billing@medicare.com
                  </div>
                </div>

                <div className="flex flex-col items-end text-right gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice Statement</span>
                  <span className="text-sm font-mono font-bold text-foreground">{selectedInvoice.invoiceNumber}</span>
                  <Badge variant={selectedInvoice.status === "paid" ? "secondary" : "warning"} className="mt-1">
                    {selectedInvoice.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Patient dossier info */}
              <div className="grid grid-cols-2 gap-8 my-8 text-xs">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Billed To</span>
                  <span className="font-bold text-foreground">{selectedInvoice.patientName}</span>
                  <span className="text-muted-foreground leading-normal mt-0.5">
                    Internal Patient ID: {selectedInvoice.patientId}
                  </span>
                </div>

                <div className="flex flex-col items-end text-right gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Invoice Details</span>
                  <div className="flex justify-end gap-2 text-muted-foreground">
                    <span>Issue Date:</span>
                    <span className="font-semibold text-foreground">{selectedInvoice.date}</span>
                  </div>
                  <div className="flex justify-end gap-2 text-muted-foreground">
                    <span>Due Date:</span>
                    <span className="font-semibold text-foreground">{selectedInvoice.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Treatment / Item Description</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold">{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Financial summation */}
              <div className="flex justify-end mt-6 text-xs">
                <div className="w-full max-w-[240px] flex flex-col gap-2.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-foreground">${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground pb-2.5 border-b border-border/50">
                    <span>Tax (0%):</span>
                    <span className="font-semibold text-foreground">$0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-foreground pt-1">
                    <span>Invoice Total:</span>
                    <span>${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment directions */}
              <div className="border-t border-dashed border-border/70 mt-12 pt-6 text-[10px] text-muted-foreground leading-relaxed text-center">
                <span>Please quote invoice reference <span className="font-semibold font-mono text-foreground">{selectedInvoice.invoiceNumber}</span> when settling balances.<br />
                Thank you for choosing MediCare Hospital Services.</span>
              </div>

            </Card>
          </div>
        ) : (
          <div className="lg:col-span-2 text-center py-16 border border-dashed border-border rounded-2xl bg-card">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">Select an invoice dossier to inspect statement.</span>
          </div>
        )}
      </div>

      {/* GENERATE INVOICE DIALOG MODAL */}
      <Dialog
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Invoice Statement"
        description="Construct a bill layout mapping consultations and drug costs to a patient."
      >
        <form onSubmit={handleGenerateInvoice} className="flex flex-col gap-4">
          {formError && (
            <div className="bg-danger/10 text-danger border border-danger/20 p-2.5 rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}

          <Select
            label="Select Patient Folder"
            options={[
              { value: "", label: "-- Choose Patient --" },
              ...patients.map((p) => ({ value: p.id, label: p.name }))
            ]}
            value={formPatientId}
            onChange={(e: any) => setFormPatientId(e.target.value)}
          />

          <Input
            type="date"
            label="Payment Due Date"
            value={formDueDate}
            onChange={(e: any) => setFormDueDate(e.target.value)}
          />

          {/* Line items constructor */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center pb-1 border-b border-border">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Line Items
              </span>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[9px] px-2 rounded-md" onClick={handleAddItemRow}>
                Add Item
              </Button>
            </div>

            <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
              {formItems.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2 text-xs">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="e.g. Paracetamol 500mg (2 packs)"
                      value={item.name}
                      onChange={(e: any) => handleItemFieldChange(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="w-16">
                    <Input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e: any) => handleItemFieldChange(idx, "quantity", Number(e.target.value))}
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="text"
                      placeholder="Price"
                      value={item.price || ""}
                      onChange={(e: any) => handleItemFieldChange(idx, "price", Number(e.target.value))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={formItems.length === 1}
                    className="h-9 w-9 text-danger hover:bg-danger/10 rounded-lg cursor-pointer shrink-0"
                    onClick={() => handleRemoveItemRow(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Confirm & Generate
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CSS print override styles (inject into document) */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

    </div>
  );
}
