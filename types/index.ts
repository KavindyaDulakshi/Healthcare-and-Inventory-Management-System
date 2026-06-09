export interface Medicine {
  id: string;
  name: string;
  category: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
  supplier: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  barcode: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface StockTransaction {
  id: string;
  date: string;
  medicineId: string;
  medicineName: string;
  type: 'in' | 'out';
  quantity: number;
  operator: string;
  reference: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  balance: number;
  purchaseHistoryCount: number;
}

export interface MedicalHistoryEntry {
  date: string;
  diagnosis: string;
  doctor: string;
  treatment: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  medicalHistory: MedicalHistoryEntry[];
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  availability: string[];
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  items: InvoiceItem[];
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  date: string;
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  clinicName?: string;
}
