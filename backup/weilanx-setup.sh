#!/usr/bin/env bash
# 恢复 weilanx 视频环境（新机器 / 环境被重置时跑一次）
set -e
[ -d /data/weilanx-claude-videos ] || git clone --depth 1 https://github.com/Azure12355/weilanx-claude-videos /data/weilanx-claude-videos
cd /data/weilanx-claude-videos && [ -d node_modules ] || npm install
command -v uv >/dev/null || pip3 install -q uv
python3 -c "import edge_tts, faster_whisper" 2>/dev/null || pip3 install -q edge-tts faster-whisper
mkdir -p ~/.config/fontconfig && cp /data/fonts/fonts.conf ~/.config/fontconfig/fonts.conf && fc-cache -f >/dev/null 2>&1
echo "weilanx env ready"
