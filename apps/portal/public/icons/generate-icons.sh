#!/bin/bash
# アイコン生成スクリプト
# 要件: ImageMagick (brew install imagemagick)
# 実行: bash public/icons/generate-icons.sh

# 青背景に「業」の文字でアイコン生成
convert -size 192x192 xc:'#1e40af' \
  -fill white -font "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc" \
  -pointsize 100 -gravity Center -annotate 0 "業" \
  public/icons/icon-192.png

convert -size 512x512 xc:'#1e40af' \
  -fill white -font "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc" \
  -pointsize 260 -gravity Center -annotate 0 "業" \
  public/icons/icon-512.png

echo "Icons generated: icon-192.png, icon-512.png"
