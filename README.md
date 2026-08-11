# 🛠️ LocalService - Local Service Management & Booking Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-v5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

An end-to-end, enterprise-ready full-stack web platform connecting local service providers (plumbers, electricians, home cleaning, technicians, tutors, etc.) directly with customers. Features multi-role role-based access control (RBAC), real-time notifications/messaging via Socket.io, online payment processing via Razorpay, dynamic provider dashboards, Cloudinary media management, and comprehensive admin system metrics.

---

## 📋 Table of Contents

- [Features](#-features)
  - [Customer Portal](#-customer-portal)
  - [Service Provider Portal](#-service-provider-portal)
  - [Admin Management Portal](#-admin-management-portal)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Local Installation (Standard)](#local-installation-standard)
  - [Local Setup with Docker Compose](#local-setup-with-docker-compose)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Scripts Reference](#-scripts-reference)
- [Deployment Guide](#-deployment-guide)
  - [Deploying on Vercel](#deploying-on-vercel)
  - [Production Docker Build](#production-docker-build)
- [License](#-license)

---

## ✨ Features

### 👤 Customer Portal
- **Service Discovery & Search**: Filter local services by category, location, rating, and price.
- **Service Booking & Scheduling**: Seamless appointment scheduling with custom dates and service requirement notes.
- **Liked / Favorite Services**: Save frequently accessed local services to a personal wishlist.
- **Secure Online Payments**: Integrated Razorpay payment gateway supporting cards, UPI, net banking, and digital wallets.
- **Order & Booking History**: Real-time status updates (Pending, Confirmed, Completed, Cancelled).
- **Reviews & Ratings**: Post ratings and detailed feedback for completed service bookings.

### 🛠️ Service Provider Portal
- **Provider Onboarding & Profile**: Customized business profile with bio, skills, service area, contact details, and portfolio images.
- **Service Management**: Create, update, toggle availability, and set pricing for offered services.
- **Booking Management**: Accept/Decline incoming service requests and update service fulfillment status.
- **Customer Directory**: View customer service request history and customer interactions.
- **Analytics & Earnings Dashboard**: Track total earnings, booking completion rates, and client reviews.

### 🛡️ Admin Management Portal
- **Platform Analytics**: High-level overview of total users, active providers, booking volumes, and revenue stats.
- **User & Provider Moderation**: Verify service provider credentials, approve provider listings, or restrict policy-violating accounts.
- **Booking & Payment Audit**: Complete oversight of platform bookings, transaction statuses, and refund requests.
- **Category & Taxonomy Control**: Dynamically add, edit, or disable service categories and sub-categories.
- **Review Moderation**: Monitor user ratings and flag fraudulent or inappropriate reviews.

---

## 🏗️ Tech Stack & Architecture

### **Frontend**
- **Framework**: React 19 with Vite & TypeScript
- **Styling**: Tailwind CSS v4, Base UI / Shadcn UI components, Lucide Icons, Animate.css
- **State Management**: Redux Toolkit & React-Redux
- **Forms & Validation**: React Hook Form with Zod schemas
- **Networking**: Axios & Socket.io-client
- **Routing**: React Router v8

### **Backend**
- **Runtime**: Node.js (v18+) with Express 5 & TypeScript
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs hashing, cookie-parser
- **File & Media Storage**: Cloudinary API with Multer middleware
- **Payment Processing**: Razorpay API
- **Real-Time Layer**: Socket.io
- **Logging & Utilities**: Morgan logger, dotenv

### **DevOps & Infrastructure**
- **Containerization**: Docker & Docker Compose (`docker-compose.dev.yml`)
- **Deployment Platform**: Vercel (Configured with root monorepo rewrites via `vercel.json`)

---

## 📁 Project Directory Structure

```text
LocalServiceManagement/
├── backend/                  # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/           # Cloudinary, Razorpay, DB configs
│   │   ├── controllers/      # Route logic for Auth, Booking, Payment, Admin, etc.
│   │   ├── middleware/       # JWT Auth, Upload, Role verification middleware
│   │   ├── models/           # Mongoose schemas (User, Service, Booking, Payment, etc.)
│   │   ├── routes/           # Express endpoint routers
│   │   ├── services/         # Business logic & external API integrations
│   │   ├── utils/            # Database connection, helpers, constants
│   │   ├── app.ts            # Express application setup
│   │   └── server.ts         # Server entry point & DB initialization
│   ├── Dockerfile.dev        # Development Dockerfile for backend
│   ├── Dockerfile.prod       # Production Dockerfile for backend
│   └── package.json
│
├── frontend/                 # React 19 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components & Shadcn elements
│   │   ├── pages/            # View components (Auth, Dashboard, Services, Admin)
│   │   ├── redux/            # Redux slices and store configuration
│   │   ├── services/         # Axios API clients & Socket connection handlers
│   │   ├── types/            # TypeScript interfaces & type definitions
│   │   ├── App.tsx           # Application route definitions
│   │   └── main.tsx          # React entry point
│   ├── Dockerfile.dev        # Development Dockerfile for frontend
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── docker-compose.dev.yml    # Docker Compose setup for local DB, backend & frontend
├── vercel.json               # Monorepo deployment rules for Vercel
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- **Docker & Docker Desktop** *(Optional, if running via containers)*

---

### Environment Configuration

#### 1. Backend Environment Setup
Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_super_secret_key

# Database Connection
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/localservice?retryWrites=true&w=majority

# Cloudinary Setup (Media Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Setup (Payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### 2. Frontend Environment Setup
Create a `.env` file in the `frontend/` directory:

```env
# API Base Endpoint
VITE_API_URL=http://localhost:5000/api
```

---

### Local Installation (Standard)

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Ravi024tiwari/LocalServiceManagement.git
cd LocalServiceManagement
```

#### Step 2: Install & Run Backend
```bash
cd backend
npm install
npm run dev
```
> The API server will start on `http://localhost:5000`

#### Step 3: Install & Run Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
> The web app will open at `http://localhost:5173`

---

### Local Setup with Docker Compose

If you prefer running the full stack (MongoDB + Express Backend + React Frontend) in isolated Docker containers:

```bash
# Start all services in development mode
docker compose -f docker-compose.dev.yml up --build

# Stop container services
docker compose -f docker-compose.dev.yml down
```

Services will be accessible at:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **MongoDB**: `localhost:27017`

---

## 📡 API Endpoints Overview

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Register new Customer or Service Provider |
| **Auth** | `/api/auth/login` | `POST` | Authenticate user & issue JWT |
| **User** | `/api/user/profile` | `GET` / `PUT` | Fetch or update user profile details |
| **Services** | `/api/service` | `GET` / `POST` | List all available services or post new service |
| **Services** | `/api/service/:id` | `GET` / `PUT` / `DELETE` | View, modify, or remove service listing |
| **Bookings** | `/api/booking` | `GET` / `POST` | View user bookings or create a new booking |
| **Bookings** | `/api/booking/:id` | `PATCH` | Update booking status (confirm/cancel/complete) |
| **Payments** | `/api/payment/create-order` | `POST` | Initialize Razorpay payment order |
| **Payments** | `/api/payment/verify` | `POST` | Verify Razorpay payment signature |
| **Reviews** | `/api/reviews` | `GET` / `POST` | Fetch reviews or post review for service |
| **Provider** | `/api/provider-profile` | `GET` / `PUT` | Manage provider public profile & stats |
| **Admin** | `/api/admin/dashboard` | `GET` | Retrieve overall platform metrics & charts |
| **Admin** | `/api/admin/providers` | `GET` / `PATCH` | Audit and manage provider statuses |
| **Admin** | `/api/admin/categories` | `GET` / `POST` | Manage platform service categories |

---

## 📜 Scripts Reference

### Backend Scripts (`/backend`)
- `npm run dev`: Launch backend server with automatic reload via `tsx watch`.
- `npm run build`: Compile TypeScript code into executable JavaScript in `/dist`.
- `npm start`: Execute production JavaScript bundle from `/dist/server.js`.

### Frontend Scripts (`/frontend`)
- `npm run dev`: Run Vite development server with hot module replacement (HMR).
- `npm run build`: Type-check TypeScript and bundle production web app.
- `npm run preview`: Serve production build locally for verification.
- `npm run lint`: Run ESLint analysis across frontend files.

---

## 🌐 Deployment Guide

### Deploying on Vercel

This repository comes pre-configured with a root `vercel.json` file designed for seamless monorepo deployment on [Vercel](https://vercel.com/):

1. Import the repository into your Vercel Dashboard.
2. Ensure Vercel detects both `frontend` (Vite) and `backend` (Serverless Function / Express API).
3. Set the Environment Variables under **Project Settings -> Environment Variables**:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
4. Deploy! Rewrites defined in `vercel.json` automatically route `/api/*` requests to backend handlers and `/*` requests to the frontend UI.

### Production Docker Build

To package backend and frontend as production Docker images:

```bash
# Build Backend Production Image
docker build -f backend/Dockerfile.prod -t localservice-backend ./backend

# Build Frontend Production Image
docker build -f frontend/Dockerfile.dev -t localservice-frontend ./frontend
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/Ravi024tiwari/LocalServiceManagement/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p center>
  Made with ❤️ by <a href="https://github.com/Ravi024tiwari">Ravi Tiwari</a>
</p>
