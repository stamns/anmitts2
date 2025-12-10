# 🎙️ 纳米AI文字转语音工具（Cloudflare Workers 版本）

无需安装，在线使用，调用 NanoAI API，支持多种中文和英文声音。基于 Cloudflare Workers 的无服务器架构，提供高质量的语音合成服务。

## 核心特性

- 🌐 **在线使用**：无需任何安装和部署复杂性
- 🎯 **高质量语音合成**：基于 NanoAI (bot.n.cn) 的专业语音技术
- 🎤 **丰富声音选择**：支持 20+ 中文和英文声音，动态加载
- 📡 **双播放模式**：流式播放（边生成边播放）和标准播放两种模式
- 🧹 **智能文本处理**：多阶段清理（Markdown、Emoji、URL、换行等）
- 📱 **响应式 Web UI**：Vue 3 前端，支持桌面、平板、手机
- ⚙️ **参数调节**：可调节语速（0.25-2.0）和音调（0.5-1.5）
- 💾 **本地缓存**：自动保存配置和表单数据到 localStorage
- 🔄 **自动批处理**：长文本智能分块处理，提高稳定性

## 详细部署指南

### 1.3.1 前置条件

- Cloudflare 免费账户（https://dash.cloudflare.com）
- Node.js 18+ 和 npm
- Git
- 可选：自定义域名（使用 Cloudflare）

### 1.3.2 本地开发环境准备

```bash
# 1. 克隆仓库
git clone https://github.com/stamns/anmitts2.git
cd anmitts2

# 2. 安装 Wrangler CLI
npm install -g @cloudflare/wrangler
# 或使用 npx (不需要全局安装)
npx wrangler --version

# 3. 配置环境变量（可选）
cp .env.example .env.local
# 编辑 .env.local，按需配置 API_KEY、LOG_LEVEL 等
```

### 1.3.3 Wrangler 认证和项目配置

```bash
# 登录 Cloudflare 账户
npx wrangler login
# 浏览器会打开登录页面，授权后返回终端

# 检查 wrangler.toml 配置
# 确保以下字段正确：
# - name = "anmitts2" (Worker 名称，会生成 anmitts2.*.workers.dev)
# - main = "src/index.js"
# - compatibility_date = "2024-12-01"
```

### 1.3.4 本地测试

```bash
# 启动本地开发服务器
npx wrangler dev

# 输出类似：
# ▲ [wrangler:inf] Ready on http://localhost:8787

# 在浏览器打开 http://localhost:8787
# 应该看到 Vue 3 UI 界面

# 测试 API 端点（新终端窗口）：
curl http://localhost:8787/api/health
curl http://localhost:8787/v1/models
```

### 1.3.5 部署到 Cloudflare Workers

```bash
# 部署到生产环境
npx wrangler deploy

# 输出类似：
# ✨ Successfully published your Worker to
# https://anmitts2.your-account.workers.dev

# 复制生成的 URL，这就是你的公网访问地址
```

### 1.3.6 验证部署成功

- 在浏览器打开部署的 URL：https://anmitts2.your-account.workers.dev
- 应该看到 Vue 3 UI 界面
- 可以输入文本并生成语音
- 测试流式和标准播放两种模式

## 环境变量配置说明

```bash
# .env.example 文件说明：

API_KEY=your-api-key-here (可选)
# - 如果留空，API 无认证要求
# - 如果设置，前端需要在请求头中提供 Authorization: Bearer {API_KEY}

LOG_LEVEL=info (可选)
# - 日志级别：debug | info | warn | error
# - 默认：info
```

## 项目结构说明

```
anmitts2/
├── src/
│   ├── index.js               # Worker 主入口，包含路由和 HTML UI
│   ├── services/
│   │   ├── tts.js             # TTS 核心逻辑
│   │   ├── text-processor.js  # 文本处理和分块
│   │   └── nano-ai-tts.js     # NanoAI API 调用
│   └── utils/
│       └── md5.js             # MD5 哈希工具
├── wrangler.toml              # Cloudflare Workers 配置
├── package.json               # npm 依赖
├── .env.example               # 环境变量模板
├── .gitignore                 # git 忽略规则
└── README.md                  # 本文档
```

## API 文档

### GET /api/health - 健康检查

**请求：**
```bash
curl http://localhost:8787/api/health
```

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2024-12-10T10:00:00.000Z"
}
```

### GET /v1/models - 获取可用声音列表

**请求：**
```bash
curl http://localhost:8787/v1/models
```

**响应：**
```json
{
  "object": "list",
  "data": [
    {
      "id": "zh-CN-XiaoXiaoNeural",
      "object": "model",
      "owned_by": "nanodotai",
      "permission": []
    },
    ...
  ]
}
```

### POST /v1/audio/speech - 生成语音

**请求：**
```bash
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "input": "你好，这是一个测试",
    "voice": "zh-CN-XiaoXiaoNeural",
    "speed": 1.0,
    "pitch": 1.0,
    "stream": false,
    "cleaning_options": {
      "remove_markdown": true,
      "remove_emoji": true,
      "remove_urls": true
    }
  }'
```

**响应：** MP3 音频流（二进制）

**参数说明：**
- `input` (string, 必需): 要转语音的文本
- `voice` (string, 必需): 声音 ID（从 /v1/models 获取）
- `speed` (number, 可选): 语速 (0.25-2.0，默认 1.0)
- `pitch` (number, 可选): 音调 (0.5-1.5，默认 1.0)
- `stream` (boolean, 可选): 是否流式返回 (默认 false)
- `cleaning_options` (object, 可选): 文本清理选项
  - `remove_markdown`: 移除 Markdown 格式
  - `remove_emoji`: 移除 Emoji
  - `remove_urls`: 移除 URL
  - `remove_newlines`: 移除换行符
  - `remove_references`: 移除引用数字

## 本地开发和测试

### 启动开发服务器

```bash
# 启动开发服务器
npx wrangler dev --local

