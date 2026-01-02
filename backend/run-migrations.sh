#!/bin/bash
# Script to run database migrations on Railway

echo "🔄 Running database migrations..."
echo "=================================="

# Run migrations
npm run typeorm:cli migration:run

echo ""
echo "✅ Migrations completed!"
echo ""
echo "Verifying tables created:"
echo "=========================="

# Connect to database and list tables
echo "Tables in database:"
echo "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" | npm run typeorm:cli query

echo ""
echo "Done!"
