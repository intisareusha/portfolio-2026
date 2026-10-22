# Short-Form Agency Rebrand — 4-Phase Plan

## Goal

Rebrand the existing short-form **video editing** template into the website for your
**short-form content agency** — a business site shown to clients, **not** a personal
portfolio — **without changing the design**. Only content/copy, brand details, links and
images change. Work is split into 4 phases matching the 4 on-page sections:

1. **HOME** (`#home`) — header, site chrome, hero, services, testimonials, featured, clients, marquee
2. **ABOUT** (`#about`)
3. **MY WORK** (`#work`)
4. **CONTACT** (`#contact`)

> Work through this one phase at a time, ticking items off. All work happens in this repo
> (`index.html` does the bulk). Image files are supplied by you; I wire them in.

> **Source of truth:** `demos/replace.txt` holds the owner's latest vision. Re-read it at
> the start of every work session and keep this plan continuously updated to match it.

**Status:** Phase 1 (HOME) done — brand = **CLIP STACK**, "we" voice, tagline in header, niches
throughout. Hero portrait → showreel `<video>` (330×230), featured → image linking to Our Work,
Happy Clients → auto-sliding rail. Phase 2 (ABOUT) in progress: lede removed, left sidebar →
Instagram phone mockup (`.phone`) playing `assets/video/awwfle.mp4` with an in-screen bottom nav.
Phases 3–4 untouched.

---

## Resume here (checkpoint)

### Done
- **HOME** — agency copy in "we" voice; brand `CLIP STACK`; hero showreel `<video>` (330×230, plays
  `assets/video/awwfle.mp4`); featured card → static image linking to `#work`; Happy Clients →
  auto-sliding rail; marquee + services/testimonials rewritten.
- **ABOUT (partial)** — removed the section lede; left sidebar replaced with an iPhone/Instagram
  phone mockup (`.phone`): dark bezel, full-bleed autoplay video, Instagram overlay, and a bottom
  nav (Home · Discover · Create · Inbox · Profile) **inside the screen**.

### Next (where to pick up)
1. **Phase 2 rest** — about copy still reads "I'm Hanifeh…" (`about__lead` L326 + 2 paragraphs);
   stats numbers; process steps; toolkit names. (see 2c–2f below)
2. **Phase 3 — WORK** (`#work`) and **Phase 4 — CONTACT** — untouched.
3. **Site chrome leftovers** — footer still `Intisar Eusha` / `Email Marketing` / `HF`; header
   `.status` still `Booking November projects`.
4. **Phase 4 mapping** — `#service` `<option>` list must match the new 6 services, same order.

### Assets still to supply
- Featured-work image (currently placeholder `assets/img/work/reel-01.jpg`) — send filename and I wire it.

### Run it
- `npm start` → open <http://localhost:3000> (a server was already listening on :3000 during the session).

---

## Brand voice & positioning (read first)

- **It's an agency, not a person.** The site sells a *business*, not your own job. Present it
  as a studio/agency that clients hire.
- **Voice: always "we / us / our" — never "I / me / my".** Rewrite every first-person-singular
  line inherited from the template. Applies to hero, about, process, testimonials, CTAs, forms.
- **Tagline:** `We make every clip count.` Use this (or minor punctuation variants) as the
  site subtitle/tagline everywhere `{{TAGLINE}}` appears.
- **What we do:** short-form content + **clipping services** — turning long-form video into
  scroll-stopping vertical clips for social.
- **Who we serve (target niches):** podcasters, vloggers, medical clinics, fitness coaches,
  real-estate agents, business owners. Reuse this list in the hero lede, about, services and
  client section where natural.

---

## Ground rules

- **Do NOT touch the CSS layout/design.** `assets/css/styles.css` stays as-is except the
  header comment (line 2) and, only if an image swap needs it, `object-position` tweaks.
  All edits are to copy/text, `data-*` attributes, links and image paths.
- **Files you'll edit:** `index.html` (the bulk), `assets/js/main.js` (only the `EMAIL`
  constant), and optionally `README.md`, `package.json`, `favicon.svg`, `portrait.svg` (later).
- **No git repo** — this is an unzipped download. Make a copy/backup of the folder before
  starting Phase 1.

### Placeholder tokens (replace these as you go)

Fill these in during Phase 1, then reuse everywhere. Until then they stay literally in the files.

