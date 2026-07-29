#!/bin/bash
# ============================================
# BurkanPOS VPS Deployment Script
# Domain: burkanpos.chatrix.vip
# Backend Port: 5555
# Run from the root of the cloned repo:
#   cd /path/to/SystemBurkan && bash deployment/deploy.sh
# ============================================

set -e

# Get the repo root (parent of deployment/)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "========================================="
echo " BurkanPOS - VPS Setup"
echo " Repo: $REPO_ROOT"
echo "========================================="

# --- 1. Install backend dependencies ---
echo "[1/6] Installing backend dependencies..."
cd "$REPO_ROOT/pos-backend"
npm install --production

# --- 2. Build frontend ---
echo "[2/6] Building frontend..."
cd "$REPO_ROOT/pos-frontend"
npm install
npm run build

# --- 3. Run database migration & seed ---
echo "[3/6] Running database migration..."
cd "$REPO_ROOT/pos-backend"
node database/migrate.js
node database/seed.js

# --- 4. Setup Nginx ---
echo "[4/6] Configuring Nginx..."
sudo cp "$REPO_ROOT/deployment/burkanpos.chatrix.vip.conf" /etc/nginx/sites-available/burkanpos.chatrix.vip
sudo ln -sf /etc/nginx/sites-available/burkanpos.chatrix.vip /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# --- 5. Setup PM2 ---
echo "[5/6] Starting backend with PM2..."
sudo npm install -g pm2 2>/dev/null || true
pm2 delete burkanpos-backend 2>/dev/null || true
pm2 start "$REPO_ROOT/deployment/ecosystem.config.js"
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

# --- 6. Firewall ---
echo "[6/6] Configuring firewall (UFW)..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status

echo ""
echo "========================================="
echo " DEPLOYMENT COMPLETE!"
echo "========================================="
echo ""
echo " Website: http://burkanpos.chatrix.vip"
echo " Backend: http://127.0.0.1:5555 (internal only)"
echo ""
echo " Default login: admin / admin123"
echo ""
echo " To add SSL:"
echo "   sudo certbot --nginx -d burkanpos.chatrix.vip"
echo ""
echo "========================================="
