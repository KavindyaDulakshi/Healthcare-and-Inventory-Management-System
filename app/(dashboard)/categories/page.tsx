"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  FolderHeart, 
  Plus, 
  Search, 
  Tags, 
  Pill, 
  FileEdit,
  ClipboardList,
  ChevronRight
} from "lucide-react";
import { useHealthcare } from "@/store/healthcare-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().min(5, "Please enter a brief description")
});

type CategoryFields = z.infer<typeof schema>;

export default function CategoriesPage() {
  const { categories, medicines, addCategory } = useHealthcare();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoryFields>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: CategoryFields) => {
    addCategory({
      name: data.name,
      description: data.description
    });
    setIsOpen(false);
    reset();
  };

  // Filter categories
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Formulary Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Groupings of pharmaceutical items by dosage type, storage guidelines, or diagnostic use.
          </p>
        </div>
        <Button className="rounded-xl gap-2 text-xs" onClick={() => { reset(); setIsOpen(true); }}>
          <Plus className="h-4.5 w-4.5" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="rounded-2xl border-border bg-card p-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search category classifications..."
            className="w-full bg-muted/40 rounded-xl pl-11 pr-4 py-2.5 text-sm border border-transparent focus:border-primary focus:bg-card focus:outline-hidden transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Categories Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          // Calculate medicine items counts dynamically
          const medItems = medicines.filter(m => m.category === cat.name);
          const totalStockCount = medItems.reduce((sum, m) => sum + m.quantity, 0);

          return (
            <Card key={cat.id} className="rounded-2xl border-border bg-card hover:border-primary/20 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border/30 bg-muted/5 text-left">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg shrink-0">
                      <FolderHeart className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-bold tracking-tight text-foreground">{cat.name}</CardTitle>
                  </div>
                  <span className="text-[10px] bg-secondary/15 text-secondary font-black px-2 py-0.5 rounded-full">
                    ID: {cat.id}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-4 text-left flex-1 justify-between">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cat.description || "No description provided for this therapeutic class."}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/35 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <Pill className="h-3 w-3" /> Formulations
                    </span>
                    <span className="font-extrabold text-foreground">{medItems.length} types</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <Tags className="h-3 w-3" /> Total Stock
                    </span>
                    <span className="font-black text-foreground">{totalStockCount} units</span>
                  </div>
                </div>

                <div className="bg-muted/20 border border-border/15 rounded-xl p-2.5 flex items-center justify-between text-[10px] mt-2">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5 text-primary" /> Checked Batch Registry
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ADD DIALOG MODAL */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Category Class"
        description="Append a new category index to organize medicine inventories."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Category Name"
            placeholder="e.g. Inhalers, Creams, Vaccines"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            type="text"
            label="Brief Description"
            placeholder="e.g. Liquid preparations administered by inhalation..."
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Save Category
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
