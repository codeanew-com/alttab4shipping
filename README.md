# Alttab For Shipping

Marketing website for Alttab For Shipping, a courier and freight forwarding company based in Dubai.

A static, dependency-free site with a serverless quote request endpoint.

## Stack

- **Frontend:** HTML, CSS and vanilla JavaScript. No framework and no build step.
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **API:** [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- **Email delivery:** [Resend](https://resend.com/)

## Project structure

```
.
├── functions/
│   └── api/
│       └── quote.js          Quote request endpoint
└── public/                   Static site root
    ├── index.html
    ├── favicon.ico
    ├── favicon.svg
    ├── apple-touch-icon.png
    ├── site.webmanifest
    └── assets/
        ├── css/
        │   └── main.css
        ├── js/
        │   └── main.js
        └── images/
            ├── brand/
            ├── carriers/
            └── icons/
```

## Getting started

Requirements: Node.js 18 or later.

```sh
git clone https://github.com/codeanew-com/alttab4shipping.git
cd alttab4shipping
npx wrangler pages dev public
```

The site is then served at `http://localhost:8788`, with the API available under `/api`.

Local environment variables go in a `.dev.vars` file at the project root. This file is git-ignored.

## Configuration

The quote endpoint reads the following environment variables:

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key. Store as a secret. |
| `QUOTE_FROM` | Sender address on a domain verified in Resend. |
| `QUOTE_TO` | Address that receives quote requests. |

In production, set them under **Cloudflare Pages → Settings → Variables and Secrets**.

## Deployment

The project deploys automatically to Cloudflare Pages on every push to `main`.

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(none)* |
| Build output directory | `public` |

Cloudflare picks up the `functions/` directory automatically.

## Customisation

- **Content:** `public/index.html`
- **Colours and typography:** design tokens at the top of `public/assets/css/main.css`
- **Carrier logos:** `public/assets/images/carriers/`
- **Accepted services:** must match between the form in `index.html` and the allow-list in `functions/api/quote.js`

## License

Proprietary. © 2026 Alttab For Shipping. All rights reserved.
