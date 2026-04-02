# ??? Shop-2hand - Backend API

H? th?ng backend cho n?n t?ng mua bán hàng c? tr?c tuy?n **Shop-2hand**. ???c xây d?ng b?ng **Node.js**, **Express.js** và **MongoDB**.

---

## ?? M?c l?c

- [Gi?i thi?u](#gi?i-thi?u)
- [Yêu c?u h? th?ng](#yêu-c?u-h?-th?ng)
- [Cài ??t](#cài-??t)
- [C?u hình](#c?u-hình)
- [Ch?y d? án](#ch?y-d?-án)
- [API Documentation](#api-documentation)
- [C?u trúc folder](#c?u-trúc-folder)
- [Công ngh? s? d?ng](#công-ngh?-s?-d?ng)
- [B?o m?t](#b?o-m?t)
- [L?u ý quan tr?ng](#l?u-ý-quan-tr?ng)
- [?óng góp](#?óng-góp)
- [Liên h?](#liên-h?)
- [License](#license)

---

## ?? Gi?i thi?u

**Shop-2hand** là m?t n?n t?ng e-commerce cho phép ng??i dùng mua bán các s?n ph?m c?, tái ch?. Backend API cung c?p các ch?c n?ng:

? Qu?n lý ng??i dùng (??ng ký, ??ng nh?p)  
? Xác th?c ng??i dùng b?ng JWT  
? Qu?n lý s?n ph?m  
? Qu?n lý ??n hàng  
? X? lý thanh toán  
? H? th?ng bình lu?n và ?ánh giá  

---

## ?? Yêu c?u h? th?ng

- **Node.js**: v16.0.0 tr? lên
- **npm**: v8.0.0 tr? lên
- **MongoDB**: Cloud (MongoDB Atlas) ho?c Local
- **Git**: ?? clone repository

---

## ?? Cài ??t

### B??c 1: Clone repository


git clone https://github.com/tuyenhk05/Shop-2hand.git
cd Shop-2hand/BE

### B??c 2: Cài ??t dependencies


npm install

### B??c 3: C?u hình bi?n môi tr??ng

T?o file `.env` trong th? m?c `BE/`:

PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shop-2hand?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-key-here-change-this
CLIENT_URL=http://localhost:3001
NODE_ENV=development

**Gi?i thích:**
- `PORT`: Port ch?y server
- `MONGODB_URI`: Connection string MongoDB Atlas
- `JWT_SECRET`: Secret key ?? mã hóa JWT token (t?o b?ng OpenSSL ho?c Node.js)
- `CLIENT_URL`: URL c?a frontend
- `NODE_ENV`: Môi tr??ng phát tri?n

---

## ?? C?u hình MongoDB Atlas

1. ??ng nh?p vào [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. T?o Cluster m?i
3. Vào **Security > Database Access** ? T?o user m?i
4. Vào **Security > Network Access** ? Thêm IP: `0.0.0.0/0` (cho development)
5. Vào **Clusters** ? **Connect** ? Sao chép connection string
6. Thay `<password>` b?ng m?t kh?u user
7. Thêm tên database: `/shop-2hand` vào URI

---

## ?? Ch?y d? án

### Development mode (v?i auto-reload)

npm start

Output:
? Database connected successfully
?? Backend API running at http://localhost:3001

### Debug mode

npm start

Server s? ch?y ? `http://localhost:3001` và Debugger ? `ws://127.0.0.1:9229`

---

## ?? API Documentation

### Authentication Endpoints

#### 1. **??ng ký** (Register)

POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Nguy?n V?n A",
  "email": "user@example.com",
  "password": "123456",
  "confirmPassword": "123456",
  "phone": "0123456789"
}

**Response (201):**
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "Nguy?n V?n A",
    "email": "user@example.com",
    "phone": "0123456789",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

---

#### 2. **??ng nh?p** (Login)

POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}

**Response (200):**
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "Nguy?n V?n A",
    "email": "user@example.com",
    "phone": "0123456789",
    "role": "user",
    "avatar": null,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

---

#### 3. **L?y thông tin user hi?n t?i** (Get Current User)

GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

**Response (200):**
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "Nguy?n V?n A",
    "email": "user@example.com",
    "phone": "0123456789",
    "avatar": null,
    "role": "user"
  }
}

---

#### 4. **??ng xu?t** (Logout)

POST /api/auth/logout

**Response (200):**
{
  "success": true,
  "message": "Logout successful"
}

---

#### 5. **Health Check**

GET /api/health

**Response (200):**
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-04-02T10:30:00.000Z"
}

---

## ?? C?u trúc folder

BE/
??? src/
?   ??? models/
?   ?   ??? users.model.js          # Schema User
?   ??? controllers/
?   ?   ??? auth.controller.js      # Logic x? lý auth
?   ??? routes/
?   ?   ??? auth.routes.js          # Routes authentication
?   ?   ??? client/
?   ?       ??? index.routes.js     # Routes chính
?   ??? middleware/
?   ?   ??? auth.middleware.js      # Middleware xác th?c JWT
?   ??? utils/
?   ?   ??? jwt.utils.js            # Hàm JWT
?   ??? configs/
?       ??? database.js             # K?t n?i MongoDB
?       ??? system.js               # C?u hình h? th?ng
??? index.js                         # Entry point
??? .env                             # Bi?n môi tr??ng
??? .env.example                     # Ví d? .env
??? .gitignore                       # Git ignore
??? package.json                     # Dependencies
??? README.md                        # Tài li?u này

---

## ??? Công ngh? s? d?ng

| Công ngh? | Phiên b?n | M?c ?ích |
|-----------|----------|---------|
| **Node.js** | v16+ | Runtime JavaScript |
| **Express.js** | v5.1.0 | Web framework |
| **MongoDB** | Cloud | Database |
| **Mongoose** | v9.0.0 | ODM (Object Data Modeling) |
| **JWT** | v9.0.3 | Xác th?c token |
| **Bcrypt** | v6.0.0 | Mã hóa password |
| **Cors** | v2.8.6 | Cross-origin requests |
| **Helmet** | - | Security headers |
| **Dotenv** | v17.2.3 | Qu?n lý bi?n môi tr??ng |
| **Nodemon** | v3.1.11 | Auto-reload (dev) |

---

## ?? B?o m?t

? Passwords ???c hash b?ng bcrypt (salt rounds: 10)  
? JWT tokens có th?i gian h?t h?n (7 ngày)  
? CORS ???c c?u hình cho phép requests t? frontend  
? Helmet middleware b?o v? headers  
? `.env` file không ???c commit lên Git  

---

## ?? L?u ý quan tr?ng

1. **JWT_SECRET**: Thay ??i giá tr? secret key trong `.env` thành chu?i bí m?t m?nh
2. **MongoDB Connection**: Ki?m tra IP whitelist trong MongoDB Atlas
3. **Password hashing**: Passwords ???c hash t? ??ng khi save user
4. **Token expiration**: Token s? h?t h?n sau 7 ngày

---

## ?? ?óng góp

?? ?óng góp vào d? án:

1. Fork repository
2. T?o branch feature: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## ?? Liên h?

- **GitHub**: [tuyenhk05](https://github.com/tuyenhk05)
- **Email**: [Liên h? qua GitHub Issues]

---

## ?? License

Project này s? d?ng License ISC. Chi ti?t xem file `LICENSE`.

---

**C?p nh?t l?n cu?i**: 02/04/2026