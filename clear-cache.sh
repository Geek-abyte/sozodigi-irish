#!/bin/bash

echo "🧹 Clearing Next.js cache and rebuilding..."

# Kill any running dev servers
echo "Stopping any running dev servers..."
pkill -f "next dev" || true

# Remove Next.js cache
echo "Removing .next directory..."
rm -rf .next

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next/cache

# Clear node cache (optional but helps)
echo "Clearing node module cache..."
rm -rf node_modules/.cache

echo "✅ Cache cleared!"
echo ""
echo "Now run: npm run dev"
echo ""
echo "Then:"
echo "1. Open your browser"
echo "2. Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) to hard refresh"
echo "3. Or open DevTools > Network tab > Check 'Disable cache'"
