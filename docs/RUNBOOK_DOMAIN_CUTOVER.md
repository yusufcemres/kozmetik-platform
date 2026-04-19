# RUNBOOK — Custom Domain Cutover

Moves REVELA from `kozmetik-platform.vercel.app` + Render `onrender.com` subdomain to a custom domain (example: `revela.com.tr` + `api.revela.com.tr`). DNS and dashboard steps live here because they can't be done from code.

---

## 0. Decide the domain pair

| Piece | Example |
|---|---|
| Web (apex)       | `revela.com.tr` |
| Web (www)        | `www.revela.com.tr` (redirects to apex) |
| API (subdomain)  | `api.revela.com.tr` |

Pick once and use the exact same strings everywhere below.

---

## 1. Codebase side (already done — zero action)

The following fall back to `kozmetik-platform.vercel.app` if env vars are unset, so deploys keep working before and during the cutover:

- `apps/web/src/lib/api.ts` → exports `SITE_URL` (reads `NEXT_PUBLIC_SITE_URL`)
- `apps/web/src/app/sitemap.ts`, `robots.ts`, `layout.tsx`, `urunler/[slug]/page.tsx`, `markalar/[slug]/page.tsx`, `(public)/page.tsx` → all env-driven
- `apps/api/src/main.ts` → CORS accepts **comma-separated** `WEB_URL`, trims trailing slashes
- `apps/mobile/src/services/deeplink.ts`, `CompareScreen.tsx` → read `EXPO_PUBLIC_WEB_URL`

No code changes at cutover — only env vars.

---

## 2. Domain registrar — DNS records

Add these records at your registrar (TürkTicaret / GoDaddy / Cloudflare / etc). TTL 300 (5 min) while testing; raise to 3600 after it stabilizes.

| Type  | Host / Name | Value                        | Purpose |
|-------|-------------|------------------------------|---------|
| A     | `@`         | `76.76.21.21`                | Vercel apex |
| CNAME | `www`       | `cname.vercel-dns.com`       | Vercel www |
| CNAME | `api`       | `kozmetik-api.onrender.com`  | Render API (use actual Render hostname) |

(Double-check the Vercel IP / CNAME target in the Vercel "Domains" panel — they publish the current value there and it very rarely changes, but never hardcode from this runbook without cross-checking.)

---

## 3. Vercel — add custom domain

1. Vercel dashboard → `kozmetik-platform` project → Settings → Domains
2. Add `revela.com.tr` (apex) and `www.revela.com.tr`. Vercel auto-provisions Let's Encrypt.
3. Set `www` → 308 redirect to apex (Vercel default is fine).
4. Verify both show **Valid Configuration** (green) before moving on.

---

## 4. Render — add custom domain to the API

1. Render dashboard → `kozmetik-api` service → Settings → Custom Domains
2. Add `api.revela.com.tr`. Render will show the CNAME target and provision a cert automatically.
3. Wait for "Verified" + cert issued (2–10 min typically).

---

## 5. Flip env vars

### Vercel (Web) — project env, both Production + Preview

```
NEXT_PUBLIC_SITE_URL=https://revela.com.tr
NEXT_PUBLIC_API_URL=https://api.revela.com.tr/api/v1
```

Trigger a fresh deploy after saving (Vercel does not auto-rebuild on env changes).

### Render (API) — service env

```
WEB_URL=https://revela.com.tr,https://kozmetik-platform.vercel.app
```

The comma lets the old Vercel preview domain keep working for smoke tests and rollback. Once you're confident, drop the second value.

### Optional: Mobile (Expo)

If deeplinks should resolve to the custom domain in the mobile app's "Open in browser" flow, rebuild with:

```
EXPO_PUBLIC_WEB_URL=https://revela.com.tr
```

(Mobile works fine without this — the existing Vercel fallback keeps deeplinks functional.)

### Optional: `render.yaml`

`render.yaml` currently bakes in `WEB_URL=https://kozmetik-platform.vercel.app`. If you want the cutover to survive a service recreate, change that value to the comma-separated pair and commit. Render dashboard env overrides the YAML, so this is belt-and-braces, not required.

---

## 6. Post-cutover verification (golden path)

Run each check. If any fails, jump to §7 before breaking anything else.

```bash
# 1. Apex + www resolve with valid TLS
curl -IsS https://revela.com.tr | head -1          # expect: HTTP/2 200
curl -IsS https://www.revela.com.tr | head -1      # expect: 308 redirect to apex

# 2. API health
curl -sS https://api.revela.com.tr/api/v1/health   # expect: {"status":"ok"...}

# 3. CORS preflight from the new origin
curl -sS -I -X OPTIONS https://api.revela.com.tr/api/v1/products \
  -H "Origin: https://revela.com.tr" \
  -H "Access-Control-Request-Method: GET"
# expect: access-control-allow-origin: https://revela.com.tr

# 4. Sitemap + robots point at the new host
curl -sS https://revela.com.tr/sitemap.xml | head -20   # URLs start with https://revela.com.tr
curl -sS https://revela.com.tr/robots.txt              # Sitemap: https://revela.com.tr/sitemap.xml
```

Then in a browser:

- [ ] `/takviyeler/<slug>` — product page renders, reviews block loads, no CORS console error
- [ ] `/tara` — barcode scan → API call succeeds
- [ ] Login magic-link email arrives, link opens on the new domain
- [ ] "View source" on homepage — Organization JSON-LD `url` is the new domain
- [ ] Vercel Analytics / GA4 starts receiving pageviews from the new hostname

---

## 7. Rollback

Cutover is reversible in <5 minutes:

1. **Registrar:** delete or flip the A/CNAME back. TTL is 300 so propagation is fast.
2. **Vercel:** the `.vercel.app` subdomain never stops working — no action needed.
3. **Render:** revert `WEB_URL` to `https://kozmetik-platform.vercel.app` (single value).
4. **Vercel env:** clear `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL` (they'll fall back to the Vercel subdomain + the code-baked API URL). Redeploy.

---

## 8. Search & analytics follow-ups (non-blocking)

Do within a week of cutover:

- Google Search Console: add new domain as a property, submit `https://revela.com.tr/sitemap.xml`
- Set up 301 redirect from old Vercel subdomain to new domain (Vercel: Project → Domains → assign → choose "redirect to")
- GA4: update property "Data Stream" hostname if you had it locked to the old one
- Update social / Instagram bio / email signature to the new URL

---

## Known trip-wires

- **CORS returns `*` instead of the origin:** `credentials: true` is set, so `*` won't work. Check that `WEB_URL` is actually set on Render (dashboard overrides `render.yaml`) and has no trailing slash (the code strips slashes, but don't rely on it).
- **Sitemap still shows old URL after deploy:** sitemap has `revalidate = 3600`. Hit `/api/revalidate` or wait an hour, or redeploy Vercel.
- **Vercel preview URLs broken:** preview URLs still hit the Vercel subdomain by design. Keep the old Vercel URL in `WEB_URL` (comma list) as long as you rely on PR previews calling production API.
