# FalconAid Tech: Next.js website

This is the FalconAid Tech public company website built with **Next.js App Router + TypeScript**. The design, page sections, responsive CSS, and gallery filtering are included with locally hosted company imagery and product concept assets.

## Requirements
- Node.js 20.9 or later
- VS Code
- Internet is only needed for the first dependency installation and the Google Fonts stylesheet currently used by the design. The core website assets are local.

## Open and run
1. Extract the ZIP file.
2. Open the extracted `falconaids-tech-nextjs` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser.

To make a production build, run `npm run build`, then `npm start`.

## Where to edit
- `public/site-content.html`: website text, page sections, founder/team placeholder cards, gallery entries, and contact form fields.
- `app/styles.css`: colors, spacing, typography, responsive layout, and visual appearance.
- `app/site-client.tsx`: mobile navigation, gallery filters, contact form submission, and portal URL.
- `app/api/contact/route.ts`: validates contact form submissions and delivers them through Resend.
- `public/falconaid-mark.png`: FalconAid Tech mark used in the header, footer, and site branding.
- `public/smartaid-kit-concept.png`: current product concept image, labelled as a concept until a finished product photo is available.
- `public/problem-overview.mp4`: user-provided video embedded in the challenge section.
- `app/layout.tsx`: website title, description, favicon, fonts.

## Before publishing
1. Create a Resend account, verify a sending domain, and create an API key.
2. Copy `.env.example` to `.env.local` for local development. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (an address on the verified domain), and `CONTACT_EMAIL` in `.env.local` and in the production host's server-side environment settings. Do not expose these values with a `NEXT_PUBLIC_` prefix or commit `.env.local`.
3. Submit a test message and verify it arrives at `CONTACT_EMAIL`. Without the Resend key and verified sender, the form reports that delivery is not configured.
4. Add the real management portal sign-in URL to `PORTAL_URL` in `app/site-client.tsx`, or remove the portal link if it is not ready.
5. Review team biographies, approved photographs, and company claims before publishing.
6. Replace the labelled SmartAid Kit concept image with a finished-product photo when available. The concept image is not evidence of a finished, clinically validated, or deployed medical device.
7. The problem overview video is about 72 MB. Consider hosting it on a video platform or media service if the deployment host has asset-size or bandwidth limits.

## Production checks
Use a Node.js version supported by Next.js (20.9 or later), then run:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm start
```

The homepage is prerendered as static content during `next build`; the page source is read from `public/site-content.html` during that build. The project uses the standard Next.js build output and has not been configured as a static export.

## Important
This is a public-facing company website. It does not replace or automatically connect to the existing SmartAid management portal or its database. No founders, credentials, customers, partners, deployments, or results have been invented.
