# Design System Document: Modern Eco-Aesthetic

## 1. Overview & Creative North Star: "The Digital Atelier"
The Creative North Star for this design system is **The Digital Atelier**. This is not a standard e-commerce grid; it is a curated editorial experience that treats second-hand items as high-end artifacts. We move away from the "cluttered marketplace" trope by embracing **Intentional Asymmetry** and **Soft Minimalism**. 

To break the "template" look, layouts should utilize "The Breathing Grid"—where large-scale typography (Display-LG) overlaps secondary imagery, and product cards are offset to create a rhythmic, organic flow rather than a rigid table. The goal is to make the user feel they are browsing a premium gallery, not a bargain bin.

---

## 2. Colors & Tonal Depth
Our palette is rooted in the earth, using `primary (#4c6545)` sage and `surface (#fcf9f4)` oatmeal neutrals to establish immediate trust and environmental consciousness.

### The "No-Line" Rule
**Explicit Instruction:** High-end design is felt, not outlined. Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for large section backgrounds to distinguish them from the main `surface` background.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
- **Base Layer:** `surface` (#fcf9f4).
- **Secondary Sectioning:** `surface-container-low` (#f6f3ee).
- **Interactive Elevated Cards:** `surface-container-lowest` (#ffffff).
- **Depth Tip:** Place a `surface-container-lowest` card on a `surface-container-low` background to create a "soft lift" without a single shadow or line.

### Glass & Gradient Rule
To avoid a flat, "cheap" feel, use **Glassmorphism** for floating headers or navigation bars. Apply a 15-20px backdrop-blur to a 70% opaque `surface` color. For high-impact CTAs, use a subtle linear gradient from `primary` (#4c6545) to `primary-container` (#809b77) to add a "silken" tactile quality.

---

## 3. Typography: Editorial Authority
The contrast between the elegant `notoSerif` and the functional `manrope` provides a balance of heritage and modernity.

- **Display & Headlines (`notoSerif`):** Use for storytelling and category titles. These should be set with tight letter-spacing (-0.02em) to feel authoritative and "inked."
- **Body & Titles (`manrope`):** Use for product details and navigation. The generous x-height ensures legibility even at small `label-sm` sizes.
- **Hierarchy Note:** Never use `headline-lg` and `body-lg` in equal weight. Create "Dynamic Contrast"—if a header is large, the supporting text should be significantly smaller and more spaced out (`3.5rem` vs `0.875rem`).

---

## 4. Elevation & Depth: Tonal Layering
We reject the heavy drop-shadows of the early web. Our depth is "Ambient."

- **The Layering Principle:** Instead of shadows, use the `surface-container` tiers. A `surface-container-high` element should contain secondary information, while the "Hero" content sits on `surface-container-lowest`.
- **Ambient Shadows:** If a floating element (like a Modal or Floating Action Button) requires a shadow, it must be `on-surface` color at 4% opacity with a `24px` to `40px` blur. It should feel like a soft glow, not a dark edge.
- **The "Ghost Border":** For input fields or mandatory containment, use `outline-variant` (#c6c8b8) at 20% opacity. If you can see the border clearly, it is too heavy.

---

## 5. Components

### Buttons
- **Primary:** Background `primary` (#4c6545), text `on-primary` (#ffffff). Apply `md` (0.375rem) roundness. 
- **Secondary:** Background `secondary-container` (#f0ddc3), text `on-secondary-container` (#6e614c). No border.
- **Tertiary:** Text-only in `primary`, using `title-sm` typography with an underline that appears only on hover.

### Cards & Lists
- **The "No-Divider" Rule:** Forbid 1px dividers. Separate list items using `spacing-5` (1.7rem) of vertical whitespace. 
- **Product Cards:** Use `surface-container-lowest` (#ffffff) with `lg` (0.5rem) corner radius. The image should be the hero; typography (Title-MD) should be placed with generous padding (`spacing-4`).

### Inputs & Selection
- **Text Inputs:** Use a soft-fill approach. Background: `surface-container-highest` (#e5e2dd). When focused, transition the background to `surface-container-lowest` with a "Ghost Border" of `primary` at 30% opacity.
- **Chips:** Selection chips should use `primary-fixed` (#ceebc2) with `full` roundness for a soft, pebble-like feel.

### Specialized Marketplace Components
- **The "Provenance" Badge:** A small, high-end tag for verified items. Use `tertiary-container` (#849887) background with `label-sm` text.
- **Eco-Impact Slider:** A custom range input using `primary` for the track and `surface-container-lowest` for the thumb, showing the CO2 saved by buying 2nd-hand.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical margins (e.g., `spacing-16` on the left, `spacing-24` on the right) for editorial hero sections.
- **Do** use `on-surface-variant` (#46483c) for secondary text to maintain a soft, low-contrast look that reduces eye strain.
- **Do** allow images to "break" the container, bleeding into the white space.

### Don't
- **Don't** use pure black (#000000). Use `on-background` (#1c1c19) for all "black" text.
- **Don't** use standard `0.25rem` roundness for everything. Mix `md` for buttons with `lg` or `xl` for large cards to create visual interest.
- **Don't** crowd the layout. If a section feels "busy," increase the spacing from `spacing-8` to `spacing-12`.