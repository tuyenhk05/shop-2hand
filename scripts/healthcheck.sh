#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# KỊCH BẢN TỰ ĐỘNG GIÁM SÁT & HỒI SINH (SELF-HEALING) DỰ ÁN SHOP-2HAND
# ==============================================================================

LOG_FILE="./scripts/healthcheck.log"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
CONTAINERS=("shop-2hand-backend" "shop-2hand-frontend")

echo "[$TIMESTAMP] 🔍 Bắt đầu kiểm tra sức khỏe hệ thống Shop-2hand..." | tee -a "$LOG_FILE"

for CONTAINER in "${CONTAINERS[@]}"; do
    # Kiểm tra trạng thái chạy (true/false) của từng container
    IS_RUNNING=$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null || echo "false")

    if [ "$IS_RUNNING" = "true" ]; then
        echo "[$TIMESTAMP] ✅ Container [$CONTAINER] đang hoạt động bình thường (UP)." | tee -a "$LOG_FILE"
    else
        echo "[$TIMESTAMP] 🚨 CẢNH BÁO: Container [$CONTAINER] đã bị SẬP! Đang tự động khởi động lại..." | tee -a "$LOG_FILE"
        docker start "$CONTAINER"
        echo "[$TIMESTAMP] 🔄 Đã hồi sinh thành công container [$CONTAINER]!" | tee -a "$LOG_FILE"
    fi
done