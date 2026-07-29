#!/bin/bash
# ============================================
# BurkanPOS VPS Deployment Script
# Domain: burkanpos.chatrix.vip
# Backend Port: 5555
# ============================================

set -e

echo "========================================="
echo " BurkanPOS - VPS Setup Script"
echo "========================================="

# --- 1. Create project directory ---
echo "[1/8] Creating project directories..."
sudo mkdir -p /var/www/burkanpos/backend
sudo mkdir -p /var/www/burkanpos/frontend
sudo chown -R $USER:$USER /var/www/burkanpos

# --- 2. Copy files (assumes you uploaded the project to ~/burkanpos-upload) ---
echo "[2/8] Copying project files..."
cp -r ~/burkanpos-upload/pos-backend/* /var/www/burkanpos/backend/
cp -r ~/burkanpos-upload/pos-frontend/dist/* /var/www/burkanpos/frontend/dist/ 2>/dev/null || true

# --- 3. Install backend dependencies ---
echo "[3/8] Installing backend dependencies..."
cd /var/www/burkanpos/backend
npm install --production

# --- 4. Create .env for production ---
echo "[4/8] Setting up environment..."
cat > /var/www/burkanpos/backend/.env << 'EOF'
# Server Configuration
PORT=5555

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=possystem

# JWT Configuration
JWT_SECRET=CHANGE_THIS_TO_A_STRONG_RANDOM_SECRET
JWT_EXPIRES_IN=7d
EOF

echo "  >> IMPORTANT: Edit /var/www/burkanpos/backend/.env with your real DB password & JWT secret!"

# --- 5. Setup database ---
echo "[5/8] Running database migration..."
cd /var/www/burkanpos/backend
node database/migrate.js
node database/seed.js

# --- 6. Setup Nginx ---
echo "[6/8] Configuring Nginx..."
sudo cp ~/burkanpos-upload/deployment/burkanpos.chatrix.vip.conf /etc/nginx/sites-available/burkanpos.chatrix.vip
sudo ln -sf /etc/nginx/sites-available/burkanpos.chatrix.vip /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# --- 7. Setup PM2 ---
echo "[7/8] Starting backend with PM2..."
sudo npm install -g pm2 2>/dev/null || true
cd /var/www/burkanpos/backend
pm2 delete burkanpos-backend 2>/dev/null || true
pm2 start ~/burkanpos-upload/deployment/ecosystem.config.js
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

# --- 8. Firewall ---
echo "[8/8] Configuring firewall (UFW)..."
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS (for SSL later)
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
echo " NEXT STEPS:"
echo "   1. Edit /var/www/burkanpos/backend/.env (DB password + JWT secret)"
echo "   2. Run: pm2 restart burkanpos-backend"
echo "   3. (Optional) Add SSL: sudo certbot --nginx -d burkanpos.chatrix.vip"
echo ""
echo "========================================="
