# 🐾 VetMeds — Pet Health Management Platform

> A full-stack web application that connects pet owners with veterinarians, enabling seamless appointment booking, emergency SOS alerts, AI-powered health assistance, and complete pet profile management.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🐶 **Pet Profiles** | Create and manage detailed health profiles for your pets |
| 📅 **Appointment Booking** | Book appointments with specialized veterinarians and receive PDF receipts |
| 🤖 **PawBot AI** | Gemini-powered AI chatbot for instant pet health guidance |
| 🚨 **Emergency** | Send real-time emergency alerts with location, description, and photos directly to doctors and Animal Helping Ngos  |
| 🗺️ **Interactive Maps** | Select your exact location via an interactive map for emergency precision |
| 📧 **Email Notifications** | Automated email alerts to doctors on new bookings and status updates |
| 🏥 **Doctor Dashboard** | Dedicated portal for vets to manage appointments, prescribe medicines, and generate PDFs |
| 💊 **Digital Prescriptions** | Doctors can prescribe medicines and generate professional PDF prescriptions |
| 🌟 **Kind Soul Points** | Loyalty reward system crediting points for appointments and pet care activities |
| 📊 **SOS History** | Users can track their past emergency alerts; doctors see all incoming cases |

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** — App Router, Server Components, API Routes
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first styling
- **[React Icons](https://react-icons.github.io/react-icons/)** — Icon set
- **[jsPDF](https://github.com/parallax/jsPDF)** — Client-side PDF generation
- **[MapLibre GL](https://maplibre.org/)** — Interactive maps

### Backend & Database
- **[Neon](https://neon.tech/)** — Serverless PostgreSQL database
- **[Drizzle ORM](https://orm.drizzle.team/)** — Type-safe SQL ORM
- **[Nodemailer](https://nodemailer.com/)** — Transactional email (Gmail SMTP)
- **[Cloudinary](https://cloudinary.com/)** — Image upload & storage for SOS photos

### Auth & AI
- **[Clerk](https://clerk.com/)** — Authentication & user management
- **[Google Gemini AI](https://ai.google.dev/)** — AI-powered PawBot chatbot

---
## 👨‍⚕️ Doctor Portal

Doctors log in at `/doctor-login` with their credentials. The portal provides:

- **All Appointments** — View, confirm, complete, or cancel appointments
- **Digital Prescriptions** — Add prescriptions and generate PDF documents
- **Previous Appointments** — Full history with medicine records
- **All Pets** — Browse all registered pet profiles
- **Emergency SOS** — Real-time dashboard with incoming emergency alerts and map links
- **Collected Points** — Track and transfer Kind Soul Points

---

## 🚨 Emergency SOS Flow

1. User triggers SOS from the dashboard
2. User fills in description, uploads a photo, and pins their location on the map
3. Alert is saved to the database and an email with full details (photo, coordinates, Google Maps link) is sent instantly to the on-call doctor
4. Doctor receives the alert in their dashboard and can mark it resolved

---

