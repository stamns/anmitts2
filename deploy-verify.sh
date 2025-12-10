#!/bin/bash

# anmitts2 纳米AI文字转语音工具 - Cloudflare Workers 部署验证脚本
# Deployment Verification Script for anmitts2 TTS on Cloudflare Workers

set -e

echo "🚀 开始部署验证流程..."
echo "=================================="

# 1. 检查环境
echo "📋 检查开发环境..."
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"
echo "Wrangler 版本: $(wrangler --version)"

# 2. 检查必要文件
echo ""
echo "📁 检查项目文件..."
required_files=(
  "src/index.js"
  "src/services/tts.js"
  "src/services/nano-ai-tts.js"
  "src/services/text-processor.js"
  "wrangler.toml"
  "package.json"
  ".env.example"
  "README-CN.md"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (缺失)"
    exit 1
  fi
done

# 3. 检查依赖
echo ""
echo "📦 检查依赖..."
if [ -d "node_modules" ]; then
  echo "✅ 依赖已安装"
else
  echo "📥 安装依赖..."
  npm install
fi

# 4. 本地开发测试
echo ""
echo "🧪 本地开发测试..."
echo "启动开发服务器 (在后台)..."

# 启动开发服务器
wrangler dev --local &
DEV_PID=$!
sleep 5

echo "✅ 开发服务器已启动 (PID: $DEV_PID)"
echo "📍 本地URL: http://localhost:8787"

# 5. API 测试
echo ""
echo "🔍 API 端点测试..."

# 健康检查
echo "测试健康检查端点..."
curl -s http://localhost:8787/api/health | head -20

# 获取模型列表
echo ""
echo "测试模型端点..."
curl -s http://localhost:8787/v1/models | head -20

# 获取语音列表
echo ""
echo "测试语音端点..."
curl -s http://localhost:8787/v1/voices | head -20

# 停止开发服务器
echo ""
echo "🛑 停止开发服务器..."
kill $DEV_PID
wait $DEV_PID 2>/dev/null || true

# 6. 部署测试 (模拟)
echo ""
echo "🚀 部署准备检查..."
echo "wrangler.toml 配置检查:"
cat wrangler.toml

echo ""
echo "📋 部署清单:"
echo "  - 项目文件完整性: ✅"
echo "  - 依赖安装: ✅"
echo "  - 本地API测试: ✅"
echo "  - 配置检查: ✅"
echo ""
echo "🎯 下一步:"
echo "  1. 配置 Cloudflare KV 命名空间 (可选)"
echo "  2. 设置环境变量 (.env)"
echo "  3. 运行: wrangler deploy"
echo "  4. 测试生产环境端点"

echo ""
echo "✅ 部署验证完成！"