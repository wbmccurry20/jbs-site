#!/bin/bash

# A&B Construction Modern Website - Quick Setup Script
# This script helps you get started quickly

echo "🏗️  A&B Construction - Modern Website Setup"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the a-b-construction-modern directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Installation failed. Please check your Node.js installation."
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open http://localhost:4321 in your browser"
echo ""
echo "3. Add your images to /public/images/"
echo "   See /public/images/README.md for details"
echo ""
echo "4. Customize the content:"
echo "   - Update company info in src/components/Footer.tsx"
echo "   - Edit projects in src/components/ProjectShowcase.tsx"
echo "   - Modify homepage content in src/pages/index.astro"
echo ""
echo "5. Set up contact form:"
echo "   - Sign up at https://web3forms.com (free)"
echo "   - Get your access key"
echo "   - Add it to src/components/ContactForm.tsx"
echo ""
echo "6. When ready to deploy:"
echo "   npm run build"
echo "   Then upload the 'dist/' folder to Netlify or Vercel"
echo ""
echo "📚 Read SETUP.md for detailed instructions"
echo "📊 Read MODERNIZATION.md to understand the innovation"
echo ""
echo "🚀 Happy building!"
