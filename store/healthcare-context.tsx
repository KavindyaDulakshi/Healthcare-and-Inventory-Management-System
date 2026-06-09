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
  loginUser: (email: string, name: string) => void;
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

  // Load state from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    
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

  const addMedicine = (med: Omit<Medicine, "id" | "status">) => {
    const status = calculateMedicineStatus(med.quantity, med.expiryDate);
    const newMed: Medicine = {
      ...med,
      id: `med-${Date.now()}`,
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
  };

  const updateMedicine = (id: string, updatedFields: Partial<Medicine>) => {
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
  };

  const deleteMedicine = (id: string) => {
    const med = medicines.find((m) => m.id === id);
    if (!med) return;
    
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    
    // Recalculate categories count
    setCategories((prev) =>
      prev.map((c) => (c.name === med.category ? { ...c, count: Math.max(0, c.count - 1) } : c))
    );

    addAuditLog("Delete Medicine", "Inventory", `Deleted medicine ${med.name}.`);
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
      }

      addAuditLog("Dispense Medicine", "Clinical", `Dispensed ${quantity} units of ${med?.name} to patient ${patient?.name}.`);
    }

    return success;
  };

  const addCategory = (cat: Omit<Category, "id" | "count">) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      count: 0
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog("Add Category", "Inventory", `Added new category ${cat.name}.`);
  };

  const addSupplier = (sup: Omit<Supplier, "id" | "purchaseHistoryCount" | "balance">) => {
    const newSup: Supplier = {
      ...sup,
      id: `sup-${Date.now()}`,
      purchaseHistoryCount: 0,
      balance: 0
    };
    setSuppliers((prev) => [...prev, newSup]);
    addAuditLog("Add Supplier", "Suppliers", `Added supplier ${sup.name}.`);
  };

  const addPatient = (pat: Omit<Patient, "id" | "medicalHistory">) => {
    const newPat: Patient = {
      ...pat,
      id: `pat-${Date.now()}`,
      medicalHistory: []
    };
    setPatients((prev) => [...prev, newPat]);
    addAuditLog("Add Patient", "Patients", `Registered new patient ${pat.name}.`);
  };

  const addMedicalHistory = (patientId: string, entry: Omit<Patient["medicalHistory"][0], "date">) => {
    const newEntry = {
      ...entry,
      date: new Date().toISOString().split("T")[0]
    };
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, medicalHistory: [newEntry, ...p.medicalHistory] } : p
      )
    );
    const patName = patients.find((p) => p.id === patientId)?.name || "Unknown";
    addAuditLog("Update Medical History", "Patients", `Added medical diagnosis for patient ${patName}.`);
  };

  const addDoctor = (doc: Omit<Doctor, "id">) => {
    const newDoc: Doctor = {
      ...doc,
      id: `doc-${Date.now()}`
    };
    setDoctors((prev) => [...prev, newDoc]);
    addAuditLog("Add Doctor", "Doctors", `Added Dr. ${doc.name} to the roster.`);
  };

  const addAppointment = (app: Omit<Appointment, "id" | "status">) => {
    const patient = patients.find((p) => p.id === app.patientId);
    const doctor = doctors.find((d) => d.id === app.doctorId);
    const newApp: Appointment = {
      ...app,
      patientName: patient?.name || app.patientName,
      doctorName: doctor?.name || app.doctorName,
      id: `app-${Date.now()}`,
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
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
    const app = appointments.find((a) => a.id === id);
    addAuditLog("Update Appointment Status", "Appointments", `Changed status of appointment for ${app?.patientName} to ${status}.`);
  };

  const addInvoice = (inv: Omit<Invoice, "id" | "invoiceNumber" | "date" | "status">) => {
    const patient = patients.find((p) => p.id === inv.patientId);
    const count = billing.length + 1;
    const invoiceNumber = `INV-2026-${String(count).padStart(3, "0")}`;
    
    const newInv: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      patientName: patient?.name || inv.patientName,
      date: new Date().toISOString().split("T")[0],
      status: "unpaid"
    };

    setBilling((prev) => [newInv, ...prev]);
    addAuditLog("Generate Invoice", "Billing", `Created invoice ${invoiceNumber} for ${newInv.patientName}.`);
  };

  const updateInvoiceStatus = (id: string, status: Invoice["status"]) => {
    setBilling((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
    const inv = billing.find((i) => i.id === id);
    addAuditLog("Update Invoice Status", "Billing", `Changed invoice ${inv?.invoiceNumber} to ${status}.`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const loginUser = (email: string, name: string) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: "Clinic Administrator",
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

  const logoutUser = () => {
    if (currentUser) {
      addAuditLog("User Logout", "Auth", `User ${currentUser.name} logged out.`);
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
