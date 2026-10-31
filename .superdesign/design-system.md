# Veila Skin design direction

An original skincare brand concept: **Your daily moment of care.** Keep the design and media local. The user declined Superdesign uploads; the private GitHub repository is the shared source of truth.

## Visual language

- Warm ivory `#F8F5EE`, cream `#F7F3EB`, ink `#354133`, sage `#637451`, muted text `#596550`, soft sage surfaces and restrained blush accents.
- Cormorant Garamond for the wordmark and editorial headings; Manrope for primary navigation, body and controls. The FAQ pairs Lora headings with DM Sans questions and answers.
- Use generous space, thin dividers, limestone, botanical textures and subtle silver packaging accents. Maintain readable contrast: product/body text 16px, secondary labels at least 12px, and controls at least 44px tall where applicable.

## Hero and motion

The hero shows a still product image before any video request. **Play the ritual** explicitly loads and starts the film; provide pause, resume, replay, loading status and retry. Pause when offscreen or when the tab is hidden. Keep the poster available if media fails. No autoplay, pointer scrubbing, frame slider or reverse playback.

Current hero assets belong in `assets/veila-hero-v4/`: the canonical bottle master, `poster.jpg` and `ritual-final.mp4`. Preserve the complete bottle and raised dropper. Desktop and tablet show the full film with `object-fit: contain`. At widths up to 600px, a square media area uses `object-fit: cover` and `object-position: 80% center` to trim empty horizontal space while preserving the full frame height. Keep the 12px inset for safe parallax movement; never crop the bottle or dropper. Desktop copy sits to the left of the product composition. At narrow widths, navigation, copy, media and controls follow normal flow so text enlargement does not collide with a fixed media position.

Fine-pointer movement adds only a small eased parallax shift to the media, up to 4px horizontally and 3px vertically. Keep navigation and text outside that response. Reduced-motion preferences disable decorative movement; users may still explicitly play the film.

The **Explore Veila** CTA is a water-drop silhouette with a fully transparent centre, a fine reflective rim and a 14px dark label. Never add an opaque white fill. Its outline morphs subtly only while the pointer is within the stable button area. Keep its location fixed, preserve the recognizable tip and use restrained press feedback. Provide a clear keyboard focus ring and disable animation for reduced motion.

## Packaging consistency

Use one canonical Dewdrop serum design across hero, product card, detail, ingredient explorer and ritual imagery. Preserve its exact bottle proportions, cap construction, label typography, product name, ingredient highlights and volume. Do not use generated text as a substitute for approved label artwork.

The Daily Ritual Set is a grouping of the same cleanser, serum and moisturiser photographs used for the individual products. Use the shared `.product-set` presentation in cards, details, bag, ingredient explorer and the ritual section. The gel moisturiser photograph must match its product name. Old film and photographic-layer experiments are archives, not active art direction.

## Collection and content

Fifteen concepts span face, sun, lip and body care. Use a three-column catalog on wide screens, two columns at intermediate widths and one column on small phones. Product names, sizes, textures and ingredient highlights take priority over decorative tags. Keep filters, search, sorting, product details and ingredient navigation understandable with keyboard and touch.

The eight-entry ingredient library explains common ingredient roles and links to sources. Product details distinguish proposed ingredients from final formulas. The browser-local preview bag supports quantities, removal and subtotal; it does not place orders or collect payments.

Use specific, calm language about the collection's development stage. Do not invent efficacy, SPF/UVA results, reviews, certifications, availability or shipping promises. Preserve the concept disclosure without presenting development assumptions as finished product facts.
