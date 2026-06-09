"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Pill,
  Plus,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  FileText,
  Trash2,
  Edit,
  Barcode,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  X,
  PackageCheck
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Medicine } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Zod Schema for Add Medicine
const medicineSchema = z.object({
  name: z.string().min(2, "Medicine name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  batchNumber: z.string().min(2, "Please enter batch number"),
  quantity: z.coerce.number().min(0, "Quantity must be at least 0"),
  unitPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
  expiryDate: z.string().min(10, "Please enter a valid date (YYYY-MM-DD)"),
  supplier: z.string().min(1, "Please select a supplier"),
  barcode: z.string().min(4, "Please enter a barcode")
});

type MedicineFields = z.infer<typeof medicineSchema>;

export default function InventoryPage() {
  const searchParams = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";

  const {
    medicines,
    categories,
    suppliers,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    theme
  } = useHealthcare();

  // Search, Filter, Pagination States
  const [searchQuery, setSearchQuery] = useState(searchParamQuery);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Medicine Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);

  // Edit Medicine Form
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<MedicineFields>({
    resolver: zodResolver(medicineSchema) as any
  });

  // Keep search state synchronized with URL search params if any
  useEffect(() => {
    if (searchParamQuery) {
      setSearchQuery(searchParamQuery);
    }
  }, [searchParamQuery]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Filter medicines
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in-stock" && med.status === "in-stock") ||
      (activeTab === "low-stock" && med.status === "low-stock") ||
      (activeTab === "out-of-stock" && med.status === "out-of-stock") ||
      (activeTab === "expired" && med.status === "expired");

    return matchesSearch && matchesTab;
  });

  // Paginated medicines
  const totalItems = filteredMedicines.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CSV Export Simulation
  const handleExportCSV = () => {
    const headers = ["ID", "Medicine Name", "Category", "Batch Number", "Quantity", "Unit Price ($)", "Expiry Date", "Supplier", "Status", "Barcode"];
    const rows = filteredMedicines.map((m) => [
      m.id,
      m.name,
      m.category,
      m.batchNumber,
      m.quantity,
      m.unitPrice,
      m.expiryDate,
      m.supplier,
      m.status,
      m.barcode
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medicare_inventory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add submission
  const handleAddSubmit = (data: MedicineFields) => {
    addMedicine({
      name: data.name,
      category: data.category,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      expiryDate: data.expiryDate,
      supplier: data.supplier,
      barcode: data.barcode,
      image: imageFile || undefined
    });
    setIsAddOpen(false);
    reset();
    setImageFile(null);
  };

  // Edit submission
  const handleEditSubmit = (data: MedicineFields) => {
    if (!editingMedId) return;
    updateMedicine(editingMedId, {
      name: data.name,
      category: data.category,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      expiryDate: data.expiryDate,
      supplier: data.supplier,
      barcode: data.barcode,
      image: imageFile || undefined
    });
    setIsEditOpen(false);
    setEditingMedId(null);
    reset();
    setImageFile(null);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedId(med.id);
    setValue("name", med.name);
    setValue("category", med.category);
    setValue("batchNumber", med.batchNumber);
    setValue("quantity", med.quantity);
    setValue("unitPrice", med.unitPrice);
    setValue("expiryDate", med.expiryDate);
    setValue("supplier", med.supplier);
    setValue("barcode", med.barcode);
    if (med.image) setImageFile(med.image);
    setIsEditOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Inventory Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage pharmaceutical stocks, batch identifiers, and suppliers.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl gap-2 text-xs" onClick={handleExportCSV}>
            <Download className="h-4.5 w-4.5" />
            <span>Export CSV</span>
          </Button>
          <Button className="rounded-xl gap-2 text-xs" onClick={() => { reset(); setImageFile(null); setIsAddOpen(true); }}>
            <Plus className="h-4.5 w-4.5" />
            <span>Add Medicine</span>
          </Button>
        </div>
      </div>

      {/* Tabs Filter Bar & Search Toolbar */}
      <Card className="rounded-2xl border-border bg-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-1 bg-muted/30">
              <TabsTrigger value="all">All Stocks</TabsTrigger>
              <TabsTrigger value="in-stock">In Stock</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock ⚠️</TabsTrigger>
              <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
              <TabsTrigger value="expired">Expired 🚫</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drug, batch, supplier..."
              className="w-full bg-muted/40 rounded-xl pl-10 pr-4 py-2 text-sm border border-transparent focus:border-primary focus:bg-card focus:outline-hidden"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Modern Data Table */}
      <Card className="rounded-2xl border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Batch ID</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Pill className="h-10 w-10 text-muted-foreground/45 animate-pulse" />
                      <span>No matching medicines found in warehouse.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMedicines.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-bold">
                      <div className="flex items-center gap-3">
                        {med.image ? (
                          <img src={med.image} alt={med.name} className="h-8 w-8 rounded-lg object-cover bg-muted" />
                        ) : (
                          <div className="bg-primary/5 text-primary p-1.5 rounded-lg shrink-0">
                            <Pill className="h-4.5 w-4.5" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span>{med.name}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                            <Barcode className="h-3 w-3" /> {med.barcode}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-xs">{med.category}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{med.batchNumber}</TableCell>
                    <TableCell className="font-bold text-xs">{med.quantity} units</TableCell>
                    <TableCell className="font-semibold text-xs">${med.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{med.expiryDate}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">{med.supplier}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          med.status === "in-stock"
                            ? "secondary"
                            : med.status === "low-stock"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {med.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"
                          onClick={() => openEditModal(med)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-danger hover:bg-danger/10 cursor-pointer"
                          onClick={() => {
                            if (confirm(`Delete ${med.name} from records?`)) {
                              deleteMedicine(med.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/10">
            <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={currentPage === p ? "primary" : "outline"}
                  size="sm"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ADD MEDICINE DIALOG MODAL */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Stock Entry"
        description="Creates a new pharmaceutical or clinical item mapping record."
      >
        <form onSubmit={handleSubmit(handleAddSubmit) as any} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Medicine Name"
            placeholder="e.g. Atorvastatin 10mg"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                { value: "", label: "-- Choose Category --" },
                ...categories.map((c) => ({ value: c.name, label: c.name }))
              ]}
              error={errors.category?.message}
              {...register("category")}
            />
            <Input
              type="text"
              label="Batch Number"
              placeholder="e.g. BT-2026-X1"
              error={errors.batchNumber?.message}
              {...register("batchNumber")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Inbound Quantity"
              placeholder="100"
              error={errors.quantity?.message}
              {...register("quantity")}
            />
            <Input
              type="text"
              label="Unit Price ($)"
              placeholder="0.45"
              error={errors.unitPrice?.message}
              {...register("unitPrice")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Supplier"
              options={[
                { value: "", label: "-- Choose Supplier --" },
                ...suppliers.map((s) => ({ value: s.name, label: s.name }))
              ]}
              error={errors.supplier?.message}
              {...register("supplier")}
            />
            <Input
              type="date"
              label="Expiry Date"
              error={errors.expiryDate?.message}
              {...register("expiryDate")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              type="text"
              label="Barcode / SKU Identifier"
              placeholder="89010203..."
              error={errors.barcode?.message}
              {...register("barcode")}
            />
          </div>

          {/* Image Upload Simulator */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground/80">Medicine Thumbnail</span>
            <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 bg-muted/20 hover:bg-muted/40 transition-colors">
              {imageFile ? (
                <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border">
                  <img src={imageFile} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-danger text-white rounded-full p-0.5"
                    onClick={() => setImageFile(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground/70" />
                  <span className="text-xs text-muted-foreground text-center">
                    Drag and drop file or click to choose
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="med-img-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImageFile(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-[10px] h-8 px-2.5"
                    onClick={() => document.getElementById("med-img-upload")?.click()}
                  >
                    Browse Files
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Save Stock Entry
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT MEDICINE DIALOG MODAL */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Stock Entry"
        description="Update pharmaceutical records mapped to this warehouse batch."
      >
        <form onSubmit={handleSubmit(handleEditSubmit) as any} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Medicine Name"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={[
                { value: "", label: "-- Choose Category --" },
                ...categories.map((c) => ({ value: c.name, label: c.name }))
              ]}
              error={errors.category?.message}
              {...register("category")}
            />
            <Input
              type="text"
              label="Batch Number"
              error={errors.batchNumber?.message}
              {...register("batchNumber")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Stock Quantity"
              error={errors.quantity?.message}
              {...register("quantity")}
            />
            <Input
              type="text"
              label="Unit Price ($)"
              error={errors.unitPrice?.message}
              {...register("unitPrice")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Supplier"
              options={[
                { value: "", label: "-- Choose Supplier --" },
                ...suppliers.map((s) => ({ value: s.name, label: s.name }))
              ]}
              error={errors.supplier?.message}
              {...register("supplier")}
            />
            <Input
              type="date"
              label="Expiry Date"
              error={errors.expiryDate?.message}
              {...register("expiryDate")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              type="text"
              label="Barcode / SKU Identifier"
              error={errors.barcode?.message}
              {...register("barcode")}
            />
          </div>

          {/* Image Upload Simulator */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground/80">Medicine Thumbnail</span>
            <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 bg-muted/20">
              {imageFile ? (
                <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border">
                  <img src={imageFile} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-danger text-white rounded-full p-0.5"
                    onClick={() => setImageFile(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground/70" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="edit-med-img-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImageFile(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-[10px]"
                    onClick={() => document.getElementById("edit-med-img-upload")?.click()}
                  >
                    Choose Thumbnail
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Save Updates
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
