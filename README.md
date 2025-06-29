# Blood Donation Support System - Backend

## 📌 Project Description
**Blood Donation Support System** is a healthcare support platform designed to facilitate blood donation activities at medical facilities. The system manages donors, recipients, blood types, appointments, donation history, and emergency cases.

This repository contains the **backend** source code, developed with **Node.js** and connected to **SQL Server**.

## 👥 User Roles
- **Guest**: Can view public information, articles, blood donation guides, etc.
- **Member**: Registered users who can donate blood or request donations.
- **Staff**: Medical staff managing donation operations.
- **Admin**: System administrators with full access and control.

## ⚙️ Core Functionalities
- Home page with information about medical facilities, blood types, blogs, and shared experiences.
- Register blood group and available donation times.
- Allow users to search for compatible donors/recipients by blood type (whole blood or blood components: red cells, plasma, platelets).
- Search for donors or recipients based on geographical distance.
- Emergency blood request submission and response handling.
- Manage the blood donation process from request to completion, including special or unmatched cases.
- Track available blood units per medical center.
- Send reminders based on appropriate time intervals between donations.
- Manage user profiles and blood donation history.
- Admin dashboard and reports for system monitoring and analytics.

## 🛠️ Technologies Used
- **Backend:** Node.js (Express)
- **Database:** Microsoft SQL Server
- **Frontend (not included in this repo):** React + Vite
- **Auth:** JWT 

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- SQL Server instance running
- .env file configured for DB connection

### Setup Instructions
```bash
1. Clone this repository:
   git clone https://github.com/june4m/BloodDonationSupportSystemBE.git

2. Install dependencies:
   cd BloodDonationSupportSystemBE
   npm install

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add your DB connection string and other configs

4. Run the development server:
   npm run dev
