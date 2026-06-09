import { Medicine, Category, StockTransaction, Supplier, Patient, Doctor, Appointment, Invoice, AuditLog, Notification, User } from "../types";

export const INITIAL_USER: User = {
  id: "u-1",
  name: "Dr. Sarah Chen",
  email: "sarah.chen@medicare.com",
  role: "Clinic Administrator / Cardiologist",
  avatar: "SC",
  clinicName: "MediCare Hospital Suite"
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Tablets", description: "Solid dosage forms containing medicinal substances", count: 6 },
  { id: "cat-2", name: "Syrups", description: "Liquid preparation of concentrated sugar solution", count: 2 },
  { id: "cat-3", name: "Injections", description: "Sterile solutions for parenteral administration", count: 2 },
  { id: "cat-4", name: "Vaccines", description: "Biological preparation providing active acquired immunity", count: 1 },
  { id: "cat-5", name: "Equipment", description: "Clinical devices, disposables, and tools", count: 1 }
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: "med-1",
    name: "Paracetamol 500mg",
    category: "Tablets",
    batchNumber: "PR-2026-A9",
    quantity: 1200,
    unitPrice: 0.15,
    expiryDate: "2027-12-15",
    supplier: "PharmaCo Industries",
    status: "in-stock",
    barcode: "8901020304051"
  },
  {
    id: "med-2",
    name: "Amoxicillin 250mg",
    category: "Tablets",
    batchNumber: "AM-2026-C2",
    quantity: 14,
    unitPrice: 0.85,
    expiryDate: "2026-07-20",
    supplier: "Global Health Distributors",
    status: "low-stock",
    barcode: "8901020304068"
  },
  {
    id: "med-3",
    name: "Ibuprofen 400mg",
    category: "Tablets",
    batchNumber: "IB-2025-F4",
    quantity: 450,
    unitPrice: 0.22,
    expiryDate: "2027-02-10",
    supplier: "PharmaCo Industries",
    status: "in-stock",
    barcode: "8901020304075"
  },
  {
    id: "med-4",
    name: "Metformin 500mg",
    category: "Tablets",
    batchNumber: "MT-2024-X2",
    quantity: 800,
    unitPrice: 0.35,
    expiryDate: "2026-06-30",
    supplier: "MedTech Solutions Ltd",
    status: "in-stock", // expiring soon!
    barcode: "8901020304082"
  },
  {
    id: "med-5",
    name: "Atorvastatin 20mg",
    category: "Tablets",
    batchNumber: "AT-2026-M8",
    quantity: 320,
    unitPrice: 1.10,
    expiryDate: "2028-01-05",
    supplier: "Apex BioLabs",
    status: "in-stock",
    barcode: "8901020304099"
  },
  {
    id: "med-6",
    name: "Omeprazole 20mg",
    category: "Tablets",
    batchNumber: "OM-2025-P3",
    quantity: 90,
    unitPrice: 0.45,
    expiryDate: "2025-11-30",
    supplier: "MedTech Solutions Ltd",
    status: "low-stock",
    barcode: "8901020304105"
  },
  {
    id: "med-7",
    name: "Cough Syrup (Guaifenesin)",
    category: "Syrups",
    batchNumber: "CS-2026-K1",
    quantity: 110,
    unitPrice: 3.50,
    expiryDate: "2027-09-18",
    supplier: "Global Health Distributors",
    status: "in-stock",
    barcode: "8901020304112"
  },
  {
    id: "med-8",
    name: "Salbutamol Inhaler 100mcg",
    category: "Syrups", // Using Syrups as a respiratory group placeholder or liquid category
    batchNumber: "SB-2025-E6",
    quantity: 0,
    unitPrice: 6.20,
    expiryDate: "2026-04-12",
    supplier: "Apex BioLabs",
    status: "out-of-stock",
    barcode: "8901020304129"
  },
  {
    id: "med-9",
    name: "Insulin Glargine 100 U/mL",
    category: "Injections",
    batchNumber: "IN-2025-Y1",
    quantity: 45,
    unitPrice: 24.50,
    expiryDate: "2026-08-30",
    supplier: "Global Health Distributors",
    status: "low-stock",
    barcode: "8901020304136"
  },
  {
    id: "med-10",
    name: "Lidocaine Injection 1%",
    category: "Injections",
    batchNumber: "LD-2024-T9",
    quantity: 120,
    unitPrice: 1.80,
    expiryDate: "2026-05-15", // Already expired based on 2026-06-09
    supplier: "MedTech Solutions Ltd",
    status: "expired",
    barcode: "8901020304143"
  },
  {
    id: "med-11",
    name: "Flu Vaccine (Influenza)",
    category: "Vaccines",
    batchNumber: "FL-2026-V2",
    quantity: 250,
    unitPrice: 15.00,
    expiryDate: "2027-03-01",
    supplier: "Apex BioLabs",
    status: "in-stock",
    barcode: "8901020304150"
  },
  {
    id: "med-12",
    name: "Disposable Syringes 5ml",
    category: "Equipment",
    batchNumber: "EQ-2026-S1",
    quantity: 2500,
    unitPrice: 0.08,
    expiryDate: "2030-10-30",
    supplier: "MedTech Solutions Ltd",
    status: "in-stock",
    barcode: "8901020304167"
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "PharmaCo Industries",
    contactPerson: "Robert Miller",
    email: "orders@pharmaco.com",
    phone: "+1 (555) 019-2834",
    address: "742 Evergreen Terrace, Springfield",
    rating: 4.8,
    balance: 1450.00,
    purchaseHistoryCount: 42
  },
  {
    id: "sup-2",
    name: "Global Health Distributors",
    contactPerson: "Jane Smith",
    email: "contact@globalhealth.com",
    phone: "+1 (555) 021-9876",
    address: "100 Medical Parkway, Suite 400, Boston",
    rating: 4.5,
    balance: 3820.50,
    purchaseHistoryCount: 29
  },
  {
    id: "sup-3",
    name: "MedTech Solutions Ltd",
    contactPerson: "Alan Turing",
    email: "sales@medtechsolutions.co.uk",
    phone: "+44 20 7946 0958",
    address: "Bletchley Park, Milton Keynes, UK",
    rating: 4.2,
    balance: 0.00,
    purchaseHistoryCount: 56
  },
  {
    id: "sup-4",
    name: "Apex BioLabs",
    contactPerson: "Dr. Clara Oswald",
    email: "distribution@apexbio.org",
    phone: "+1 (555) 014-4321",
    address: "350 Innovation Way, San Francisco",
    rating: 4.9,
    balance: 890.00,
    purchaseHistoryCount: 18
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "pat-1",
    name: "John Doe",
    age: 45,
    gender: "Male",
    email: "john.doe@gmail.com",
    phone: "+1 (555) 123-4567",
    address: "123 Elm St, Metropolis",
    bloodGroup: "A+",
    medicalHistory: [
      { date: "2025-10-15", diagnosis: "Essential Hypertension", doctor: "Dr. Sarah Chen", treatment: "Amlodipine 5mg daily" },
      { date: "2026-03-04", diagnosis: "Acute Bronchitis", doctor: "Dr. Marcus Vance", treatment: "Amoxicillin 250mg & rest" }
    ]
  },
  {
    id: "pat-2",
    name: "Alice Johnson",
    age: 32,
    gender: "Female",
    email: "alice.j@yahoo.com",
    phone: "+1 (555) 987-6543",
    address: "456 Oak Ave, Gotham",
    bloodGroup: "O-",
    medicalHistory: [
      { date: "2025-08-20", diagnosis: "Type 2 Diabetes Mellitus", doctor: "Dr. Sarah Chen", treatment: "Metformin 500mg daily & dietary control" }
    ]
  },
  {
    id: "pat-3",
    name: "Robert Downey",
    age: 58,
    gender: "Male",
    email: "tony@stark.com",
    phone: "+1 (555) 300-3000",
    address: "10880 Wilshire Blvd, Los Angeles",
    bloodGroup: "AB+",
    medicalHistory: [
      { date: "2024-12-01", diagnosis: "Coronary Artery Disease", doctor: "Dr. Sarah Chen", treatment: "Atorvastatin 20mg & Aspirin 81mg" }
    ]
  },
  {
    id: "pat-4",
    name: "Emily Watson",
    age: 27,
    gender: "Female",
    email: "emily.w@outlook.com",
    phone: "+1 (555) 234-5678",
    address: "789 Pine Rd, Smallville",
    bloodGroup: "B+",
    medicalHistory: [
      { date: "2026-05-12", diagnosis: "Seasonal Allergies", doctor: "Dr. Marcus Vance", treatment: "Cetirizine 10mg as needed" }
    ]
  },
  {
    id: "pat-5",
    name: "Michael Brown",
    age: 63,
    gender: "Male",
    email: "mbrown@gmail.com",
    phone: "+1 (555) 345-6789",
    address: "321 Maple Dr, Riverdale",
    bloodGroup: "O+",
    medicalHistory: [
      { date: "2025-05-01", diagnosis: "Gastroesophageal Reflux Disease (GERD)", doctor: "Dr. Elena Rostova", treatment: "Omeprazole 20mg daily" }
    ]
  },
  {
    id: "pat-6",
    name: "Sophia Martinez",
    age: 8,
    gender: "Female",
    email: "parent.martinez@gmail.com",
    phone: "+1 (555) 456-7890",
    address: "555 Cedar Ln, Hill Valley",
    bloodGroup: "A-",
    medicalHistory: [
      { date: "2026-01-10", diagnosis: "Mild Asthma", doctor: "Dr. Marcus Vance", treatment: "Salbutamol Inhaler as needed" }
    ]
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@medicare.com",
    phone: "+1 (555) 019-3388",
    department: "Cardiology",
    specialization: "Interventional Cardiology",
    availability: ["Monday", "Wednesday", "Friday"],
    avatar: "SC"
  },
  {
    id: "doc-2",
    name: "Dr. Marcus Vance",
    email: "marcus.vance@medicare.com",
    phone: "+1 (555) 019-4455",
    department: "Pediatrics",
    specialization: "General Pediatrics",
    availability: ["Monday", "Tuesday", "Thursday"],
    avatar: "MV"
  },
  {
    id: "doc-3",
    name: "Dr. Elena Rostova",
    email: "elena.rostova@medicare.com",
    phone: "+1 (555) 019-5566",
    department: "Neurology",
    specialization: "Clinical Neurophysiology",
    availability: ["Tuesday", "Wednesday", "Thursday"],
    avatar: "ER"
  },
  {
    id: "doc-4",
    name: "Dr. James Carter",
    email: "james.carter@medicare.com",
    phone: "+1 (555) 019-6677",
    department: "General Medicine",
    specialization: "Family Medicine & General Practice",
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    avatar: "JC"
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "app-1",
    patientId: "pat-1",
    patientName: "John Doe",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Chen",
    date: "2026-06-09",
    time: "09:30 AM",
    status: "completed",
    notes: "Routine hypertension follow-up. Blood pressure stable at 124/82. Continue medication."
  },
  {
    id: "app-2",
    patientId: "pat-2",
    patientName: "Alice Johnson",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Chen",
    date: "2026-06-09",
    time: "11:00 AM",
    status: "completed",
    notes: "Diabetes screening review. HbA1c is 6.4%. Progressing well. Keep Metformin dosage."
  },
  {
    id: "app-3",
    patientId: "pat-3",
    patientName: "Robert Downey",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Chen",
    date: "2026-06-09",
    time: "02:00 PM",
    status: "confirmed",
    notes: "Post-cardiac rehab evaluation. Check EKG and lipid profile."
  },
  {
    id: "app-4",
    patientId: "pat-4",
    patientName: "Emily Watson",
    doctorId: "doc-2",
    doctorName: "Dr. Marcus Vance",
    date: "2026-06-09",
    time: "03:30 PM",
    status: "pending",
    notes: "Reports mild allergic rhinitis returning. Check prescription status."
  },
  {
    id: "app-5",
    patientId: "pat-6",
    patientName: "Sophia Martinez",
    doctorId: "doc-2",
    doctorName: "Dr. Marcus Vance",
    date: "2026-06-10",
    time: "10:00 AM",
    status: "confirmed",
    notes: "Asthma spacer review and general checkup."
  },
  {
    id: "app-6",
    patientId: "pat-5",
    patientName: "Michael Brown",
    doctorId: "doc-3",
    doctorName: "Dr. Elena Rostova",
    date: "2026-06-11",
    time: "11:30 AM",
    status: "confirmed",
    notes: "GERD consultation & neurological checkup for occasional dizziness."
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-001",
    patientId: "pat-1",
    patientName: "John Doe",
    date: "2026-06-01",
    dueDate: "2026-06-15",
    amount: 125.00,
    status: "paid",
    items: [
      { name: "Cardiology Consultation Fee", quantity: 1, price: 100.00 },
      { name: "Blood Pressure Monitoring Strip", quantity: 5, price: 5.00 }
    ]
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-002",
    patientId: "pat-2",
    patientName: "Alice Johnson",
    date: "2026-06-03",
    dueDate: "2026-06-17",
    amount: 85.00,
    status: "paid",
    items: [
      { name: "Pediatrics Consultation", quantity: 1, price: 75.00 },
      { name: "Cough Syrup (Guaifenesin)", quantity: 1, price: 10.00 }
    ]
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-003",
    patientId: "pat-3",
    patientName: "Robert Downey",
    date: "2026-06-08",
    dueDate: "2026-06-22",
    amount: 320.00,
    status: "unpaid",
    items: [
      { name: "Comprehensive Cardiac Panel", quantity: 1, price: 250.00 },
      { name: "Electrocardiogram (EKG)", quantity: 1, price: 70.00 }
    ]
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-004",
    patientId: "pat-4",
    patientName: "Emily Watson",
    date: "2026-05-20",
    dueDate: "2026-06-03",
    amount: 90.00,
    status: "overdue",
    items: [
      { name: "General Checkup Clinic Fee", quantity: 1, price: 75.00 },
      { name: "Allergy Testing Strip Pack", quantity: 1, price: 15.00 }
    ]
  }
];

