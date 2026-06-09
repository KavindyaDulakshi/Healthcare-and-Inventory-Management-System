"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar,
  List,
  Plus,
  Clock,
  User,
  Stethoscope,
  Check,
  X as CloseIcon,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { useHealthcare } from "@/store/healthcare-context";
import { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const appointSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().min(1, "Please assign a doctor"),
  date: z.string().min(10, "Please enter a valid date (YYYY-MM-DD)"),
  time: z.string().min(4, "Please enter appointment time"),
  notes: z.string().min(3, "Please write clinical notes/reason")
});

type AppointFields = z.infer<typeof appointSchema>;

export default function AppointmentsPage() {
  const {
    appointments,
    patients,
    doctors,
    addAppointment,
    updateAppointmentStatus
  } = useHealthcare();

  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-06-09"); // Hardcoded center date Context

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AppointFields>({
    resolver: zodResolver(appointSchema)
  });

  const onSubmit = (data: AppointFields) => {
    const p = patients.find((pat) => pat.id === data.patientId);
    const d = doctors.find((doc) => doc.id === data.doctorId);
    
    addAppointment({
      patientId: data.patientId,
      patientName: p?.name || "Unknown Patient",
      doctorId: data.doctorId,
      doctorName: d?.name || "Unknown Doctor",
      date: data.date,
      time: data.time,
      notes: data.notes
    });
    setIsBookOpen(false);
    reset();
  };

  // Generate calendar days for visual grid (June 2026)
  // 1st of June 2026 is a Monday. 30 days in June.
  const daysInMonth = 30;
  const startOffset = 0; // Monday start
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group appointments by date
  const getDayAppointments = (dayNum: number) => {
    const formattedDate = `2026-06-${String(dayNum).padStart(2, "0")}`;
    return appointments.filter((a) => a.date === formattedDate);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Clinical Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule consultations, manage calendar slots, and update check-in status.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Views */}
          <div className="flex items-center bg-card border border-border p-1 rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
            </button>
          </div>

          <Button className="rounded-xl gap-2 text-xs" onClick={() => setIsBookOpen(true)}>
            <Plus className="h-4.5 w-4.5" />
            <span>Book Appointment</span>
          </Button>
        </div>
      </div>

      {/* Main Area */}
      {viewMode === "list" ? (
        
        /* LIST AGENDA VIEW */
        <Card className="rounded-2xl border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Assigned Doctor</TableHead>
                  <TableHead>Appointment Date</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Reason / Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                      No appointments registered in system logs.
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-bold text-xs">{app.patientName}</TableCell>
                      <TableCell className="font-medium text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {app.doctorName.split(" ").filter((n) => !n.includes("Dr.")).map((n) => n[0]).join("")}
                          </div>
                          <span>{app.doctorName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{app.date}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{app.time}</TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={app.notes}>
                        {app.notes}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.status === "completed"
                              ? "secondary"
                              : app.status === "confirmed"
                              ? "primary"
                              : app.status === "cancelled"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {app.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-secondary hover:bg-secondary/15 rounded-lg cursor-pointer"
                              onClick={() => updateAppointmentStatus(app.id, "confirmed")}
                              title="Confirm Appointment"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </Button>
                          )}
                          {app.status === "confirmed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/15 rounded-lg cursor-pointer"
                              onClick={() => updateAppointmentStatus(app.id, "completed")}
                              title="Complete Appointment"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </Button>
                          )}
                          {app.status !== "completed" && app.status !== "cancelled" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-danger hover:bg-danger/15 rounded-lg cursor-pointer"
                              onClick={() => updateAppointmentStatus(app.id, "cancelled")}
                              title="Cancel Appointment"
                            >
                              <CloseIcon className="h-4.5 w-4.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        
        /* CALENDAR VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Day Grid (Left/Middle) */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
              <div>
                <CardTitle>June 2026</CardTitle>
                <CardDescription>Click a day tile to inspect appointments scheduled.</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg cursor-pointer">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg cursor-pointer">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* Day names */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground mb-3">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2">
                {daysArray.map((dayNum) => {
                  const dateStr = `2026-06-${String(dayNum).padStart(2, "0")}`;
                  const dayApps = getDayAppointments(dayNum);
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === "2026-06-09";

                  return (
                    <div
                      key={dayNum}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-h-18 p-1.5 border border-border/60 rounded-xl flex flex-col justify-between cursor-pointer hover:border-primary transition-all ${
                        isSelected
                          ? "bg-primary/5 border-primary shadow-xs"
                          : isToday
                          ? "bg-secondary/5 border-secondary"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${
                          isToday ? "bg-secondary text-white h-5 w-5 rounded-full flex items-center justify-center font-bold" : ""
                        }`}>
                          {dayNum}
                        </span>
                        {dayApps.length > 0 && (
                          <span className="h-1.5 w-1.5 bg-primary rounded-full" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-2 overflow-hidden">
                        {dayApps.slice(0, 2).map((app) => (
                          <div
                            key={app.id}
                            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm truncate ${
                              app.status === "completed"
                                ? "bg-muted text-muted-foreground"
                                : app.status === "confirmed"
                                ? "bg-primary/10 text-primary"
                                : "bg-warning/10 text-warning"
                            }`}
                          >
                            {app.patientName.split(" ")[0]}
                          </div>
                        ))}
                        {dayApps.length > 2 && (
                          <span className="text-[7px] text-muted-foreground font-semibold">+{dayApps.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Day Detail dossier (Right side) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <span className="text-xs font-bold text-muted-foreground">SLOTS ON: {selectedDate}</span>
            <Card className="flex-1 flex flex-col gap-4 p-5 min-h-[400px]">
              {appointments.filter((a) => a.date === selectedDate).length === 0 ? (
                <div className="my-auto text-center text-xs text-muted-foreground">
                  No appointments scheduled for this date.
                </div>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
                  {appointments
                    .filter((a) => a.date === selectedDate)
                    .map((app) => (
                      <div
                        key={app.id}
                        className="p-3 border border-border rounded-xl flex flex-col gap-2 bg-muted/20"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs">{app.patientName}</span>
                          <Badge variant={app.status === "completed" ? "secondary" : "primary"}>
                            {app.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                          <Clock className="h-3 w-3 text-primary" /> {app.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                          <Stethoscope className="h-3 w-3 text-primary" /> {app.doctorName}
                        </div>
                        <p className="text-[10px] text-muted-foreground border-t border-border/50 pt-2 leading-relaxed">
                          Reason: {app.notes}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* BOOK APPOINTMENT DIALOG MODAL */}
      <Dialog
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule Clinic Appointment"
        description="Book a consultation slot for a registered patient."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Select
            label="Select Patient Folder"
            options={[
              { value: "", label: "-- Choose Patient --" },
              ...patients.map((p) => ({ value: p.id, label: p.name }))
            ]}
            error={errors.patientId?.message}
            {...register("patientId")}
          />

          <Select
            label="Assign Medical Doctor"
            options={[
              { value: "", label: "-- Choose Specialist --" },
              ...doctors.map((d) => ({ value: d.id, label: `${d.name} (${d.department})` }))
            ]}
            error={errors.doctorId?.message}
            {...register("doctorId")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Appointment Date"
              error={errors.date?.message}
              {...register("date")}
            />
            <Input
              type="text"
              label="Time (e.g. 11:30 AM)"
              placeholder="11:30 AM"
              error={errors.time?.message}
              {...register("time")}
            />
          </div>

          <Input
            type="text"
            label="Observation Notes / Reason"
            placeholder="e.g. Chronic chest tightness"
            error={errors.notes?.message}
            {...register("notes")}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsBookOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg">
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