| Token | Meaning | Current value in repo |
| --- | --- | --- |
| `{{NAME}}` | Agency/studio name, exact spelling | **`CLIP STACK`** (set in HOME; About/Footer still `Intisar Eusha`) |
| `{{TAGLINE}}` | Agency tagline / subtitle | **`We make every clip count`** (set in header) |
| `{{AUDIENCE}}` | Who we serve (niches) | podcasters, vloggers, medical clinics, fitness coaches, real-estate agents, business owners |
| `{{EMAIL}}` | Contact email | `hello@hanifeh.studio` |
| `{{CITY}}` / `{{TZ}}` | Location + timezone | `Tehran, Iran` / `GMT+3:30` |
| `{{INSTAGRAM}}` `{{YOUTUBE}}` `{{LINKEDIN}}` | Social URLs | platform home pages |
| `{{STAT_VIDEOS}}` `{{STAT_CLIENTS}}` `{{STAT_VIEWS}}` | 3 stats | `320` / `48` / `6.4` |
| `{{BOOKING_STATUS}}` | Availability line | `Booking November projects` |
| `{{LOGO_ALT}}` | Descriptive logo alt text | `My logo` |

### Global find/replace reference (do these in Phase 1, they touch every section)

**Email `hello@hanifeh.studio` → `{{EMAIL}}`** (6 places):
- `index.html` line 566 (`mailto:` + visible), 568 (visible), 601 (`data-copy`), 665 (form note), 699 (footer)
- `assets/js/main.js` line 17 — `const EMAIL = "hello@hanifeh.studio";`

**Name & voice leftovers from the original template:**
- `index.html` line 326 — bio says "I'm Hanifeh…" — rewrite to **"we" agency voice** (Phase 2)
- Scan the whole file for first-person **"I / me / my"** and convert to **"we / us / our"**
- `index.html` line 687 — footer mark is text `HF` (header uses `logo.png`; make them consistent)
- `favicon.svg` line 10 — `HF` glyph; `portrait.svg` line 2 — title
- `README.md`, `package.json`, `package-lock.json`, `styles.css:2`, `main.js:2` — template name (cosmetic, optional)

### How image replacement works (you supply, I wire)

1. Drop your file into `assets/img/` (portraits, logo) or `assets/img/work/` (posters `reel-0X.jpg`).
2. Tell me the exact filename and which slot it belongs to.
3. I update the matching `src`/`poster`/`data-poster` in `index.html`. No CSS changes unless
   the new image is framed differently.

### Known cleanup
- `assets/video/Replacing-reel-05.mp4` is an orphan (referenced nowhere) — safe to delete.
- All 6 `reel-0X.mp4/.webm` and `portrait.svg` are still placeholders/demo content.

---

## Phase 1 — HOME

**Covers:** site-wide meta/chrome + the entire `#home` section.
**Files:** `index.html`, `assets/js/main.js`.

> **Status: mostly done.** Copy updated for a CLIP STACK agency site in "we" voice. Remaining
> unchecked items are footer, image files, email/status tokens, and the favicon glyph.

### 1a. Site-wide chrome (do first — referenced by every section)
- [x] `index.html` L6 `<title>` → `CLIP STACK — Short-Form Content Agency`
- [x] L7 `<meta name="description">` → agency one-liner with niches + tagline
- [x] L10–11 `og:title` / `og:description` → match title/pitch ("we" voice)
- [x] L8 optional `theme-color` (kept `#1b0b35`)
- [ ] L14 favicon (keep `favicon.svg`; regenerate glyph later in Phase 4 polish)
- [ ] **Global email replace** — all 5 `index.html` spots + `main.js:17` `EMAIL`
- [x] Header (L31–43): brand `aria-label`, `logo.png` `alt` → `CLIP STACK logo`,
      `brand__text` `CLIP STACK` + **subtitle → `{{TAGLINE}}`** (`We make every clip count`)
- [ ] L41 `.status` → `{{BOOKING_STATUS}}` (still `Booking November projects`)
- [x] Dock labels: `Home / About / Our Work / Contact` (`My Work` → `Our Work`)
- [ ] Footer (L686–703): brand mark (make it match header — `logo.png` or fix `HF`),
      footer nav, `footer__mail` → `{{EMAIL}}`, copyright `{{NAME}}`

### 1b. Hero card (`card--hero`, L223–242)
- [x] L224 eyebrow → "Welcome to" (was "Hello, my name is")
- [x] L225 `hero__name` → `CLIP STACK`
- [x] L226 `hero__lede` → agency one-liner in **"we" voice** (`{{AUDIENCE}}`)
- [x] L227–233 buttons → "Let's Collaborate" / "Our Work" (was "My Work")
- [x] L235–241 portrait `<img>` **replaced with a showreel `<video class="hero__reel">`** — sources
      point to `assets/video/showreel.mp4` / `.webm` (**drop the file in later**); poster = `reel-01.jpg`
- [x] L237–240 `.chip--float` "320+ clips delivered" **removed**
- [x] Showreel sized **`330×230`** (`aspect-ratio: 330 / 230`); space added above (`margin-top`) and below (card padding); hero content vertically centred