export const INITIAL_STOCK_TRANSACTIONS: StockTransaction[] = [
  {
    id: "st-1",
    date: "2026-06-08T09:15:00Z",
    medicineId: "med-1",
    medicineName: "Paracetamol 500mg",
    type: "in",
    quantity: 500,
    operator: "Dr. Sarah Chen",
    reference: "Restocked from PharmaCo Industries (PO-448)"
  },
  {
    id: "st-2",
    date: "2026-06-08T14:30:00Z",
    medicineId: "med-2",
    medicineName: "Amoxicillin 250mg",
    type: "out",
    quantity: 30,
    operator: "Dr. James Carter",
    reference: "Dispensed to Patient John Doe (RX-9821)"
  },
  {
    id: "st-3",
    date: "2026-06-07T11:00:00Z",
    medicineId: "med-8",
    medicineName: "Salbutamol Inhaler 100mcg",
    type: "out",
    quantity: 10,
    operator: "Dr. Marcus Vance",
    reference: "Dispensed to Patient Sophia Martinez (RX-7729)"
  },
  {
    id: "st-4",
    date: "2026-06-06T16:45:00Z",
    medicineId: "med-11",
    medicineName: "Flu Vaccine (Influenza)",
    type: "in",
    quantity: 100,
    operator: "Dr. Sarah Chen",
    reference: "Seasonal stock shipment Apex BioLabs (PO-442)"
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "not-1",
    title: "Critical Low Stock",
    message: "Amoxicillin 250mg is critically low (14 units remaining). Reorder immediately.",
    priority: "high",
    read: false,
    date: "2026-06-09T08:00:00Z"
  },
  {
    id: "not-2",
    title: "Medicine Out Of Stock",
    message: "Salbutamol Inhaler 100mcg is completely out of stock.",
    priority: "high",
    read: false,
    date: "2026-06-09T09:12:00Z"
  },
  {
    id: "not-3",
    title: "Expired Medicine Batch",
    message: "Lidocaine Injection 1% (Batch LD-2024-T9) expired on 2026-05-15. Dispose safely.",
    priority: "high",
    read: false,
    date: "2026-06-08T18:00:00Z"
  },
  {
    id: "not-4",
    title: "Upcoming Expiry",
    message: "Metformin 500mg (Batch MT-2024-X2) is expiring soon on 2026-06-30.",
    priority: "medium",
    read: false,
    date: "2026-06-09T10:00:00Z"
  },
  {
    id: "not-5",
    title: "Unpaid Invoice Overdue",
    message: "Invoice INV-2026-004 for Emily Watson is overdue ($90.00).",
    priority: "medium",
    read: true,
    date: "2026-06-03T17:00:00Z"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    user: "Dr. Sarah Chen",
    action: "User Login",
    module: "Auth",
    date: "2026-06-09T08:30:15Z",
    details: "Logged in successfully from IP 192.168.1.45"
  },
  {
    id: "log-2",
    user: "Dr. Sarah Chen",
    action: "Add Stock",
    module: "Inventory",
    date: "2026-06-09T09:02:11Z",
    details: "Restocked 500 units of Paracetamol 500mg (Batch PR-2026-A9)"
  },
  {
    id: "log-3",
    user: "Dr. James Carter",
    action: "Dispense",
    module: "Clinical",
    date: "2026-06-09T09:35:40Z",
    details: "Dispensed 30 tablets of Amoxicillin 250mg to John Doe"
  },
  {
    id: "log-4",
    user: "Dr. Sarah Chen",
    action: "Create Appointment",
    module: "Appointments",
    date: "2026-06-09T10:15:00Z",
    details: "Scheduled appointment for Robert Downey with Dr. Sarah Chen on 2026-06-09"
  },
  {
    id: "log-5",
    user: "Dr. Marcus Vance",
    action: "Update Patient Profile",
    module: "Patients",
    date: "2026-06-09T11:45:22Z",
    details: "Updated medical history for Sophia Martinez (Added asthma inhaler spacer review)"
  }
];
