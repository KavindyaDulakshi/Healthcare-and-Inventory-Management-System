"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Users,
  Search,
  Plus,
  Heart,
  Calendar,
  CreditCard,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Stethoscope
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Patient, MedicalHistoryEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Patient schema
const patientSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.coerce.number().min(1, "Please enter age"),
  gender: z.enum(["Male", "Female", "Other"]),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter address"),
  bloodGroup: z.string().min(1, "Please select blood group")
});

type PatientFields = z.infer<typeof patientSchema>;

// Medical History schema
const historySchema = z.object({
  diagnosis: z.string().min(3, "Diagnosis must be at least 3 characters"),
  doctor: z.string().min(1, "Please select attending doctor"),
  treatment: z.string().min(3, "Treatment description must be at least 3 characters")
});

type HistoryFields = z.infer<typeof historySchema>;

export default function PatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const {
    patients,
    appointments,
    billing,
    doctors,
    addPatient,
    addMedicalHistory
  } = useHealthcare();

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isAddHistoryOpen, setIsAddHistoryOpen] = useState(false);

  const {
    register: registerPatient,
    handleSubmit: handlePatientSubmit,
    reset: resetPatient,
    formState: { errors: patientErrors }
  } = useForm<PatientFields>({
    resolver: zodResolver(patientSchema) as any
  });

  const {
    register: registerHistory,
    handleSubmit: handleHistorySubmit,
    reset: resetHistory,
    formState: { errors: historyErrors }
  } = useForm<HistoryFields>({
    resolver: zodResolver(historySchema) as any
  });

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  const onRegisterPatient = (data: PatientFields) => {
    addPatient({
      name: data.name,
      age: data.age,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      address: data.address,
      bloodGroup: data.bloodGroup
    });
    setIsAddPatientOpen(false);
    resetPatient();
  };

  const onAddHistory = (data: HistoryFields) => {
    if (!selectedPatientId) return;
    addMedicalHistory(selectedPatientId, {
      diagnosis: data.diagnosis,
      doctor: data.doctor,
      treatment: data.treatment
    });
    setIsAddHistoryOpen(false);
    resetHistory();
  };

  // Filter patients
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Matches for selected patient
  const patientAppointments = appointments.filter(
    (a) => a.patientId === selectedPatient?.id || a.patientName === selectedPatient?.name
  );
  
  const patientBills = billing.filter(
    (b) => b.patientId === selectedPatient?.id || b.patientName === selectedPatient?.name
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Patient Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage clinical health folders, case files, and diagnostic history.</p>
        </div>
        <Button className="rounded-xl gap-2 text-xs self-start" onClick={() => setIsAddPatientOpen(true)}>
          <UserPlus className="h-4.5 w-4.5" />
          <span>Register Patient</span>
        </Button>
      </div>

      {/* Main Grid Split: Left Directory, Right File Folder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Patient search list */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, blood, email..."
              className="w-full bg-card rounded-xl pl-10 pr-4 py-2 text-sm border border-border focus:border-primary focus:bg-card focus:outline-hidden"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <span className="text-xs font-bold text-muted-foreground">PATIENTS INDEX ({filteredPatients.length})</span>
          
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No matching patients found.
              </div>
            ) : (
              filteredPatients.map((p) => (
                <Card
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`p-4 cursor-pointer hover:border-primary transition-all flex justify-between items-center ${
                    selectedPatient?.id === p.id
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary font-bold h-9 w-9 rounded-xl flex items-center justify-center text-xs shrink-0">
                      {p.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold leading-tight">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {p.gender}, {p.age} yrs &middot; Blood: {p.bloodGroup}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right column: Patient dossier */}
        {selectedPatient ? (
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Folder Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-white font-extrabold h-14 w-14 rounded-2xl flex items-center justify-center text-lg">
                      {selectedPatient.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex flex-col text-left">
                      <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Patient ID: {selectedPatient.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-lg">
                      Blood Group: {selectedPatient.bloodGroup}
                    </Badge>
                    <Badge variant="outline" className="rounded-lg">
                      {selectedPatient.gender}, {selectedPatient.age} years old
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4.5 w-4.5 text-primary shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-muted-foreground font-semibold">Email</span>
                      <span className="truncate font-medium text-foreground">{selectedPatient.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4.5 w-4.5 text-primary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-muted-foreground font-semibold">Phone</span>
                      <span className="font-medium text-foreground">{selectedPatient.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                    <div className="flex flex-col truncate">
                      <span className="text-muted-foreground font-semibold">Address</span>
                      <span className="truncate font-medium text-foreground">{selectedPatient.address}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Folder Tabs Details */}
            <Tabs defaultValue="history">
              <Card>
                <CardHeader className="border-b border-border/40 p-0 px-6 pt-4 flex flex-row items-center justify-between flex-wrap gap-2">
                  <TabsList className="bg-transparent border-0 p-0 flex gap-2">
                    <TabsTrigger value="history" className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=selected]:border-primary data-[state=selected]:bg-transparent shadow-none px-4 py-3">
                      Medical Records
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=selected]:border-primary data-[state=selected]:bg-transparent shadow-none px-4 py-3">
                      Appointments
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=selected]:border-primary data-[state=selected]:bg-transparent shadow-none px-4 py-3">
                      Billing Receipts
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="history" className="mt-0 pb-3">
                    <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-8 px-2.5 gap-1.5" onClick={() => setIsAddHistoryOpen(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Case Entry</span>
                    </Button>
                  </TabsContent>
                </CardHeader>
                <CardContent className="p-6">
                  
                  {/* Medical History tab content */}
                  <TabsContent value="history" className="mt-0 flex flex-col gap-6">
                    {selectedPatient.medicalHistory.length === 0 ? (
                      <div className="text-center py-12 text-xs text-muted-foreground">
                        No medical history entries recorded for this patient.
                      </div>
                    ) : (
                      <div className="relative border-l border-border pl-6 flex flex-col gap-6">
                        {selectedPatient.medicalHistory.map((entry, idx) => (
                          <div key={idx} className="relative group text-left">
                            {/* Timeline circle icon */}
                            <div className="absolute -left-[31px] top-0.5 bg-background border-2 border-primary h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0">
                              <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                                  {entry.date}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-0.5">
                                  <Stethoscope className="h-3 w-3" /> Dr: {entry.doctor}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-foreground mt-0.5">{entry.diagnosis}</h4>
                              <p className="text-xs text-muted-foreground bg-muted/30 border border-border/20 rounded-lg p-2.5 mt-1 leading-relaxed">
                                <span className="font-semibold text-foreground/80">Rx Treatment:</span> {entry.treatment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Appointments tab content */}
                  <TabsContent value="appointments" className="mt-0">
                    {patientAppointments.length === 0 ? (
                      <div className="text-center py-12 text-xs text-muted-foreground">
                        No appointments mapped to this patient.
                      </div>
                    ) : (
                      <div className="border border-border rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Doctor</TableHead>
                              <TableHead>Scheduled Date</TableHead>
                              <TableHead>Time Slot</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patientAppointments.map((app) => (
                              <TableRow key={app.id}>
                                <TableCell className="font-bold text-xs">{app.doctorName}</TableCell>
                                <TableCell className="text-xs">{app.date}</TableCell>
                                <TableCell className="text-xs">{app.time}</TableCell>
                                <TableCell>
                                  <Badge variant={app.status === "completed" ? "secondary" : app.status === "confirmed" ? "primary" : "warning"}>
                                    {app.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={app.notes}>
                                  {app.notes}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>

                  {/* Billing history tab content */}
                  <TabsContent value="billing" className="mt-0">
                    {patientBills.length === 0 ? (
                      <div className="text-center py-12 text-xs text-muted-foreground">
                        No invoices generated for this patient.
                      </div>
                    ) : (
                      <div className="border border-border rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice #</TableHead>
                              <TableHead>Issue Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Payment Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patientBills.map((bill) => (
                              <TableRow key={bill.id}>
                                <TableCell className="font-mono text-xs font-semibold">{bill.invoiceNumber}</TableCell>
                                <TableCell className="text-xs">{bill.date}</TableCell>
                                <TableCell className="text-xs font-bold">${bill.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge variant={bill.status === "paid" ? "secondary" : bill.status === "unpaid" ? "warning" : "danger"}>
                                    {bill.status.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-primary text-[10px] font-bold" onClick={() => router.push(`/billing?id=${bill.id}`)}>
                                    View Receipt
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>

                </CardContent>
              </Card>
            </Tabs>

          </div>
        ) : (
          <div className="lg:col-span-2 text-center py-16 border border-dashed border-border rounded-2xl bg-card">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">Select a patient dossier to inspect.</span>
          </div>
        )}
      </div>

      {/* REGISTER PATIENT DIALOG MODAL */}
      <Dialog
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        title="Register New Patient Profile"
        description="Creates a digital case folder inside the hospital central files index."
      >
        <form onSubmit={handlePatientSubmit(onRegisterPatient)} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Full Name"
            placeholder="John Watson"
            error={patientErrors.name?.message}
            {...registerPatient("name")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Age"
              placeholder="35"
              error={patientErrors.age?.message}
              {...registerPatient("age")}
            />
            <Select
              label="Gender"
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" }
              ]}
              error={patientErrors.gender?.message}
              {...registerPatient("gender")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="name@example.com"
              error={patientErrors.email?.message}
              {...registerPatient("email")}
            />
            <Input
              type="text"
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              error={patientErrors.phone?.message}
              {...registerPatient("phone")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Blood Group"
              options={[
                { value: "", label: "-- Choose Group --" },
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" }
              ]}
              error={patientErrors.bloodGroup?.message}
              {...registerPatient("bloodGroup")}
            />
            <Input
              type="text"
              label="Resident Address"
              placeholder="123 Orchard Rd, Boston"
              error={patientErrors.address?.message}
              {...registerPatient("address")}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAddPatientOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Create Folder
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ADD MEDICAL HISTORY RECORD DIALOG */}
      <Dialog
        isOpen={isAddHistoryOpen}
        onClose={() => setIsAddHistoryOpen(false)}
        title="Add Diagnostic Case Entry"
        description={`Log clinical observations and treatments under patient folder: ${selectedPatient?.name}`}
      >
        <form onSubmit={handleHistorySubmit(onAddHistory)} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Diagnosis / Condition"
            placeholder="e.g. Acute Pharyngitis"
            error={historyErrors.diagnosis?.message}
            {...registerHistory("diagnosis")}
          />

          <Select
            label="Attending Clinical Doctor"
            options={[
              { value: "", label: "-- Attending Staff --" },
              ...doctors.map((d) => ({ value: d.name, label: d.name }))
            ]}
            error={historyErrors.doctor?.message}
            {...registerHistory("doctor")}
          />

          <Input
            type="text"
            label="Rx Treatment & Prescriptions"
            placeholder="e.g. Amoxicillin 250mg thrice daily for 7 days"
            error={historyErrors.treatment?.message}
            {...registerHistory("treatment")}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAddHistoryOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Append Record
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