### 1c. Services accordion (L59–162, 6 items) — text-only
- [x] Reframed as **agency services in "we" voice**, order kept:
      1 Podcast Clipping · 2 Short-Form Editing · 3 Vlog & Creator Content ·
      4 Medical & Clinic Content · 5 Fitness & Coaching Content · 6 Real Estate & Business Content
- [x] Each `.service`: `service__label` + `<p>` + `data-service="…"` updated (order unchanged)
- [x] Icons kept as-is (design)
- ⚠️ `data-service` values changed → **Phase 4 `#service` `<option>` list must be updated to
  match, in the same order.**

### 1d. Testimonials slider (L165–218, 3 quotes)
- [x] Quote 1 "Working with CLIP STACK…"; Quote 2 kept (clinic); Quote 3 → "CLIP STACK gets the hook…"; avatars/names/brands kept
- [ ] Dots unchanged (still 3 quotes — add/remove if quote count changes)

### 1e. Featured Work card (L246–258)
- [x] Video `<button data-reel…>` **replaced with a static image** `<a class="featured__media" href="#work" data-scroll>` — real image supplied later (uses `reel-01.jpg` as placeholder)
- [x] Play button + duration badge removed; `featured__hook` kept; top badge → "Featured '26"
- [x] Clicking the featured media scrolls to **Our Work** (`#work`)
- [x] "See all projects" link **removed**
- [x] Body copy → "Browse our latest projects…"
- [x] Right-column gap tightened — `.col--right` no longer `space-between`; featured card grows to fill, leaving a small fixed gap before Happy Clients

### 1f. Happy Clients logos (L260–278)
- [x] Continuous **sliding effect** — `.clients__rail` (masked overflow) wraps `.logos`, animated via `@keyframes marquee`; the 5 logos are duplicated for a seamless loop (hover pauses)
- [x] "40+ brands" hint **removed**
- [ ] Swap the 5 `.logo` entries to your real clients (or keep as illustrative).

### 1g. Marquee (L283–296)
- [x] Two identical runs of 5 phrases → Podcast clipping · Short-form editing · Vlog & creator
      content · Clinics & fitness coaches · Business & real estate

### Verify Phase 1
- [ ] `npm start` → open <http://localhost:3000>
- [ ] Header shows `CLIP STACK` + `We make every clip count`; footer mark matches header
- [ ] Hero, services, testimonials, clients all read as your brand; email links go to `{{EMAIL}}`
- [ ] No "Email Marketing" left anywhere (footer still has it — pending 1a)
- [ ] No first-person **"I / me / my"** left — everything reads as **"we / us / our"** agency copy

---

## Phase 2 — ABOUT

**Covers:** `#about` (L298–355). **Files:** `index.html`.

### 2a. Section head
- [x] L301 eyebrow "About" (kept)
- [ ] L302 `about-title` heading (keep `<span class="grad">` on a keyword)
- [x] L303 `section__lede` ("Four years of cutting short-form…") — **removed** per owner request

### 2b. Left sidebar → phone mockup
- [x] Removed the old card (portrait, `about__name`/`about__role`, `facts`, "Book an intro call")
- [x] Replaced with an **iPhone / Instagram-style phone mockup** (`.phone`): dark bezel + inner
      shadow, full-bleed `<video>` (`object-cover`, `autoplay loop muted playsinline`), Instagram
      overlay (top bar, side actions, `@clipstack` caption) and a bottom nav (Home · Discover ·
      Create + · Inbox · Profile) **inside the screen**, overlaying the video
- [x] Video = `assets/video/awwfle.mp4` (provided) — plays inside the screen
- ⚠️ Built with the site's own CSS (`.phone`), **not Tailwind** — the project has no Tailwind, and
  the Play CDN would reset the existing design. Say the word to switch.

### 2c. About copy
- [ ] L326 `about__lead` — **fix "I'm Hanifeh…"** → agency intro in **"we" voice** (`{{NAME}}`)
- [ ] L327–328 two body paragraphs — rewrite as **studio/agency story** (who we serve: `{{AUDIENCE}}`)

### 2d. Stats (L331–335, animated counters)
- [ ] `data-count` values: L332 `{{STAT_VIDEOS}}`, L333 `{{STAT_CLIENTS}}`, L334 `{{STAT_VIEWS}}`
- [ ] Update the adjacent `<dt>` labels ("Videos delivered" etc.)

### 2e. Process steps (L337–345, 4 steps)
- [ ] Rewrite the 4 `<li>` (heading + `<p>`) to our workflow in **"we" voice**.

### 2f. Toolkit (L347–352)
- [ ] Replace the 6 `<li>` software names with your stack.

### Verify Phase 2
- [ ] Counters animate to your numbers on scroll; phone mockup shows the reel; bio no longer says Hanifeh

