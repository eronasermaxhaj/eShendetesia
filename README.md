# eShendetesia - Sistemi i Integruar i Shëndetësisë

#### Video Demo: https://www.youtube.com/watch?v=wwyI5zLw6Gs

---

## Overview

**eShendetesia** is a comprehensive, web-based simulation of a national integrated health information system designed for the Republic of Kosovo. This platform serves as a centralized hub connecting three primary stakeholders in the healthcare ecosystem: **Patients**, **Doctors**, and **Medical Staff**. The project aims to digitize and streamline traditional healthcare processes such as appointment scheduling, medical record management, and patient intake workflows.

Built as a Single Page Application (SPA) simulation using vanilla JavaScript, HTML5, and CSS3, **eShendetesia** demonstrates a robust frontend architecture without backend dependencies, utilizing the browser's `localStorage` to persist data across sessions. This design choice allows for a seamless, persistent user experience that mimics a full-stack application, complete with authentication, role-based access control (RBAC), and dynamic data manipulation.

Additionally, the project integrates a modern **React-based Symptom Tracker** component, showcasing not only core web technologies but also the ability to integrate modern frameworks into a larger static site architecture. This hybrid approach highlights flexibility in frontend development.

---

## Demo & Access

To explore the application, you can log in using one of the pre-configured test accounts. Each role offers a distinct perspective and feature set.

| Role | User ID | Password | Description |
|------|---------|----------|-------------|
| **Patient** | `1111111111` | `Patient1!` | Allows booking appointments, viewing medical history, and tracking symptoms. |
| **Doctor** | `2222222222` | `Doctor1!` | Allows managing daily schedules, searching for patients, and issuing medical reports. |
| **Staff** | `3333333333` | `Staff12!` | Administrative view for checking patients in/out and managing queue flow. |

> **Note**: If you wish to reset the application state (clear all appointments and custom data), you can navigate to `html/reset-data.html` and click "Reset System Data".

---

## Key Features & Functionality

### 1. Patient Portal

The patient portal empowers users to take control of their health journey with self-service tools.

* **Interactive Dashboard**: The `patient-dashboard.html` serves as the command center. Upon login, the system loads dynamic "Health Tips" from a simulated JSON API, providing personalized content. It also renders a "Medical Reports" grid, showing the user's recent activity.
* **Smart Appointment Scheduling**: The `patient-appointment.html` page features a sophisticated booking engine:
  * **Date & Time Logic**: Users can only book appointments up to 2 months in advance.
  * **Conflict Detection**: The JavaScript logic (`js/patient-appointment.js`) automatically disables time slots that are already booked by other patients for the selected doctor or resource (e.g., MRI machine).
  * **Dynamic Dropdowns**: Selecting a "General Checkup" reveals a doctor selector, while selecting a "Technical Procedure" (like X-Ray) hides it, simplifying the form.
* **Symptom Tracker (React)**: Located deeply within the patient experience, this module (`html/patient/symptoms/index.html`) is a full React application. It uses simulated routing to allow users to "Go Back" to the main dashboard, effectively bridging the React app with the static HTML pages.

### 2. Doctor Portal

Designed for clinical efficiency, this portal focuses on patient data and schedule management.

* **Daily Schedule View**: On `doctor-dashboard.html`, the system filters the global appointment list to show *only* the appointments assigned to the logged-in doctor. It organizes them chronologically.
* **Patient Search & History**: The `manage-patients.html` page implements a search algorithm that filters the user database. Clicking a patient reveals their entire medical history, pulled from the centralized 'orders' and 'appointments' storage.

### 3. Medical Staff Portal

The administrative backbone of the clinic, focused on high-level flow management.

* **Queue Management**: The `staff-dashboard.html` uses a Kanban-style approach (implied via status pills). Staff can see patients with status `scheduled` and mark them as `arrived`.
* **Check-in Workflow**: When a patient arrives, staff click "Check-in", which updates the appointment status in real-time. This change is immediately reflected on the doctor's dashboard (if they were to refresh), simulating a real-time network.

---

## 🛠️ Technical Architecture & Implementation

### Frontend-Only "Backend" (LocalStorage Strategy)

To ensure the application runs identically to a full-stack app without requiring a server setup, I implemented a data persistence layer using `localStorage`.

* **`AuthService` (`js/auth.js`)**: This singleton object acts as the security guard. It handles:
  * **Session Management**: Stores the `currentUser` object (minus the password) in storage.
  * **Route Protection**: Automatically checks `window.location.path`. If a user tries to access `/doctor/` without the `doctor` role, they are instantly redirected to login.
  * **Data Seeding**: On the first run, it checks if `eShendetesia_users` exists. If not, it populates it with the default array of users.

* **Data Schemas**:
  * **User Object**: `{ id, password, role, name, email, specialization? }`
  * **Appointment Object**: `{ id, patientId, doctorId, date (ISO string), status, type }`
  * **Symptoms (React)**: `{ id, symptom, severity, date, notes }`

### React Integration

The project demonstrates a hybrid architecture where a modern React app lives inside a traditional Multi-Page Application (MPA).

* **Build Process**: The React app resides in `react-app/`. It is built using **Vite**. The build command `npm run build` generates optimized static assets (JS/CSS) into `react-app/dist`.
* **Deployment**: These assets are then manually deployed to `html/patient/symptoms/`, allowing the main application to link to it seamlessly.
* **State Sharing**: The React app reads the `eShendetesia_currentUser` from `localStorage`, allowing it to greet the patient by name even though it's a separate "app".

### UI/UX Design System

The visual identity is consistent across all pages, managed by a structured CSS approach.

* **CSS Variables**: Files like `css/Patient/patient-dashboard.css` utilize simulation of variables (and consistent hex codes) for the primary brand color (`#05468c` - Ministry Blue) and secondary accents.
* **Responsive Design**: All layouts use Flexbox and Grid. Media queries (`@media (max-width: 768px)`) ensure that dashboards stack vertically on mobile devices, and navigation bars collapse gracefully.
* **Feedback Loops**: Interactive elements provide hover states (darkening buttons), and form inputs show visual validation states (red borders for errors).

---

## Detailed File Structure

```text
eShendetesia/
├── html/                           # View Layer
│   ├── auth/                       # Authentication Pages
│   │   ├── login.html              # Entry point
│   │   └── register.html           # New user sign-up
│   ├── patient/                    # Patient-Specific Views
│   │   ├── patient-dashboard.html  # Main hub
│   │   ├── patient-appointment.html# Booking logic
│   │   └── symptoms/               # React App Build Destination
│   ├── doctor/                     # Doctor Views
│   └── medical-staff/              # Staff Views
├── css/                            # Styling Layer (Modular per feature)
├── js/                             # Logic Layer
│   ├── auth.js                     # Security & User Management
│   ├── patient-appointment.js      # Booking Algorithm
│   └── ...                         # Feature-specific scripts
├── react-app/                      # React Source Code
│   ├── src/                        # Components & Hooks
│   └── vite.config.js              # Build Configuration
└── README.md                       # Documentation
```

---

## Future Improvements

While accurate for a simulation, a production release would require:

1. **Backend Migration**: Moving `localStorage` logic to a Node.js/Python API with a SQL database.
2. **Security**: Implementing JWT (JSON Web Tokens) for real session security instead of storing plain user objects.
3. **Real-time Sockets**: Using Socket.io to update the Doctor's dashboard the instant a Staff member checks a patient in, without refreshing.

---

## License

This project is created for educational and demonstration purposes.
