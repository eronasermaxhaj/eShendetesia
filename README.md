# eShendetesia - Sistemi i Integruar i Shëndetësisë

**eShendetesia** is a web-based platform designed to simulate a comprehensive national health system. It provides distinct portals for Patients, Doctors, and Medical Staff to manage appointments, medical records, and health services efficiently.

## 🚀 Key Features

### 👤 **Patient Portal**

- **Dashboard**: Quick access to health services and notifications.
- **Appointments**: Schedule, reschedule, or cancel appointments with ease.
- **History**: View past medical visits and diagnoses.
- **Health Tips**: Access curated health advice and nutritional information.

### 👨‍⚕️ **Doctor Portal**

- **Dashboard**: Overview of daily schedules and patient stats.
- **Appointment Management**: View and complete scheduled appointments.
- **Medical Orders**: Create prescriptions, referrals, and lab requests.
- **Patient Search**: Search and view patient medical histories.

### 🏥 **Medical Staff Portal**

- **Check-in System**: Manage patient arrivals and waiting rooms.
- **Administrative Tools**: Handle offline bookings and patient registrations.
- **Queue Management**: Monitor patient flow in real-time.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Framework**: React (for Symptom Checker component)
- **Persistence**: `localStorage` (Simulates a backend database)
- **Icons**: FontAwesome 6

---

## ⚛️ React Application (Symptom Checker)

The project includes a React-based **Symptom Checker** located in the `react-app/` directory.

### Quick Start for React App

1. Open a terminal in the root directory.
2. Navigate to the react app: `cd react-app`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. The React app will run at `http://localhost:5173` (or similar).

---

## 🏁 Getting Started

This project is a static web application and requires no build process (except for the React component).

### Prerequisites

- A modern web browser (Chrome, Edge, Firefox, etc.).

### Installation & Running

1. Clone or download the repository.
2. Navigate to the project folder.
3. Open `index.html` in your browser to see the landing page.
4. To log in, click **"Kyçuni"** or navigate directly to `html/auth/login.html`.

---

## 🔐 Test Credentials

Use the following default accounts to explore the different roles within the system:

| Role | Personal ID (User) | Password | Description |
|------|--------------------|----------|-------------|
| **Patient** | `1111111111` | `Patient1!` | Patient Account (Liridon Krasniqi). |
| **Doctor** | `2222222222` | `Doctor1!` | Cardiologist Account (Dr. Venera Mustafa). |
| **Staff** | `3333333333` | `Staff12!` | Admin/Staff Account (Fatmir Sejdiu). |

> **Note**: Data is stored in your browser's Local Storage. clearing your cache will reset the "database" to its default state (as defined in `js/auth.js`).

---

## 📂 Project Structure

- `html/` - Contains all page views organized by role (patient, doctor, medical-staff, auth).
- `css/` - Stylesheets for layout, components, and responsive design.
- `js/` - Logic for authentication, dashboards, and data management.
- `img/` - Static assets and images.
- `data/` - JSON data files (e.g., daily tips).

---

## 📝 License

This project is created for educational and demonstration purposes.
