/*
  # MEDIBOT Database Schema

  1. New Tables
    - `users` - Patient and admin user accounts
    - `doctors` - Medical professionals in the system
    - `pharmacies` - Partner pharmacy locations
    - `appointments` - Patient-doctor appointment bookings
    - `vitals` - Patient vital sign measurements
    - `chat_sessions` - AI chat conversation sessions
    - `chat_messages` - Individual messages in chat sessions
    - `medicine_orders` - Pharmacy orders and prescriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Separate access controls for patients, doctors, and admins

  3. Features
    - Real-time vital monitoring
    - Appointment management system
    - AI chat history tracking
    - Medicine ordering system
*/

-- Users table (patients and admins)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    date_of_birth date,
    user_type text DEFAULT 'patient' CHECK (user_type IN ('patient', 'admin')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    specialty text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    license_number text,
    experience text,
    education text,
    about text,
    languages text[] DEFAULT ARRAY['English'],
    availability text[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    consultation_fee integer DEFAULT 150,
    rating decimal(2,1) DEFAULT 4.5,
    total_reviews integer DEFAULT 0,
    image text DEFAULT '/placeholder-user.jpg',
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    address text NOT NULL,
    phone text,
    email text,
    delivery_time text DEFAULT '30-45 mins',
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES users(id) ON DELETE CASCADE,
    patient_name text NOT NULL,
    patient_email text NOT NULL,
    patient_phone text,
    doctor_id uuid REFERENCES doctors(id) ON DELETE SET NULL,
    doctor_name text,
    doctor_email text,
    appointment_date date NOT NULL,
    appointment_time time NOT NULL,
    reason text NOT NULL,
    symptoms text DEFAULT '',
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    consultation_fee integer DEFAULT 0,
    meeting_link text,
    doctor_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Vitals table for storing patient vital signs
CREATE TABLE IF NOT EXISTS vitals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES users(id) ON DELETE CASCADE,
    heart_rate integer,
    spo2 integer,
    temperature decimal(4,1),
    bmi decimal(4,1),
    recorded_at timestamptz DEFAULT now()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES users(id) ON DELETE CASCADE,
    session_start timestamptz DEFAULT now(),
    session_end timestamptz,
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message text NOT NULL,
    sender text NOT NULL CHECK (sender IN ('user', 'bot')),
    severity text CHECK (severity IN ('low', 'medium', 'high')),
    appointment_suggested boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Medicine orders table
CREATE TABLE IF NOT EXISTS medicine_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES users(id) ON DELETE CASCADE,
    pharmacy_id uuid REFERENCES pharmacies(id) ON DELETE SET NULL,
    medicines jsonb NOT NULL,
    total_amount decimal(10,2),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
    delivery_address text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for doctors (public read access)
CREATE POLICY "Anyone can read active doctors"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Doctors can update own data"
  ON doctors
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for pharmacies (public read access)
CREATE POLICY "Anyone can read active pharmacies"
  ON pharmacies
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- RLS Policies for appointments
CREATE POLICY "Users can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id::text OR auth.uid()::text = doctor_id::text);

CREATE POLICY "Users can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = patient_id::text OR auth.uid()::text = doctor_id::text);

-- RLS Policies for vitals
CREATE POLICY "Users can read own vitals"
  ON vitals
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can insert own vitals"
  ON vitals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = patient_id::text);

-- RLS Policies for chat sessions
CREATE POLICY "Users can read own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can create own chat sessions"
  ON chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = patient_id::text);

-- RLS Policies for chat messages
CREATE POLICY "Users can read own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND auth.uid()::text = chat_sessions.patient_id::text
    )
  );

CREATE POLICY "Users can create own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND auth.uid()::text = chat_sessions.patient_id::text
    )
  );

-- RLS Policies for medicine orders
CREATE POLICY "Users can read own medicine orders"
  ON medicine_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

CREATE POLICY "Users can create own medicine orders"
  ON medicine_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = patient_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_recorded_at ON vitals(recorded_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_patient_id ON chat_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_medicine_orders_patient_id ON medicine_orders(patient_id);