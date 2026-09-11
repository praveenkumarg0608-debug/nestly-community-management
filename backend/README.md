# Nestly SQL Backend

This backend uses **MySQL + Node.js + Express**. The React frontend should communicate with it through REST APIs; the browser must not connect directly to MySQL.

## 1. Create the database

Open MySQL Workbench or MySQL Command Line and run:

```sql
SOURCE backend/schema.sql;
SOURCE backend/seed.sql;
```

## 2. Configure the server

Copy `.env.example` to `.env` and set your MySQL password.

## 3. Install and run

```powershell
cd backend
npm install
npm run dev
```

Backend URL: `http://localhost:5000`

Health check: `http://localhost:5000/api/health`

## Main API modules

- `/api/auth` — registration and login
- `/api/notices` — announcements
- `/api/requests` — service requests
- `/api/visitors` — visitor passes and verification
- `/api/facilities` — facilities
- `/api/bookings` — facility bookings
- `/api/marketplace` — buy/sell/rent listings
- `/api/maintenance` — maintenance payment records
- `/api/emergency-contacts` — emergency contacts
- `/api/entry-logs` — security gate activity

## Important

Passwords are stored as bcrypt hashes. JWT is used for API authentication. For a real deployment, use HTTPS, a strong secret, database backups, validation/rate limiting, and proper payment-gateway integration.
