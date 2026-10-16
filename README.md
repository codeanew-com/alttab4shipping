# Alttab For Shipping website

Company website for **Alttab For Shipping**, a courier and freight desk in Deira, Dubai. It's one static page with a quote form. There's no framework and no build step.

- **Live:** https://alttab4shipping.pages.dev (custom domain `alttab4shipping.com` still to be connected)
- **Hosting:** Cloudflare Pages, with one Pages Function for the form
- **Email sending:** Resend, from the verified domain `alttab4shipping.com`

## Project structure

```
.
├── functions/
│   └── api/
│       └── quote.js            POST /api/quote: validates the form, filters spam, sends the email
├── public/                     everything served by Cloudflare Pages
│   ├── index.html
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── site.webmanifest
│   └── assets/
│       ├── css/main.css        all styles; colour and font tokens are at the top
│       ├── js/main.js          quote form behaviour
│       └── images/
│           ├── brand/          logo mark, share (OG) image
│           ├── carriers/       carrier logos (SVG)
│           └── icons/          app and fallback icons
└── README.md
```

Favicons and the manifest stay at the site root because browsers request them there.

## Common edits

| To change | Edit |
|---|---|
| Address, phone, email, licence no., hours | `public/index.html`, Contact section and footer |
| Services list | `public/index.html` (`#services`), and the `SERVICES` list in `functions/api/quote.js` so the form still accepts them |
| Carrier logos | Add or replace the SVG in `assets/images/carriers/`, then update the list in `index.html` (`#carriers`) |
| Colours and fonts | Tokens at the top of `assets/css/main.css` |
| Share preview text and image | `<meta property="og:…">` tags in the `<head>` of `index.html` |

## Brand

| | Value |
|---|---|
| Navy (primary) | `#0B2545` |
| Orange (accent) | `#CF4500` |
| Light orange (route lines only) | `#F37338` |
| Background | `#F3F0EE` |
| Logo type | Montserrat ExtraBold ("ALTTAB"), Montserrat SemiBold ("FOR SHIPPING") |
| Body type | Sofia Sans |

## Deploy on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick `codeanew-com/alttab4shipping`.
2. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `public`
3. **Settings → Variables and Secrets**, for Production:
   | Name | Type | Example |
   |---|---|---|
   | `QUOTE_TO` | Text | inbox that receives quote requests |
   | `QUOTE_FROM` | Text | `Alttab Website <no-reply@alttab4shipping.com>` |
   | `RESEND_API_KEY` | Secret | Resend key with **Sending access** for `alttab4shipping.com` only |
4. Redeploy so the variables take effect.
5. **Custom domains** → add `alttab4shipping.com` and `www.alttab4shipping.com`.

The `functions/` folder at the repo root is picked up automatically. Each push to `main` deploys.

The share image tags use absolute `https://alttab4shipping.com/...` URLs, so link previews only work once the custom domain is connected.

## How the form works

1. The browser checks the required fields, then POSTs the form to `/api/quote` in the background.
2. The function rejects bots silently: the hidden `website` field must be empty, and the form must have been open for at least 3 seconds.
3. It validates every field on the server, including lengths, email format and an allowed service list.
4. `deliver()` emails the request to `QUOTE_TO` through Resend, with **Reply-To** set to the customer's email, so replying goes straight to them.
5. The page shows "request sent". If sending fails, it shows the contact email instead.

To change email provider, edit only `deliver()` in `functions/api/quote.js`.

## Run locally

```sh
npx wrangler pages dev public
```

Put local variables in `.dev.vars`, which is git-ignored:

```
QUOTE_TO=you@example.com
QUOTE_FROM=Alttab Website <no-reply@alttab4shipping.com>
RESEND_API_KEY=re_...
```

Never commit a real API key.

## Still to do

- Connect `alttab4shipping.com` in Cloudflare Pages (Custom domains).
- Make `info@alttab4shipping.com` receive mail (forward it to an inbox), since it's the address shown on the site.
