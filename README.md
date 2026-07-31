# SideFX Next.js Client

This is the Next.js frontend for **SideFX**, a medication tracking, symptom logging, health news, recall, reporting, and subscription management app.

The client communicates with the SideFX FastAPI backend and uses Paddle for SideFX Plus subscription checkout.

---

## Tech Stack

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* HttpOnly cookie authentication through the FastAPI backend
* Next.js API route proxies for authenticated backend requests
* Paddle.js for subscription checkout

---

## Project Structure Notes

Representative folders:

```txt
src/
  app/
    (marketing)/
      pricing/
        page.tsx
    (private)/
      billing/
        checkout/
          page.tsx
          PaddleCheckoutClient.tsx
        success/
          page.tsx
    api/
      billing/
        checkout/
          route.ts
  components/
    BillingCheckoutButton/
      BillingCheckoutButton.tsx
    PricingSection/
      PricingSection.tsx
  config/
    paths.ts
```

Route groups such as `(marketing)` and `(private)` are organizational only. They do not appear in the browser URL.

For example:

```txt
src/app/(private)/billing/checkout/page.tsx
```

becomes:

```txt
/billing/checkout
```

---

## Local Environment Setup

Create a file named:

```txt
.env.local
```

in the root of the Next.js project.

Example:

```env
API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_your_paddle_client_side_token
```

### Environment Variable Meaning

```env
API_BASE_URL=http://localhost:8000/api
```

Used by server-side Next.js route handlers, such as proxy routes under `src/app/api`.

This should point to the FastAPI backend root used by the frontend. In the current local setup, the backend is mounted under `/api`.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Used by browser-side code only when needed.

Anything prefixed with `NEXT_PUBLIC_` is exposed to the browser bundle, so do not put backend secrets here.

```env
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
```

Tells the Paddle checkout client to use Sandbox mode.

Use:

```env
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
```

only when switching to live Paddle payments.

```env
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_your_paddle_client_side_token
```

Used by Paddle.js in the browser.

This is not the same as the backend Paddle API key.

Sandbox client-side tokens usually start with:

```txt
test_
```

Live client-side tokens are separate and should only be used when going live.

---

## Important Security Notes

Do not put these backend secrets in the Next.js client environment:

```env
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
PADDLE_PLUS_PRICE_ID=
JWT_SECRET=
DATABASE_URL=
FERNET_KEY=
EMAIL_PEPPER=
```

Those belong in the FastAPI backend environment, not the Next.js client.

The Paddle client-side token is safe to use in frontend code because it is specifically designed for Paddle.js browser checkout initialization.

---

## Local Development Commands

Install dependencies:

```bash
npm install
```

Run standard local development:

```bash
npm run dev
```

Run local development over HTTPS:

