import { supabase, isSupabaseConfigured } from "./supabase";
import { 
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

// In-Memory Server State Fallback (Cached on global object to survive HMR resets)
interface GlobalHealthcareDb {
  users: any[];
  categories: any[];
  suppliers: any[];
  medicines: any[];
  transactions: any[];
  patients: any[];
  doctors: any[];
  appointments: any[];
  bills: any[];
  notifications: any[];
  auditLogs: any[];
}

let db: GlobalHealthcareDb;

if (typeof global !== "undefined") {
  if (!(global as any).healthcareDb) {
    // Hash a default password for sarah.chen@medicare.com ("password123")
    // $2a$10$w85Jd1VfT0dM1qgE2DqjcuqKz6zE0U2Z87T994a5e3a7c8d9e0f1g -> bcrypt hash for password123
    (global as any).healthcareDb = {
      users: [
        {
          id: "u-1",
          full_name: "Dr. Sarah Chen",
          email: "sarah.chen@medicare.com",
          password_hash: "$2a$10$w85Jd1VfT0dM1qgE2DqjcuqKz6zE0U2Z87T994a5e3a7c8d9e0f1g",
          role: "Admin",
          created_at: new Date().toISOString()
        }
      ],
      categories: INITIAL_CATEGORIES.map(c => ({ id: c.id, name: c.name })),
      suppliers: INITIAL_SUPPLIERS.map(s => ({
        id: s.id,
        company_name: s.name,
        email: s.email,
        phone: s.phone,
        address: s.address
      })),
      medicines: INITIAL_MEDICINES.map((m, idx) => ({
        id: m.id,
        name: m.name,
        generic_name: m.name.includes(" Syrup") ? "Guaifenesin" : m.name.split(" ")[0],
        category_id: idx % 5 + 1, // mapping
        supplier_id: "sup-1",
        batch_number: m.batchNumber,
        quantity: m.quantity,
        unit_price: m.unitPrice,
        selling_price: m.unitPrice * 1.3,
        expiry_date: m.expiryDate,
        image_url: m.image || null,
        created_at: new Date().toISOString()
      })),
      transactions: INITIAL_STOCK_TRANSACTIONS.map(t => ({
        id: t.id,
        medicine_id: t.medicineId,
        quantity: t.quantity,
        action: t.type,
        created_at: t.date
      })),
      patients: INITIAL_PATIENTS.map(p => {
        const names = p.name.split(" ");
        return {
          id: p.id,
          first_name: names[0],
          last_name: names[1] || "",
          phone: p.phone,
          email: p.email,
          dob: "1980-01-01",
          address: p.address,
          medical_notes: JSON.stringify(p.medicalHistory),
          created_at: new Date().toISOString()
        };
      }),
      doctors: INITIAL_DOCTORS.map(d => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        phone: d.phone,
        email: d.email,
        created_at: new Date().toISOString()
      })),
      appointments: INITIAL_APPOINTMENTS.map(a => ({
        id: a.id,
        patient_id: a.patientId,
        doctor_id: a.doctorId,
        appointment_date: a.date + "T" + (a.time.includes("PM") ? "14:00:00" : "09:30:00"),
        status: a.status.charAt(0).toUpperCase() + a.status.slice(1) // match 'Pending', 'Confirmed' etc
      })),
      bills: INITIAL_INVOICES.map(i => ({
        id: i.id,
        patient_id: i.patientId,
        total: i.amount,
        payment_status: i.status.charAt(0).toUpperCase() + i.status.slice(1), // Paid, Unpaid etc
        created_at: new Date(i.date).toISOString()
      })),
      notifications: INITIAL_NOTIFICATIONS.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        is_read: n.read,
        created_at: n.date
      })),
      auditLogs: INITIAL_AUDIT_LOGS.map(l => ({
        id: l.id,
        user_id: "u-1",
        action: l.action,
        module: l.module,
        created_at: l.date
      }))
    };
  }
  db = (global as any).healthcareDb;
}

// ----------------------------------------------------
// DATABASE SERVICE LAYER (REPOSITORY PATTERN)
// ----------------------------------------------------

