# 🎙️ anmitts2 纳米AI文字转语音工具 (Cloudflare Workers 版)

## 项目简介

anmitts2 纳米AI文字转语音工具是一个基于 Cloudflare Workers 的无服务器文本转语音服务。该项目将原始的 Python TTS 实现转换为在 Cloudflare 全球边缘网络运行的 JavaScript Worker，提供高性能、高可用的语音合成服务。

### 核心特性

✅ **高性能文本转语音**：使用 bot.n.cn API 进行高质量MP3音频转换  
✅ **多语音支持**：支持多种语音选项（从 bot.n.cn 动态加载）  
✅ **智能文本处理**：
   - 多阶段文本清理（Markdown、表情符号、URL等）
   - 智能按句子边界分块处理
   - 自动批处理长文本

✅ **OpenAI 兼容API**：REST端点与 OpenAI TTS API 格式兼容  
✅ **CORS支持**：完整的跨域请求支持  
✅ **语音缓存**：使用 Cloudflare KV 自动缓存语音列表  
✅ **错误处理**：全面的错误处理和数据验证  
✅ **流式支持**：支持流式响应  
✅ **响应式Web界面**：Vue 3 前端，支持桌面和移动设备  

## 项目结构

```
├── src/
│   ├── index.js                 # Worker入口点和请求路由
│   ├── services/
│   │   ├── tts.js              # 主要TTS编排服务
│   │   ├── nano-ai-tts.js       # NanoAI TTS API客户端
│   │   └── text-processor.js    # 文本清理和分块工具
│   └── utils/
│       └── md5.js              # MD5哈希实现
├── tests/
│   └── test.js                 # 测试脚本（curl示例）
├── wrangler.toml               # Cloudflare Workers 配置
├── package.json                # Node.js 依赖
├── .env.example                # 环境变量模板
├── README.md                   # 英文文档
├── README-CN.md                # 中文文档（本文件）
├── DEPLOYMENT.md               # 部署指南
├── index.html                  # Vue 3 前端界面
└── worker.py                   # Python Worker 类
```

## 详细部署指南

### 1. 前置要求

- **Node.js 16+** 和 npm
- **Wrangler CLI**: `npm install -g @cloudflare/wrangler`
- **Cloudflare 账户**（免费即可）

### 2. Cloudflare 账户创建和配置

