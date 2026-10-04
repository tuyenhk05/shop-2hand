
# ========================================================
# TẦNG 1: BUILD REACT (Đặt tên tạm là 'builder')
# ========================================================
FROM node:20-slim AS builder

# Đặt thư mục làm việc bên trong container là /app
WORKDIR /app

# Copy 2 file package để cài thư viện trước (tận dụng Docker Cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ code React từ máy bạn vào và tiến hành biên dịch
COPY . .
RUN npm run build


# ========================================================
# TẦNG 2: CHẠY PRODUCTION VỚI NGINX (SIÊU NHẸ)
# ========================================================
# Chọn Nginx bản chạy trên Linux Alpine (hệ điều hành Alpine siêu nhỏ, chỉ khoảng 5MB)
FROM nginx:alpine

# Copy file cấu hình Nginx ta vừa viết ở trên đè vào cấu hình mặc định của Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# CÂU LỆNH "MA THUẬT": 
# Chỉ lấy duy nhất thư mục 'dist' đã được build xong từ TẦNG 1 (builder) 
# đưa sang thư mục phục vụ web của Nginx ở TẦNG 2.
# Toàn bộ Node.js và thư mục node_modules nặng 500MB ở Tầng 1 sẽ bị BỎ LẠI HOÀN TOÀN!
COPY --from=builder /app/dist /usr/share/nginx/html

# Khai báo cổng 80 (cổng HTTP chuẩn của Nginx)
EXPOSE 80

# Chạy Nginx ở chế độ foreground (chạy liên tục, không tự tắt)
CMD ["nginx", "-g", "daemon off;"]