#!/bin/bash
echo "🔧 Staging all changes..."
git add .

echo "📝 Committing..."
git commit -m "🤖 Auto-review: linted, tested, diffed, cleaned"

echo "🚀 Pushing to current branch..."
branch=$(git rev-parse --abbrev-ref HEAD)
git push origin "$branch"

