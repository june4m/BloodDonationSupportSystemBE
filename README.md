# 🩸 Blood Donation Support System – Backend

This repository contains the **backend** of the **Blood Donation Support System**, a web-based platform designed to manage and support blood donation activities at a healthcare facility.

> ⚠️ **Note:** The frontend (built with **React + Vite**) is located in a **separate repository** and is not included here.

---

## 📌 Overview

The backend exposes RESTful APIs that support:

- Blood donation registration & appointment scheduling
- Blood type/component matching & emergency donation support
- Blood inventory tracking
- Email notification system
- Role-based access (Guest, Member, Staff, Admin)
- JWT-based authentication and authorization

---

## 👥 User Roles

- **Guest** – View public information, register as donor
- **Member** – Manage own profile, donation history, and availability
- **Staff** – Handle appointment requests, manage inventory
- **Admin** – Access system reports, analytics, and manage users

---

## 🛠 Tech Stack

| Layer           | Technology              |
|------------------|--------------------------|
| Language         | TypeScript               |
| Runtime          | Node.js                  |
| Framework        | Express.js               |
| Database         | SQL Server               |
| Authentication   | JSON Web Token (JWT)     |
| Email Service    | Nodemailer               |
| Environment Vars | dotenv                   |

---

## 📁 Project Structure

src/
├── constant/ # App-wide constants
├── controller/ # Route handlers
├── middleware/ # Middleware functions 
├── models/ # Request/response schemas, database models
├── repository/ # DB interaction logic
├── routers/ # Express route definitions
├── services/ # Business logic 
├── utils/ # Helper utilities 
├── index.ts # App entry point

---

## 🛠 Environment Variables (.env)

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000

# Database
DB_HOST=your_sql_server_host
DB_USER=your_sql_user
DB_PASSWORD=your_password
DB_NAME=BloodDonationDB

# JWT
ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRE_IN=1h

# Email Service (Nodemailer)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

🚀 Getting Started
1. Clone the repository
bash
Copy
Edit
git clone https://github.com/june4m/BloodDonationSupportSystemBE.git
cd BloodDonationSupportSystemBE
2. Install dependencies
bash
Copy
Edit
npm install
3. Start the server (in development mode)
bash
Copy
Edit
npm run dev
