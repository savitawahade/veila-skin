# Veila Skin

Your daily moment of care.

A responsive skincare storefront concept in the existing private repository [savitawahade/veila-skin](https://github.com/savitawahade/veila-skin).

## Preview

Open `index.html` directly in Chrome, or run from this repository:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Visit http://127.0.0.1:4173/. No build or package installation is required. Google Fonts needs internet access; system font fallbacks are provided.

## Design and functionality

- Full-viewport photographic hero. Mouse movement gently moves the bottle, aloe, oats and dewdrops at different depths, with small tilts and smooth settling. The bottle remains front-facing and legible. Touch movement also responds without blocking page scrolling. Reduced-motion preferences disable the effect. No autoplay, 360° spin, slider, frame counter or bottom control strip.
- Fifteen original Veila concept products across ten skincare categories: cleansers, toners, serums, moisturisers, sunscreen, masks, essence pads, lip care, body care and sets. Fifteen coordinated AI-generated product photographs show the product type and proposed ingredient highlights directly on the packaging.
- Category filters, product/ingredient search, price/name sorting, progressive collection loading and empty results handling.
- Visible ingredient chips on every card and an interactive ingredient atelier with a product selector and individual ingredient notes.
- Sunscreen remains a development concept: no tested SPF, UVA rating or performance claim is asserted.
- Accessible native product dialogs with ingredient, ritual and delivery information.
- Preview shopping bag with quantity adjustment, removal, calculated subtotal and local browser persistence. No checkout, payments, orders or customer data collection.
- Ritual, philosophy, FAQ and footer sections; working navigation and mobile menu.

The retail structure references [Sephora India's skincare collection](https://sephora.in/collection/skincare), with category coverage informed by [Hyphen's full collection](https://letshyphen.com/collections/all). Veila branding, product names, descriptions and packaging illustrations are original concept content. Formulas, pricing, availability, suitability, delivery and returns need confirmation before launch. No customer ratings, certifications or tested efficacy are asserted. Brand/domain availability has not been verified.

## Files

- `design/veila-hero.html`: full page.
- `design/hero-parallax.js`: lightweight pointer-following layers, easing, reduced-motion support and mobile navigation.
- `design/assets/veila-parallax/`: transparent photographic bottle, aloe and oat layers.
- `design/veila-parallax-prompts.txt`: built-in image generation prompts for those layers.
- `design/hero-refined.css`: refined dropper hero composition.
- `design/storefront.css`: base collection, editorial sections and dialogs.
- `design/veila-refined.css`: photographic collection, ingredient atelier and refined responsive styling.
- `design/assets/veila-products/`: fifteen labelled product photographs and their original photographic references, optimized as JPEGs.
- `design/veila-art-direction.md`: image direction, catalog scope and source references.
- `design/storefront.js`: concept catalog, ingredient explorer, filters and browser-local bag.
- `design/assets/veila-hero-v2/`: refined bottle reference and approved 10-second MP4, retained separately from the interactive hero. Locally extracted frames are ignored.
- `design/assets/veila-frames/`: archived first-version frames.
- `design/assets/veila-bottle-opening-8s.mp4`: approved source clip; never played by the website.
- `design/veila-flow-prompt.txt`: original animation brief.
- `design/veila-hero-v2-prompt.txt`: current bottle art direction and 10-second film brief.

[Working Google Flow project](https://flow.google.com/project/d256b2ba-d855-4c03-ba10-c19df781e4d8).

## Antigravity and GitHub workflow

Open this repository folder in Antigravity. Edit the same source files, preview in Chrome, then commit and push to `origin/main`. GitHub is the shared source of truth. Public hosting and a custom domain are not configured; this remains a local design preview with source saved in the private repository.

## Verification

Checked JavaScript syntax, desktop/mobile layouts, category filtering, ingredient search, price sorting, product dialogs, bag quantity/subtotal, removal, empty states, and persistence after reload. The photographic hero is checked for independent layer movement, desktop/mobile layout, removed controls and browser errors. The separate MP4 was verified as exactly 10 seconds.
