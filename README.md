# Hanifeh Farahzadi — short-form studio

A responsive one-page portfolio for a short-form content agency. Purple glass theme,
floating dock navigation, animated service accordion, testimonial slider, filterable
work grid with a video lightbox, and a contact form.

No build step, no dependencies — plain HTML, CSS and JavaScript.

```
index.html
server.mjs              tiny static server (no dependencies)
package.json            `npm start` script
assets/
  css/styles.css        all styling + responsive rules
  js/main.js            all interactions
  fonts/outfit-*.woff2  self-hosted webfont
  img/
    portrait.svg        hero/about portrait (placeholder)
    favicon.svg
    work/reel-0X.jpg    poster frames for the six work cards
  video/
    reel-0X.mp4         H.264 clips (used by Safari + everything else)
    reel-0X.webm        VP9 clips (preferred by Chrome/Firefox, smaller)
tools/gen_reels.py      regenerates the placeholder clips/posters
```

## Run it in VS Code

1. Unzip the folder and open it in VS Code (**File → Open Folder**).
2. Open a terminal (**Terminal → New Terminal**) and run:

   ```bash
   npm start
   ```

3. Open <http://localhost:3000>. `Ctrl+C` stops the server.

No `npm install` is needed — the server has zero dependencies. If you prefer an
extension, the **Live Server** extension works too (right-click `index.html` →
Open with Live Server). You can also just double-click `index.html`, but a local
server is closer to production (relative media + clipboard APIs).

## Add your video (the important part)

The Work section ships with six **placeholder demo reels** so every play button works
out of the box. To showcase your own footage:

1. Export your clip as **vertical 9:16, H.264 MP4** (1080×1920 is ideal). Keep it short —
   15–45s. Name it like `reel-01.mp4`.
2. Drop it in `assets/video/`, replacing the matching placeholder.
3. Replace the matching poster frame `assets/img/work/reel-01.jpg` with a still from
   your clip (same 9:16 crop). If you skip this, the old placeholder gradient is shown
   before playback.
4. Optional: add `reel-01.webm` for smaller files on Chrome/Firefox. Only do this if you
   have a WebM export; otherwise remove the `.webm` `<source>` and the
   `data-webm` attribute for that card and the MP4 is used everywhere.
5. Update the card details in `index.html` (title, client, category, view count,
   description). Each card has two places to update:
   - the data attributes on `<button class="work-card__btn" data-reel=… data-title=…>`
     — used by the lightbox
   - the visible text in `.work-card__body` (`client`, `title`, `meta`)

To add a **seventh** project, copy one whole `<article class="work-card">` block,
then give it a unique `data-cat`, `data-reel`, `data-poster`, `data-webm` and copy.
The filter buttons, lightbox counter and previous/next order pick it up automatically.
`assets/img/work/reel-01.jpg` also powers the “Featured Work” card in the hero — point
its `<img>` at whichever project should be featured.

### Replacing the portrait

`assets/img/portrait.svg` is an illustrated placeholder. To use a real photo:

1. Export a **transparent PNG** of yourself (cut out from the background), roughly
   600×760, and save it as `assets/img/portrait.png`.
2. In `index.html`, change both `src="assets/img/portrait.svg"` references (hero card
   and About card) to `portrait.png`, and update the `alt` text.
3. If your cutout is framed differently, adjust `object-position`/`max-height` on
   `.hero__portrait img` and `.about__portrait img` in `styles.css`.

## Make it yours

| What | Where |
| --- | --- |
| Name, headline, bio, stats | `index.html` (hero, about) |
| Email address | search `hello@hanifeh.studio` in `index.html` and `EMAIL` in `assets/js/main.js` |
| Social links | `index.html` → `.socials` (currently platform home pages — swap for your profiles) |
| Testimonials | `index.html` → `.quotes` (add/remove a `<figure data-quote>` **and** a matching `.dot`; the slider adapts) |
| Services + prices/copy | `index.html` → `.services` (the accordion CTA pre-fills the matching service in the contact form by position) |
| Work categories | `data-cat` on cards + `data-filter` on buttons (`shortform`, `motion`, `medical`, `personal`) |
| Colors, radius, fonts | `:root` tokens at the top of `assets/css/styles.css` |
| Booking status | `.status` in the header, `.contact__meta` in the contact card |

## How the contact form works

There is no backend, so “Send enquiry” validates the fields and opens the visitor’s
email app with a prefilled message (`mailto:hello@hanifeh.studio`). A “Copy message”
button appears afterwards as a fallback for visitors without a mail client.

To collect submissions properly, replace the `form.addEventListener("submit", …)`
block in `assets/js/main.js` with a `fetch()` to a form service (Formspree, Basin,
Netlify Forms, etc.) or your own endpoint. Keep the validation and status messages.

## Notes

- Self-hosted Outfit (Latin subset) means no Google Fonts request; the site works offline.
- Motion respects `prefers-reduced-motion`, and all interactive controls are keyboard
  accessible (accordion, slider, filters, modal, form errors).
- Placeholder reels are silent, 4-second abstract clips regenerated by
  `tools/gen_reels.py` (needs `numpy` + `imageio-ffmpeg`).


git add .
git commit -m "Adding a new functionality"
git push