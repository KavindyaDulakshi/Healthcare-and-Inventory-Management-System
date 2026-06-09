"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Stethoscope,
  Plus,
  Mail,
  Phone,
  Calendar,
  Clock,
  Briefcase,
  Search,
  CheckCircle,
  UserPlus
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  department: z.string().min(1, "Please select a department"),
  specialization: z.string().min(2, "Specialization must be at least 2 characters")
});

type DoctorFields = z.infer<typeof doctorSchema>;

export default function DoctorsPage() {
  const { doctors, addDoctor, appointments } = useHealthcare();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("all");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DoctorFields>({
    resolver: zodResolver(doctorSchema)
  });

  const onSubmit = (data: DoctorFields) => {
    addDoctor({
      name: `Dr. ${data.name.replace(/^Dr\.\s+/i, "")}`,
      email: data.email,
      phone: data.phone,
      department: data.department,
      specialization: data.specialization,
      availability: ["Monday", "Wednesday", "Friday"],
      avatar: data.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    });
    setIsAddOpen(false);
    reset();
  };

  // Get list of unique departments
  const departments = ["all", ...Array.from(new Set(doctors.map((d) => d.department)))];

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = activeDepartment === "all" || doc.department === activeDepartment;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Clinical Staff Directory</h1>
          <p className="text-sm text-muted-foreground mt-1"> Roster of specialized medical practitioners and calendar availability.</p>
        </div>
        <Button className="rounded-xl gap-2 text-xs self-start" onClick={() => setIsAddOpen(true)}>
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add Specialist</span>
        </Button>
      </div>

      {/* Directory Filters */}
      <Card className="rounded-2xl border-border bg-card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {departments.map((dept) => (
              <Button
                key={dept}
                variant={activeDepartment === dept ? "primary" : "outline"}
                size="sm"
                className="rounded-lg text-xs capitalize h-8"
                onClick={() => setActiveDepartment(dept)}
              >
                {dept}
              </Button>
            ))}
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, specialization..."
              className="w-full bg-muted/40 rounded-lg pl-10 pr-4 py-1.5 text-xs border border-transparent focus:border-primary focus:bg-card focus:outline-hidden"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            No doctors found matching filters.
          </div>
        ) : (
          filteredDoctors.map((doc) => {
            const docAppointments = appointments.filter(
              (a) => (a.doctorId === doc.id || a.doctorName === doc.name) && a.status === "confirmed"
            );
            
            return (
              <Card key={doc.id} className="flex flex-col h-full overflow-hidden hover:border-primary transition-all">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border/40 flex flex-col items-center text-center p-6">
                  <div className="bg-primary text-white font-extrabold h-16 w-16 rounded-2xl flex items-center justify-center text-lg shadow-sm mb-3">
                    {doc.avatar || doc.name.split(" ").filter((n) => !n.includes("Dr.")).map((n) => n[0]).join("")}
                  </div>
                  <CardTitle className="text-base font-bold">{doc.name}</CardTitle>
                  <CardDescription className="text-xs font-semibold text-primary mt-1">
                    {doc.specialization}
                  </CardDescription>
                  <Badge variant="outline" className="mt-2 capitalize bg-card text-[10px] rounded-full">
                    Dept: {doc.department}
                  </Badge>
                </CardHeader>
                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-5 text-xs">
                  
                  {/* Doctor Info */}
                  <div className="flex flex-col gap-2.5 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate text-foreground/80">{doc.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-foreground/80">{doc.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-semibold text-foreground/90">Duty Days:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-0.5 pl-6">
                      {doc.availability.map((day) => (
                        <span key={day} className="bg-muted text-foreground/80 font-bold px-1.5 py-0.5 rounded-sm text-[9px]">
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Operational indicators */}
                  <div className="pt-4 border-t border-border/40 flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Confirmed Slots:
                    </span>
                    <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]">
                      {docAppointments.length} pending
                    </span>
                  </div>

                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ADD DOCTOR DIALOG */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Medical Specialist"
        description="Registers a new doctor profile into the clinic registry database."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Doctor Name (excluding Dr. prefix)"
            placeholder="Sarah Chen"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Department"
              options={[
                { value: "", label: "-- Choose Department --" },
                { value: "Cardiology", label: "Cardiology" },
                { value: "Pediatrics", label: "Pediatrics" },
                { value: "Neurology", label: "Neurology" },
                { value: "Orthopedics", label: "Orthopedics" },
                { value: "General Medicine", label: "General Medicine" }
              ]}
              error={errors.department?.message}
              {...register("department")}
            />
            <Input
              type="text"
              label="Specialization / Board Certification"
              placeholder="e.g. Pediatric Surgery"
              error={errors.specialization?.message}
              {...register("specialization")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="email"
              label="Staff Email"
              placeholder="name@medicare.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              type="text"
              label="Emergency Phone"
              placeholder="+1 (555) 012-9999"
              error={errors.phone?.message}
              {...register("phone")}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Save Doctor
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
