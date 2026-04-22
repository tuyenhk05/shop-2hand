# TÀI LIỆU HƯỚNG DẪN DỰ ÁN ATELIER

Chào mừng bạn đến với tài liệu chi tiết về dự án **Atelier** - Nền tảng thời trang Second-hand bền vững. Tài liệu này cung cấp cái nhìn toàn diện về công nghệ, cấu trúc và cách thiết lập hệ thống.

---

## 1. Công nghệ sử dụng (Technology Stack)

### 🔹 Frontend (FE)
- **Framework:** React (Vite) - Tốc độ build cực nhanh.
- **State Management:** Redux (Legacy Core) - Quản lý trạng thái ứng dụng.
- **UI Architecture:** Ant Design (v6) - Hệ thống component chuyên nghiệp.
- **Styling:** Tailwind CSS (v3) kết hợp SASS/SCSS.
- **Animation:** Framer Motion - Hiệu ứng mượt mà, cao cấp.
- **HTTP Client:** Axios - Xử lý API calls.
- **Routing:** React Router v7.

### 🔹 Backend (BE)
- **Runtime:** Node.js.
- **Framework:** Express.js (v5).
- **Database:** MongoDB với Mongoose (v9).
- **Security:** Helmet, CORS, Bcrypt (Mã hóa mật khẩu).
- **Authentication:** JSON Web Token (JWT), Google OAuth 2.0.
- **Storage:** Cloudinary SDK (Lưu trữ hình ảnh).
- **Mailing:** Nodemailer (Gửi mã OTP, thông báo).
- **Payment:** VNPay SDK Integration.

---

## 2. Cấu trúc thư mục (Directory Structure)

### 📂 Backend (BE)
```text
BE/
├── src/
│   ├── configs/      # Cấu hình Database, Cloudinary, System prefix
│   ├── controllers/  # Logic xử lý nghiệp vụ (Admin & Client)
│   ├── helpers/      # Các hàm hỗ trợ (Search, Pagination, Upload)
│   ├── middleware/   # Các tầng trung gian (Auth, Upload)
│   ├── models/       # Định nghĩa Schema MongoDB
│   ├── routes/       # Định nghĩa các API endpoints
│   ├── services/     # Logic dịch vụ bên thứ 3 (OTP, Payment)
│   ├── utils/        # Tiện ích dùng chung (JWT, Format)
│   └── validations/  # Kiểm tra dữ liệu đầu vào
└── index.js          # Entry point của Server
```

### 📂 Frontend (FE)
```text
FE/
├── src/
│   ├── action/       # Redux Actions (Xử lý logic state)
│   ├── assets/       # Hình ảnh, Fonts, Styles
│   ├── components/   # Các Component dùng chung (Layout, UI)
│   ├── helpers/      # Các hàm hỗ trợ Frontend (Animation, Format)
│   ├── hooks/        # Custom React Hooks
│   ├── pages/        # Các trang giao diện chính
│   ├── reducers/     # Redux Reducers
│   ├── routes/       # Cấu hình điều hướng (React Router)
│   └── services/     # Các hàm gọi API (Axios instance)
└── vite.config.js    # Cấu hình build Vite
```

---

## 3. Hệ thống Routes (Routing System)

### 🌐 Client Routes (Người dùng)
- `/`: Trang chủ.
- `/products`: Cửa hàng (Danh sách sản phẩm).
- `/products/:slug`: Chi tiết sản phẩm.
- `/sustain`: Trang giới thiệu về bền vững.
- `/wishlist`: Danh sách yêu thích.
- `/dashboard`: Tổng quan tài khoản cá nhân.
- `/checkout`: Thanh toán.
- `/consignment`: Đăng ký ký gửi sản phẩm.
- `/history`: Lịch sử mua hàng.
- `/login` & `/register`: Đăng nhập/Đăng ký.

### ⚙️ Admin Routes (Quản trị)
- `/admin/dashboard`: Thống kê tổng quan.
- `/admin/roles`: Quản lý phân quyền.
- `/admin/users`: Quản lý tài khoản người dùng.
- `/admin/categories`: Quản lý danh mục sản phẩm.
- `/admin/products`: Quản lý kho hàng sản phẩm.
- `/admin/consignments`: Phê duyệt và quản lý ký gửi.
- `/admin/orders`: Quản lý đơn hàng.

---

## 4. Các Module chính (Core Modules)

### 🔐 Module Authentication
- Hỗ trợ đăng nhập truyền thống (Email/Password).
- Hỗ trợ Social Login (Google/Facebook).
- Quên mật khẩu qua mã OTP (Email).
- Phân quyền (RBAC) giữa Admin và Khách hàng.

### 📦 Module Ký gửi (Consignment)
- Người dùng đăng tải thông tin và hình ảnh sản phẩm.
- Admin kiểm định chất lượng (QC).
- Quy trình: `Chờ xử lý` -> `Đã nhận hàng` -> `Đã kiểm định/Lên sàn`.

### 💳 Module Thanh toán (Payment)
- Tích hợp VNPay: Tạo URL thanh toán, xử lý callback để cập nhật trạng thái đơn hàng.
- Quản lý trạng thái: `Chờ thanh toán`, `Đã thanh toán`, `Hủy`.

---

## 5. Hướng dẫn thiết lập .env (Environment Setup)

Để dự án hoạt động, bạn cần tạo file `.env` tại thư mục gốc của cả `FE` và `BE`.

### 📥 Backup/Example .env cho Backend (BE/.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shop-2hand
CLIENT_URL=http://localhost:3001

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your_super_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Email (Nodemailer - dùng App Password của Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# VNPay
VNP_TMN_CODE=your_tmn_code
VNP_HASH_SECRET=your_vnp_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3001/checkout/vnpay_return
```

### 📥 Backup/Example .env cho Frontend (FE/.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 💡 Lưu ý nâng cao
- **SEO:** Các sản phẩm và danh mục đều sử dụng `slug` để tối ưu kết quả tìm kiếm.
- **Security:** Backend sử dụng `helmet` để bảo vệ các header và `bcrypt` để băm mật khẩu.
- **Performance:** Frontend sử dụng Vite và tối ưu hóa ảnh qua Cloudinary Transformation API.

---
*Tài liệu này được soạn thảo bới Antigravity AI trợ giúp nhóm phát triển Atelier.*