```bash
npm run dev:https
```

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:https": "next dev --experimental-https",
    "build": "next build",
    "start": "next start"
  }
}
```

Alternative command without adding a script:

```bash
npm run dev -- --experimental-https
```

The `--` is important because it passes the flag to Next.js instead of npm trying to interpret the flag itself.

---

## Why HTTPS Is Needed Locally

Paddle may return a checkout URL like:

```txt
https://localhost:3000/billing/checkout?_ptxn=txn_...
```

When that happens, the Next.js app must actually be running at:

```txt
https://localhost:3000
```

Use:

```bash
npm run dev:https
```

The browser may show a local certificate warning the first time. Accepting the local development certificate is expected during local HTTPS testing.

---

## Paddle Checkout Flow

Current SideFX Plus checkout flow:

```txt
User logs in
↓
User visits /pricing
↓
User clicks Subscribe
↓
BillingCheckoutButton calls /api/billing/checkout
↓
Next.js proxy route forwards the request and auth cookies to FastAPI
↓
FastAPI creates a Paddle transaction
↓
FastAPI returns checkout_url
↓
Browser redirects to /billing/checkout?_ptxn=txn_...
↓
PaddleCheckoutClient loads Paddle.js
↓
Paddle overlay opens
↓
User completes sandbox payment
↓
Paddle sends webhook to FastAPI
↓
FastAPI updates subscription from pending to active
```

---

## Pricing Page

The public pricing page lives under the marketing route group:

```txt
src/app/(marketing)/pricing/page.tsx
```

The Plus plan button should use the client-side billing checkout button rather than linking directly to Paddle.

Expected behavior:

```txt
/pricing
→ click Subscribe
→ POST /api/billing/checkout
→ redirect to returned checkout_url
```

---

## Billing Checkout Page

The Paddle checkout page lives at:

```txt
/billing/checkout
```

Current file location:

```txt
src/app/(private)/billing/checkout/page.tsx
src/app/(private)/billing/checkout/PaddleCheckoutClient.tsx
```

This page reads the Paddle transaction id from:

```txt
_ptxn
```

Example:

```txt
/billing/checkout?_ptxn=txn_01...
```

Then it initializes Paddle.js and opens the checkout overlay using the transaction id.

---

## Auth and Proxy Route Notes

The backend checkout route requires an authenticated user.

Because auth uses HttpOnly cookies, the browser cannot manually read the access token. Instead, the frontend calls a same-origin Next.js proxy route:

```txt
POST /api/billing/checkout
```

That proxy route forwards the browser's `Cookie` header to FastAPI.

Expected proxy file:

```txt
src/app/api/billing/checkout/route.ts
```

Expected proxy behavior:

```txt
Browser
→ Next.js /api/billing/checkout
→ FastAPI /billing/checkout
```

This avoids direct browser-to-backend cookie and CORS issues, especially when the backend later runs on Render.

---

## Paddle Sandbox Setup Checklist

In Paddle Sandbox:

```txt
Product created
Price created
Price id starts with pri_
API key created for backend
Client-side token created for frontend
Default payment link configured
Webhook destination configured
Webhook secret copied to backend env
```

Recommended local default payment link:

```txt
https://localhost:3000/billing/checkout
```

The success page should not be used as the default payment link.

Use:

```txt
/billing/checkout
```

for opening checkout.

Use:

```txt
/billing/success
```

for after checkout completes.

---

## Backend Assumptions

The Next.js app assumes the FastAPI backend is running locally at:

```txt
http://localhost:8000/api
```

Start the backend separately before testing the frontend.

For local Paddle webhook testing, the backend must be reachable from the internet. The current local test setup uses Cloudflare Tunnel:

```bash
cloudflared tunnel --url http://localhost:8000
```

The generated Cloudflare URL should be configured in Paddle Sandbox as the webhook destination.

Example Paddle webhook URL:

```txt
https://your-current-cloudflare-url.trycloudflare.com/api/billing/webhook/paddle
```

If the tunnel URL changes, update the Paddle webhook destination.

---

## First Checkout Test Checklist

Before testing:

```txt
FastAPI backend is running
Next.js is running with HTTPS
User is logged in with a fresh session
.env.local exists
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is set
Paddle Sandbox default payment link is set to /billing/checkout
Cloudflare tunnel is running for webhook testing
Paddle webhook destination points to the current tunnel URL
```

Run Next.js:

```bash
npm run dev:https
```

Then test:

```txt
1. Log in.
2. Go to /pricing.
3. Click Subscribe.
4. Confirm POST /api/billing/checkout returns 200.
5. Confirm browser redirects to /billing/checkout?_ptxn=...
6. Confirm Paddle overlay opens.
7. Complete sandbox checkout.
8. Confirm FastAPI receives Paddle webhook.
9. Confirm subscription changes from pending to active.
```

---

## Refresh Token Test

Because access tokens expire, test the checkout flow after the access token has expired but the refresh token is still valid.

Expected result:

```txt
User remains authenticated
Checkout request succeeds
Paddle overlay opens
```

If checkout returns:

```json
{
  "detail": "Not authenticated"
}
```

then check:

```txt
User is still logged in
Refresh proxy route is working
Cookies are present in the browser
/api/billing/checkout forwards Cookie header to FastAPI
FastAPI refresh route still issues a valid access token
```

---

## Common Issues

### npm warns about unknown `--experimental-https`

Wrong:

```bash
npm run dev --experimental-https
```

Correct:

```bash
npm run dev -- --experimental-https
```

Better:

```bash
npm run dev:https
```

---

### 401 Not authenticated on Subscribe

Likely causes:

```txt
User is not logged in
Old/stale auth cookies
Access token expired and refresh did not run
Checkout button is calling FastAPI directly instead of /api/billing/checkout
Proxy route is not forwarding the Cookie header
API_BASE_URL points to the wrong backend URL
```

Fixes:

```txt
Log out and log in again
Confirm /api/billing/checkout is used
Confirm proxy route forwards Cookie
Confirm API_BASE_URL includes the correct /api prefix
Restart Next.js after changing .env.local
```

---

### Paddle overlay does not open

Likely causes:

```txt
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN missing
Wrong Paddle environment
Sandbox token not used with sandbox mode
Next.js not restarted after env changes
Page missing _ptxn transaction id
Paddle default payment link points to the wrong page
Next.js not running over HTTPS while checkout_url uses https://localhost:3000
```

Fixes:

```txt
Check .env.local
Restart Next.js
Run npm run dev:https
Confirm /billing/checkout?_ptxn=txn_... is reached
Confirm Paddle Sandbox client-side token starts with test_
```

---

### Checkout opens but webhook does not arrive

Likely causes:

```txt
Cloudflare tunnel is stopped
Paddle webhook destination uses an old tunnel URL
Webhook URL is missing /api if backend is mounted under /api
PADDLE_WEBHOOK_SECRET does not match the Paddle notification destination
Backend is not running
```

Fixes:

```txt
Restart cloudflared
Copy the current tunnel URL
Update Paddle webhook destination
Restart FastAPI after env changes
Complete another sandbox payment
Check FastAPI logs
```

---

## Production / Deployment Notes

When deploying the Next.js client:

```env
API_BASE_URL=https://sidefx-fastapi-server.onrender.com/api
NEXT_PUBLIC_API_BASE_URL=https://sidefx-fastapi-server.onrender.com/api
NEXT_PUBLIC_PADDLE_ENVIRONMENT=production
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_your_live_client_side_token
```

Production Paddle setup also requires:

```txt
Live Paddle product
Live Paddle price
Live Paddle API key on backend
Live Paddle client-side token on frontend
Approved live checkout domain
Live webhook destination
Live webhook secret on backend
```

Do not reuse sandbox credentials in production.

Sandbox and live Paddle environments have separate products, prices, customers, API keys, client-side tokens, and webhooks.

---

## Git Notes

Do not commit:

```txt
.env
.env.local
.env*.local
```

Recommended:

```txt
.env.example
```

Example `.env.example`:

```env
API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_replace_me
```

---

## Current Local Billing Status

The current local client flow successfully opens the Paddle Sandbox checkout overlay.

Next test priorities:

```txt
1. Confirm checkout works after access token refresh.
2. Complete a full sandbox payment.
3. Confirm Paddle webhook reaches FastAPI through Cloudflare Tunnel.
4. Confirm user subscription updates from pending to active.
5. Add or polish /billing/success UI.
```

# .Next filesystem Error: 

[Error: EINVAL: invalid argument, readlink 'C:\Users\thebl\OneDrive\Documents\Projects\sidefx-app\.next\server\interception-route-rewrite-manifest.js'] {
  errno: -4071,
  code: 'EINVAL',
  syscall: 'readlink',
  path: 'C:\\Users\\thebl\\OneDrive\\Documents\\Projects\\sidefx-app\\.next\\server\\interception-route-rewrite-manifest.js'
}

1. Similar Windows .next filesystem problems have been reported in Next.js, while Microsoft documents limitations and complications around links inside OneDrive-managed folders.

3. Stop the development server, then run this from the project root in PowerShell:

Remove-Item -Recurse -Force .next
npm run dev:https