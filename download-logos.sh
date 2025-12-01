#!/bin/bash

# Script to download AI model logos
# This script downloads logos from publicly available sources

echo "Downloading AI Model Logos..."

# Create logos directory
mkdir -p public/logos

# 1. OpenAI Logo (from Simple Icons)
echo "Downloading OpenAI logo..."
curl -L "https://simpleicons.org/icons/openai.svg" -o public/logos/openai.svg
# Convert SVG to PNG (requires ImageMagick or similar)
# If ImageMagick is installed:
# convert public/logos/openai.svg -resize 128x128 public/logos/openai.png

# 2. Google Logo (from Simple Icons)
echo "Downloading Google logo..."
curl -L "https://simpleicons.org/icons/google.svg" -o public/logos/google.svg

# 3. Anthropic Claude Logo
# Note: Anthropic logo may not be available on Simple Icons
# You may need to download manually from their official site
echo "Anthropic logo: Please download manually from https://www.anthropic.com"

# 4. xAI Grok Logo
# Note: xAI logo may not be available on Simple Icons
# You may need to download manually from https://x.ai
echo "xAI Grok logo: Please download manually from https://x.ai"

echo ""
echo "SVG files downloaded to public/logos/"
echo "To convert SVG to PNG, you can:"
echo "1. Use online converter: https://cloudconvert.com/svg-to-png"
echo "2. Use ImageMagick: convert input.svg -resize 128x128 output.png"
echo "3. Use Inkscape: inkscape input.svg --export-filename=output.png --export-width=128"

