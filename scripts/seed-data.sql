-- Seed data for MEDIBOT platform

-- Insert sample doctors
INSERT INTO doctors (name, specialty, email, phone, license_number, status) VALUES
('Dr. Sarah Johnson', 'General Medicine', 'sarah.johnson@medibot.com', '+1-555-123-4567', 'MD123456', 'active'),
('Dr. Michael Chen', 'Cardiology', 'michael.chen@medibot.com', '+1-555-234-5678', 'MD234567', 'active'),
('Dr. Emily Rodriguez', 'Pediatrics', 'emily.rodriguez@medibot.com', '+1-555-345-6789', 'MD345678', 'active'),
('Dr. David Wilson', 'Dermatology', 'david.wilson@medibot.com', '+1-555-456-7890', 'MD456789', 'active'),
('Dr. Lisa Thompson', 'Psychiatry', 'lisa.thompson@medibot.com', '+1-555-567-8901', 'MD567890', 'active');

-- Insert sample pharmacies
INSERT INTO pharmacies (name, address, phone, email, delivery_time, status) VALUES
('MediCare Pharmacy', '123 Health St, Medical District, City 12345', '+1-555-111-2222', 'orders@medicare-pharmacy.com', '30-45 mins', 'active'),
('QuickMeds Express', '456 Wellness Ave, Downtown, City 12345', '+1-555-333-4444', 'support@quickmeds.com', '20-30 mins', 'active'),
('HealthPlus Drugstore', '789 Care Blvd, Suburb, City 12345', '+1-555-555-6666', 'info@healthplus.com', '45-60 mins', 'active'),
('City Central Pharmacy', '321 Main St, City Center, City 12345', '+1-555-777-8888', 'orders@citycentral.com', '25-35 mins', 'active'),
('Neighborhood Meds', '654 Local Ave, Residential, City 12345', '+1-555-999-0000', 'help@neighborhoodmeds.com', '40-50 mins', 'active');

-- Insert sample admin user
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type) VALUES
('admin@medibot.com', '$2b$10$example_hash_here', 'Admin', 'User', '+1-555-000-0001', 'admin');

-- Insert sample patients
INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, user_type) VALUES
('john.doe@example.com', '$2b$10$example_hash_here', 'John', 'Doe', '+1-555-000-0002', '1990-05-15', 'patient'),
('jane.smith@example.com', '$2b$10$example_hash_here', 'Jane', 'Smith', '+1-555-000-0003', '1985-08-22', 'patient'),
('bob.johnson@example.com', '$2b$10$example_hash_here', 'Bob', 'Johnson', '+1-555-000-0004', '1992-12-10', 'patient');

-- Insert sample appointments
INSERT INTO appointments (patient_id, doctor_id, symptoms, severity, status, appointment_date) VALUES
(1, 1, 'Persistent headache and fatigue for 3 days', 'medium', 'confirmed', '2024-01-22 14:00:00'),
(2, 2, 'Chest pain and shortness of breath', 'high', 'confirmed', '2024-01-22 10:30:00'),
(3, 3, 'Child has fever and cough', 'medium', 'pending', '2024-01-23 16:00:00');

-- Insert sample vital signs
INSERT INTO vitals (patient_id, heart_rate, spo2, temperature, bmi, recorded_at) VALUES
(1, 72, 98, 98.6, 23.5, '2024-01-21 08:00:00'),
(1, 75, 97, 98.4, 23.5, '2024-01-21 12:00:00'),
(1, 70, 99, 98.7, 23.5, '2024-01-21 18:00:00'),
(2, 85, 96, 99.2, 26.8, '2024-01-21 09:00:00'),
(2, 88, 95, 99.5, 26.8, '2024-01-21 15:00:00'),
(3, 68, 99, 97.8, 21.2, '2024-01-21 07:30:00');

-- Insert sample chat sessions
INSERT INTO chat_sessions (patient_id, session_start, status) VALUES
(1, '2024-01-21 10:00:00', 'completed'),
(2, '2024-01-21 14:30:00', 'completed'),
(3, '2024-01-21 16:45:00', 'active');

-- Insert sample chat messages
INSERT INTO chat_messages (session_id, message, sender, severity, appointment_suggested) VALUES
(1, 'I have been having persistent headaches for the past 3 days', 'user', NULL, FALSE),
(1, 'I understand you are experiencing persistent headaches. Can you describe the intensity and any other symptoms?', 'bot', NULL, FALSE),
(1, 'The pain is moderate but constant, and I feel tired all the time', 'user', NULL, FALSE),
(1, 'Based on your symptoms, this could indicate several conditions. I recommend booking an appointment with a doctor for proper evaluation.', 'bot', 'medium', TRUE),
(2, 'I am experiencing chest pain and difficulty breathing', 'user', NULL, FALSE),
(2, 'Chest pain and breathing difficulties are serious symptoms that require immediate medical attention. Please seek emergency care or book an urgent appointment.', 'bot', 'high', TRUE);