---

## Phase 3 — MY WORK

**Covers:** `#work` (L357–554). **Files:** `index.html`.

### 3a. Section head + filters
- [ ] L360–362 eyebrow/title/lede
- [ ] L366–370 filter buttons: `data-filter` values (`all`, `shortform`, `motion`, `medical`,
      `personal`) and the `All` count (`6`) must match your categories & card count.
      **If you rename categories**, update `data-filter` here AND `data-cat` on each card.

### 3b. The 6 work cards (L374–540)
For **each** `<article class="work-card">`:
- [ ] `data-cat` = one of your filter values
- [ ] Button `data-reel` / `data-webm` / `data-poster` → your file paths
- [ ] Button `data-title`, `data-cat-label`, `data-client`, `data-meta`, `data-desc`
- [ ] `<img src>` + `<video>` poster → your poster path
- [ ] `work-card__hook` (2-line overlay), `work-card__tag`, `work-card__time`
- [ ] `work-card__body`: client / title / meta visible text

> **To add a 7th project:** copy a whole `<article>` block, give it unique
> `data-cat`/`data-reel`/`data-poster`/`data-webm`, then bump the `All` count on L366.
> Filter, lightbox counter and prev/next pick it up automatically.

### 3c. Empty note + CTA strip
- [ ] L543 empty-state text (usually untouched)
- [ ] L547–550 CTA strip headline

### Image slots (posters)
- [ ] `assets/img/work/reel-0X.jpg` (6 files) — supply 9:16 stills, tell me names.
- [ ] `assets/video/reel-0X.mp4` (+ `.webm` if you have them) — replace placeholders.
- [ ] Delete orphan `assets/video/Replacing-reel-05.mp4` if unused.

### Verify Phase 3
- [ ] Each filter button shows/hides the right cards; counts correct
- [ ] Clicking a card opens the lightbox with correct title/desc/client/counter
- [ ] Prev/next cycles only the currently-visible cards; hover previews play

---

## Phase 4 — CONTACT

**Covers:** `#contact` (L556–680) + favicon polish. **Files:** `index.html`, `assets/js/main.js`.

### 4a. Section head
- [ ] L559–561 eyebrow/title/lede

### 4b. Contact sidebar
- [ ] L566–568 email link → `{{EMAIL}}`
- [ ] L570–583 `contact__meta`: Availability (`{{BOOKING_STATUS}}`), Response time, Based in (`{{CITY}} · {{TZ}}`)
- [ ] L584–600 socials: `href` for Instagram/TikTok/YouTube/LinkedIn → your URLs
      (keep `target`/`rel`/`aria-label`)
- [ ] L601 copy button `data-copy` → `{{EMAIL}}`

### 4c. Form
- [ ] L625–633 `#service` options — **same order as the 6 services in Phase 1c** (positional prefill)
- [ ] L640–647 `#budget` options — your ranges
- [ ] L611/616/655 placeholders (name/email/message) — optional wording
- [ ] L665 `form__note` email → `{{EMAIL}}`

### 4d. Polish
- [ ] `assets/js/main.js:17` `EMAIL` (confirm already done in Phase 1)
- [ ] Regenerate `favicon.svg` glyph (L10 `HF` → your initials) and `portrait.svg` title
- [ ] Optional: rename `README.md` / `package.json` / `package-lock.json` off "hanifeh"
- [ ] Optional: update `README.md` "Make it yours" table to reflect your values

### Verify Phase 4
- [ ] Submitting the form opens mail app addressed to `{{EMAIL}}` with correct body
- [ ] "Copy email" / "Copy message" both work
- [ ] Socials open your profiles in new tabs

---

## Final verification (all phases)

- [ ] `npm start`, open <http://localhost:3000>
- [ ] Resize to mobile/tablet — layout unchanged, no overflow
- [ ] Keyboard-only pass: accordion, slider dots, filters, lightbox Esc/arrows, form errors
- [ ] No remaining `hanifeh`, `HF`, `Intisar Eusha`, or `Email Marketing` (as a tagline) strings
- [ ] Whole site reads as an **agency business** ("we / us / our") — no "I / me / my" anywhere
- [ ] Tagline everywhere is `We make every clip count.`; niches (`{{AUDIENCE}}`) surface in copy
- [ ] `demos/replace.txt` re-read and `docs/PLAN.md` updated to match the latest vision
- [ ] `grep -ri hanifeh .` and `grep -n "EMAIL" assets/js/main.js` return only intended values
- [ ] All 6 reels + portrait replaced with real assets; orphan mp4 removed

## Deferred / out of scope
- Hosting/deploy, custom domain, analytics
- Re-theming colors/fonts (design stays as-is per your instruction)
