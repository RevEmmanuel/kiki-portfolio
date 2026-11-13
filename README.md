# Kiki Williams — portfolio

The production site for Kiki Williams, Videographer / Photographer / Creator. Design: Concept B "Backdrop", with the Spotlight film theatre.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · hls.js.
Hosting: **Vercel**. Films: **Cloudflare Stream**. Enquiries: **Resend**.
There's no CMS and no database. Content lives in `src/content/`.

**Works with zero setup.** Without any environment variables, films play from their shared Google Drive originals and the enquiry form sends the finished enquiry to WhatsApp. Adding Cloudflare Stream or a Resend key later upgrades each one; neither is required.

```bash
rm -rf node_modules .next   # only if node_modules came from another machine
npm install
cp .env.example .env.local   # fill in what you have; everything is optional for local work
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
npm test                     # enquiry validation and endpoint tests
npm run lint                 # TypeScript
npm run check:private        # withheld material and secrets are not in the build (run after build)
```

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Opening (STILL / MOVING diptych), six selected projects, statement, all work, booking |
| `/photographs` | Shoots as colour chapters; any frame opens the full-size viewer |
| `/films` | Light table (desktop) or vertical reel (phone), chapters by type |
| `/work/[slug]` | Project page: hero, metadata, sequence, next project |
| `/about` | Name, title, introduction, disciplines, contact |
| `/contact` | WhatsApp, phone, email, Instagram and the enquiry form |
| `/api/enquiry` | POST only: validates the enquiry and sends it through Resend |
| `/sitemap.xml`, `/robots.txt`, `…/opengraph-image` | SEO, generated at build time |

## Environment

All variables are documented in `.env.example`. Summary:

| Variable | Where | Needed for |
| --- | --- | --- |
| `RESEND_API_KEY` | Vercel, server only | Sending enquiries |
| `ENQUIRY_TO_EMAIL` | Vercel | Inbox (default kikiwill7.kw@gmail.com) |
| `ENQUIRY_FROM_EMAIL` | Vercel | Sender on a domain verified in Resend |
| `NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE` | Vercel | Film playback |
| `NEXT_PUBLIC_STREAM_IDS` | Vercel (optional) | Per-environment UID overrides |
| `NEXT_PUBLIC_SITE_URL` | Vercel, production | Canonical URLs and Open Graph (set when the domain is confirmed) |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Vercel, production | `true` only at launch |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_STREAM_API_TOKEN` | Your terminal only | `npm run stream:upload`. **Never set on Vercel** |
| `MEDIA_SRC` | Your terminal only | `npm run media` / `stream:upload` |

Secrets have no `NEXT_PUBLIC_` prefix, so Next.js never puts them in the browser. `npm run check:private` scans the built client output for them.

## Media pipeline

The originals stay in Google Drive and are never modified. Download the ones you need anywhere (for example `./originals/`, which git ignores) and run:

```bash
MEDIA_SRC=./originals npm run media
```

- **Photos.** Matched by exact Drive filename. EXIF orientation is applied and all metadata, including GPS, is stripped. Output is 2400 px on the long edge, saved to `public/media/photo/`. `next/image` serves responsive AVIF and WebP from these.
- **Films.** The poster frame and a 6-second silent preview loop (540 px, H.264, faststart) go to `public/media/film/`. Optional per-film poster and loop timing lives in `scripts/film-timing.json` as `{ "shine": { "posterAt": 3, "loopAt": 5 } }`.
- **Sizes.** Measured sizes and durations are written to `src/content/media.generated.json`.
- **Duplicate filenames.** When two Drive files share a name (Black Chedder has two `Cheddar.MOV`), the one whose running time matches the content model is used.

### Films on Cloudflare Stream

```bash
CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_STREAM_API_TOKEN=… MEDIA_SRC=./originals npm run stream:upload
```

The script uploads each published film. It uses the local master when `MEDIA_SRC` has one; otherwise Stream copies the file from its public Drive link. It waits until each film is ready, writes `src/content/stream-ids.json` (UIDs are public identifiers), and prints the value for `NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE`. Commit `stream-ids.json`, set the customer code on Vercel, and redeploy.

Playback uses HLS with adaptive bitrate. Safari and iOS play it natively; other browsers use hls.js, loaded only when a film opens.

The theatre has:
- typographic controls: play/pause, scrubber, timecode, sound and fullscreen;
- keyboard controls: Space/K, M, F, ← →, N/P between films, Esc to close;
- loading, buffering, "being prepared" and error/retry states.

Preview loops pause when they're off screen, and don't play with reduced motion or on Save-Data or slow connections.

## Enquiries

`src/app/api/enquiry/route.ts` with shared validation in `src/lib/enquiry.ts`.

- **Fields:** name, email, phone (optional), service, date (optional), budget (optional) and message.
- **Validation:** done on the server, which is authoritative, and repeated in the browser for early feedback. Input is NFC-normalised, control characters are stripped, and length is capped. The HTML email is escaped.
- **Spam protection:**
  - a hidden honeypot field;
  - a time trap that rejects forms submitted in under 3 s or after more than 24 h;
  - same-origin check;
  - 16 KB body limit.

  Bots get a fake success, so they learn nothing.
- **Rate limit:** 5 per IP per 10 minutes and 3 per email per hour, held in memory per function instance. That's enough against casual abuse without adding a database.
- **Delivery:** to `ENQUIRY_TO_EMAIL`, with `reply_to` set to the sender, so Kiki can just press Reply.
- **States:**
  - success shows "Enquiry sent";
  - a validation failure marks and focuses the field;
  - a delivery failure, missing key or rate limit shows an error with WhatsApp and email links pre-filled with the same details.

## Privacy

`src/content/withheld.ts` lists everything in the archive that is deliberately not published, with the reason: the newborn and family events, the children's party, the private shoot, and Ojude Oba (pending a check for identifiable children). Nothing imports it except the scripts. `npm run media`, `npm run stream:upload` and `npm run check:private` all refuse withheld files.

To publish one:
1. Get written permission.
2. Add it to `projects.ts`.
3. Remove it from `withheld.ts`.

## Content model

There is one object per project in `src/content/projects.ts`. Unknown facts are `null` or `[]`, and render as `[to confirm]`. Nothing is invented: no biography, years, clients, awards or credits beyond what the work shows. Every photo and film keeps its exact original Drive filename.

## Backdrop system

Each project has a `backdrop` colour sampled from its pictures and an `on` text colour that passes 4.5:1. Pages are built from `<Section bd on>` blocks. `BackdropObserver` sets `--page-bd` and `--page-on` on `<body>` as sections cross the middle of the screen, so the whole page, chrome included, crossfades together. Without JavaScript, each section paints its own colour. The film theatre is always near-black.
