"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Medicine, Category, StockTransaction, Supplier, Patient, Doctor, Appointment, Invoice, AuditLog, Notification, User } from "../types";
import {
  INITIAL_USER,
  INITIAL_CATEGORIES,
  INITIAL_MEDICINES,
  INITIAL_SUPPLIERS,
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_INVOICES,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from "../data/mock-data";

interface HealthcareContextProps {
  medicines: Medicine[];
  categories: Category[];
  stockTransactions: StockTransaction[];
  suppliers: Supplier[];
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  billing: Invoice[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  currentUser: User | null;
  theme: "light" | "dark";
  
  // Inventory actions
  addMedicine: (medicine: Omit<Medicine, "id" | "status">) => void;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  dispenseMedicine: (medicineId: string, quantity: number, patientId: string, doctorId: string, notes: string) => boolean;
  addCategory: (category: Omit<Category, "id" | "count">) => void;
  
  // Suppliers
  addSupplier: (supplier: Omit<Supplier, "id" | "purchaseHistoryCount" | "balance">) => void;
  
  // Patients
  addPatient: (patient: Omit<Patient, "id" | "medicalHistory">) => void;
  addMedicalHistory: (patientId: string, entry: Omit<Patient["medicalHistory"][0], "date">) => void;
  
  // Doctors
  addDoctor: (doctor: Omit<Doctor, "id">) => void;
  
  // Appointments
  addAppointment: (appointment: Omit<Appointment, "id" | "status">) => void;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  
  // Billing
  addInvoice: (invoice: Omit<Invoice, "id" | "invoiceNumber" | "date" | "status">) => void;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  
  // Operations & Notifications
  addAuditLog: (action: string, module: string, details: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Auth & Theme
  loginUser: (email: string, name: string, role?: string, id?: string) => void;
  logoutUser: () => void;
  toggleTheme: () => void;
}

const HealthcareContext = createContext<HealthcareContextProps | undefined>(undefined);

export function HealthcareProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [billing, setBilling] = useState<Invoice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Load state from API with local storage fallback on mount
  useEffect(() => {
    setIsMounted(true);
    
    async function loadData() {
      try {
        const profileRes = await fetch("/api/auth/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const pUser = profileData.user;
          setCurrentUser({
            id: pUser.id,
            name: pUser.name,
            email: pUser.email,
            role: pUser.role,
            avatar: pUser.name ? pUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "US",
            clinicName: "MediCare Hospital Suite"
          });
          
          const [
            medsRes, 
            catsRes, 
            supsRes, 
            patsRes, 
            docsRes, 
            appsRes, 
            billsRes, 
            notifsRes, 
            logsRes
          ] = await Promise.all([
            fetch("/api/medicines"),
            fetch("/api/categories"),
            fetch("/api/suppliers"),
            fetch("/api/patients"),
            fetch("/api/doctors"),
            fetch("/api/appointments"),
            fetch("/api/billing"),
            fetch("/api/notifications"),
            fetch("/api/audit-logs")
          ]);

          if (medsRes.ok) setMedicines(await medsRes.json());
          if (catsRes.ok) setCategories(await catsRes.json());
          if (supsRes.ok) setSuppliers(await supsRes.json());
          if (patsRes.ok) setPatients(await patsRes.json());
          if (docsRes.ok) setDoctors(await docsRes.json());
          if (appsRes.ok) setAppointments(await appsRes.json());
          if (billsRes.ok) setBilling(await billsRes.json());
          if (notifsRes.ok) setNotifications(await notifsRes.json());
          if (logsRes.ok) setAuditLogs(await logsRes.json());
          
          return;
        }
      } catch (err) {
        console.error("Failed to load from API, falling back to local storage:", err);
      }

      // Fallback
      const localMedicines = localStorage.getItem("hc_medicines");
      const localCategories = localStorage.getItem("hc_categories");
      const localTransactions = localStorage.getItem("hc_transactions");
      const localSuppliers = localStorage.getItem("hc_suppliers");
      const localPatients = localStorage.getItem("hc_patients");
      const localDoctors = localStorage.getItem("hc_doctors");
      const localAppointments = localStorage.getItem("hc_appointments");
      const localBilling = localStorage.getItem("hc_billing");
      const localAuditLogs = localStorage.getItem("hc_audit_logs");
      const localNotifications = localStorage.getItem("hc_notifications");
      const localUser = localStorage.getItem("hc_user");
      const localTheme = localStorage.getItem("hc_theme") as "light" | "dark" | null;

      setMedicines(localMedicines ? JSON.parse(localMedicines) : INITIAL_MEDICINES);
      setCategories(localCategories ? JSON.parse(localCategories) : INITIAL_CATEGORIES);
      setStockTransactions(localTransactions ? JSON.parse(localTransactions) : INITIAL_STOCK_TRANSACTIONS);
      setSuppliers(localSuppliers ? JSON.parse(localSuppliers) : INITIAL_SUPPLIERS);
      setPatients(localPatients ? JSON.parse(localPatients) : INITIAL_PATIENTS);
      setDoctors(localDoctors ? JSON.parse(localDoctors) : INITIAL_DOCTORS);
      setAppointments(localAppointments ? JSON.parse(localAppointments) : INITIAL_APPOINTMENTS);
      setBilling(localBilling ? JSON.parse(localBilling) : INITIAL_INVOICES);
      setAuditLogs(localAuditLogs ? JSON.parse(localAuditLogs) : INITIAL_AUDIT_LOGS);
      setNotifications(localNotifications ? JSON.parse(localNotifications) : INITIAL_NOTIFICATIONS);
      setCurrentUser(localUser ? JSON.parse(localUser) : INITIAL_USER);
    }
    
    loadData();
    
    const localTheme = localStorage.getItem("hc_theme") as "light" | "dark" | null;
    const initialTheme = localTheme || "light";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Save states to local storage when they change
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_medicines", JSON.stringify(medicines));
  }, [medicines, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_categories", JSON.stringify(categories));
  }, [categories, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_transactions", JSON.stringify(stockTransactions));
  }, [stockTransactions, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_suppliers", JSON.stringify(suppliers));
  }, [suppliers, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_patients", JSON.stringify(patients));
  }, [patients, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_doctors", JSON.stringify(doctors));
  }, [doctors, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_appointments", JSON.stringify(appointments));
  }, [appointments, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_billing", JSON.stringify(billing));
  }, [billing, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("hc_notifications", JSON.stringify(notifications));
  }, [notifications, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    if (currentUser) {
      localStorage.setItem("hc_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("hc_user");
    }
  }, [currentUser, isMounted]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("hc_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Helper: Get medicine status based on quantity and expiry
  const calculateMedicineStatus = (qty: number, expDate: string): Medicine["status"] => {
    const today = new Date("2026-06-09"); // Hardcoded local date context
    const expiry = new Date(expDate);
    if (expiry <= today) return "expired";
    if (qty <= 0) return "out-of-stock";
    if (qty < 50) return "low-stock";
    return "in-stock";
  };

  // Actions
  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: currentUser?.name || "System",
      action,
      module,
      date: new Date().toISOString(),
      details
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addMedicine = async (med: Omit<Medicine, "id" | "status">) => {
    const status = calculateMedicineStatus(med.quantity, med.expiryDate);
    const tempId = `med-${Date.now()}`;
    const newMed: Medicine = {
      ...med,
      id: tempId,
      status
    };
    setMedicines((prev) => [...prev, newMed]);
    
    // Add transaction log
    const newTx: StockTransaction = {
      id: `st-${Date.now()}`,
      date: new Date().toISOString(),
      medicineId: newMed.id,
      medicineName: newMed.name,
      type: "in",
      quantity: med.quantity,
      operator: currentUser?.name || "System",
      reference: `Initial stock for ${newMed.name}`
    };
    setStockTransactions((prev) => [newTx, ...prev]);

    // Recalculate categories count
    setCategories((prev) =>
      prev.map((c) => (c.name === med.category ? { ...c, count: c.count + 1 } : c))
    );

    addAuditLog("Add Medicine", "Inventory", `Added medicine ${med.name} with ${med.quantity} units.`);
    
    // Notification if initial stock is low
    if (status === "low-stock" || status === "out-of-stock") {
      const newNotif: Notification = {
        id: `not-${Date.now()}`,
        title: "Inventory Alert",
        message: `${med.name} was added with low/out-of-stock units (${med.quantity}).`,
        priority: "medium",
        read: false,
        date: new Date().toISOString()
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(med)
      });
      if (res.ok) {
        const saved = await res.json();
        setMedicines((prev) => prev.map(m => m.id === tempId ? { ...m, id: saved.medicine.id } : m));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateMedicine = async (id: string, updatedFields: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const merged = { ...med, ...updatedFields };
          merged.status = calculateMedicineStatus(merged.quantity, merged.expiryDate);
          return merged;
        }
        return med;
      })
    );
    
    const medName = medicines.find((m) => m.id === id)?.name || "Unknown";
    addAuditLog("Update Medicine", "Inventory", `Updated fields for ${medName}.`);

    try {
      await fetch(`/api/medicines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMedicine = async (id: string) => {
    const med = medicines.find((m) => m.id === id);
    if (!med) return;
    
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    
    // Recalculate categories count
    setCategories((prev) =>
      prev.map((c) => (c.name === med.category ? { ...c, count: Math.max(0, c.count - 1) } : c))
    );

    addAuditLog("Delete Medicine", "Inventory", `Deleted medicine ${med.name}.`);

    try {
      await fetch(`/api/medicines/${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.error(e);
    }
  };

  const dispenseMedicine = (medicineId: string, quantity: number, patientId: string, doctorId: string, notes: string): boolean => {
    let success = false;
    
    setMedicines((prev) => {
      return prev.map((med) => {
        if (med.id === medicineId) {
          if (med.quantity < quantity) {
            return med; // not enough stock
          }
          success = true;
          const nextQty = med.quantity - quantity;
          const nextStatus = calculateMedicineStatus(nextQty, med.expiryDate);
          
          // Trigger notifications inside state handler context (safely queued)
          setTimeout(() => {
            if (nextStatus === "low-stock" || nextStatus === "out-of-stock") {
              const newNotif: Notification = {
                id: `not-disp-${Date.now()}`,
                title: "Stock Depleting",
                message: `${med.name} quantity fell to ${nextQty} units after dispensing.`,
                priority: "high",
                read: false,
                date: new Date().toISOString()
              };
              setNotifications((prevN) => [newNotif, ...prevN]);
            }
          }, 0);

          return {
            ...med,
            quantity: nextQty,
            status: nextStatus
          };
        }
        return med;
      });
    });

    if (success) {
      const med = medicines.find((m) => m.id === medicineId);
      const patient = patients.find((p) => p.id === patientId);
      const doctor = doctors.find((d) => d.id === doctorId);
      
      const newTx: StockTransaction = {
        id: `st-${Date.now()}`,
        date: new Date().toISOString(),
        medicineId,
        medicineName: med?.name || "Unknown Medicine",
        type: "out",
        quantity,
        operator: doctor?.name || currentUser?.name || "Clinic Staff",
        reference: `Dispensed to patient ${patient?.name || "Unknown"} (Rx notes: ${notes})`
      };
      setStockTransactions((prev) => [newTx, ...prev]);

      // Record medical history on the patient
      if (patientId) {
        const historyEntry = {
          date: new Date().toISOString().split("T")[0],
          diagnosis: "Prescription Dispensed",
          doctor: doctor?.name || currentUser?.name || "Doctor",
          treatment: `Dispensed ${quantity} units of ${med?.name}. Notes: ${notes}`
        };
        setPatients((prevPatients) =>
          prevPatients.map((p) =>
            p.id === patientId ? { ...p, medicalHistory: [historyEntry, ...p.medicalHistory] } : p
          )
        );
        
        // Sync history update to API in background
        if (patient) {
          const updatedHistory = [historyEntry, ...patient.medicalHistory];
          fetch(`/api/patients/${patientId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ medicalHistory: updatedHistory })
          }).catch(console.error);
        }
      }

      addAuditLog("Dispense Medicine", "Clinical", `Dispensed ${quantity} units of ${med?.name} to patient ${patient?.name}.`);

      // Decrease stock in DB via API
      if (med) {
        const nextQty = med.quantity - quantity;
        fetch(`/api/medicines/${medicineId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: nextQty })
        }).catch(console.error);
      }
    }

    return success;
  };

  const addCategory = async (cat: Omit<Category, "id" | "count">) => {
    const tempId = `cat-${Date.now()}`;
    const newCat: Category = {
      ...cat,
      id: tempId,
      count: 0
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog("Add Category", "Inventory", `Added new category ${cat.name}.`);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat)
      });
      if (res.ok) {
        const saved = await res.json();
        setCategories((prev) => prev.map(c => c.id === tempId ? { ...c, id: String(saved.category.id) } : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addSupplier = async (sup: Omit<Supplier, "id" | "purchaseHistoryCount" | "balance">) => {
    const tempId = `sup-${Date.now()}`;
    const newSup: Supplier = {
      ...sup,
      id: tempId,
      purchaseHistoryCount: 0,
      balance: 0
    };
    setSuppliers((prev) => [...prev, newSup]);
    addAuditLog("Add Supplier", "Suppliers", `Added supplier ${sup.name}.`);

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sup)
      });
      if (res.ok) {
        const saved = await res.json();
        setSuppliers((prev) => prev.map(s => s.id === tempId ? { ...s, id: saved.supplier.id } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addPatient = async (pat: Omit<Patient, "id" | "medicalHistory">) => {
    const tempId = `pat-${Date.now()}`;
    const newPat: Patient = {
      ...pat,
      id: tempId,
      medicalHistory: []
    };
    setPatients((prev) => [...prev, newPat]);
    addAuditLog("Add Patient", "Patients", `Registered new patient ${pat.name}.`);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pat)
      });
      if (res.ok) {
        const saved = await res.json();
        setPatients((prev) => prev.map(p => p.id === tempId ? { ...p, id: saved.patient.id } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addMedicalHistory = async (patientId: string, entry: Omit<Patient["medicalHistory"][0], "date">) => {
    const newEntry = {
      ...entry,
      date: new Date().toISOString().split("T")[0]
    };
    
    let updatedHistory: any[] = [];
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          updatedHistory = [newEntry, ...p.medicalHistory];
          return { ...p, medicalHistory: updatedHistory };
        }
        return p;
      })
    );
    const patName = patients.find((p) => p.id === patientId)?.name || "Unknown";
    addAuditLog("Update Medical History", "Patients", `Added medical diagnosis for patient ${patName}.`);

    try {
      await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicalHistory: updatedHistory })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addDoctor = async (doc: Omit<Doctor, "id">) => {
    const tempId = `doc-${Date.now()}`;
    const newDoc: Doctor = {
      ...doc,
      id: tempId
    };
    setDoctors((prev) => [...prev, newDoc]);
    addAuditLog("Add Doctor", "Doctors", `Added Dr. ${doc.name} to the roster.`);

    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        const saved = await res.json();
        setDoctors((prev) => prev.map(d => d.id === tempId ? { ...d, id: saved.doctor.id } : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addAppointment = async (app: Omit<Appointment, "id" | "status">) => {
    const patient = patients.find((p) => p.id === app.patientId);
    const doctor = doctors.find((d) => d.id === app.doctorId);
    const tempId = `app-${Date.now()}`;
    const newApp: Appointment = {
      ...app,
      patientName: patient?.name || app.patientName,
      doctorName: doctor?.name || app.doctorName,
      id: tempId,
      status: "pending"
    };
    setAppointments((prev) => [newApp, ...prev]);
    
    addAuditLog("Schedule Appointment", "Appointments", `Booked appointment for ${newApp.patientName} with ${newApp.doctorName}.`);
    
    // Notification for upcoming appointment booking
    const newNotif: Notification = {
      id: `not-app-${Date.now()}`,
      title: "Appointment Booked",
      message: `New appointment scheduled: ${newApp.patientName} with ${newApp.doctorName} on ${app.date} at ${app.time}.`,
      priority: "low",
      read: false,
      date: new Date().toISOString()
    };
    setNotifications((prev) => [newNotif, ...prev]);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app)
      });
      if (res.ok) {
        const saved = await res.json();
        setAppointments((prev) => prev.map(a => a.id === tempId ? { ...a, id: saved.appointment.id } : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
    const app = appointments.find((a) => a.id === id);
    addAuditLog("Update Appointment Status", "Appointments", `Changed status of appointment for ${app?.patientName} to ${status}.`);

    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addInvoice = async (inv: Omit<Invoice, "id" | "invoiceNumber" | "date" | "status">) => {
    const patient = patients.find((p) => p.id === inv.patientId);
    const count = billing.length + 1;
    const invoiceNumber = `INV-2026-${String(count).padStart(3, "0")}`;
    const tempId = `inv-${Date.now()}`;
    
    const newInv: Invoice = {
      ...inv,
      id: tempId,
      invoiceNumber,
      patientName: patient?.name || inv.patientName,
      date: new Date().toISOString().split("T")[0],
      status: "unpaid"
    };

    setBilling((prev) => [newInv, ...prev]);
    addAuditLog("Generate Invoice", "Billing", `Created invoice ${invoiceNumber} for ${newInv.patientName}.`);

    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: inv.patientId,
          amount: inv.amount,
          items: inv.items,
          dueDate: inv.dueDate
        })
      });
      if (res.ok) {
        const saved = await res.json();
        setBilling((prev) => prev.map(b => b.id === tempId ? { ...b, id: saved.bill.id } : b));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateInvoiceStatus = async (id: string, status: Invoice["status"]) => {
    setBilling((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
    const inv = billing.find((i) => i.id === id);
    addAuditLog("Update Invoice Status", "Billing", `Changed invoice ${inv?.invoiceNumber} to ${status}.`);

    // Invoicing status sync (dummy API model handles PUT updates as well)
    try {
      await fetch(`/api/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Try marking all read sequentially in background
    try {
      const unreads = notifications.filter(n => !n.read);
      await Promise.all(unreads.map(n => 
        fetch(`/api/notifications/${n.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true })
        })
      ));
    } catch (e) {
      console.error(e);
    }
  };

  const loginUser = (email: string, name: string, role: string = "Admin", id?: string) => {
    const newUser: User = {
      id: id || `u-${Date.now()}`,
      name,
      email,
      role,
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      clinicName: "MediCare Hospital Suite"
    };
    setCurrentUser(newUser);
    
    // Create new context audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: name,
      action: "User Login",
      module: "Auth",
      date: new Date().toISOString(),
      details: `Logged in via email ${email}`
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const logoutUser = async () => {
    if (currentUser) {
      addAuditLog("User Logout", "Auth", `User ${currentUser.name} logged out.`);
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
  };

  return (
    <HealthcareContext.Provider
      value={{
        medicines,
        categories,
        stockTransactions,
        suppliers,
        patients,
        doctors,
        appointments,
        billing,
        auditLogs,
        notifications,
        currentUser,
        theme,
        
        addMedicine,
        updateMedicine,
        deleteMedicine,
        dispenseMedicine,
        addCategory,
        addSupplier,
        addPatient,
        addMedicalHistory,
        addDoctor,
        addAppointment,
        updateAppointmentStatus,
        addInvoice,
        updateInvoiceStatus,
        addAuditLog,
        markNotificationRead,
        markAllNotificationsRead,
        loginUser,
        logoutUser,
        toggleTheme
      }}
    >
      {children}
    </HealthcareContext.Provider>
  );
}

export function useHealthcare() {
  const context = useContext(HealthcareContext);
  if (context === undefined) {
    throw new Error("useHealthcare must be used within a HealthcareProvider");
  }
  return context;
}
