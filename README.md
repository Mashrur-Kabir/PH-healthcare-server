# PH Healthcare - Medical Information System

PH Healthcare is a comprehensive backend infrastructure designed for medical facilities. It manages a multi-tier ecosystem including Doctors, Patients, Admins, Specialties, and Appointments. Built with a focus on scalability and type-safety, it leverages a sophisticated query engine and cloud-based asset management.

---

## 🏗 System Architecture

The project follows a modular architecture, ensuring that each domain (Users, Doctors, Appointments, etc.) is isolated yet interoperable.

- **API Layer:** Express.js with TypeScript for robust routing and type-safe controllers.
- **Database:** PostgreSQL managed via Prisma ORM for relational data integrity.
- **Query Engine:** Custom `QueryBuilder` for advanced searching, multi-level nested filtering, and dynamic pagination.
- **File Management:** Integrated Cloudinary storage with automated categorization (Images, Documents, PDFs).
- **Authentication:** Multi-role JWT-based security (Super Admin, Admin, Doctor, Patient).

---

## 🚀 Core Features

### 🔍 Advanced Search & Filtering

The backend implements a proprietary `QueryBuilder` class that allows for:

- **Deep Nested Search:** Search through relations (e.g., finding a Doctor by their User's email).
- **Flexible Filtering:** Range-based queries (e.g., appointment fees between $50-$100) and multi-select filters.
- **Dynamic Sorting:** Order results by any field or nested relation field.

### 📁 Intelligent Asset Management

All file uploads are handled through a custom middleware pipeline:

- **Buffer Streaming:** Files are streamed directly to Cloudinary, reducing server memory load.
- **Auto-Categorization:** Logic automatically sorts uploads into `/images`, `/pdfs`, or `/documents` folders.
- **Sanitization:** Filenames are automatically cleaned and timestamped to prevent URL breakages and collisions.

### 🩺 Healthcare Specific Workflows

- **Doctor Profiles:** Management of specialties, qualifications, and consultation fees.
- **Appointment Lifecycle:** Booking, payment status tracking, and scheduling logic.
- **Administrative Control:** Dedicated panels for managing medical specialties and user roles.

---

## 🛠 Tech Stack

| Technology            | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| **TypeScript**        | Primary language for type-safety and developer productivity         |
| **Node.js / Express** | Runtime environment and web framework                               |
| **Prisma**            | Modern ORM for database schema management and type-safe queries     |
| **PostgreSQL**        | Relational database for structured healthcare data                  |
| **Cloudinary**        | Cloud-based media management for medical reports and profile images |
| **Multer**            | Middleware for handling `multipart/form-data`                       |
| **Zod**               | Schema-based validation for request bodies                          |

---

## ⚙️ Configuration

To run this project locally, create a `.env` file in the root directory and provide the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ph_healthcare"
PORT=5000

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

```

---

## 🏃 Getting Started

1. **Clone the repository:**

```bash
git clone https://github.com/your-repo/ph-healthcare-server.git

```

2. **Install dependencies:**

```bash
npm install

```

3. **Run Prisma Migrations:**

```bash
npx prisma migrate dev

```

4. **Start the development server:**

```bash
npm run dev

```
