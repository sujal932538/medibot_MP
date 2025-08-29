# MEDIBOT - AI Health Companion

A comprehensive healthcare platform that combines AI-powered symptom analysis with real doctor consultations, vital monitoring, and pharmacy services.

## Features

- **AI Health Assistant**: Chat with MEDIBOT for symptom analysis and health guidance
- **Doctor Consultations**: Book appointments with qualified medical professionals
- **Real-time Vital Monitoring**: Track heart rate, SpO2, temperature, and BMI
- **Pharmacy Integration**: Order medicines from partner pharmacies
- **Video Consultations**: Vonage-powered video calls between patients and doctors
- **Role-based Authentication**: Clerk-powered auth for patients, doctors, and administrators

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS  
- **Backend**: Next.js API Routes, Convex
- **Database**: Convex (Real-time database)
- **Authentication**: Clerk
- **Video Calls**: Vonage Video API
- **AI**: Google Gemini API for health consultations
- **UI Components**: shadcn/ui, Radix UI
- **IoT Integration**: ESP32 for vital signs monitoring

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Clerk account
- Convex account
- Vonage account (for video calls)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local` and fill in your API keys
   - Get Clerk keys from https://clerk.com
   - Get Convex URL from https://convex.dev
   - Get Vonage keys from https://vonage.com

4. Set up Convex:
   ```bash
   npx convex dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Database Schema

The Convex database includes:

- **users**: Patient and admin accounts (Clerk integration)
- **doctors**: Medical professional profiles
- **pharmacies**: Partner pharmacy locations
- **appointments**: Appointment bookings and management
- **vitals**: Real-time vital sign data
- **chatSessions**: AI conversation sessions
- **chatMessages**: Individual chat messages
- **medicineOrders**: Pharmacy orders

### ESP32 Integration

Send vital signs data to the API endpoint:
```
POST /api/esp32/vitals
Content-Type: application/json

{
  "deviceId": "esp32_001",
  "patientId": "user_clerk_id",
  "heartRate": 72,
  "spO2": 98,
  "temperature": 98.6,
  "bmi": 23.5
}
```
### Video Consultations

Video calls are powered by Vonage Video API:
- Automatic session creation for approved appointments
- Real-time video/audio communication
- Screen sharing and chat features
- Call recording for medical records

## API Endpoints

### ESP32 Integration
- `POST /api/esp32/vitals` - Receive vitals from ESP32 device
- `GET /api/esp32/vitals` - Get device status and latest vitals

### Video Calls
- `POST /api/vonage/session` - Create video session
- `GET /api/vonage/session` - Get session details

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user management webhook

### Legacy API (Still Available)
- `POST /api/chat` - AI health consultation
- `POST /api/appointments` - Create appointment
- `POST /api/notifications/email` - Send email notifications

## Features in Detail

### AI Health Assistant
- Powered by Google Gemini API
- Analyzes symptoms and provides health guidance
- Determines severity levels (low, medium, high)
- Suggests when to book doctor appointments
- Maintains conversation history

### Authentication & Authorization
- Clerk-powered authentication
- Role-based access control (Patient, Doctor, Admin)
- Secure user management and session handling

### Appointment & Video System
- Real-time booking with available doctors
- Email notifications to doctors and patients
- Vonage Video API integration for consultations
- Appointment status tracking
- Automatic video session creation

### Vital Monitoring
- Real-time data from ESP32 IoT devices
- Heart rate, SpO2, temperature, BMI tracking
- Historical data visualization
- Automatic alerts for abnormal readings
- RESTful API for device integration

### Pharmacy System
- Partner pharmacy management
- Medicine inventory and ordering
- Delivery tracking and notifications
- **Patients**: Chat with AI, book appointments, view vitals
- **Doctors**: Manage appointments, approve/reject requests, conduct consultations
- **Admins**: Manage doctors, pharmacies, view analytics

## Security

- Clerk authentication with role-based access
- Convex real-time database with built-in security
- HIPAA-compliant data handling
- Secure API endpoints with proper validation
- End-to-end encrypted video calls

## Deployment

The application can be deployed to any platform that supports Next.js:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

3. Set up environment variables in your deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.