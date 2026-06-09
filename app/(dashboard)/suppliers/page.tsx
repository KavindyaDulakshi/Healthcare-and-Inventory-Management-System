"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Truck,
  Plus,
  Mail,
  Phone,
  MapPin,
  Star,
  DollarSign,
  TrendingUp,
  FileText,
  User,
  ExternalLink,
  ChevronRight
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name must be at least 2 characters"),
  contactPerson: z.string().min(2, "Contact person name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter a valid address"),
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5")
});

type SupplierFields = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const { suppliers, addSupplier, medicines } = useHealthcare();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(suppliers[0]?.id || null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SupplierFields>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: {
      rating: 5
    }
  });

  const onSubmit = (data: SupplierFields) => {
    addSupplier({
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      rating: data.rating
    });
    setIsAddOpen(false);
    reset();
  };

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  // Get medicines associated with the selected supplier
  const supplierMedicines = medicines.filter(
    (m) => m.supplier.toLowerCase() === selectedSupplier?.name.toLowerCase()
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Suppliers & Logistics</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage wholesale pharmaceutical partners, invoices, and performance scores.</p>
        </div>
        <Button className="rounded-xl gap-2 text-xs self-start" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4.5 w-4.5" />
          <span>Add Supplier</span>
        </Button>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-xl">
            <Truck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black">{suppliers.length}</span>
            <span className="text-xs text-muted-foreground mt-0.5">Active Partnerships</span>
          </div>
        </Card>
        
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-secondary/10 text-secondary p-3 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black">
              {(suppliers.reduce((acc, curr) => acc + curr.rating, 0) / suppliers.length || 0).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1">
              Avg Supplier Rating <Star className="h-3 w-3 fill-warning text-warning" />
            </span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-warning/10 text-warning p-3 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black">
              ${suppliers.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">Outstanding Balances</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="bg-accent/10 text-accent p-3 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black">
              {suppliers.reduce((acc, curr) => acc + curr.purchaseHistoryCount, 0)}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">Total Orders Dispatched</span>
          </div>
        </Card>
      </div>

      {/* Main Split Layout: Supplier List Cards vs Detailed Roster view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Supplier Roster list */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <span className="text-sm font-bold text-muted-foreground">PARTNERS DIRECTORY</span>
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {suppliers.map((s) => (
              <Card
                key={s.id}
                onClick={() => setSelectedSupplierId(s.id)}
                className={`p-4 cursor-pointer hover:border-primary transition-all flex justify-between items-center ${
                  selectedSupplier?.id === s.id
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted text-foreground p-2 rounded-lg font-bold text-xs uppercase shrink-0">
                    {s.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Orders: {s.purchaseHistoryCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-warning/10 text-warning font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    {s.rating} <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Detailed Supplier Roster */}
        {selectedSupplier ? (
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-3.5 rounded-2xl shrink-0">
                      <Truck className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col text-left">
                      <CardTitle className="text-xl font-bold">{selectedSupplier.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        Contact Key: <span className="font-semibold text-foreground/80">{selectedSupplier.contactPerson}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-lg">
                      Rating: {selectedSupplier.rating} / 5.0
                    </Badge>
                    <Badge variant={selectedSupplier.balance > 0 ? "warning" : "secondary"}>
                      {selectedSupplier.balance > 0 ? "PAST DUE" : "SETTLED"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col gap-6">
                
                {/* Contact grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30 text-xs">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-muted-foreground font-semibold">Email</span>
                      <a href={`mailto:${selectedSupplier.email}`} className="truncate hover:underline text-foreground">
                        {selectedSupplier.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30 text-xs">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-muted-foreground font-semibold">Phone</span>
                      <a href={`tel:${selectedSupplier.phone}`} className="hover:underline text-foreground">
                        {selectedSupplier.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30 text-xs">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-muted-foreground font-semibold">Address</span>
                      <span className="truncate text-foreground">{selectedSupplier.address}</span>
                    </div>
                  </div>
                </div>

                {/* Logistics breakdown */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-muted-foreground">MAPPED PHARMACEUTICAL CATALOGS</span>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Drug Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Remaining Stock</TableHead>
                          <TableHead>Unit Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplierMedicines.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                              No medicines mapped to this supplier currently in stock.
                            </TableCell>
                          </TableRow>
                        ) : (
                          supplierMedicines.map((m) => (
                            <TableRow key={m.id}>
                              <TableCell className="font-bold text-xs">{m.name}</TableCell>
                              <TableCell className="text-xs">{m.category}</TableCell>
                              <TableCell className="text-xs font-semibold">{m.quantity} units</TableCell>
                              <TableCell className="text-xs font-semibold">${m.unitPrice.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={m.status === "in-stock" ? "secondary" : m.status === "low-stock" ? "warning" : "danger"}>
                                  {m.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-2 text-center py-12 border border-dashed border-border rounded-2xl">
            <Truck className="h-10 w-10 text-muted-foreground mx-auto mb-2 animate-pulse" />
            <span className="text-sm text-muted-foreground">Select a supplier to examine logistics details.</span>
          </div>
        )}
      </div>

      {/* ADD SUPPLIER DIALOG MODAL */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Supplier Partner"
        description="Append a wholesale pharmaceutical company mapping to logistics indexes."
      >
        <form onSubmit={handleSubmit(onSubmit) as any} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Supplier Company Name"
            placeholder="e.g. Pfizer Distribution Ltd"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            type="text"
            label="Primary Contact Representative"
            placeholder="e.g. Robert Miller"
            error={errors.contactPerson?.message}
            {...register("contactPerson")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="email"
              label="Contact Email"
              placeholder="orders@pfizer.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              type="text"
              label="Phone Number"
              placeholder="+1 (555) 012-3456"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>

          <Input
            type="text"
            label="Business Address"
            placeholder="e.g. 500 Grand Ave, Chicago, IL"
            error={errors.address?.message}
            {...register("address")}
          />

          <Input
            type="number"
            label="Initial Rating Index (1.0 to 5.0)"
            placeholder="5"
            error={errors.rating?.message}
            {...register("rating")}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Register Partner
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