#### 创建 Cloudflare 账户
1. 访问 [Cloudflare](https://cloudflare.com) 并注册账户
2. 完成邮箱验证
3. 在控制台中确认账户状态

#### 安装 Wrangler CLI
```bash
# 全局安装
npm install -g @cloudflare/wrangler

# 验证安装
wrangler --version

# 登录 Cloudflare
wrangler login
```
登录后会打开浏览器进行授权，完成后终端会显示登录成功。

### 3. 环境变量配置

#### 复制环境变量模板
```bash
cp .env.example .env
```

#### 编辑 .env 文件
```bash
# 编辑环境变量
nano .env  # 或使用其他编辑器

# 主要配置项：
API_KEY=your-api-key-here                    # 可选：API密钥保护端点
DEFAULT_VOICE=DeepSeek                       # 默认语音
DEFAULT_SPEED=1.0                            # 默认语速
DEFAULT_PITCH=1.0                            # 默认音调
MAX_TEXT_LENGTH=10000                        # 最大文本长度
MAX_CONCURRENCY=6                            # 最大并发数
```

### 4. Cloudflare KV 命名空间配置（可选）

为了启用语音缓存，建议设置 Cloudflare KV：

#### 创建 KV 命名空间
```bash
# 创建生产环境 KV 命名空间
wrangler kv:namespace create "NANO_AI_TTS_KV"

# 创建预览环境 KV 命名空间
wrangler kv:namespace create "NANO_AI_TTS_KV" --preview
```

#### 更新 wrangler.toml
创建 KV 后，更新 `wrangler.toml` 中的命名空间ID：

```toml
[[kv_namespaces]]
binding = "NANO_AI_TTS_KV"
id = "your-actual-kv-namespace-id"
preview_id = "your-actual-preview-kv-namespace-id"
```

### 5. 分步部署命令和说明

#### 安装依赖
```bash
npm install
```

#### 本地开发测试
```bash
# 启动开发服务器
npm run dev

# 或者直接使用 wrangler
wrangler dev

# 服务将在 http://localhost:8787 启动
```

#### 部署到 Cloudflare Workers

```bash
# 部署到生产环境（推荐）
npm run deploy
# 等同于：wrangler deploy

# 部署到特定环境
wrangler deploy --env production

# 部署到开发环境
wrangler deploy --env development
```

### 6. 部署后验证步骤

#### 6.1 获取生产环境 URL
部署成功后，Cloudflare 会返回类似以下的URL：
```
Published nanoaitts-worker (1.23s)
  https://nanoaitts-worker.your-subdomain.workers.dev
```

#### 6.2 测试 API 端点

**健康检查端点：**
```bash
curl https://nanoaitts-worker.your-subdomain.workers.dev/api/health
```

预期响应：
```json
{
  "status": "healthy",
  "service": "nanoaitts-worker", 
  "voicesAvailable": 10,
  "timestamp": "2024-12-10T12:00:00Z"
}
```

**获取语音列表：**
```bash
curl https://nanoaitts-worker.your-subdomain.workers.dev/v1/models
```

**测试语音生成：**
```bash
curl -X POST https://nanoaitts-worker.your-subdomain.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "input": "你好，世界",
    "voice": "DeepSeek"
  }' \
  --output test-audio.mp3
```

#### 6.3 验证前端 UI

访问生产环境URL，应能看到完整的 Vue 3 TTS 界面，包括：
- API 配置区域
- 文本输入框
- 语音选择下拉菜单
- 语速和音调滑块
- 文本清理选项
- 生成按钮
- 音频播放控件

## API 文档

### 端点概览

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/v1/models` | 获取可用模型（OpenAI兼容） |
| GET | `/v1/voices` | 获取可用语音 |
| POST | `/v1/audio/speech` | 文本转语音 |
| POST | `/v1/voices/refresh` | 刷新语音缓存 |

### 详细API说明

#### 健康检查

**GET** `/api/health`

检查服务健康状况并获取语音数量。

**响应示例：**
```json
{
  "status": "healthy",
  "service": "nanoaitts-worker",
  "voicesAvailable": 10,
  "timestamp": "2024-12-10T12:00:00Z"
}
```

#### 获取模型列表 (OpenAI兼容)

**GET** `/v1/models`

获取可用的TTS模型列表。

**响应示例：**
```json
{
  "object": "list",
  "data": [
    {
      "id": "DeepSeek",
      "object": "model",
      "created": 1702200000,
      "owned_by": "nanoaitts",
      "permission": [],
      "root": "bot.n.cn",
      "parent": null
    }
  ]
}
```

#### 获取语音列表

**GET** `/v1/voices`

获取可用的语音列表。

**响应示例：**
```json
{
  "object": "list",
  "data": [
    {
      "id": "DeepSeek",
      "name": "DeepSeek (默认)",
      "iconUrl": "https://..."
    },
    {
      "id": "Female1", 
      "name": "女声1",
      "iconUrl": "https://..."
    }
  ]
}
```

#### 文本转语音

**POST** `/v1/audio/speech`

将文本转换为语音。

**请求参数：**
```json
{
  "input": "你好，世界",
  "voice": "DeepSeek",
  "speed": 1.0,
  "pitch": 1.0,
  "stream": false
}
```

**参数说明：**
- `input` (string, 必需): 要转换的文本（最大10,000字符）
- `voice` (string, 可选): 语音ID（默认："DeepSeek"）
- `speed` (number, 可选): 播放速度（0.5 - 2.0，默认：1.0）
- `pitch` (number, 可选): 音调调整（0.5 - 2.0，默认：1.0）
- `stream` (boolean, 可选): 流式响应（默认：false）

**响应：**
- Content-Type: `audio/mpeg`
- Body: MP3音频文件

**错误响应：**
```json
{
  "error": {
    "message": "错误描述",
    "type": "invalid_request_error", 
    "code": 400
  }
}
```

#### 刷新语音缓存

**POST** `/v1/voices/refresh`

刷新语音列表缓存（需要API密钥保护）。

**请求头：**
```
Authorization: Bearer YOUR_API_KEY
```

**响应示例：**
```json
{
  "message": "Voices refreshed successfully",
  "voicesCount": 10
}
```

### 使用示例

#### curl 命令示例

```bash
# 健康检查
curl https://your-worker.workers.dev/api/health

# 获取语音列表
curl https://your-worker.workers.dev/v1/voices

# 生成语音（保存为文件）
curl -X POST https://your-worker.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "input": "这是一个测试",
    "voice": "DeepSeek",
    "speed": 1.0
  }' \
  --output output.mp3
