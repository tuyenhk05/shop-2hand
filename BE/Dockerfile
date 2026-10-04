#1. Chọn môi trường nền tảng
FROM node:20-slim

#2. Đặt thư mục làm việc trong container
WORKDIR /app

#3. Copy file định nghĩa thư viện vào trước để tận dụng cơ chế Docker Cache
COPY package*.json ./

# 4. Cài đặt các thư viện (chạy bên trong môi trường Linux của container)
RUN npm install
# 5. Copy toàn bộ mã nguồn còn lại từ máy bạn vào thư mục /app trong container
COPY . .
# 6. Khai báo cổng mà ứng dụng Backend lắng nghe (Port 3000)
EXPOSE 3000
# 7. Lệnh mặc định sẽ chạy khi container khởi động
CMD ["node", "index.js"]