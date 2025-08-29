/*
  # Seed Initial Data for MEDIBOT

  1. Sample Data
    - Doctors with various specialties
    - Pharmacies in different locations
    - Sample users for testing

  2. Test Accounts
    - Admin user for system management
    - Sample patients for testing
*/

-- Insert sample doctors
INSERT INTO doctors (name, specialty, email, phone, license_number, experience, education, about, languages, availability, consultation_fee, rating, total_reviews, status) VALUES
('Dr. Sarah Johnson', 'General Medicine', 'sarah.johnson@medibot.com', '+1 (555) 123-4567', 'MD123456', '8 years', 'MD from Harvard Medical School', 'Dr. Sarah Johnson is a dedicated general practitioner with over 8 years of experience in primary care. She specializes in preventive medicine, chronic disease management, and patient education.', ARRAY['English', 'Spanish'], ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 150, 4.8, 245, 'active'),

('Dr. Michael Chen', 'Cardiology', 'michael.chen@medibot.com', '+1 (555) 234-5678', 'MD234567', '12 years', 'MD from Johns Hopkins University', 'Dr. Michael Chen is a board-certified cardiologist with extensive experience in treating heart conditions. He specializes in interventional cardiology and heart disease prevention.', ARRAY['English', 'Mandarin'], ARRAY['Monday', 'Wednesday', 'Friday'], 250, 4.9, 189, 'active'),

('Dr. Emily Rodriguez', 'Pediatrics', 'emily.rodriguez@medibot.com', '+1 (555) 345-6789', 'MD345678', '10 years', 'MD from Stanford University', 'Dr. Emily Rodriguez is a compassionate pediatrician who has been caring for children and adolescents for over 10 years. She specializes in developmental pediatrics and childhood immunizations.', ARRAY['English', 'Spanish'], ARRAY['Tuesday', 'Thursday', 'Saturday'], 180, 4.7, 156, 'active'),

('Dr. David Wilson', 'Dermatology', 'david.wilson@medibot.com', '+1 (555) 456-7890', 'MD456789', '15 years', 'MD from UCLA Medical School', 'Dr. David Wilson is a renowned dermatologist with 15 years of experience in treating skin conditions. He specializes in medical dermatology and skin cancer detection.', ARRAY['English'], ARRAY['Monday', 'Tuesday', 'Thursday', 'Friday'], 200, 4.6, 203, 'active'),

('Dr. Lisa Thompson', 'Psychiatry', 'lisa.thompson@medibot.com', '+1 (555) 567-8901', 'MD567890', '9 years', 'MD from Yale University', 'Dr. Lisa Thompson is a compassionate psychiatrist specializing in anxiety disorders, depression, and cognitive behavioral therapy.', ARRAY['English', 'French'], ARRAY['Monday', 'Wednesday', 'Thursday', 'Friday'], 220, 4.8, 167, 'active');

-- Insert sample pharmacies
INSERT INTO pharmacies (name, address, phone, email, delivery_time, status) VALUES
('MediCare Pharmacy', '123 Health St, Medical District', '+1 (555) 111-2222', 'orders@medicare-pharmacy.com', '30-45 mins', 'active'),
('QuickMeds Express', '456 Wellness Ave, Downtown', '+1 (555) 333-4444', 'support@quickmeds.com', '20-30 mins', 'active'),
('HealthPlus Drugstore', '789 Care Blvd, Suburb', '+1 (555) 555-6666', 'info@healthplus.com', '45-60 mins', 'active'),
('City Central Pharmacy', '321 Main St, City Center', '+1 (555) 777-8888', 'orders@citycentral.com', '25-35 mins', 'active'),
('Neighborhood Meds', '654 Local Ave, Residential', '+1 (555) 999-0000', 'help@neighborhoodmeds.com', '40-50 mins', 'active');