```

#### JavaScript 示例

```javascript
const response = await fetch('https://your-worker.workers.dev/v1/audio/speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: '你好，世界！',
    voice: 'DeepSeek',
    speed: 1.0,
    pitch: 1.0,
  }),
});

if (response.ok) {
  const audioBlob = await response.blob();
  // 使用音频数据（播放、保存等）
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}
```

#### Python 示例

```python
import requests

response = requests.post(
    'https://your-worker.workers.dev/v1/audio/speech',
    json={
        'input': '你好，世界！',
        'voice': 'DeepSeek',
        'speed': 1.0,
        'pitch': 1.0,
    }
)

if response.status_code == 200:
    with open('output.mp3', 'wb') as f:
        f.write(response.content)
    print("音频已保存为 output.mp3")
```

## 本地开发指南

### 开发环境设置

1. **克隆仓库**
```bash
git clone <repository-url>
cd nanoaitts-worker
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
cp .env.example .env
# 编辑 .env 文件设置必要的变量
```

### 启动开发服务器

```bash
# 使用 npm 脚本
npm run dev

# 或直接使用 wrangler
wrangler dev

# 服务将在 http://localhost:8787 启动
```

### 开发调试

#### 查看日志
```bash
# 实时查看日志
wrangler tail

# 查看历史日志
wrangler tail --since=1h
```

#### 本地测试API
```bash
# 健康检查
curl http://localhost:8787/api/health

# 测试语音生成
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input": "本地测试", "voice": "DeepSeek"}' \
  --output local-test.mp3
```

### 测试覆盖

项目包含完整的测试套件：

```bash
# 运行测试
npm test

# 或手动运行测试脚本
node tests/test.js
```

## 故障排除

### 常见问题及解决方案

#### 1. 部署失败

**问题：** 部署时出现权限错误或认证失败

**解决方案：**
```bash
# 确保已登录
wrangler login

# 检查账户状态
wrangler whoami

# 重新部署
wrangler deploy --verbose
```

#### 2. 语音无法加载

**问题：** `/v1/voices` 返回空列表或错误

**解决方案：**
```bash
# 检查网络连接到 bot.n.cn
curl -I https://bot.n.cn

# 清除 KV 缓存
curl -X POST https://your-worker.workers.dev/v1/voices/refresh

# 查看 Worker 日志
wrangler tail
```

#### 3. 语音生成失败

**问题：** `/v1/audio/speech` 返回错误

**解决方案：**
```bash
# 检查请求格式
curl -v -X POST https://your-worker.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input": "测试文本"}'

# 检查 bot.n.cn API 状态
curl -I https://bot.n.cn/api/tts

# 查看详细错误日志
wrangler tail --since=5m
```

#### 4. 响应缓慢

**问题：** API 响应时间过长

**解决方案：**
- 检查 Cloudflare Worker 日志中的执行时间
- 调整 `CHUNK_SIZE` 以获得更小的分块
- 确认 `MAX_CONCURRENCY` 设置合理
- 检查 bot.n.cn API 的响应时间

#### 5. 音频质量问题

**问题：** 生成的音频有杂音或质量不佳

**解决方案：**
- 尝试不同的语音ID
- 调整 `speed` 和 `pitch` 参数
- 确保输入文本使用 UTF-8 编码
- 检查网络连接稳定性

### 性能优化

#### 1. 缓存优化
```bash
# 手动刷新语音缓存
curl -X POST https://your-worker.workers.dev/v1/voices/refresh

# 配置更长的缓存时间（在代码中调整）
```

#### 2. 并发控制
调整 `.env` 文件中的并发设置：
```bash
MAX_CONCURRENCY=6  # 避免超出 Worker 子请求限制
CHUNK_SIZE=500     # 平衡性能和延迟
```

#### 3. 文本优化
启用智能文本清理：
```bash
SHOULD_CLEAN_TEXT=true
```

### 日志监控

#### Cloudflare Dashboard
1. 登录 Cloudflare Dashboard
2. 选择 Workers & Pages
3. 点击你的 Worker 名称
4. 查看 Analytics 和 Logs

#### 命令行监控
```bash
# 实时监控
wrangler tail