export const dbService = {
  // --- USERS ---
  async getUserByEmail(email: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("users").select("*").eq("email", email).single();
      if (error) return null;
      return data;
    }
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(user: { full_name: string; email: string; password_hash: string; role: string }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("users").insert([user]).select().single();
      if (error) throw error;
      return data;
    }
    const newUser = { id: `u-${Date.now()}`, ...user, created_at: new Date().toISOString() };
    db.users.push(newUser);
    return newUser;
  },

  async getUsers() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("users").select("id, full_name, email, role, created_at");
      if (error) throw error;
      return data;
    }
    return db.users.map(({ password_hash, ...u }) => u);
  },

  async updateUser(id: string, updates: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...updates };
    const { password_hash, ...rest } = db.users[idx];
    return rest;
  },

  async deleteUser(id: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    db.users = db.users.filter(u => u.id !== id);
    return true;
  },

  // --- MEDICINES ---
  async getMedicines() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("medicines").select("*");
      if (error) throw error;
      return data;
    }
    return db.medicines;
  },

  async getMedicineById(id: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("medicines").select("*").eq("id", id).single();
      if (error) return null;
      return data;
    }
    return db.medicines.find(m => m.id === id) || null;
  },

  async createMedicine(med: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("medicines").insert([med]).select().single();
      if (error) throw error;
      return data;
    }
    const newMed = { id: `med-${Date.now()}`, ...med, created_at: new Date().toISOString() };
    db.medicines.push(newMed);
    return newMed;
  },

  async updateMedicine(id: string, updates: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("medicines").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = db.medicines.findIndex(m => m.id === id);
    if (idx === -1) return null;
    db.medicines[idx] = { ...db.medicines[idx], ...updates };
    return db.medicines[idx];
  },

  async deleteMedicine(id: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("medicines").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    db.medicines = db.medicines.filter(m => m.id !== id);
    return true;
  },

  // --- CATEGORIES ---
  async getCategories() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    }
    return db.categories;
  },

  async createCategory(cat: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("categories").insert([cat]).select().single();
      if (error) throw error;
      return data;
    }
    const newCat = { id: db.categories.length + 1, ...cat };
    db.categories.push(newCat);
    return newCat;
  },

  async updateCategory(id: number, updates: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = db.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    db.categories[idx] = { ...db.categories[idx], ...updates };
    return db.categories[idx];
  },

  async deleteCategory(id: number) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    db.categories = db.categories.filter(c => c.id !== id);
    return true;
  },

  // --- SUPPLIERS ---
  async getSuppliers() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("suppliers").select("*");
      if (error) throw error;
      return data;
    }
    return db.suppliers;
  },

  async createSupplier(sup: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("suppliers").insert([sup]).select().single();
      if (error) throw error;
      return data;
    }
    const newSup = { id: `sup-${Date.now()}`, ...sup };
    db.suppliers.push(newSup);
    return newSup;
  },

  async updateSupplier(id: string, updates: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("suppliers").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = db.suppliers.findIndex(s => s.id === id);
    if (idx === -1) return null;
    db.suppliers[idx] = { ...db.suppliers[idx], ...updates };
    return db.suppliers[idx];
  },

  async deleteSupplier(id: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    db.suppliers = db.suppliers.filter(s => s.id !== id);
    return true;
  },

  // --- PATIENTS ---
  async getPatients() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("patients").select("*");
      if (error) throw error;
      return data;
    }
    return db.patients;
  },

  async getPatientById(id: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("patients").select("*").eq("id", id).single();
      if (error) return null;
      return data;
    }
    return db.patients.find(p => p.id === id) || null;
  },

  async createPatient(pat: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("patients").insert([pat]).select().single();
      if (error) throw error;
      return data;
    }
    const newPat = { id: `pat-${Date.now()}`, ...pat, created_at: new Date().toISOString() };
    db.patients.push(newPat);
    return newPat;
  },

  async updatePatient(id: string, updates: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("patients").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = db.patients.findIndex(p => p.id === id);
    if (idx === -1) return null;
    db.patients[idx] = { ...db.patients[idx], ...updates };
    return db.patients[idx];
  },

  async deletePatient(id: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    db.patients = db.patients.filter(p => p.id !== id);
    return true;
  },

  // --- DOCTORS ---
  async getDoctors() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("doctors").select("*");
      if (error) throw error;
      return data;
    }
    return db.doctors;
  },

  async getDoctorById(id: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("doctors").select("*").eq("id", id).single();
      if (error) return null;
      return data;
    }
    return db.doctors.find(d => d.id === id) || null;
  },

  async createDoctor(doc: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("doctors").insert([doc]).select().single();
      if (error) throw error;
      return data;
    }
    const newDoc = { id: `doc-${Date.now()}`, ...doc, created_at: new Date().toISOString() };
    db.doctors.push(newDoc);
    return newDoc;
  },

  async updateDoctor(id: string, updates: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("doctors").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = db.doctors.findIndex(d => d.id === id);
    if (idx === -1) return null;
    db.doctors[idx] = { ...db.doctors[idx], ...updates };
    return db.doctors[idx];
  },

  async deleteDoctor(id: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("doctors").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    db.doctors = db.doctors.filter(d => d.id !== id);
    return true;
  },

  // --- APPOINTMENTS ---
  async getAppointments() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("appointments").select("*");
      if (error) throw error;
      return data;
    }
    return db.appointments;
  },

  async createAppointment(app: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("appointments").insert([app]).select().single();
      if (error) throw error;
      return data;
    }
    const newApp = { id: `app-${Date.now()}`, status: "Pending", ...app };
    db.appointments.push(newApp);
    return newApp;
  },

  async updateAppointment(id: string, updates: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("appointments").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = db.appointments.findIndex(a => a.id === id);
    if (idx === -1) return null;
    db.appointments[idx] = { ...db.appointments[idx], ...updates };
    return db.appointments[idx];
  },

  async deleteAppointment(id: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
      return true;
    }
    db.appointments = db.appointments.filter(a => a.id !== id);
    return true;
  },

  // --- BILLING / BILLS ---
  async getBills() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("bills").select("*");
      if (error) throw error;
      return data;
    }
    return db.bills;
  },

  async createBill(bill: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("bills").insert([bill]).select().single();
      if (error) throw error;
      return data;
    }
    const newBill = { id: `inv-${Date.now()}`, payment_status: "Unpaid", created_at: new Date().toISOString(), ...bill };
    db.bills.push(newBill);
    return newBill;
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("notifications").select("*");
      if (error) throw error;
      return data;
    }
    return db.notifications;
  },

  async updateNotification(id: string, updates: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("notifications").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = db.notifications.findIndex(n => n.id === id);
    if (idx === -1) return null;
    db.notifications[idx] = { ...db.notifications[idx], ...updates };
    return db.notifications[idx];
  },

  // --- AUDIT LOGS ---
  async getAuditLogs() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("audit_logs").select("*");
      if (error) throw error;
      return data;
    }
    return db.auditLogs;
  },

  async createAuditLog(log: any) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("audit_logs").insert([log]).select().single();
      if (error) throw error;
      return data;
    }
    const newLog = { id: `log-${Date.now()}`, created_at: new Date().toISOString(), ...log };
    db.auditLogs.unshift(newLog);
    return newLog;
  }
};
