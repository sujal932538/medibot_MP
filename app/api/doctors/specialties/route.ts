import { NextResponse } from "next/server"

// Available medical specialties
const specialties = [
  {
    id: "general-medicine",
    name: "General Medicine",
    description: "Primary care and general health consultations",
    icon: "🩺",
    doctorCount: 15
  },
  {
    id: "cardiology",
    name: "Cardiology",
    description: "Heart and cardiovascular system specialists",
    icon: "❤️",
    doctorCount: 8
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    description: "Medical care for infants, children, and adolescents",
    icon: "👶",
    doctorCount: 12
  },
  {
    id: "dermatology",
    name: "Dermatology",
    description: "Skin, hair, and nail conditions",
    icon: "🧴",
    doctorCount: 6
  },
  {
    id: "psychiatry",
    name: "Psychiatry",
    description: "Mental health and behavioral disorders",
    icon: "🧠",
    doctorCount: 10
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    description: "Bone, joint, and muscle conditions",
    icon: "🦴",
    doctorCount: 7
  },
  {
    id: "neurology",
    name: "Neurology",
    description: "Nervous system and brain disorders",
    icon: "🧠",
    doctorCount: 5
  },
  {
    id: "gynecology",
    name: "Gynecology",
    description: "Women's reproductive health",
    icon: "👩‍⚕️",
    doctorCount: 9
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology",
    description: "Eye and vision care",
    icon: "👁️",
    doctorCount: 4
  },
  {
    id: "ent",
    name: "ENT (Otolaryngology)",
    description: "Ear, nose, and throat conditions",
    icon: "👂",
    doctorCount: 6
  }
]

// GET - Fetch all medical specialties
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      specialties,
      total: specialties.length
    })
  } catch (error) {
    console.error("Error fetching specialties:", error)
    return NextResponse.json(
      { error: "Failed to fetch specialties" },
      { status: 500 }
    )
  }
}