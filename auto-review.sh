#!/bin/bash
echo "📋 Running auto-review for $(basename "$PWD")"

echo "🔍 Checking branches..."
git branch -a

echo "🔍 Diff between main and dev (if both exist)..."
git show-ref --verify --quiet refs/heads/dev && git diff main dev

echo "🧪 Running frontend lint (if exists)..."
[ -d frontend ] && cd frontend && npm install && npm run lint:fix && cd ..

echo "🧪 Running backend lint/test (if exists)..."
[ -d backend ] && cd backend && yarn install && yarn lint && yarn test && cd ..

echo "✅ Review complete."

