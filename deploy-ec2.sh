#!/bin/bash
set -euo pipefail

# ================================================
# Shadow Deploy Production Demo — EC2 Setup
# ================================================
# Deploys V1+V2 websites + Shadow Deploy platform
# End users access http://<EC2-IP> and see V1 normally
# All API traffic is silently mirrored to V2
#
# Requirements: Ubuntu 24.04, t3.medium (4GB RAM)
# Ports open: 22, 80, 3004
# ================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

echo ""
echo "================================================"
echo "  Shadow Deploy — Production Demo Setup"
echo "================================================"
echo ""

# ── Step 1: Swap ──
echo "━━━ Step 1/7: Creating swap space ━━━"
if ! swapon --show | grep -q '/swapfile'; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab > /dev/null
    log "4GB swap created"
else
    warn "Swap already exists, skipping"
fi

# ── Step 2: Docker ──
echo ""
echo "━━━ Step 2/7: Installing Docker ━━━"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm -f get-docker.sh
    log "Docker installed"
else
    warn "Docker already installed"
fi

# Use sudo docker if current user isn't in docker group yet
DOCKER="docker"
if ! docker ps &> /dev/null 2>&1; then
    DOCKER="sudo docker"
fi
COMPOSE="$DOCKER compose"

# ── Step 3: Collect Configuration ──
echo ""
echo "━━━ Step 3/7: Configuration ━━━"

EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")
if [ -z "$EC2_PUBLIC_IP" ]; then
    read -p "  Enter your EC2 Public IP: " EC2_PUBLIC_IP
fi
info "EC2 Public IP: $EC2_PUBLIC_IP"

read -p "  Supabase Project URL (Press Enter for default): " SUPABASE_URL
SUPABASE_URL=${SUPABASE_URL:-https://likjiuylgndoedpkzxhb.supabase.co}

read -p "  Supabase Anon Key (Press Enter for default): " SUPABASE_ANON_KEY
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpa2ppdXlsZ25kb2VkcGt6eGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODQ5NzUsImV4cCI6MjA4Nzk2MDk3NX0.y6yvFLWpLWkRPYoi-PpPa645SEBjwWZnd6c-ExZJBHU}

read -p "  Gemini API Key (optional, Enter to skip): " GEMINI_API_KEY
GEMINI_API_KEY=${GEMINI_API_KEY:-}

# ── Step 4: Clone Repositories ──
echo ""
echo "━━━ Step 4/7: Cloning repositories ━━━"
cd ~

if [ ! -d "ticket-ai-v2" ]; then
    git clone https://github.com/ayush1233/ticket-ai-v2.git
    log "Cloned ticket-ai-v2"
else
    cd ticket-ai-v2 && git pull && cd ~
    warn "ticket-ai-v2 already exists, pulled latest"
fi

if [ ! -d "shadow-deploy" ]; then
    git clone https://github.com/ayush1233/shadow-deploy.git
    log "Cloned shadow-deploy"
else
    cd shadow-deploy && git pull && cd ~
    warn "shadow-deploy already exists, pulled latest"
fi

# ── Step 5: Start V1 + V2 Applications ──
echo ""
echo "━━━ Step 5/7: Building V1 + V2 apps ━━━"
info "This may take 5-10 minutes on first run..."

cd ~/ticket-ai-v2
$COMPOSE up -d --build
log "V1 + V2 apps started"

info "Waiting 30s for apps to initialize..."
sleep 30

# ── Step 6: Configure & Start Shadow Deploy ──
echo ""
echo "━━━ Step 6/7: Configuring Shadow Deploy ━━━"
cd ~/shadow-deploy

# Generate .env
cat > .env << EOF
# Shadow Deploy — EC2 Production Config
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
GEMINI_API_KEY=$GEMINI_API_KEY

# V1 on port 3000, V2 on port 4000 (running on this host)
PROD_BACKEND_HOST=host.docker.internal
PROD_BACKEND_PORT=3000
SHADOW_BACKEND_HOST=host.docker.internal
SHADOW_BACKEND_PORT=4000
MIRROR_PERCENTAGE=100

# Security
INTERNAL_SHARED_SECRET=shadow-internal-dev-secret
JWT_SECRET=shadow-jwt-ec2-$(date +%s)
CORS_ALLOWED_ORIGINS=http://localhost:3004,http://$EC2_PUBLIC_IP:3004

# Ports
DASHBOARD_PORT=3004
NGINX_PROXY_PORT=8080
EOF

log "Created .env"

# EC2-specific compose override (port 80, Linux host resolution, disable extras)
cat > docker-compose.ec2.yml << 'YAMLEOF'
services:
  nginx-proxy:
    ports:
      - "80:80"
    extra_hosts:
      - "host.docker.internal:host-gateway"
  sample-api-v1:
    deploy:
      replicas: 0
  sample-api-v2:
    deploy:
      replicas: 0
  prometheus:
    deploy:
      replicas: 0
  grafana:
    deploy:
      replicas: 0
YAMLEOF

log "Created docker-compose.ec2.yml"

# ── Step 7: Start Shadow Deploy ──
echo ""
echo "━━━ Step 7/7: Building Shadow Deploy platform ━━━"
info "This may take 10-15 minutes (Java services compile)..."

$COMPOSE -f docker-compose.yml -f docker-compose.ec2.yml up -d --build

log "Shadow Deploy platform started"

# ── Summary ──
echo ""
echo "================================================"
echo "  ✅ Deployment Complete!"
echo "================================================"
echo ""
echo "  🌐 V1 Website:       http://$EC2_PUBLIC_IP"
echo "  📊 Shadow Dashboard:  http://$EC2_PUBLIC_IP:3004"
echo ""
echo "  📋 How to test:"
echo "  1. Open http://$EC2_PUBLIC_IP in your browser"
echo "  2. Use the V1 website normally (create/view tickets)"
echo "  3. Open http://$EC2_PUBLIC_IP:3004 for comparisons"
echo ""
echo "  🔧 View logs:"
echo "  cd ~/shadow-deploy && $COMPOSE -f docker-compose.yml -f docker-compose.ec2.yml logs -f"
echo "  cd ~/ticket-ai-v2 && $COMPOSE logs -f"
echo ""
echo "  ⛔ Stop everything:"
echo "  cd ~/shadow-deploy && $COMPOSE -f docker-compose.yml -f docker-compose.ec2.yml down"
echo "  cd ~/ticket-ai-v2 && $COMPOSE down"
echo ""
