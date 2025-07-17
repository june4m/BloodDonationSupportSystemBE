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

```
src/
├── constant/       # App-wide constants
├── controller/     # Route handlers
├── middleware/     # Middleware functions
├── models/         # Request/response schemas, database models
├── repository/     # DB interaction logic
├── routers/        # Express route definitions
├── services/       # Business logic
├── utils/          # Helper utilities
└── index.ts        # App entry point
```

## 🛠 Environment Variables (.env)

Create a `.env` file in the root directory with the following variables:

```env
## 🛠 Environment Variables (.env)

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=BloodDonationSupportSystem
DB_SERVER=localhost
DB_PORT=1433

# JWT Secrets
JWT_SECRET=your_base_jwt_secret
JWT_SECRET_ACCESS_TOKEN=your_access_token_secret
JWT_SECRET_REFRESH_TOKEN=your_refresh_token_secret
JWT_SECRET_EMAIL_VERIFY_TOKEN=your_email_verify_secret
JWT_SECRET_FORGOT_PASSWORD_TOKEN=your_forgot_password_secret

# Token Expiration Settings
ACCESS_TOKEN_EXPIRE_IN=15m
REFRESH_TOKEN_EXPIRE_IN=100d
EMAIL_VERIFY_TOKEN_EXPIRE_IN=7d
FORGOT_PASSWORD_TOKEN_EXPIRE_IN=7d

# Email Configuration (for Nodemailer)
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_app_password

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