# 按错误过滤
wrangler tail | grep -i error

# 监控特定时间范围
wrangler tail --since=10m
```

## 配置说明

### 环境变量详解

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `API_KEY` | - | API密钥，保护敏感端点 |
| `DEFAULT_VOICE` | "DeepSeek" | 默认使用语音 |
| `DEFAULT_SPEED` | 1.0 | 默认语速 (0.5-2.0) |
| `DEFAULT_PITCH` | 1.0 | 默认音调 (0.5-2.0) |
| `MAX_TEXT_LENGTH` | 10000 | 最大文本长度 |
| `MIN_TEXT_LENGTH` | 1 | 最小文本长度 |
| `CHUNK_SIZE` | 500 | 文本分块大小 |
| `MAX_CONCURRENCY` | 6 | 最大并发请求 |
| `SHOULD_CLEAN_TEXT` | true | 是否启用文本清理 |
| `LOG_LEVEL` | info | 日志级别 |
| `DEBUG` | false | 调试模式 |

### Cloudflare KV 配置

KV 命名空间用于缓存语音列表，提高性能：

1. **创建命名空间**：
```bash
wrangler kv:namespace create "NANO_AI_TTS_KV"
```

2. **绑定到 Worker**：
更新 `wrangler.toml` 中的 `kv_namespaces` 配置

3. **缓存策略**：
- 语音列表缓存24小时
- 可通过 `/v1/voices/refresh` 手动刷新
- 缓存失效自动重新获取

## 高级功能

### 自定义配置

#### 自定义语音列表
可以修改 `src/services/nano-ai-tts.js` 来添加自定义语音或修改语音加载逻辑。

#### 批处理配置
调整批处理参数以优化性能：
```javascript
// 在服务中调整
const BATCH_SIZE = 6;        // 并发数
const CHUNK_SIZE = 500;      // 分块大小
const MAX_RETRIES = 3;       // 重试次数
```

### 监控和指标

#### 性能指标
- 响应时间：1-5秒（单分块）
- 批处理：最多6个并发请求
- 缓存：24小时TTL（可配置）
- MP3输出：1小时缓存

#### 错误监控
所有错误都会记录到 Cloudflare Logs：
- 4xx：客户端错误（参数、权限等）
- 5xx：服务器错误（API、网络等）

## 项目来源和参考

### 技术栈
- **Cloudflare Workers**：无服务器边缘计算平台
- **Wrangler CLI**：Cloudflare Workers 开发工具
- **Node.js 18+**：JavaScript 运行时
- **bot.n.cn API**：文字转语音服务提供商

### 原始项目
本项目基于原始的 Python TTS 实现：
- 原始实现：基于 Tkinter 的桌面应用
- 转换目标：Cloudflare Workers 无服务器架构
- 兼容性：保持 API 接口与 OpenAI TTS 格式兼容

### 参考文档
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [KV Store 文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [bot.n.cn API 文档](https://bot.n.cn)

### 贡献指南
1. Fork 项目仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 许可证
MIT License - 详见 [LICENSE](LICENSE) 文件

### 支持
如有问题或建议：
1. 查看本文档的故障排除部分
2. 检查 Cloudflare Worker 日志
3. 在 GitHub Issues 中提交问题
4. 参考相关技术文档

---

## 快速参考

### 常用命令
```bash
# 部署
npm run deploy

# 开发
npm run dev

# 查看日志
wrangler tail

# 测试API
curl https://your-worker.workers.dev/api/health
```

### 重要端点
- 健康检查：`GET /api/health`
- 获取语音：`GET /v1/voices`
- 生成语音：`POST /v1/audio/speech`
- 刷新缓存：`POST /v1/voices/refresh`

### 配置检查清单
- [ ] Cloudflare 账户已创建
- [ ] Wrangler CLI 已安装并登录
- [ ] 环境变量已配置
- [ ] KV 命名空间已创建（如需要）
- [ ] 部署成功并获得 URL
- [ ] API 端点测试通过
- [ ] 前端界面访问正常

通过以上配置，您的 anmitts2 纳米AI文字转语音工具就成功部署到了 Cloudflare Workers 平台！