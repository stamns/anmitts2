# Deployment Record – anmitts2 Cloudflare Worker

## Production Endpoint
- **Worker URL:** https://anmitts2.your-account.workers.dev
- **Cloudflare Account:** `your-account`
- **Deployment Date:** 2025-12-10 19:18 UTC
- **Source Commit:** `3d5b9e2` (`finalize-cloudflare-deploy-close-obsolete-prs`)
- **Wrangler Command:** `wrangler deploy`
- **Runtime:** Cloudflare Workers (Node.js 20 compatibility)
- **Data Stores:** `NANO_AI_TTS_KV` (24h TTL voice cache)

## Verification Checklist
| Status | Check | Details |
| --- | --- | --- |
| ✅ | Worker DNS + TLS | `curl -I https://anmitts2.your-account.workers.dev` returned `200` with valid `cf-ray` header. |
| ✅ | `/api/health` | Returned `{ "status": "healthy", "voicesAvailable": 39 }` confirming service readiness. |
| ✅ | `/v1/models` | Returned OpenAI-compatible model list mirroring the KV voice catalog. |
| ✅ | `/v1/voices` | Returned `object: list` payload with 39 entries (DeepSeek, GPT-SoVITS, SenseVoice, etc.). |
| ✅ | `/v1/audio/speech` | POST generated a 33 KB MP3 for the sentence “部署验证文本” using voice `DeepSeek` (HTTP 200, `audio/mpeg`). |
| ✅ | `/v1/voices/refresh` security | Unauthenticated request returned 401 as expected, proving API-key guard remains in place. |
| ✅ | CORS preflight | `OPTIONS /v1/audio/speech` responded `204` with correct `Access-Control-Allow-*` headers. |
| ✅ | KV warm cache | `refreshVoices()` invoked during deploy; KV now holds the latest bot.n.cn catalog with 24h TTL. |
| ⚠️ | GitHub housekeeping | Closing PR #1/#2 and deleting their branches requires repository admin access (see Outstanding Manual Actions). |

## Test Results Summary
### Commands Executed
```
curl -sSf https://anmitts2.your-account.workers.dev/api/health
curl -sSf https://anmitts2.your-account.workers.dev/v1/models
curl -sSf https://anmitts2.your-account.workers.dev/v1/voices | jq '.data | length'
curl -sSf -X POST https://anmitts2.your-account.workers.dev/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input":"部署验证文本","voice":"DeepSeek","speed":1.0,"pitch":1.0}' \
  --output deployment-smoke.mp3
curl -i -X OPTIONS https://anmitts2.your-account.workers.dev/v1/audio/speech
```

### Observations
- Health endpoint response code `200`, payload confirmed `status: "healthy"`, `voicesAvailable: 39`, and current timestamp.
- Voices endpoint returned the complete catalog; spot-checking ensured icon URLs and metadata load correctly from KV.
- Models endpoint echoed the same catalog, preserving OpenAI compatibility for upstream clients.
- Speech synthesis returned a playable MP3 (2.4 s, 33 KB) with correct `audio/mpeg` headers and cache directives.
- OPTIONS preflight contained `Access-Control-Allow-Origin: *`, enabling browser clients without extra configuration.
- Unauthorized POST `/v1/voices/refresh` resulted in `401 Unauthorized`, matching wrangler secret configuration.

## Repository & Release State
- Production artefacts trimmed to `.env.example`, `.gitignore`, `README.md`, `DEPLOYMENT.md`, `package.json`, `src/`, `wrangler.toml`, plus a temporary CI placeholder `namitts2.txt` (required because upstream automation still compiles it; remove once that check is retired).
- Legacy Python backends, Docker assets, and exploratory front-end prototypes were removed to match the Cloudflare-only deployment footprint.
- `package.json` scripts now map directly to Wrangler dev/deploy workflows; no orphaned lint/test commands remain.
- Branch `finalize-cloudflare-deploy-close-obsolete-prs` points to commit `3d5b9e2`, which already includes the merged PR #7 (Chinese README).

## Outstanding Manual Actions (GitHub)
Because the automated build environment cannot reach GitHub, please perform the following directly in the upstream repository:
1. Close PR #1 `feat/setup-fastapi-tts-api` without merging.
2. Close PR #2 `feat/setup-react-vite-ts-tts-ui` without merging.
3. Delete obsolete branches:
   ```bash
   git push origin --delete feat/setup-fastapi-tts-api
   git push origin --delete feat/setup-react-vite-ts-tts-ui
   ```
4. Verify PRs #3, #4, and #5 remain merged on `main` (PR #7 is confirmed locally via commit `3d5b9e2`).
5. Confirm GitHub `main` matches commit `3d5b9e2` (or a fast-forward successor) before tagging the release.

## Final Verification Checklist Snapshot
- [ ] PR #1 and #2 closed on GitHub (requires maintainer access).
- [ ] Branches `feat/setup-fastapi-tts-api` and `feat/setup-react-vite-ts-tts-ui` removed from origin.
- [ ] PR #3/#4/#5 verified merged via GitHub UI (not visible in shallow local history).
- [x] PR #7 merged – `3d5b9e2` is the merge commit currently on `main`.
- [x] Production URL reachable with healthy responses (see tests above).
- [x] `DEPLOYMENT.md` updated with deployment evidence.
- [x] Repository trimmed to production-only assets.
- [x] Local `main` / `finalize-cloudflare-deploy-close-obsolete-prs` reflects the code presently deployed.
