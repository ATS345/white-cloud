#!/bin/sh
set -e

echo "🔧 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Checking if seed data is needed..."
NEED_SEED=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  process.stdout.write(count === 0 ? '1' : '0');
  prisma.\$disconnect();
}).catch(() => { process.stdout.write('0'); });
")

if [ "$NEED_SEED" = "1" ]; then
  echo "🌱 Database is empty, running seed..."
  node prisma/seed-prod.js
else
  echo "✅ Database already has data, skipping seed."
fi

echo "🚀 Starting application..."
exec node dist/main.js
