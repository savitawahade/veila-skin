# Veila Skin

Your daily moment of care.

A responsive skincare brand and storefront concept in the private repository [savitawahade/veila-skin](https://github.com/savitawahade/veila-skin).

## Local preview

Open `index.html` in Chrome, or run from the repository:

```sh
python3 tools/preview.py
```

Visit http://127.0.0.1:4173/veila-hero.html. No build or package installation is required. Google Fonts needs internet access; system font fallbacks are provided.

## Current experience

- The hero displays a product poster first. Moving the mouse loads the frame-accurate film and gently advances the bottle opening, slow serum drop and closing ritual. There is no play button, autoplay or reverse-droplet motion. Movement eases to a stop after input ends, and stops immediately offscreen or in a hidden tab.
- Fast pointer movement cannot skip through the action: progress is capped at 0.78 film seconds per second, slowing to 0.38 during the drop. Horizontal touch gestures and Right Arrow/Space on the focused bottle provide alternatives. Reduced-motion users get a still image with optional discrete keyboard steps.
- Fine-pointer movement also adds a small, eased shift to the composition. The transparent water-drop CTA gently morphs within its fixed location.
- On narrow screens, navigation, copy, the product film follow normal page flow. Small phones trim empty space beside the bottle while preserving the full image height, bottle and raised dropper. The product grid has one column on small phones, two at intermediate widths and three on wide screens. Product text is 16px, secondary information is at least 12px, and interactive controls have comfortable touch targets.
- Fifteen Veila concepts cover cleansers, toners, serums, moisturisers, sunscreen, masks, essence pads, lip care, body care and ritual sets. Category filters, search, sorting, progressive collection loading and product dialogs support browsing.
- The Dewdrop serum uses a consistent packaging master across hero and catalog imagery. The Daily Ritual Set displays the same cleanser, serum and moisturiser photographs used by their individual products. The gel moisturiser image matches its named product.
- The ingredient library, product ingredient explorer, ritual, philosophy and FAQ explain the collection. The preview bag supports quantities, removal and subtotal calculation; it is stored only in the visitor's browser.

## Concept status

Veila is in development. Names, formulas, packaging, ingredients and INR prices are illustrative. Final formulas, suitability, availability, delivery and returns need confirmation before launch. No orders or payments are accepted. No customer reviews, certifications, tested SPF/UVA protection or clinical efficacy claims are fabricated. Brand and domain availability have not been verified.

The retail structure references [Sephora India's skincare collection](https://sephora.in/collection/skincare), with category coverage informed by [Hyphen's collection](https://letshyphen.com/collections/all). Veila's branding and content are original concept work. Generated media is illustrative and should be checked against approved packaging before any public launch.

## Main files

- `design/veila-hero.html`: complete page and hero media references.
- `design/hero-film.js`: poster-first media lifecycle, gesture-driven frame progression, restrained pointer motion and mobile navigation.
- `design/water-button.js`: local droplet-outline animation and press feedback.
- `design/hero-refined.css`: responsive hero, safe bottle/dropper framing and transparent CTA.
- `design/storefront.js`: catalog, filtering, product details, ingredient explorer and browser-local bag.
- `design/storefront.css` and `design/veila-refined.css`: collection, editorial sections, dialogs, typography and responsive layouts.
- `design/assets/veila-hero-v4/`: canonical bottle master, `poster.jpg` and `ritual-interactive.mp4` for the current hero direction.
- `design/assets/veila-products/`: catalog photographs, including the canonical serum and corrected gel moisturiser.
- `tests/hero-motion.test.cjs`: media lifecycle, interaction and reduced-motion regression checks.

Older film versions and photographic-layer experiments are retained as archives. They do not define the current hero behavior.

[Working Google Flow project](https://flow.google.com/project/d256b2ba-d855-4c03-ba10-c19df781e4d8).

## Antigravity and GitHub workflow

Open this repository folder in Antigravity, edit the same source, preview in Chrome, then commit and push to `origin/main`. GitHub is the shared source of truth. The design remains local with source in the private repository; public hosting and a custom domain are not configured. Do not upload the design or media to Superdesign without the user's authorization.

## Checks

```sh
node --check design/hero-film.js
node --check design/water-button.js
node --check design/storefront.js
node --test tests/hero-motion.test.cjs
git diff --check
```

Before publishing, visually verify desktop and small-phone layouts, enlarged text, keyboard navigation, film loading/retry and gesture-controlled motion, product filters, ingredient selection, dialogs and bag persistence. Verify each final media asset against the canonical packaging and confirm product information separately from this concept build.

For HTTP previews, use a server with byte-range support for video seeking. Opening the local HTML directly in Chrome also works. The original corrected film remains archived as `ritual-final.mp4`; `tools/prepare-interaction-film.swift` encodes its seekable derivative.
