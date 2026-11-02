# 🚀 GIÁO TRÌNH & LỘ TRÌNH THỰC CHIẾN: TỪ ZERO ĐẾN SENIOR DEVOPS & CLOUD ENGINEER
> **Đề cương chuẩn hóa quốc tế (TechWorld with Nana, KodeKloud, roadmap.sh) áp dụng trực tiếp vào dự án `Shop-2hand` với chi phí $0**  
> *Phiên bản Master Syllabus - Cập nhật tháng 10/2026*

---

## 🌍 PHẦN 1: TỔNG HỢP KHÓA HỌC & PHÒNG LAB MIỄN PHÍ TỐT NHẤT TRÊN INTERNET

Để học đúng trọng tâm, không bị lạc giữa hàng ngàn công cụ, dưới đây là các nguồn tài liệu và phòng Lab thực hành chuẩn quốc tế được các kỹ sư DevOps/SRE khuyên dùng:

| Phân loại | Tên Khóa học / Nền tảng | Điểm mạnh cốt lõi & Cách tận dụng | Chi phí |
| :--- | :--- | :--- | :--- |
| **Bản đồ chuẩn quốc tế** | **[roadmap.sh/devops](https://roadmap.sh/devops)** | Sơ đồ tương tác chuẩn hóa toàn bộ kỹ năng từ Junior đến Senior DevOps/SRE. Dùng để đối chiếu tiến độ học. | Miễn phí 100% |
| **Video trực quan dễ hiểu nhất** | **TechWorld with Nana** (YouTube) | Giải thích bản chất kiến trúc Docker, K8s, Jenkins, Terraform, Ansible bằng sơ đồ động cực kỳ dễ hiểu. | Miễn phí (YouTube) |
| **Phòng Lab thực hành số 1** | **KodeKloud** (Mumshad Mannambeth) | Nền tảng học qua trình duyệt có sẵn Terminal chấm điểm tự động (nổi tiếng nhất về Linux, Docker, K8s CKA, Terraform). | Có gói Free Labs & Pro |
| **Giả lập K8s & Linux trực tuyến** | **[Killercoda.com](https://killercoda.com/)** & **[Play with Docker](https://labs.play-with-docker.com/)** | Cấp máy chủ Ubuntu, Docker & Cụm Kubernetes miễn phí ngay trên trình duyệt để gõ lệnh và "đập phá" thoải mái. | Miễn phí 100% |
| **Luyện Linux & Bash từ gốc** | **[Linux Journey](https://linuxjourney.com/)** & **[OverTheWire Bandit](https://overthewire.org/wargames/bandit/)** | Học lệnh Linux và Bash qua dạng trò chơi vượt ải (SSH vào server giải đố tìm mật khẩu qua từng màn) cực cuốn và nhớ lâu. | Miễn phí 100% |
| **Tài liệu Thực chiến VN** | **Cộng đồng DevOps VietNam / Tự Học DevOps** | Chia sẻ kinh nghiệm xử lý sự cố thực tế tại doanh nghiệp VN (tối ưu VPS, On-premise, Telegram Alert, Zalo/Viettel Cloud). | Cộng đồng mở |

---

## 🗺️ PHẦN 2: BẢN ĐỒ KIẾN TRÚC DEVOPS TOÀN CẢNH TRÊN DỰ ÁN `SHOP-2HAND`

```
[ LẬP TRÌNH VIÊN (BẠN) ]
        │ (Viết code Node.js/React + Bash scripts tự động hóa)
        ▼
[ MODULE 1: LINUX, BASH & NETWORKING ] ─── Quản trị Ubuntu VPS, SSH, Firewall UFW, Nginx Reverse Proxy
        │
        ▼
[ MODULE 2: DOCKER & CONTAINERIZATION ] ─── Đóng gói BE & FE thành Image bất biến (~30MB) [ĐÃ XONG ✔]
        │
        │ (git push lên GitHub)
        ▼
[ MODULE 3: CI/CD AUTOMATION & DEVSECOPS ] ─── Băng chuyền Test, Quét bảo mật & Đóng gói tự động
   ├── GitHub Actions: Pipeline 2 tầng (Unit Test -> Build & Push Docker Hub) [ĐÃ XONG ✔]
   ├── Jenkins: Tự dựng CI/CD Server nội bộ bằng Jenkinsfile (Chuẩn Ngân hàng/Tập đoàn)
   └── Trivy Security Scan: Quét lỗ hổng bảo mật trong thư viện npm & Docker Image
        │
        ▼
[ MODULE 4: CLOUD COMPUTING & MULTI-CLOUD DEPLOY ] ─── Đưa web ra Internet thật
   ├── VPS Truyền thống: Hostinger / DigitalOcean / Multipass Local VPS
   └── Public Cloud: AWS (EC2, S3, VPC, IAM) / Google Cloud Run / Render / Koyeb ($0)
        │
        ▼
[ MODULE 5: INFRASTRUCTURE AS CODE (IaC) ] ─── Quản lý máy chủ bằng Code thay vì bấm tay
   ├── Terraform (main.tf): Gõ 1 lệnh tự tạo Server, Network, S3 (thực hành với Docker/LocalStack)
   └── Ansible (playbook.yml): Tự động cài đặt phần mềm cho 100 máy chủ cùng lúc qua SSH
        │
        ▼
[ MODULE 6: "TRÙM CUỐI" KUBERNETES (K8S) & GITOPS ] ─── Cụm máy chủ chịu tải hàng triệu user
   ├── K8s Cluster: Pods, Deployments, Services, Ingress, ConfigMap, Secret
   ├── Self-healing & Auto-scaling (HPA): Tự hồi sinh trong 0.5s & tự nhân bản khi quá tải
   └── Helm Charts & ArgoCD: Quản lý gói và tự động đồng bộ trạng thái K8s từ Git
        │
        ▼
[ MODULE 7: OBSERVABILITY, INCIDENT/RCA & AIOPS ] ─── Vận hành 99.99% Uptime & Trí tuệ nhân tạo
   ├── Monitoring (Prometheus + Grafana): Đồng hồ đo nhịp tim CPU, RAM, Request/s
   ├── Centralized Logging (Grafana Loki / ELK): Hộp đen gom toàn bộ log để tra cứu trong 3 giây
   ├── Incident Management & RCA: Quy trình ứng cứu sự cố 2h sáng & Báo cáo phân tích nguyên nhân gốc rễ
   └── AIOps: Dùng AI tự động đọc log lỗi, chẩn đoán nguyên nhân & bắn cảnh báo về Telegram Bot
```

---

## 📚 PHẦN 3: TỪ ĐIỂN BẢN CHẤT CÁC MẢNG CÔNG NGHỆ CỐT LÕI

### 1. Linux, Bash Scripting & Networking (Móng nhà của mọi kỹ sư DevOps)
- **Vì sao bắt buộc phải giỏi?** 96.3% máy chủ Cloud và 100% Docker Container trên thế giới chạy nhân **Linux**. Nếu không biết Linux và Mạng, bạn sẽ bó tay khi container không gọi được nhau hoặc server bị đầy ổ cứng.
- **Bash Scripting (`.sh`):** Ngôn ngữ kịch bản giúp tự động hóa các thao tác lặp đi lặp lại (tự động sao lưu MongoDB lúc 2h sáng, tự động xóa log cũ, tự động kiểm tra sức khỏe server).
- **Networking thực chiến:** Hiểu rõ đường đi của 1 gói tin từ trình duyệt người dùng -> qua phân giải tên miền **DNS** -> đi qua tường lửa **Firewall (UFW/Security Group)** -> chạm vào **Nginx Reverse Proxy** (cổng `80`/`443`) -> phân luồng `/api` vào Backend (cổng `3000`) và `/` vào Frontend.

### 2. Cloud Providers: Hostinger (VPS) vs AWS / Google Cloud (Public Cloud)
- **Hostinger / VPS truyền thống:** Giống như **thuê một căn hộ trống**. Giá cố định rất rẻ (\$4–\$10/tháng), bạn tự vào cài Docker, tự cài Nginx, tự chạy web. Cực kỳ phù hợp cho dự án cá nhân, đồ án, startup vừa và nhỏ.
- **AWS (Amazon Web Services) / GCP:** Giống như **một thành phố công nghệ khổng lồ** với hơn 200 dịch vụ lắp ghép sẵn:
  - `EC2`: Máy chủ ảo; `S3`: Kho lưu trữ ảnh/file vô hạn; `RDS`: Database tự động backup; `VPC & IAM`: Mạng riêng ảo và phân quyền bảo mật cấp độ ngân hàng; `ECS / EKS / Cloud Run`: Chạy Container tự động co giãn.

### 3. Infrastructure as Code (Terraform & Ansible)
- **Vấn đề:** Nếu tạo 10 máy chủ trên AWS bằng cách click chuột trên web (ClickOps), bạn mất cả ngày và dễ bấm nhầm. Nếu muốn xóa đi tạo lại môi trường giống hệt cho khách hàng khác thì phải bấm lại từ đầu.
- **Giải pháp IaC:**
  - **Terraform (`main.tf`):** Viết code định nghĩa hạ tầng. Gõ `terraform apply` -> Tự động tạo máy chủ, mạng, database trong 2 phút. Gõ `terraform destroy` -> Xóa sạch để không tốn tiền.
  - **Ansible (`playbook.yml`):** Sau khi Terraform tạo xong máy chủ trống, Ansible sẽ tự động SSH vào cả 10 máy để cài Docker, kéo image `Shop-2hand` về và bật web lên.

### 4. Container Orchestration (Kubernetes - K8s) & Hệ sinh thái Cloud-Native
- **Docker Compose** chỉ quản lý được các container nằm trên **1 máy chủ duy nhất**. Nếu máy chủ đó cháy RAM hoặc sập nguồn, web sập.
- **Kubernetes (K8s)** kết nối hàng chục máy chủ thành một **Cluster (Cụm máy chủ)**:
  - **Self-healing:** 1 container hoặc 1 máy chủ chết -> K8s tự chuyển container sang máy chủ còn sống trong 0.5 giây.
  - **Auto-scaling (HPA):** Ngày Flash Sale 11/11 lượng khách tăng gấp 10 lần -> K8s tự nhân bản từ 2 lên 20 container Backend; hết giờ cao điểm tự thu về 2 container để tiết kiệm tiền.
  - **Zero-downtime Rolling Update:** Cập nhật phiên bản web mới từng chút một, khách đang mua hàng không hề bị văng ra.

### 5. Observability (Monitoring & Logging), Incident Management (RCA) & AIOps
- **Monitoring (Prometheus + Grafana):** Theo dõi "chỉ số sinh tồn" (CPU, RAM, Disk, số lượng lỗi HTTP 500, thời gian phản hồi API). Khi vượt ngưỡng (ví dụ CPU > 85% trong 3 phút), hệ thống bắn cảnh báo ngay lập tức.
- **Logging (Grafana Loki / ELK Stack):** Khi có 20 container chạy cùng lúc, bạn không thể gõ `docker logs` từng cái. Hệ thống Logging sẽ gom toàn bộ chữ in ra từ mọi container về một nơi để tìm kiếm như Google.
- **Incident Management & RCA (Root Cause Analysis):** Quy trình chuẩn khi xảy ra sự cố:
  1. *Detect & Alert:* Phát hiện và báo động tự động.
  2. *Mitigate:* Cứu hệ thống chạy lại nhanh nhất (ví dụ Rollback về bản Git SHA cũ).
  3. *Post-Mortem & RCA:* Truy tìm nguyên nhân gốc rễ bằng phương pháp **5 Whys (5 câu hỏi Tại sao)** và lập chốt chặn kỹ thuật để lỗi đó không bao giờ lặp lại lần thứ hai.
- **AIOps (AI trong DevOps):** Dùng AI/LLM tự động đọc hàng ngàn dòng log lỗi phức tạp, tóm tắt nguyên nhân gốc rễ bằng tiếng Việt và đề xuất câu lệnh sửa lỗi gửi thẳng về Telegram của kỹ sư trực ca.

---

## 🎯 PHẦN 4: ĐỀ CƯƠNG CHI TIẾT 7 HỌC PHẦN (MODULES) & BÀI LAB THỰC HÀNH ($0)

---

### ✅ MODULE 1: LINUX, BASH SCRIPTING & QUẢN TRỊ VPS/NETWORKING — [ĐÃ HOÀN THÀNH 100% ✔]
*Mục tiêu: Làm chủ hoàn toàn hệ điều hành Linux, viết kịch bản Bash tự động hóa và tự tay cấu hình một máy chủ VPS Ubuntu thực thụ.*

#### Kiến thức trọng tâm:
1. **Quản trị Linux cốt lõi:** Hệ thống file (`/etc`, `/var/log`, `/home`, `/opt`), phân quyền (`chmod`, `chown`, `sudo`, groups `docker.sock`), quản lý tiến trình & dịch vụ (`ps`, `htop`, `systemctl`, `journalctl`), kiểm tra dung lượng (`df -h`, `free -h`).
2. **Mạng & Bảo mật máy chủ:** Kết nối `ssh` bằng SSH Key (không dùng mật khẩu chống dò pass), kiểm tra cổng mạng (`ss -tulpn`, `netstat`, `curl -I`), tường lửa **UFW** (`ufw allow 22/80/443`).
3. **Bash Scripting tự động hóa:** Biến, điều kiện `if/else`, vòng lặp `for/while`, bắt lỗi an toàn với `set -euo pipefail`, lọc log với `grep`, lập lịch chạy tự động định kỳ với **`crontab`**.
4. **Nginx Reverse Proxy & SSL:** Cấu hình Nginx đứng làm cổng đón khách duy nhất, điều hướng `/api/` về Backend (`http://backend:3000/api/`) và `/` về Frontend.

#### 🛠️ Bài Lab Thực Hành ($0 trên `Shop-2hand`):
- [x] **Lab 1.1:** Khởi tạo môi trường máy chủ Linux Ubuntu 26.04 LTS ngay trên máy (`wsl --install -d Ubuntu`) và phân quyền Docker Socket (`gpasswd -a $USER docker`).
- [x] **Lab 1.2:** Viết kịch bản Bash [scripts/healthcheck.sh](file:///f:/Shop-2hand/scripts/healthcheck.sh) tự động kiểm tra trạng thái Backend/Frontend của `Shop-2hand`, tự khởi động lại nếu container bị dừng (Self-healing), và ghi log kiểm tra theo thời gian thực.
- [x] **Lab 1.3:** Thiết lập **Nginx Reverse Proxy** trong [FE/nginx.conf](file:///f:/Shop-2hand/FE/nginx.conf) hợp nhất cổng để truy cập cả Frontend và Backend API qua duy nhất cổng của Nginx (`/api/products` -> `http://backend:3000/api/products`).

---

### ✅ MODULE 2: DOCKER & CONTAINERIZATION — [ĐÃ HOÀN THÀNH 100% ✔]
*Mục tiêu: Đóng gói ứng dụng chuẩn doanh nghiệp, chạy mọi nơi không sợ lệch môi trường.*

- [x] **Lab 2.1:** Viết [BE/Dockerfile](file:///f:/Shop-2hand/BE/Dockerfile) (`node:20-slim`) và [.dockerignore](file:///f:/Shop-2hand/BE/.dockerignore) chuẩn bảo mật.
- [x] **Lab 2.2:** Kỹ thuật **Multi-stage Build** cho [FE/Dockerfile](file:///f:/Shop-2hand/FE/Dockerfile) kết hợp [FE/nginx.conf](file:///f:/Shop-2hand/FE/nginx.conf) xử lý lỗi SPA 404, giảm dung lượng từ ~600MB xuống ~30MB.
- [x] **Lab 2.3:** Thiết lập [docker-compose.yml](file:///f:/Shop-2hand/docker-compose.yml) điều phối đa container cùng Bind Mount + Anonymous Volume cho Live-reload (`nodemon -L`).
- [x] **Lab 2.4:** Xử lý các lỗi thực tế: UTF-8 BOM trong `.env`, dấu ngoặc kép biến môi trường Docker, xung đột cổng mạng.

---

### ✅ MODULE 3: CI/CD AUTOMATION & DEVSECOPS (GITHUB ACTIONS & JENKINS) — [ĐÃ HOÀN THÀNH 100% ✔]
*Mục tiêu: Tự động hóa hoàn toàn quy trình kiểm thử, quét lỗ hổng bảo mật và đóng gói phần mềm.*

#### Phần 3A: Cloud CI/CD với GitHub Actions — [ĐÃ HOÀN THÀNH 100% ✔]
- [x] **Lab 3.1:** Viết Unit Test tự động cho hàm bảo mật [string.utils.test.js](file:///f:/Shop-2hand/BE/src/utils/string.utils.test.js) với `node --test`.
- [x] **Lab 3.2:** Thiết kế Pipeline 2 tầng (`test-code` -> `build-and-push-docker` với `needs: test-code`) tại [.github/workflows/docker-ci.yml](file:///f:/Shop-2hand/.github/workflows/docker-ci.yml).
- [x] **Lab 3.3:** Tối ưu tốc độ build bằng GitHub Cache (`type=gha`) và gắn nhãn kép `:latest` + `:${{ github.sha }}` phục vụ Rollback tức thì.

#### Phần 3B: On-Premise CI/CD với Jenkins & DevSecOps — [ĐÃ HOÀN THÀNH 100% ✔]
- [x] **Lab 3.4:** Dựng máy chủ **Jenkins LTS** bằng Docker trên máy cá nhân (`port 8080`) với dữ liệu vĩnh viễn `jenkins_home`.
- [x] **Lab 3.5:** Tích hợp công cụ bảo mật **Trivy (DevSecOps)** quét sạch 33 lỗ hổng bảo mật (CVE) trong `package-lock.json` về con số `0`, thiết lập chốt chặn `--exit-code 1`.
- [x] **Lab 3.6:** Viết file [Jenkinsfile](file:///f:/Shop-2hand/Jenkinsfile) chuẩn Declarative Pipeline cho dự án `Shop-2hand`, kích hoạt và kiểm chứng trực quan trên giao diện **Jenkins Stage View**.

---

### ⏳ MODULE 4: CLOUD COMPUTING & THỰC CHIẾN DEPLOY ĐA NỀN TẢNG ($0)
*Mục tiêu: Đưa dự án `Shop-2hand` lên đám mây thực tế, có tên miền và chứng chỉ bảo mật HTTPS để bất kỳ ai trên thế giới cũng truy cập được.*

- [ ] **Lab 4.1:** Nắm vững kiến trúc mạng đám mây AWS/GCP: VPC, Public/Private Subnet, Internet Gateway, Security Group, IAM Role.
- [ ] **Lab 4.2:** Thực hành triển khai (Deploy) Docker Image của `Shop-2hand` từ Docker Hub lên nền tảng Cloud miễn phí (**Render / Koyeb** hoặc **Google Cloud Run**).
- [ ] **Lab 4.3:** Kết nối luồng **CD (Continuous Deployment)**: Mỗi khi bạn `git push` code mới -> GitHub Actions test & đẩy image mới -> Cloud tự động kéo bản mới về cập nhật web không cần đụng tay!

---

### ⏳ MODULE 5: INFRASTRUCTURE AS CODE (TERRAFORM) & CONFIGURATION MANAGEMENT (ANSIBLE)
*Mục tiêu: Biến toàn bộ hạ tầng máy chủ và việc cài đặt phần mềm thành các dòng code tự động.*

- [ ] **Lab 5.1:** Cài đặt **Terraform CLI** và viết file `terraform/main.tf` (sử dụng Docker Provider & **LocalStack** giả lập AWS miễn phí 100%).
- [ ] **Lab 5.2:** Thực hành vòng đời hạ tầng bằng lệnh: `terraform init` -> `terraform plan` -> `terraform apply` -> `terraform destroy`.
- [ ] **Lab 5.3:** Viết kịch bản **Ansible Playbook (`ansible/playbook.yml`)** tự động hóa việc cài đặt Docker, cấu hình tường lửa và khởi chạy `Shop-2hand` trên máy chủ Ubuntu mới tinh.

---

### ⏳ MODULE 6: "TRÙM CUỐI" KUBERNETES (K8S CLUSTER) & GITOPS
*Mục tiêu: Đạt trình độ Senior DevOps — Điều phối cụm máy chủ có khả năng tự chữa lành (Self-healing) và tự co giãn (Auto-scaling).*

- [ ] **Lab 6.1:** Kích hoạt cụm **Kubernetes** miễn phí ngay trên Docker Desktop (hoặc Minikube) và làm chủ công cụ dòng lệnh **`kubectl`**.
- [ ] **Lab 6.2:** Viết bộ cấu hình K8s chuẩn doanh nghiệp trong thư mục `k8s/`:
  - `backend-deployment.yaml` (chạy 3 Pods bản sao song song) & `backend-service.yaml`.
  - `frontend-deployment.yaml` & `frontend-service.yaml`.
  - `configmap.yaml`, `secret.yaml` & `ingress.yaml`.
- [ ] **Lab 6.3:** Thực nghiệm **Self-healing** (xóa thử 1 Pod đang chạy và xem K8s tự dựng lại Pod mới trong tích tắc) và **Rolling Update / Rollback** không gián đoạn dịch vụ.
- [ ] **Lab 6.4:** Đóng gói cấu hình K8s thành **Helm Chart** và làm quen tư duy **GitOps với ArgoCD**.

---

### ⏳ MODULE 7: OBSERVABILITY (MONITORING & LOGGING), INCIDENT/RCA & AIOPS
*Mục tiêu: Xây dựng "bệnh viện giám sát 24/7" cho hệ thống, nắm vững quy trình xử lý sự cố và ứng dụng AI vào vận hành.*

- [ ] **Lab 7.1 (Monitoring):** Dựng cụm **Prometheus + Grafana + Node Exporter** bằng Docker Compose để vẽ bảng điều khiển (Dashboard) theo dõi % CPU, RAM, lượng truy cập của `Shop-2hand` theo thời gian thực.
- [ ] **Lab 7.2 (Logging):** Tích hợp **Grafana Loki + Promtail** thu thập toàn bộ log từ Backend và Frontend về một giao diện tìm kiếm tập trung.
- [ ] **Lab 7.3 (Incident & RCA):** Thực hành diễn tập sự cố (Chaos Engineering): Cố tình gây lỗi kết nối Database -> Hệ thống phát cảnh báo -> Kỹ sư điều tra qua Grafana/Loki -> Khắc phục -> Viết báo cáo **RCA (Root Cause Analysis - 5 Whys)** chuẩn mẫu công ty công nghệ lớn.
- [ ] **Lab 7.4 (AIOps):** Viết script tích hợp **AI (Gemini API)** tự động đọc dòng log lỗi vừa phát sinh từ container `Shop-2hand`, phân tích nguyên nhân gốc rễ và bắn thông báo kèm cách sửa về **Telegram Bot** của bạn!

---

## 🧰 PHẦN 5: BỘ CÔNG CỤ THỰC HÀNH MIỄN PHÍ 100% ($0 DEVOPS TOOLKIT)

| Mảng kỹ năng | Công cụ thực hành miễn phí $0 | Vai trò trong lộ trình của bạn |
| :--- | :--- | :--- |
| **Linux & VPS** | **WSL2 Ubuntu** / **Multipass** / **Killercoda** | Máy chủ Ubuntu thực thụ ngay trên máy tính Windows của bạn. |
| **Container** | **Docker Desktop** & **Docker Hub** | Đóng gói, chạy ứng dụng và lưu trữ Image trên mây. |
| **CI/CD & DevSecOps** | **GitHub Actions**, **Jenkins Docker**, **Trivy** | Tự động test, quét bảo mật và triển khai phần mềm. |
| **Cloud Deploy** | **Render**, **Koyeb**, **Google Cloud Run** | Đưa ứng dụng ra Internet với link HTTPS miễn phí. |
| **Hạ tầng dạng Code (IaC)** | **Terraform**, **Ansible**, **LocalStack** | Giả lập AWS miễn phí trên máy cá nhân để code hạ tầng. |
| **Kubernetes (K8s)** | **Docker Desktop K8s** / **Minikube** | Cụm K8s đầy đủ tính năng chạy ngay trên máy cá nhân. |
| **Giám sát & AI** | **Prometheus**, **Grafana**, **Loki**, **Gemini API + Telegram** | Giám sát biểu đồ, gom log tập trung và trợ lý AI báo lỗi tự động. |
