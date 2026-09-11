Nestly — Smart Residential Community Management Platform

Nestly is a full-stack residential community management application for residents, administrators, and security teams. It combines a modern React + TypeScript frontend with a Node.js + Express REST API and MySQL database.

Key Features

Resident

Role-based resident workspace

Digital notice board and announcements

Create and track service requests

Create visitor passes

Book community facilities

Create community posts

Participate in events and meetings

Buy / Sell / Rent marketplace

Maintenance payment tracking

Resident directory and emergency contacts

Notifications, profile, and settings

Persistent application data

Admin

Admin dashboard and analytics

Manage society notices

View, assign, and resolve service requests

Review community activity

Manage society-level information

Security

Security dashboard

Visitor verification queue

Verify visitor passes

Maintain entry logs

Monitor visitor activity

Reliability

Form validation

Loading and empty states

Error boundary with recovery

Persistent browser state for supported client-side data

API error handling

Protected role-based actions

Technology Stack

Frontend

React 18

TypeScript

Vite

React Router

Lucide React

CSS with responsive glassmorphism and 3D-inspired UI

Browser localStorage for selected client-side persistence

Backend

Node.js

Express.js

MySQL

mysql2

JWT authentication

bcryptjs

dotenv

CORS

Database

Database name: nestly_community

The database includes tables for users and roles, notices, events and participants, service requests, visitor passes, facilities and bookings, community posts and likes, marketplace listings, maintenance payments, emergency contacts, notifications, and security entry logs.

System Architecture

The application follows a client-server architecture.

flowchart LR
    A[React + TypeScript Frontend] --> B[REST API]
    B --> C[Node.js + Express Backend]
    C --> D[(MySQL Database)]
    A --> E[Browser localStorage]
    C --> F[JWT Authentication]
    A --> G[Resident Workspace]
    A --> H[Admin Workspace]
    A --> I[Security Workspace]

The browser never connects directly to MySQL. Database operations are performed through the REST API exposed by the Express backend.

Application Flow

flowchart TD
    A[Login / Registration] --> B[Authentication]
    B --> C{User Role}
    C -->|Resident| D[Resident Dashboard]
    C -->|Admin| E[Admin Dashboard]
    C -->|Security| F[Security Dashboard]
    D --> G[Community Actions]
    E --> H[Society Administration]
    F --> I[Visitor Verification]
    G --> J[REST API]
    H --> J
    I --> J
    J --> K[Node.js + Express]
    K --> L[(MySQL)]

Main Data Flow

sequenceDiagram
    participant U as User
    participant F as React Frontend
    participant A as Express REST API
    participant D as MySQL Database

    U->>F: Perform an action
    F->>A: Send authenticated API request
    A->>A: Validate request and role
    A->>D: Read / write data
    D-->>A: Return result
    A-->>F: JSON response
    F-->>U: Update interface

Project Structure

nestly/
├── public/
│   ├── community-reference.png
│   └── dashboard-hero.png
├── src/
│   ├── App.tsx
│   ├── App_backup.tsx
│   ├── api.ts
│   ├── main.tsx
│   └── styles.css
├── backend/
│   ├── .env.example
│   ├── README.md
│   ├── package.json
│   ├── package-lock.json
│   ├── schema.sql
│   ├── seed.sql
│   └── server.js
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── vite.config.ts
└── README.md

Prerequisites

Node.js

npm

MySQL Server 8.x

MySQL Workbench (recommended)

Git (optional)

Installation

From the main nestly directory:

npm install

Install backend dependencies:

cd backend
npm install
cd ..

Database Setup

Open MySQL Workbench.

1. Create tables

Execute:

backend/schema.sql

This creates the nestly_community database and required tables.

2. Insert demo data

Execute:

backend/seed.sql

This inserts the initial demo users and sample data.

3. Configure environment variables

Create:

backend/.env

Use backend/.env.example as the template.

