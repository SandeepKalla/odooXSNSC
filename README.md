# 🌍 GlobeTrotter  
**Intelligent Travel Planning & Itinerary Management Platform**

GlobeTrotter is a full-stack travel planning application designed to help users **plan, structure, budget, and share multi-day, multi-city trips** with clarity and realism.

The application was built with a strong focus on **production-grade data flows**, **relational integrity**, and **end-to-end functional screens**, strictly adhering to the provided design specifications.

> ⚠️ **Important Note for Reviewers**  
> All features are powered by **real backend APIs and real database interactions**.  
> No UI-only mock flows were used for core functionality — every screen is backed by actual REST endpoints, business logic, and persisted data to demonstrate real-world production readiness.

---

## 📋 Table of Contents

- [Key Highlights](#-key-highlights)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Screens & User Flow](#-screens--user-flow)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Overview](#-api-overview)
- [How It Works](#-how-it-works)
- [Contributors](#-contributors)
- [License](#-license)

---

## ⭐ Key Highlights

- ✅ All screens implemented exactly as per provided designs  
- ✅ No Backend-as-a-Service (BaaS); fully custom backend  
- ✅ PostgreSQL-backed relational data model  
- ✅ Real APIs used instead of UI-only mocks  
- ✅ End-to-end flows fully functional  
- ✅ Production-style validation and data integrity  
- ✅ Community trip sharing and cloning  
- ✅ Budget consistency and itinerary validation  

---

## ✨ Features

### 🔐 Authentication & User Management
- Secure registration and login
- JWT-based authentication
- Protected routes and APIs
- Editable user profile

---

### ✈️ Trip Planning & Management
- Create, edit, and delete trips
- Automatic trip status classification:
  - Upcoming
  - Ongoing
  - Completed
- Public trip publishing with unique shareable URLs

---

### 🧱 Itinerary Builder (Section-Based Planning)
- Structured itinerary sections with:
  - Notes
  - Date ranges
  - Section budgets
- Overlapping date detection
- Activity scheduling inside sections
- Section intelligence inferred from activity types (no extra UI)

---

### 💰 Budget Management
- Trip-level and section-level budgets
- Per-day expense aggregation
- Overbudget detection at day and section level
- Budget consistency across itinerary and calendar views

---

### 🗓 Calendar Validation
- Monthly calendar view of trips
- Visual indicators for:
  - Overbudget days
  - Gaps in itinerary coverage
  - Overlapping sections
- Calendar acts as a **validator**, not just a viewer

---

### 🌐 Community & Sharing
- Public trip listing
- Read-only public trip view
- Copy public trips into your account
- Date-shifted cloning while preserving structure and budgets

---

### 🔍 Search & Discovery
- City search
- Activity search with filters
- Activities linked to cities
- Real-world enrichment via external APIs

---

### 🛠 Admin Dashboard
- System-level metrics
- User and trip statistics
- Popular destinations and activities
- Minimal but functional admin interface

---

## 🌍 Real External APIs (No Mock-Only Data)

To demonstrate real production behavior, GlobeTrotter integrates with **live external APIs**:

- Unsplash API – Destination images  
- OpenWeatherMap – Live weather data  
- OpenTripMap – Real-world attractions & POIs  
- ExchangeRate API – Currency conversion  
- REST Countries API – Country metadata  
- Nominatim (OpenStreetMap) – City geocoding  

All external services are accessed **via backend routes**, keeping the frontend clean and secure.

---

## 🛠 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- CSS (custom styling)

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod validation

---

## 🏗 Architecture Overview

- Frontend: Stateless UI consuming REST APIs  
- Backend: Express REST API with service-layer business logic  
- Database: PostgreSQL with normalized relational schema  
- Authentication: JWT-based middleware  
- External APIs: Server-side integrations only  

---

## 🖥 Screens & User Flow

> 📸 **Screenshots placeholders**  
> Replace the placeholders below with actual screenshots.

### 1️⃣ Login Screen  
<img width="1919" height="872" alt="image" src="https://github.com/user-attachments/assets/e373440f-b323-4c31-a4d8-d1416c43c29b" />


### 2️⃣ Registration Screen  
<img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/882aab72-86e1-4273-a72b-57d19c8818d4" />


### 3️⃣ Dashboard / Home  
<img width="3572" height="2458" alt="localhost_3000_dashboard" src="https://github.com/user-attachments/assets/e0693271-288c-4f00-9253-fcd0574f11bc" />


### 4️⃣ Create Trip  
<img width="1898" height="877" alt="image" src="https://github.com/user-attachments/assets/34baff55-4180-4a64-bfac-00012337a0de" />


### 5️⃣ Build Itinerary  
<img width="1915" height="881" alt="image" src="https://github.com/user-attachments/assets/ed4c5a42-1316-4a90-9f8b-752ddcf7e5ab" />


### 6️⃣ Trip Listing  
📷 _[Insert Trip Listing Screenshot Here]_

### 7️⃣ User Profile  
<img width="1898" height="875" alt="image" src="https://github.com/user-attachments/assets/a5796a86-a783-41a9-8ca6-fefc537f02db" />


### 8️⃣ City & Activity Search  
<img width="1129" height="722" alt="image" src="https://github.com/user-attachments/assets/61ffc51f-306e-4f9d-bd7d-282ffafe1988" />

###  Community Trips  
<img width="1919" height="873" alt="image" src="https://github.com/user-attachments/assets/7d118efd-42fc-4d92-a973-d742dc36da92" />


###  Calendar View  
<img width="1917" height="879" alt="image" src="https://github.com/user-attachments/assets/1b9035b0-1227-4d04-bad3-ed5882dc2681" />


### Admin Dashboard  
<img width="1918" height="874" alt="image" src="https://github.com/user-attachments/assets/15a763a9-c2f5-4df9-8ead-7564735812d5" />


---

## 📁 Project Structure

Refer to the repository for detailed folder and file organization of the frontend and backend services.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 12
- npm

### Clone Repository
```bash
git clone https://github.com/SandeepKalla/odooXSNSC
cd odooxsnsc
