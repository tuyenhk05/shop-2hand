# Atelier - Sustainable Second-Hand Fashion Platform

![Atelier Banner](https://img.shields.io/badge/Status-Development-orange)
![Atelier Banner](https://img.shields.io/badge/Tech-React--Node--MongoDB-blue)

Atelier is a premium e-commerce platform dedicated to second-hand fashion, focusing on sustainability and circular economy. It provides a seamless interface for users to buy, sell (consignment), and manage high-quality pre-owned garments.

## 🚀 Vision
Our mission is to redefine the second-hand market by providing a professional, trustworthy, and aesthetically pleasing environment for fashion lovers to extend the lifecycle of their clothes.

---

## ✨ Key Features

### 🛍️ Client Features
- **Modern Storefront**: Browse through curated second-hand items with advanced filtering (Brands, Categories, Price).
- **Consignment Workflow**: Users can submit their items for consignment, track status (QC, Received, Listed), and earn from sales.
- **Wishlist & Cart**: Interactive wishlist and streamlined checkout process.
- **Social Login**: Secure authentication with Google and Facebook.
- **Payment Integration**: Support for VNPay for secure transactions.
- **Eco-Impact Tracking**: Visual representation of the environmental benefits of buying second-hand.

### 🛡️ Admin Features
- **Comprehensive Dashboard**: Real-time stats on sales, users, and orders.
- **Consignment Management**: Full control over the quality check and listing process for user-submitted items.
- **Product & Category Management**: Tools to manage the inventory with SEO-friendly slugs.
- **Order Tracking**: Handle order statuses from processing to shipping and fulfillment.
- **Role-Based Access Control (RBAC)**: Manage permissions for different staff roles.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **State Management**: [Redux](https://redux.js.org/)
- **UI Components**: [Ant Design](https://ant.design/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [SASS](https://sass-lang.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: React Icons, Ant Design Icons

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Image Hosting**: [Cloudinary](https://cloudinary.com/)
- **Authentication**: JWT, Google Auth Library
- **Mailing**: Nodemailer
- **Payment**: VNPay Integration

---

## 📂 Project Structure

```text
Shop-2hand/
├── BE/               # Backend (Node.js/Express)
│   ├── src/
│   │   ├── configs/  # DB, Cloudinary, System configs
│   │   ├── controllers/ # Business logic
│   │   ├── models/    # Database schemas
│   │   ├── routes/    # API Endpoints
│   │   └── utils/     # Shared utilities (JWT, Mail)
│   └── index.js       # Entry point
└── FE/               # Frontend (React/Vite)
    ├── src/
    │   ├── action/    # Redux actions
    │   ├── components/# Reusable UI components
    │   ├── pages/     # Full-page components
    │   ├── routes/    # Routing configuration
    │   └── services/  # API service layer
    └── vite.config.js # Vite configuration
```

---

## ⚙️ Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account
- Google Cloud Console project (for Login)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tuyenhk05/shop-2hand.git
   cd shop-2hand
   ```

2. **Backend Setup**
   ```bash
   cd BE
   npm install
   # Create .env file based on technical documentation
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd FE
   npm install
   # Create .env file based on technical documentation
   npm run dev
   ```

---

## 📝 License
Distributed under the ISC License.

---

## 🤝 Contact
Huynh Kim Tuyen - [GitHub](https://github.com/tuyenhk05)

Developed with ❤️ for sustainable fashion.
