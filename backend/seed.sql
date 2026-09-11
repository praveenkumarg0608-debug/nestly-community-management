USE nestly_community;

INSERT INTO users (full_name,email,phone,password_hash,role,apartment_no) VALUES
('Praveen Kumar','praveen@nestly.demo','9876543210','$2b$10$abcdefghijklmnopqrstuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu','Resident','A-204'),
('Nestly Admin','admin@nestly.demo','9876500000','$2b$10$abcdefghijklmnopqrstuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu','Admin','Office'),
('Security Desk','security@nestly.demo','9876511111','$2b$10$abcdefghijklmnopqrstuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu','Security','Gate 01');

INSERT INTO facilities (name,description,capacity,hourly_rate) VALUES
('Clubhouse','Community hall for meetings and celebrations',80,500),
('Swimming Pool','Residents-only pool',30,0),
('Gym','Fitness centre',25,0),
('Tennis Court','Outdoor court',4,100);

INSERT INTO emergency_contacts (name,service_type,phone) VALUES
('Security Desk','Security','9876511111'),
('Ambulance','Medical Emergency','108'),
('Fire & Rescue','Fire Emergency','101'),
('Police','Police Emergency','100');

INSERT INTO notices (title,description,category,priority,created_by) VALUES
('Water Tank Cleaning','Overhead tank cleaning will be completed this Sunday morning.','Maintenance','Important',2),
('Community Meetup','Monthly residents meetup at the clubhouse this weekend.','Community','Normal',2);

INSERT INTO events (title,description,event_date,event_time,location,created_by) VALUES
('Green Weekend','Tree planting and neighbourhood clean-up drive.','2026-09-19','08:00:00','Central Garden',2),
('Residents Meetup','Monthly community discussion and updates.','2026-09-20','18:00:00','Clubhouse',2);

INSERT INTO maintenance_payments (user_id,billing_month,amount,due_date,status) VALUES
(1,'2026-09-01',2500,'2026-09-10','Pending');
