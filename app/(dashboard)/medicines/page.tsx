"use client";

import React, { useState } from "react";
import { useHealthcare } from "@/store/healthcare-context";
import { 
  Pill, 
  Search, 
  Tag, 
  Activity, 
  DollarSign, 
  FileText, 
  ChevronRight, 
  Boxes,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  PackageSearch
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MedicinesDirectoryPage() {
  const { medicines, categories } = useHealthcare();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter medicines
  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = 
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      med.barcode.includes(searchQuery) ||
      (med.supplier && med.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || med.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Medicine Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centralized directory of pharmaceutical compounds, clinical groupings, and prices.
          </p>
        </div>
        <div className="flex gap-2 text-xs font-semibold text-muted-foreground bg-muted/20 px-4 py-2.5 rounded-xl border border-border/40">
          <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>Active Formulary Database</span>
        </div>
      </div>

      {/* Directory Search & Category Filter */}
      <Card className="rounded-2xl border-border bg-card p-5">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drug formulations, barcode, chemical name..."
              className="w-full bg-muted/40 rounded-xl pl-11 pr-4 py-3 text-sm border border-transparent focus:border-primary focus:bg-card focus:outline-hidden transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
            <Button
              variant={selectedCategory === "All" ? "primary" : "outline"}
              className="rounded-xl text-xs py-1.5 h-9"
              onClick={() => setSelectedCategory("All")}
            >
              All Formulations
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.name ? "primary" : "outline"}
                className="rounded-xl text-xs py-1.5 h-9"
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMedicines.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center gap-3 text-center border-2 border-dashed border-border/80 rounded-2xl bg-card/45">
            <PackageSearch className="h-12 w-12 text-muted-foreground/60 animate-bounce" />
            <span className="text-sm font-bold text-foreground">No medicines found</span>
            <span className="text-xs text-muted-foreground max-w-xs">
              Try adjusting your query string or filtering by another category group.
            </span>
          </div>
        ) : (
          filteredMedicines.map((med) => (
            <Card 
              key={med.id} 
              className="rounded-2xl border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
            >
              <CardHeader className="pb-3 border-b border-border/30 bg-muted/5">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2.5 rounded-xl shrink-0">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <CardTitle className="text-base font-bold tracking-tight text-foreground">{med.name}</CardTitle>
                      <CardDescription className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                        <Tag className="h-3 w-3" /> SKU: {med.barcode}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      med.status === "in-stock" 
                        ? "secondary" 
                        : med.status === "low-stock" 
                        ? "warning" 
                        : "danger"
                    }
                    className="capitalize text-[9px] font-bold shrink-0"
                  >
                    {med.status.replace("-", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-4 flex-1">
                
                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3.5 text-xs text-left">
                  <div className="flex flex-col gap-1 border-r border-border/40 pr-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <Boxes className="h-3.5 w-3.5" /> Category Type
                    </span>
                    <span className="font-semibold text-foreground truncate">{med.category}</span>
                  </div>
                  <div className="flex flex-col gap-1 pl-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" /> Stock Volume
                    </span>
                    <span className="font-black text-foreground">{med.quantity} units</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs text-left border-t border-border/30 pt-3.5">
                  <div className="flex flex-col gap-1 border-r border-border/40 pr-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> Retail Unit Price
                    </span>
                    <span className="font-extrabold text-foreground">${med.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col gap-1 pl-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> Expiry Status
                    </span>
                    <span className="font-semibold text-foreground truncate">{med.expiryDate}</span>
                  </div>
                </div>

                {/* Supplier detail */}
                <div className="bg-muted/30 border border-border/20 rounded-xl p-3 text-[10px] text-left flex justify-between items-center mt-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground font-semibold">Primary Supplier</span>
                    <span className="font-bold text-foreground truncate max-w-[150px]">{med.supplier}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10 text-primary">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
