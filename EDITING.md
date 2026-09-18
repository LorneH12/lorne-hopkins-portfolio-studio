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

Find `SECTION-ONLY SCROLL OVERLAP` in the stylesheet. Whole sheets are sticky briefly; individual assets never animate. To remove overlap entirely, set `.section-sheet { position: relative; top: auto; }` and `.scene { padding-bottom: 0; margin-bottom: 0; }`. Reduced-motion users already get this behavior.

Before committing, check phone and desktop sizes, all four tabs, expandable details, navigation, and email/LinkedIn links. The current colleague review text has been approved. Confirm approval for any replacement review wording before publishing it.
