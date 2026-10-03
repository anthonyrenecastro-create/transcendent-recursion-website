# cyberpunk-shopify-storefront
A cyberpunk shopify storefront. 
# THE TRANSCENDENT RECURSION // Creative Universe

Editorial archive and headless storefront for The Transcendent Recursion. Built with Next.js and TypeScript, designed to deploy on Vercel with Shopify providing commerce and archive content.

The archive is loaded from Shopify `creative_work` metaobjects through the Storefront API. Products, checkout, and digital releases can be added as the works become available.

## Stack

- **Next.js** (App Router) + TypeScript
- **Custom CSS** with a signal/archive visual system
- **Google Fonts** using Manrope and DM Mono
- **Shopify Storefront API** for creative work metaobjects
- Ready for **Vercel** deployment

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Shopify credentials, the archive renders the built-in six-work archive. With credentials and published `creative_work` metaobjects, it renders the Shopify archive instead.

## Theme tokens

Neon colors live in `tailwind.config.ts` and are also registered for Tailwind v4 in `src/app/globals.css`:

| Token | Use |
| --- | --- |
| `cyber-bg` | Deep violet-black page background |
| `cyber-panel` | Card / HUD surfaces |
| `cyber-violet` | Primary chrome, panels, and controls |
| `cyber-violet-soft` | Readable violet body text |
| `cyber-gold` | Headlines, status, prices, and hover glow |
| `cyber-gold-bright` | High-contrast labels and product titles |

HUD chrome (scanlines, clip-path corners, button hover glow) is in `src/app/globals.css`.

## Deploy (GitHub → Vercel)

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new). Framework preset: Next.js.
3. Leave build settings at defaults (`next build`).
4. After Shopify is wired, add storefront env vars in the Vercel project settings.

## Shopify content setup

Create a custom app in the Shopify admin with Storefront API access, then copy:

```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
SHOPIFY_API_VERSION=2026-07
```

into `.env.local` (see `.env.example`). The token is used only in the server-side client at `src/lib/shopify.ts`.

Create a Shopify metaobject definition with type `creative_work` and these fields. The built-in archive remains as a fallback until Shopify content is published:

| Field | Type | Purpose |
| --- | --- | --- |
| `number` | Single line text | Display order, such as `01` |
| `type` | Single line text | Work category label |
| `title` | Single line text | Work title |
| `description` | Multi-line text | Archive card description |
| `action` | Single line text | Link label |
| `href` | URL or single line text | Destination URL or anchor |
| `status` | Single line text | Available or coming-soon label |
| `theme` | Single line text | `water`, `signal`, `sound`, `grid`, `orange`, or `violet` |

## Newsletter (Transmissions)

The newsletter-autopilot app publishes free preview editions as articles in
the Shopify blog with handle `news` (configurable via `NEWSLETTER_BLOG_HANDLE`).
The homepage's **Transmissions** section reads the latest editions back
through the Storefront API (`blog(handle: "news") { articles ... }`) and
renders them as cards. With no Storefront token configured, or before the
first edition is published, the section shows a "first transmission pending"
state and the rest of the page is unaffected.