# 或使用 node 内置的测试模式
npx wrangler dev --test
```

### 测试脚本示例 (test.sh)

```bash
#!/bin/bash

BASE_URL="http://localhost:8787"

echo "Testing /api/health..."
curl -s $BASE_URL/api/health | jq .

echo -e "\n\nTesting /v1/models..."
curl -s $BASE_URL/v1/models | jq '.data[0:2]'

echo -e "\n\nTesting /v1/audio/speech (standard mode)..."
curl -s -X POST $BASE_URL/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "input": "这是一个测试",
    "voice": "zh-CN-XiaoXiaoNeural",
    "speed": 1.0,
    "stream": false
  }' --output test.mp3 && echo "Audio saved to test.mp3"
```

## 故障排除

### Q: 部署后访问 Worker URL 显示 404
**A:** 检查 wrangler.toml 中的 name 字段，确保与实际部署的名称一致。

### Q: API 调用返回 CORS 错误
**A:** 检查浏览器控制台的错误信息。项目已配置 CORS 允许所有域名，如问题仍存在，检查网络连接。

### Q: 音频生成速度很慢或超时
**A:** 可能是 NanoAI API 响应慢或文本过长。建议：
- 检查网络连接
- 缩短输入文本（< 1000 字符）
- 查看浏览器控制台是否有错误信息

### Q: Worker 大小超过限制
**A:** 如果遇到 413 Payload Too Large，可能是请求文本过长。缩短文本或分多次请求。

### Q: 如何自定义域名？
**A:** 在 Cloudflare 上添加自定义域名，然后在 wrangler.toml 中配置：
```toml
routes = [
  { pattern = "yourdomain.com/api/*", zone_name = "yourdomain.com" }
]
```

## 功能说明

### 声音选择
- 支持 20+ 中文和英文声音
- 从 NanoAI (bot.n.cn) API 动态加载
- 缓存声音列表以提高性能

### 文本处理
- **智能分块**：按句子边界分割，避免断句
- **多阶段清理**：
  - 移除 Markdown 格式（#、**、- 等）
  - 移除 Emoji 表情
  - 移除 URL 和链接
  - 移除多余换行符
  - 移除引用数字 [1] [2] 等

### 播放模式
- **流式播放**：边生成边播放，延迟低，用户体验好
- **标准播放**：等待完整生成后播放，适合需要完整音频的场景

### 本地缓存
- 配置和表单数据自动保存到 localStorage
- 页面刷新后自动恢复设置

## 技术架构

### 前端（Vue 3）
- 通过 CDN 引入 Vue 3，无需构建工具
- 响应式设计，支持桌面、平板、手机
- 使用 CSS Grid 和 Flexbox 布局
- 渐变背景和玻璃拟态设计

### 后端（Cloudflare Workers）
- 无服务器架构，全球边缘分发
- 使用 Cloudflare KV 进行缓存
- 兼容 OpenAI TTS API 格式
- 支持流式和非流式响应

### 音频处理
- 基于 NanoAI (bot.n.cn) API
- 自动批处理长文本
- MP3 格式输出
- 支持语速和音调调节

## 性能指标

- **响应时间**：1-5 秒（单段文本）
- **批处理并发**：最多 6 个并发请求
- **声音缓存**：24 小时 TTL（可配置）
- **音频缓存**：1 小时（Cloudflare CDN）

## 安全特性

- 可选的 API 密钥认证
- 跨域请求保护（可配置 CORS 策略）
- 输入验证和清理
- 文本长度限制防止滥用
- 敏感信息日志保护

## 开发环境配置

### 开发模式运行

```bash
# 启动本地开发环境
npm run dev
# 或
npx wrangler dev

# 访问 http://localhost:8787
```

### 生产部署

```bash
# 预览部署
npx wrangler publish --env development

# 正式部署
npx wrangler publish --env production
```

### 环境变量设置

在 Cloudflare Dashboard 中设置环境变量：
1. 进入 Workers & Pages
2. 选择你的 Worker
3. 进入 Settings > Variables
4. 添加环境变量

## 监控和日志

### 查看 Worker 日志
```bash
# 实时日志
npx wrangler tail

# 查看历史日志
# 在 Cloudflare Dashboard > Workers & Pages > 你的 Worker > Logs
```

### 性能监控
- 使用 Cloudflare Analytics 监控访问量
- 通过 Worker Metrics 监控执行时间
- 查看 KV 存储使用情况

## 扩展和自定义

### 添加新声音
1. 在 Cloudflare KV 中更新声音列表
2. 或修改 `src/services/nano-ai-tts.js` 中的声音获取逻辑

### 自定义 UI
编辑 `src/index.js` 中的 HTML 模板部分，修改：
- CSS 样式
- Vue 组件结构
- 响应式布局

### 添加新功能
- 在 `src/services/` 目录下添加新的服务
- 在 `src/utils/` 目录下添加工具函数
- 更新 API 路由处理逻辑

## 项目来源和参考

- **原项目**：anmitts2（Python Tkinter TTS 工具）
- **迁移到**：Cloudflare Workers（无服务器架构）
- **参考项目**：edgetts（文本处理和批处理实现）
- **语音服务**：NanoAI (bot.n.cn)

## 许可证

MIT License

## 技术支持

如有问题或建议：
1. 首先查看本 README.md 和故障排除章节
2. 检查 Cloudflare Worker 日志
3. 使用 curl 测试 API 端点
4. 提交 Issue 到项目仓库

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [KV 存储文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Cloudflare 免费账户](https://dash.cloudflare.com)