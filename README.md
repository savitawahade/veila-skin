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

- Full-viewport hero: 48 still frames controlled by mouse movement or a touch/keyboard slider. No video element, autoplay or time-driven playback. Reduced-motion preferences disable pointer scrubbing; the slider remains available.
- Six original Veila concept products with responsive packaging illustrations, sizes, illustrative INR prices, texture directions and proposed ingredient stories.
- Category filters, product/ingredient search, price/name sorting and empty results handling.
- Accessible native product dialogs with ingredient, ritual and delivery information.
- Preview shopping bag with quantity adjustment, removal, calculated subtotal and local browser persistence. No checkout, payments, orders or customer data collection.
- Ritual, philosophy, FAQ and footer sections; working navigation and mobile menu.

The retail structure references [Sephora India's skincare collection](https://sephora.in/collection/skincare). Veila branding, product names, descriptions and packaging illustrations are original concept content. Formulas, pricing, availability, suitability, delivery and returns need confirmation before launch. No customer ratings, certifications or tested efficacy are asserted. Brand/domain availability has not been verified.

## Files

- `design/veila-hero.html`: full page and hero interaction.
- `design/storefront.css`: collection, editorial sections and dialogs.
- `design/storefront.js`: concept catalog, filters, illustrations and browser-local bag.
- `design/assets/veila-frames/`: the 48 still images used by the hero.
- `design/assets/veila-bottle-opening-8s.mp4`: approved source clip; never played by the website.
- `design/veila-flow-prompt.txt`: original animation brief.

[Working Google Flow project](https://flow.google.com/project/d256b2ba-d855-4c03-ba10-c19df781e4d8).

## Antigravity and GitHub workflow

Open this repository folder in Antigravity. Edit the same source files, preview in Chrome, then commit and push to `origin/main`. GitHub is the shared source of truth. Public hosting and a custom domain are not configured; this remains a local design preview with source saved in the private repository.

## Verification

Checked JavaScript syntax, desktop/mobile layouts, category filtering, ingredient search, price sorting, product dialogs, bag quantity/subtotal, removal, empty states, and persistence after reload. Hero uses still images and supports keyboard frame selection.
