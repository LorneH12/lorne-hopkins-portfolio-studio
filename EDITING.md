# Editing your portfolio

## Replace an image

Open `assets/` in GitHub and upload a new file with the **same filename** to replace it. Keep the format and transparency when possible. Commit the change and GitHub Pages redeploys.

| File | Appearance |
| --- | --- |
| `hero.png` | Seated hero and chair (transparent PNG) |
| `live-session.png` | Left laptop, listening on a call |
| `instructor-session.png` | Right laptop, laughing with a clapping audience |
| `alessia-willmott.jpg` | Alessia headshot |
| `john-lodola.jpg` | John headshot |
| `ursula-roberts.jpg` | Ursula headshot |
| `raza-agha-candidate.jpg` | User-confirmed Raza headshot |
| `americanexpress.svg`, `nike.svg`, `intuit.svg`, `apple.svg` | Company logos |
| `favicon.svg` | Browser tab icon |

The other company names are editable text in `index.html`. Mark uses an MD badge until a headshot is added. Use descriptive alt text if the image subject changes. If an image's proportions change, update its HTML `width` and `height` to the new pixel dimensions. Never stretch images to force a fit.

## Change text or contact details

1. Open `index.html`, then choose Edit.
2. Search for the sentence you want to change. Edit only the words between the HTML tags.
3. Leave `class`, `id`, `role`, and `aria-*` attributes intact.
4. Find `mailto:` to change your email, or the LinkedIn URL to change the contact destination.
5. Commit, wait for Pages deployment, and refresh the site.

## Change colors or fonts

The first `:root` block in `css/styles.css` contains named colors: `--blue`, `--navy`, `--ink`, `--cognac`, `--tan`, `--gray`. The stylesheet is formatted with one property per line. Fonts are hosted locally under `fonts/`.

## Add a section

In `index.html`, copy a complete `.scene` block, including its `.section-sheet`. Place it before the contact scene, then adapt this template:

```html
<div class="scene" style="--scene-order: 4">
  <div class="section-sheet">
    <section class="screen work" id="new-section" aria-labelledby="new-title">
      <div class="section-heading">
        <p class="label">04 / NEW SECTION</p>
        <h2 id="new-title">Write a clear heading here.</h2>
        <p>Add your body text here.</p>
      </div>
    </section>
  </div>
</div>
```

Use unique IDs, increment the contact scene's `--scene-order`, and add `<a href="#new-section">New section</a>` inside `#primary-nav` if you want a navigation link. Use sequential scene-order values. The script automatically measures section height, including longer content and expanded details. Sections are at least one screen tall and grow as needed on phones.

## Update projects

Each work tab has a `data-panel` value and `aria-controls` matching a panel ID. Copy an existing button and matching `<article role="tabpanel">`, give both unique IDs, and update `aria-labelledby`. New inactive tabs need `aria-selected="false"`, `tabindex="-1"` and panels need `hidden`. Keep at least one tab selected.

## Motion and accessibility

Find `SECTION-ONLY SCROLL OVERLAP` in the stylesheet. Whole sheets are sticky briefly. Portraits and text remain stationary; the ornamental rings and matte backgrounds have their own gentle motion, described below. To remove overlap entirely, set `.section-sheet { position: relative; top: auto; }` and `.scene { padding-bottom: 0; margin-bottom: 0; }`. Reduced-motion users already get this behavior.

Before committing, check phone and desktop sizes, all four tabs, expandable details, navigation, and email/LinkedIn links. The current colleague review text has been approved. Confirm approval for any replacement review wording before publishing it.


## Optimized images and hero reveal

Original editable PNGs remain in `assets/`. The live page uses transparent WebP copies: `hero.webp`, `hero-small.webp` (phone size), `live-session.webp` and `instructor-session.webp`. Replace these served files when changing images, or update the HTML sources. The hero uses a responsive `srcset` and a matching preload.

The decorative `.hero-trace` SVG in `index.html` follows the current portrait's alpha silhouette. Update that contour if the pose changes. The final CSS and JS blocks control a single soft pulse and approximately 1.6-second outline-to-silhouette-to-portrait reveal. It waits for portrait decoding, never blocks the page, and has a 4.5-second fail-safe. Reduced-motion users see the normal image without the effect.


## Ornamental depth and matte texture

The final CSS/JS blocks control the scroll-reactive rings and matte white surfaces. `assets/matte-grain.svg` is the lightweight grain tile. Foreground rings occupy edge whitespace; an SVG mask excludes all text, images, navigation and the opaque company/testimonial/work sections. Keep new content in semantic HTML (`h1`–`h3`, `p`, `img`, links/buttons) or extend `protectedElements` in `js/main.js` for custom elements. Ring positions and sizes are in `positions`. Rings use navy, cognac and chalk colors. On phones the foreground layer is hidden and background movement is limited to 12px. Reduced-motion disables decorative movement.
