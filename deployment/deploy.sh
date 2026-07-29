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

# --- 1. Create .env if not exists ---
echo "[1/7] Setting up environment..."
if [ ! -f "$REPO_ROOT/pos-backend/.env" ]; then
cat > "$REPO_ROOT/pos-backend/.env" << 'EOF'
# Server Configuration
PORT=5555

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=burkanadministrator
DB_PASSWORD=EIO2zHf3iemiuw4fCL5N
DB_NAME=possystem

# JWT Configuration
JWT_SECRET=pos_system_secret_key_change_in_production
JWT_EXPIRES_IN=7d
EOF
echo "  .env created!"
else
echo "  .env already exists, skipping."
fi

# --- 2. Install backend dependencies ---
echo "[2/7] Installing backend dependencies..."
cd "$REPO_ROOT/pos-backend"
npm install --production

# --- 3. Build frontend ---
echo "[3/7] Building frontend..."
cd "$REPO_ROOT/pos-frontend"
npm install
npm run build

# --- 4. Run database migration & seed ---
echo "[4/7] Running database migration..."
cd "$REPO_ROOT/pos-backend"
node database/migrate.js
node database/seed.js

# --- 5. Setup Nginx ---
echo "[5/7] Configuring Nginx..."
sudo cp "$REPO_ROOT/deployment/burkanpos.chatrix.vip.conf" /etc/nginx/sites-available/burkanpos.chatrix.vip
sudo ln -sf /etc/nginx/sites-available/burkanpos.chatrix.vip /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# --- 6. Setup PM2 ---
echo "[6/7] Starting backend with PM2..."
sudo npm install -g pm2 2>/dev/null || true
pm2 delete burkanpos-backend 2>/dev/null || true
pm2 start "$REPO_ROOT/deployment/ecosystem.config.js"
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

# --- 7. Firewall ---
echo "[7/7] Configuring firewall (UFW)..."
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
