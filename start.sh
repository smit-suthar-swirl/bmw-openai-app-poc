#!/bin/bash
set -e

echo "🔧 Running Prisma db push..."
cd server && npx prisma db push --skip-generate

echo "⚙️  Generating Prisma client..."
npx prisma generate

echo "🌱 Seeding database..."
npx tsx prisma/seed.ts

echo "🚗 Starting BMW AI Server..."
cd .. && npm run dev --workspace=server
