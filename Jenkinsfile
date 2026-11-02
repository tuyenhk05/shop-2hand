pipeline {
    agent any

    environment {
        PROJECT_NAME = "shop-2hand"
        DOCKERHUB_USER = "tuyendevelops"
    }

    stages {
        stage('1. Checkout Source Code') {
            steps {
                echo "📥 Đang tải mã nguồn mới nhất của dự án ${PROJECT_NAME}..."
                checkout scm
            }
        }

        stage('2. Automated Unit Testing') {
            steps {
                echo "🧪 Đang chạy kiểm thử tự động (Unit Tests) cho Backend..."
                dir('BE') {
                    sh 'npm test'
                }
            }
        }

        stage('3. DevSecOps Trivy Security Scan') {
            steps {
                echo "🛡️ Đang quét lỗ hổng bảo mật CVE bằng Trivy..."
                sh '''
                    docker run --rm \
                        -v trivy-cache:/root/.cache/ \
                        -v $(pwd)/BE:/project \
                        aquasec/trivy:latest fs \
                        --scanners vuln \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        /project
                '''
            }
        }

        stage('4. Build Docker Images') {
            steps {
                echo "🐳 Đang đóng gói Docker Image cho Backend & Frontend..."
                sh 'docker compose build'
            }
        }
    }

    post {
        success {
            echo "✅ PIPELINE HOÀN TẤT THÀNH CÔNG 100%! Hệ thống an toàn và sẵn sàng triển khai!"
        }
        failure {
            echo "🚨 CẢNH BÁO: Pipeline thất bại! Vui lòng kiểm tra lại Unit Test hoặc lỗ hổng bảo mật CVE!"
        }
    }
}