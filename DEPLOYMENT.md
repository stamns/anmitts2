# Deployment Guide for NanoAITTS Worker

This guide covers deploying the NanoAITTS Worker to Cloudflare.

## Prerequisites

- Cloudflare account (free or paid)
- Wrangler CLI installed: `npm install -g @cloudflare/wrangler`
- Git credentials configured for Cloudflare

## Step 1: Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser to authorize Wrangler with your Cloudflare account.

## Step 2: Create Cloudflare KV Namespaces (Optional but Recommended)

For production voice caching, create KV namespaces:

```bash
# Production namespace
wrangler kv:namespace create "NANO_AI_TTS_KV"
wrangler kv:namespace create "NANO_AI_TTS_KV" --preview

# Development namespace (optional)
wrangler kv:namespace create "NANO_AI_TTS_KV_DEV"
wrangler kv:namespace create "NANO_AI_TTS_KV_DEV" --preview
```

This outputs namespace IDs like:
```
 ⛅ Created namespace with ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 ⛅ Created preview namespace with ID: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

## Step 3: Update wrangler.toml

Replace the placeholder IDs in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "NANO_AI_TTS_KV"
id = "YOUR_KV_NAMESPACE_ID"           # From step 2
preview_id = "YOUR_PREVIEW_KV_NAMESPACE_ID"  # From step 2
```

## Step 4: Configure Environment Variables (Optional)

If you want to use API key authentication:

1. Create a `.env` file based on `.env.example`
2. Set your API_KEY:
   ```
   API_KEY=your-secret-api-key
   ```

For secure deployment, add secrets to Wrangler:
```bash
echo "your-secret-api-key" | wrangler secret put API_KEY --env production
```

## Step 5: Test Locally

```bash
npm run dev
```

Test endpoints:
```bash
# Health check
curl http://localhost:8787/api/health

# Get voices
curl http://localhost:8787/v1/voices

# Generate speech
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "input": "测试文本",
    "voice": "DeepSeek"
  }' \
  --output test.mp3
```

## Step 6: Deploy to Cloudflare

### Deploy to Production

```bash
npm run deploy
```

Or with environment:
```bash
wrangler deploy --env production
```

### Deploy to Staging/Development

```bash
wrangler deploy --env development
```

Wrangler outputs your worker URL:
```
✨ Uploaded nanoaitts-worker successfully to example.workers.dev
```

## Step 7: Configure Custom Domain (Optional)

To use a custom domain instead of `*.workers.dev`:

1. Go to Cloudflare Dashboard
2. Select your domain
3. Workers Routes
4. Add route: `tts.example.com/*` → `nanoaitts-worker`

## Step 8: Verify Deployment

Test your deployed worker:

```bash
# Health check
curl https://nanoaitts-worker.example.workers.dev/api/health

# Get voices
curl https://nanoaitts-worker.example.workers.dev/v1/voices

# Generate speech
curl -X POST https://nanoaitts-worker.example.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello World",
    "voice": "DeepSeek"
  }' \
  --output output.mp3
```

## Advanced Configuration

### Enable API Key Authentication

To protect the voice refresh endpoint:

```bash
# Set API key in production
echo "your-secret-api-key" | wrangler secret put API_KEY --env production
```

Then use the API with:
```bash
curl -X POST https://your-worker.workers.dev/v1/voices/refresh \
  -H "Authorization: Bearer your-secret-api-key"
```

### Custom Text Processing Settings

Add to `wrangler.toml`:

```toml
[env.production]
vars = {
  ENVIRONMENT = "production",
  MAX_TEXT_LENGTH = "10000",
  CHUNK_SIZE = "500",
  MAX_CONCURRENCY = "6"
}
```

### Route Configuration

If using under a subpath:

```toml
routes = [
  { pattern = "example.com/tts/*", zone_name = "example.com" }
]
```

## Monitoring and Logging

### View Live Logs

```bash
wrangler tail --env production
```

### Check Deployment Status

```bash
# List all deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --env production
```

## Troubleshooting

### Issue: "Unauthorized" error on deployment

**Solution**: Re-authenticate with Cloudflare
```bash
wrangler login
```

### Issue: KV namespace not found

**Solution**: Verify namespace IDs in wrangler.toml and create if missing
```bash
wrangler kv:namespace list
```

### Issue: Worker timeout on large texts

**Solution**: Reduce CHUNK_SIZE or MAX_CONCURRENCY in wrangler.toml

### Issue: Voice list not loading

**Solution**: 
1. Check bot.n.cn API availability
2. Clear KV cache: POST `/v1/voices/refresh` (with API key if required)
3. Check worker logs: `wrangler tail`

### Issue: CORS errors from browser

**Solution**: The worker returns proper CORS headers for any origin. If still issues:
1. Check browser console for actual error
2. Verify request Content-Type is `application/json`
3. Test with curl first

## Performance Tuning

### For High Volume

1. Increase `MAX_CONCURRENCY`:
```toml
vars = { MAX_CONCURRENCY = "10" }
```

2. Reduce `CHUNK_SIZE` for faster processing:
```toml
vars = { CHUNK_SIZE = "300" }
```

3. Enable caching in your application layer

### For Cost Optimization

1. Keep voice cache TTL at 24 hours (default)
2. Use batch requests when possible
3. Consider worker rate limiting

## Security Best Practices

1. **Always use HTTPS**: Workers.dev URLs use HTTPS by default
2. **Protect sensitive endpoints**:
   ```bash
   echo "your-secret-key" | wrangler secret put API_KEY
   ```
3. **Monitor logs**: `wrangler tail --env production`
4. **Set rate limiting** via Cloudflare firewall rules
5. **Use API key** for voice refresh endpoint in production

## Rollback

To rollback to a previous version:

```bash
# List deployments
wrangler deployments list

# Rollback to specific deployment
wrangler rollback --env production --message "Rolling back due to issue"
```

## Updating the Worker

To update the worker code:

1. Make code changes
2. Test locally: `npm run dev`
3. Deploy: `npm run deploy`

No downtime - new version deploys instantly.

## Integration with Other Services

### As OpenAI API Drop-in Replacement

```python
from openai import OpenAI

client = OpenAI(
    api_key="any-key",  # Not used if API_KEY not set
    base_url="https://your-worker.workers.dev"
)

response = client.audio.speech.create(
    model="DeepSeek",
    input="Hello, world!",
    voice="DeepSeek",
    speed=1.0
)

response.stream_to_file("output.mp3")
```

### As REST API

Works with any HTTP client supporting POST requests with JSON bodies.

## Support and Troubleshooting

1. **Check Wrangler version**: `wrangler --version`
2. **Update if needed**: `npm install -g @cloudflare/wrangler`
3. **View detailed logs**: `wrangler tail --format pretty`
4. **Test endpoints individually**: Use curl with verbose flags

## Next Steps

- Set up custom domain routing
- Configure API key authentication
- Add monitoring and alerts
- Integrate with your application
- Set up CI/CD pipeline

## References

- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [KV Store Best Practices](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Cloudflare Deployments](https://developers.cloudflare.com/workers/deployments/)
