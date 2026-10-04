# Atelier - Sustainable Second-Hand Fashion Platform

![Atelier Banner](https://img.shields.io/badge/Status-Development-orange)
![Tech Stack](https://img.shields.io/badge/Tech-React--Node--MongoDB--Docker-blue)
![License](https://img.shields.io/badge/License-ISC-green)

Atelier is a premium e-commerce platform dedicated to second-hand fashion, focusing on sustainability and circular economy. It provides a seamless interface for users to buy, sell (consignment), and manage high-quality pre-owned garments.

---

## 🚀 Vision & Mission
Our mission is to redefine the second-hand fashion market by providing a professional, trustworthy, and aesthetically pleasing environment for fashion lovers to extend the lifecycle of their garments.

---

## ✨ Key Features

### 🛍️ Client Features
- **Modern Storefront**: Browse curated second-hand fashion items with dynamic filtering (Brands, Categories, Price ranges).
- **Consignment Workflow**: Submit personal garments for consignment, track review status (QC, Received, Listed), and receive sales earnings.
- **Wishlist & Cart**: Interactive user wishlist, shopping cart, and streamlined checkout.
- **Social Authentication**: Secure authentication using Google OAuth and traditional JWT login.
- **Payment Gateway**: VNPay integration for secure online transactions.
- **AI Chatbot & Support**: Integrated customer support and AI assistant for product recommendations.

### 🛡️ Admin Management
- **Analytics Dashboard**: Real-time business metrics on sales, revenue, users, and orders.
- **Consignment QC**: Manage quality control, verification, pricing, and listing approvals for consignment submissions.
- **Product & Category Catalog**: Full CRUD management with automated SEO-friendly slugs.
- **Order Fulfillment**: Track and update order statuses from processing to delivery.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for staff and administrators.

---

## 🛠️ Technology Stack

| Tầng (Layer) | Công nghệ / Thư viện (Tech Stack) |
|---|---|
| **Frontend** | React (Vite), Redux, Ant Design v6, Tailwind CSS v3, Framer Motion, Axios |
| **Backend** | Node.js, Express.js v5, MongoDB (Mongoose v9), JWT, Helmet, Cloudinary, Nodemailer |
| **Containerization** | Docker, Multi-stage Builds, Nginx Alpine, Docker Compose |
| **Integrations** | VNPay Payment Gateway, Google OAuth 2.0, Socket.io |

---

## 📂 Directory Structure

```text
Shop-2hand/
├── BE/                       # Backend Application (Express.js)
│   ├── src/
│   │   ├── configs/          # DB, Cloudinary & System configurations
│   │   ├── controllers/      # Business logic handlers
│   │   ├── models/           # Mongoose Data Schemas
│   │   ├── routes/           # API Endpoint definitions
│   │   ├── services/         # Third-party services (VNPay, Mail)
│   │   └── utils/            # Helper utilities (JWT, Response formatters)
│   ├── .dockerignore         # Docker ignore rules for BE
│   ├── Dockerfile            # Node.js backend Docker image specification
│   └── index.js              # Server entrypoint
├── FE/                       # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   ├── pages/            # View Pages (Client & Admin)
│   │   ├── services/         # API Service client layers
│   │   └── routes/           # React Router configuration
│   ├── .dockerignore         # Docker ignore rules for FE
│   ├── Dockerfile            # Multi-stage Dockerfile (Node Build -> Nginx)
│   └── nginx.conf            # Nginx SPA web server configuration
├── docker-compose.yml        # Docker Multi-container orchestration
└── README.md                 # Project Documentation
```

---

## 🐳 Quick Start with Docker (Recommended)

Running the entire stack (Backend + Frontend) is super easy using Docker Compose.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Environment Configuration

Create `.env` file in `BE/` directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3001

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Security & OAuth
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id

# Mail Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# VNPay Payment Gateway
VNP_TMN_CODE=your_vnp_tmn_code
VNP_HASH_SECRET=your_vnp_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3001/checkout/vnpay_return
```

Create `.env` file in `FE/` directory:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Launching containers

Run the following command at the root of the project:

```bash
docker-compose up -d --build
```

### 3. Access the Applications
- **Frontend App**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)

### 4. Useful Docker Commands

```bash
# View container logs
docker-compose logs -f

# Stop containers
docker-compose stop

# Stop and remove containers & networks
docker-compose down

# Rebuild containers after code changes
docker-compose up -d --build
```

---

## ⚙️ Manual Local Setup (Without Docker)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Backend Setup

```bash
cd BE
npm install
npm start
```
*Backend runs at `http://localhost:3000`*

### 2. Frontend Setup

```bash
cd FE
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173` (or as configured by Vite)*

---

## 📝 License
Distributed under the ISC License.

---

## 🤝 Contact & Authors
- **Huynh Kim Tuyen** - [GitHub Profile](https://github.com/tuyenhk05)

Developed with ❤️ for sustainable fashion.

