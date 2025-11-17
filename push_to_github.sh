#!/bin/bash

# Script pour pousser vers GitHub
# Usage: ./push_to_github.sh [YOUR_GITHUB_TOKEN]

echo "🚀 Pushing Multi-Agent Research Assistant to GitHub..."
echo "Repository: https://github.com/M13E-LAB/AgenticSystem1"
echo ""

if [ -z "$1" ]; then
    echo "❌ Error: GitHub token required"
    echo "Usage: ./push_to_github.sh YOUR_GITHUB_TOKEN"
    echo ""
    echo "To get a token:"
    echo "1. Go to GitHub.com → Settings → Developer settings → Personal access tokens"
    echo "2. Generate new token with 'repo' permissions"
    echo "3. Copy the token and use it with this script"
    exit 1
fi

TOKEN=$1

echo "📁 Files to be pushed:"
git status --porcelain
echo ""

echo "🔄 Pushing to GitHub..."
git push https://$TOKEN@github.com/M13E-LAB/AgenticSystem1.git main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your project at: https://github.com/M13E-LAB/AgenticSystem1"
    echo ""
    echo "📋 Your repository now contains:"
    echo "   - Multi-Agent Research Assistant (complete system)"
    echo "   - Documentation and usage guide"
    echo "   - Requirements and setup instructions"
else
    echo ""
    echo "❌ Push failed. Check your token and try again."
    echo "💡 Make sure your token has 'repo' permissions."
fi
