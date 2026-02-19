#!/bin/bash
# LSM3 Deployment Script - Quick deployment to Railway/Render

echo "🚀 LSM3 Project Deployment Helper"
echo "=================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Pre-requisites found"
echo ""

# Menu
echo "Choose deployment option:"
echo "1. Deploy Frontend to Vercel"
echo "2. Deploy Backend to Railway"
echo "3. Deploy Backend to Render"
echo "4. Prepare for DigitalOcean"
echo "5. Test Production Build Locally"
echo "6. Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo "📦 Preparing Frontend for Vercel..."
        cd frontend
        
        # Check if vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        echo "Building frontend..."
        npm run build
        
        echo ""
        echo "🎯 Login to Vercel..."
        vercel
        
        echo ""
        echo "✅ Frontend deployed to Vercel!"
        ;;
        
    2)
        echo "📦 Preparing Backend for Railway..."
        cd backend
        
        echo "Installing dependencies..."
        npm install
        
        echo ""
        echo "⚠️  Make sure you have:"
        echo "   1. Railroad CLI installed (npm install -g railway)"
        echo "   2. Railway account created (https://railway.app)"
        echo "   3. GitHub repository connected"
        echo ""
        read -p "Continue? (y/n): " confirm
        
        if [ "$confirm" = "y" ]; then
            echo "Initializing Railway..."
            railway init
            
            echo ""
            echo "Deploying to Railway..."
            railway up
            
            echo ""
            echo "✅ Backend deployed to Railway!"
        fi
        ;;
        
    3)
        echo "📦 Preparing Backend for Render..."
        cd backend
        
        echo "Installing dependencies..."
        npm install
        
        echo ""
        echo "⚠️  Manual steps required:"
        echo "   1. Go to https://render.com"
        echo "   2. Click 'New +' → 'Web Service'"
        echo "   3. Connect your GitHub repository"
        echo "   4. Configure:"
        echo "      - Runtime: Node"
        echo "      - Build command: npm install"
        echo "      - Start command: npm start"
        echo "   5. Add environment variables"
        echo "   6. Deploy"
        echo ""
        read -p "Open Render dashboard? (y/n): " confirm
        
        if [ "$confirm" = "y" ]; then
            if command -v xdg-open &> /dev/null; then
                xdg-open https://render.com/dashboard
            elif command -v open &> /dev/null; then
                open https://render.com/dashboard
            else
                echo "Open this URL: https://render.com/dashboard"
            fi
        fi
        ;;
        
    4)
        echo "📦 Preparing for DigitalOcean..."
        
        echo ""
        echo "📋 Deployment steps:"
        echo "   1. Create DigitalOcean Droplet (Ubuntu 22.04)"
        echo "   2. SSH into droplet"
        echo "   3. Run the following commands:"
        echo ""
        echo "   --- Copy and paste in terminal ---"
        echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "   sudo apt-get install -y nodejs postgresql postgresql-contrib"
        echo "   sudo npm install -g pm2"
        echo "   cd /var/www"
        echo "   git clone YOUR_REPO_URL"
        echo "   cd YOUR_REPO/backend"
        echo "   npm install"
        echo "   pm2 start npm --name \"lsm3-backend\" -- start"
        echo "   pm2 startup"
        echo "   pm2 save"
        echo "   sudo apt-get install -y nginx"
        echo "   --- End ---"
        echo ""
        echo "Then configure Nginx and SSL"
        ;;
        
    5)
        echo "🧪 Testing Production Build Locally..."
        
        # Test Backend
        echo ""
        echo "Testing Backend..."
        cd backend
        if [ ! -d "node_modules" ]; then
            npm install
        fi
        NODE_ENV=production npm start &
        BACKEND_PID=$!
        sleep 3
        
        echo "Testing API endpoint..."
        curl -s http://localhost:3000 || echo "Backend not responding"
        
        # Test Frontend
        echo ""
        echo "Testing Frontend..."
        cd ../frontend
        if [ ! -d "node_modules" ]; then
            npm install
        fi
        npm run build
        npm run preview &
        FRONTEND_PID=$!
        sleep 3
        
        echo "✅ Both services running!"
        echo "  Frontend: http://localhost:4173"
        echo "  Backend: http://localhost:3000"
        echo ""
        read -p "Press Enter to stop servers..."
        
        kill $BACKEND_PID $FRONTEND_PID
        echo "✅ Stopped all services"
        ;;
        
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✨ Done!"
