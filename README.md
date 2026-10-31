# Veila Skin

Your daily moment of care.

A responsive skincare storefront concept in the repository [savitawahade/veila-skin](https://github.com/savitawahade/veila-skin).

## Preview

Open `index.html` directly in Chrome, or run from this repository:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Visit http://127.0.0.1:4173/. No build or package installation is required. Google Fonts needs internet access; system font fallbacks are provided.

## Design and functionality

- Full-viewport Google Flow video hero using the new 10-second Natural Serum Ritual film. Mouse movement scrubs the opening sequence with eased seeking; leaving the hero returns to the opening shot. The film is encoded with every frame independently seekable. A Play the ritual / Pause film button supports touch and keyboard, and playback pauses offscreen or when the tab is hidden. No autoplay. Reduced-motion preferences disable pointer scrubbing. The transparent, morphing water-drop CTA remains in place.
- Fifteen original Veila concept products across ten skincare categories: cleansers, toners, serums, moisturisers, sunscreen, masks, essence pads, lip care, body care and sets. Coordinated product photographs show the product type and proposed ingredient highlights directly on the packaging. The ritual set reuses the same cleanser, serum and moisturiser images as the individual products.
- Category filters, product/ingredient search, price/name sorting, progressive collection loading and empty results handling.
- An eight-entry ingredient library with editorial photography, expandable explanations, source links and links into the corresponding product explorer. A dedicated Veila approach section explains ingredient transparency, routine information and concept status.
- Visible ingredient chips on every card and an interactive ingredient atelier with a product selector and individual ingredient notes.
- Sunscreen remains a development concept: no tested SPF, UVA rating or performance claim is asserted.
- Accessible native product dialogs with ingredient, ritual and delivery information.
- Preview shopping bag with quantity adjustment, removal, calculated subtotal and local browser persistence. No checkout, payments, orders or customer data collection.
- Ritual, philosophy, FAQ and footer sections; working navigation and mobile menu.

The retail structure references [Sephora India's skincare collection](https://sephora.in/collection/skincare), with category coverage informed by [Hyphen's full collection](https://letshyphen.com/collections/all). Veila branding, product names, descriptions and packaging illustrations are original concept content. Formulas, pricing, availability, suitability, delivery and returns need confirmation before launch. No customer ratings, certifications or tested efficacy are asserted. Brand/domain availability has not been verified.

## Files

- `design/veila-hero.html`: full page.
- `design/water-button.js`: smooth movement of the entire droplet-shaped Explore Veila button, with gentle tilt, liquid stretch, press feedback and reduced-motion support.
- `design/hero-film.js`: mouse-controlled film, explicit play/pause, reduced-motion handling and mobile navigation.
- `design/hero-parallax.js`: archived photographic layer interaction.
- `design/assets/veila-parallax/`: transparent photographic bottle, open bottle, detached dropper, aloe, oat and serum layers, plus the ingredient editorial still life.
- `design/veila-parallax-prompts.txt`: built-in image generation prompts for those layers.
- `design/hero-refined.css`: responsive film composition and transparent morphing CTA.
- `design/storefront.css`: base collection, editorial sections and dialogs.
- `design/veila-refined.css`: photographic collection, ingredient atelier and refined responsive styling.
- `design/assets/veila-products/`: fifteen labelled product photographs and their original photographic references, optimized as JPEGs.
- `design/veila-art-direction.md`: image direction, catalog scope and source references.
- `design/storefront.js`: concept catalog, ingredient explorer, filters and browser-local bag.
- `design/assets/veila-hero-v3/`: new Google Flow source, seek-friendly 10-second MP4 and poster. Generated with Omni 1.1 Flash, 720p, one output at the approved 15-credit cost. The film has AI-generated small-print imperfections and is concept imagery.
- `design/assets/veila-hero-v2/`: refined bottle reference and approved 10-second MP4, retained separately from the interactive hero. Locally extracted frames are ignored.
- `design/assets/veila-frames/`: archived first-version frames.
- `design/assets/veila-bottle-opening-8s.mp4`: approved source clip; never played by the website.
- `design/veila-flow-prompt.txt`: original animation brief.
- `design/veila-hero-v2-prompt.txt`: current bottle art direction and 10-second film brief.

[Working Google Flow project](https://flow.google.com/project/d256b2ba-d855-4c03-ba10-c19df781e4d8).

## Antigravity and GitHub workflow

Open this repository folder in Antigravity. Edit the same source files, preview in Chrome, then commit and push to `origin/main`. GitHub is the shared source of truth. The GitHub Pages workflow is prepared in `.github/workflows/pages.yml`. It packages only the active website into `dist/`, preserving the first screen and relative asset URLs. The old ChatGPT Sites deployment has had its website content removed and public access disabled.

## Verification

Checked JavaScript syntax, desktop/mobile layouts, category filtering, ingredient search, price sorting, product dialogs, bag quantity/subtotal, removal, empty states, and persistence after reload. The photographic hero is checked for independent layer movement, cap opening and closing, bounded droplets, ingredient library links, desktop/mobile layout, removed controls and browser errors. The active Flow MP4 was verified as exactly 10 seconds at 1280×720, with mouse seeking, explicit playback and responsive framing.

## Below-hero review improvements

The first screen is intentionally preserved from `a473eae` (the pre-team design): hero markup, film, water-drop CTA, hero stylesheet and interaction scripts are unchanged. Review fixes apply below that screen only.

- Product descriptions are 16px; secondary labels and ingredient chips are at least 12px. Text contrast and touch targets are improved, with a single-column catalog on small phones.
- The serum catalogue uses the ivory dropper artwork; gel moisturiser imagery uses centella and clear gel. Cards, details, bag, ingredients and ritual sets reuse canonical product photographs. The hero film remains its existing version.
- Expanding the catalog focuses the first newly revealed product. At the quantity limit, focus stays on an enabled control. Removal restores a useful focus target and bag updates are announced. Section jumps move focus to the destination.
- Ingredient explanations are specific to the selected concept and do not imply tested product results.

Verified unchanged first-screen computed styles at 1440px and 390px, mobile 16px/12px product text, product dialogs, collection expansion, quantity limit, bag removal, announcements, JavaScript syntax and clean browser error logs.

## GitHub Pages setup

Run `python3 scripts/build-pages.py` to produce the static website in `dist/`. The published entry page is an exact copy of `design/veila-hero.html`; archived media, design briefs, local hosting checkouts and repository history are excluded.

The repository is public, as authorized, to use free GitHub Pages. Settings → Pages uses GitHub Actions as the publishing source. Run the Deploy Veila to GitHub Pages workflow manually when needed; future website changes pushed to `main` deploy automatically.

GitHub Pages website address: https://savitawahade.github.io/veila-skin/.
