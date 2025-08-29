// Basic database operations using Convex
// Note: Run 'npx convex dev' to generate proper types

// Type definitions based on your Convex schema
export interface Doctor {
  _id: string;
  clerkId: string;
  name: string;
  specialty: string;
  email: string;
  phone?: string;
  licenseNumber?: string;
  experience?: string;
  education?: string;
  about?: string;
  languages: string[];
  availability: string[];
  consultationFee: number;
  rating: number;
  totalReviews: number;
  image?: string;
  status: "active" | "inactive";
}

export interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  doctorId?: string;
  doctorName?: string;
  doctorEmail?: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  symptoms?: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  consultationFee: number;
  meetingLink?: string;
  doctorNotes?: string;
  vonageSessionId?: string;
}

export interface Vital {
  _id: string;
  patientId: string;
  heartRate?: number;
  spO2?: number;
  temperature?: number;
  bmi?: number;
  deviceId?: string;
}

export interface ChatSession {
  _id: string;
  patientId: string;
  sessionStart: string;
  sessionEnd?: string;
  status: "active" | "completed";
}

export interface ChatMessage {
  _id: string;
  sessionId: string;
  message: string;
  sender: "user" | "bot";
  severity?: "low" | "medium" | "high";
  appointmentSuggested: boolean;
}

export interface Pharmacy {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  deliveryTime?: string;
  medicines: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
    inStock: boolean;
  }>;
  status: "active" | "inactive";
}

// Mock data functions for now - replace with actual Convex queries late
export async function getDoctors(specialty?: string, search?: string): Promise<Doctor[]> {
  const mockDoctors: Doctor[] = [
    {
      _id: "doc_001",
      clerkId: "clerk_mock_001",
      name: "Dr. Sarah Johnson",
      specialty: "General Medicine",
      email: "sujalt.etc22@sbjit.edu.in",
      phone: "+1 (555) 123-4567",
      licenseNumber: "MD123456",
      experience: "8 years",
      education: "MD from Harvard Medical School",
      about: "Dr. Sarah Johnson is a dedicated general practitioner with over 8 years of experience in primary care.",
      languages: ["English", "Spanish"],
      availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      consultationFee: 150,
      rating: 4.8,
      totalReviews: 245,
      image: "/placeholder-user.jpg",
      status: "active"
    }
  ];

  // Filter mock data based on parameters
  let filteredDoctors = mockDoctors;
  
  if (specialty && specialty !== 'all') {
    filteredDoctors = filteredDoctors.filter(doc => 
      doc.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }
  
  if (search) {
    filteredDoctors = filteredDoctors.filter(doc =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase())
    );
  }

  return filteredDoctors;
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  const mockDoctors = await getDoctors();
  return mockDoctors.find(d => d._id === id) || null;
}

export async function createAppointment(appointmentData: Omit<Appointment, '_id'>): Promise<Appointment> {
  const mockAppointment: Appointment = {
    _id: `apt_${Date.now()}`,
    ...appointmentData,
    meetingLink: `https://medibot-meet.com/room/${Date.now()}`
  };
  
  console.log("Mock appointment created:", mockAppointment._id);
  return mockAppointment;
}

export async function getAppointments(patientId?: string, doctorId?: string, status?: string): Promise<Appointment[]> {
  // TODO: Implement with Convex queries
  return [];
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
  // TODO: Implement with Convex mutations
  return null;
}

export async function saveVitals(vitalData: Omit<Vital, '_id'>): Promise<Vital> {
  const mockVital: Vital = {
    _id: `vital_${Date.now()}`,
    ...vitalData
  };
  
  return mockVital;
}

export async function getVitals(patientId: string, limit = 10): Promise<Vital[]> {
  // TODO: Implement with Convex queries
  return [];
}

export async function createChatSession(patientId: string): Promise<ChatSession> {
  const mockSession: ChatSession = {
    _id: `session_${Date.now()}`,
    patientId,
    sessionStart: new Date().toISOString(),
    status: "active"
  };
  
  return mockSession;
}

export async function saveChatMessage(messageData: Omit<ChatMessage, '_id'>): Promise<ChatMessage> {
  const mockMessage: ChatMessage = {
    _id: `msg_${Date.now()}`,
    ...messageData
  };
  
  return mockMessage;
}

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  // TODO: Implement with Convex queries
  return [];
}

export async function getPharmacies(): Promise<Pharmacy[]> {
  // TODO: Implement with Convex queries
  return [];
}

export async function getAppointmentStats() {
  return {
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0
  };
}

// TODO: Add these Convex hooks after running 'npx convex dev'
// export function useDoctors(specialty?: string, search?: string) {
//   return useQuery(api.doctors.getAllDoctors, { specialty, search });
// }

// export function useDoctorById(id: string) {
//   return useQuery(api.doctors.getDoctorById, { id });
// }

// export function useCreateDoctor() {
//   return useMutation(api.doctors.createDoctor);
// }