Example:

PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nestly_community
JWT_SECRET=your_secure_jwt_secret

Do not commit backend/.env to GitHub. It is excluded by .gitignore.

Running the Application

The frontend and backend run separately during development.

Start the backend

From the backend directory:

node server.js

Backend:

http://localhost:5000

Start the frontend

Open another terminal in the main nestly directory:

npm run dev

Vite will display the local development URL, normally:

http://localhost:5173

Open that URL in your browser.

Demo Accounts

Role

Email

Password

Resident

praveen@nestly.demo

password123

Admin

admin@nestly.demo

password123

Security

security@nestly.demo

password123

These accounts are intended for project demonstration and evaluation.

REST API

Examples of implemented endpoints:

GET    /api/health
POST   /api/auth/register
POST   /api/auth/login

GET    /api/notices
POST   /api/notices

GET    /api/requests
POST   /api/requests
PATCH  /api/requests/:id

GET    /api/visitors
POST   /api/visitors

GET    /api/facilities
GET    /api/bookings
POST   /api/bookings

GET    /api/community
POST   /api/community

GET    /api/marketplace
POST   /api/marketplace
PATCH  /api/marketplace/:id/buy

The complete API implementation is available in:

backend/server.js

Authentication and Authorization

Nestly uses JWT-based authentication for protected API requests.

Supported roles:

Resident — community activities and personal requests

Admin — society administration and request management

Security — visitor verification and security operations

Role-based access is enforced by the backend for protected operations.

Marketplace Workflow

The marketplace supports Buy / Sell / Rent interactions.

A resident can:

View active marketplace listings.

Create a listing.

Open the purchase workflow.

Confirm a demo purchase.

Mark an SQL-backed listing as Sold.

Remove the purchased listing from the active marketplace view.

Users cannot purchase their own listing.

Reliability and Error Handling

The project includes:

Initial loading state

Empty-state screens

Form validation

API error handling

Error boundary recovery screen

Protected API actions

Authentication failure handling

Local persistence fallback

Reset demo data option

Responsive and Visual Design

Nestly uses a modern community-oriented visual design featuring:

Green sustainability-inspired visual language

Glassmorphism panels

3D-inspired cards and controls

Tilted and elevated interface elements

Community-themed imagery

Responsive layouts

Interactive buttons and transitions

Role-specific dashboards

The login experience uses an interactive 3D/glass-style authentication design with role selection.

Limitations

This is a placement evaluation/demo application, so some production features are intentionally simplified:

Authentication credentials are demonstration accounts.

Google login is a demo workflow rather than production OAuth.

Payment processing is a demonstration workflow; no real payment gateway is connected.

Visitor QR scanning is not connected to a physical gate device.

Emergency contacts are demo application data.

Cloud file/image storage is not implemented.

The application is intended for local development and evaluation rather than production deployment.

Future Improvements

Production OAuth / social authentication

Cloud-hosted MySQL database

Real-time and push notifications

Real QR generation and gate scanning

Online maintenance payment gateway

Cloud image and document uploads

Advanced audit logs

More detailed admin analytics

Resident polls and surveys

Automated unit and integration testing

CI/CD pipeline

Docker-based deployment

Production hosting and monitoring

Git Workflow

The project uses Git for version control.

Recommended commit style:

feat: add new community feature
fix: resolve marketplace purchase issue
fix: improve visitor verification workflow
docs: update project documentation
refactor: improve API handling

Keep commit history meaningful instead of using one final commit.

Security Notes

Never commit backend/.env.

Never publish real database passwords or private API keys.

Use strong secrets when deploying outside the demo environment.

The provided demo credentials are for evaluation only.

License

No license is currently specified because this repository is being used as a placement evaluation project.

Author

Nestly — Smart Residential Community Management Platform

Developed as a full-stack placement evaluation project using React, TypeScript, Node.js, Express, and MySQL.