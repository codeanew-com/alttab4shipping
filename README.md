# Alttab For Shipping website

A single static page with a quote form. There's no framework and no build step. The site is hosted on **Cloudflare Pages**, and form submissions are handled by one **Pages Function**.

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
│       ├── css/main.css
│       ├── js/main.js          quote form behaviour
│       └── images/
│           ├── brand/          logo mark, share (OG) image
│           ├── carriers/       carrier logos (SVG)
│           └── icons/          app and fallback icons
└── README.md
```

Favicons and the manifest stay at the site root because browsers request them there.

## Deploy on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick `codeanew-com/alttab4shipping`.
2. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `public`
3. **Settings → Variables and Secrets**, for Production:
   | Name | Type | Example |
   |---|---|---|
   | `QUOTE_TO` | Text | `info@alttab4shipping.com` |
   | `QUOTE_FROM` | Text | `Alttab Website <website@alttab4shipping.com>` |
   | `RESEND_API_KEY` | Secret | `re_...` |
4. Redeploy so the variables take effect.
5. **Custom domains** → add `alttab4shipping.com` and `www.alttab4shipping.com`.

The `functions/` folder at the repo root is picked up automatically. Each push to `main` deploys.

## How the form works

1. The browser checks the required fields, then POSTs the form to `/api/quote` in the background.
2. The function rejects bots silently: the hidden `website` field must be empty, and the form must have been open for at least 3 seconds.
3. It validates every field on the server, including lengths, email format and an allowed service list.
4. `deliver()` emails the request to `QUOTE_TO`, with **Reply-To** set to the customer's email.
5. The page shows "request sent". If sending fails, it shows the email address instead.

To change email provider, edit only `deliver()` in `functions/api/quote.js`.

## Run locally

```sh
npx wrangler pages dev public
```

Put local variables in `.dev.vars`, which is git-ignored:

```
QUOTE_TO=you@example.com
QUOTE_FROM=Alttab Website <website@alttab4shipping.com>
RESEND_API_KEY=re_...
```

## Still to fill in on the page

The office address, phone number and trade licence number in the Contact section are highlighted placeholders. Search `index.html` for `class="ph"`.
