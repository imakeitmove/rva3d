# RVA3D Visual Identity Guide

**Version:** 0.3 working draft  
**Date:** September 5, 2026  
**Status:** Updated to reflect the approved derived Depth Green support tone for Signal Green.

---

## 1. Brand idea

RVA3D makes complex products, systems, and ideas easier to understand, easier to trust, and harder to ignore.

The identity should communicate:

**Technical · Cinematic · Trusted · Clear · Senior · Human**

The visual principle is:

> **Confident restraint with moments of signal.**

RVA3D should not look like a generic neon gaming brand, a faceless production factory, or a software company pretending the interface is the product. The work is the product. The identity frames it, organizes it, and makes it memorable.

---

## 2. The organizing metaphor

The original terminal / PowerShell inspiration remains useful, but RVA3D should not copy the terminal literally.

A terminal is mostly neutral. Color appears selectively to identify a type of information, a state, an action, or an exception.

RVA3D should use that same logic:

- **Neutrals create the field.**
- **Acid green is the primary signal and core brand accent.**
- **Depth Green is the derived dimensional and shadow companion to Signal Green.**
- **Purple is the official secondary brand color and the preferred non-neutral background accent.**
- **Blue and orange are tertiary system colors.**
- **Project imagery supplies much of the site's changing color energy.**
- **A color used inside a render or case study is not automatically a brand color.**

The goal is not to make every page multicolored. The goal is to create a system in which each color has a job.

---

## 3. Color system

### 3.1 Core palette

| Token | Name | Value | Primary use |
|---|---|---:|---|
| `--rva-void` | RVA Void | `#080A09` | Main background, dark surfaces |
| `--rva-paper` | RVA Paper | `#F3F1E9` | Primary text, light surfaces |
| `--rva-signal` | Signal Green | `#D7FF43` | Primary brand accent, action, focus, key CTA |
| `--rva-depth-green` | Depth Green | `#087A14` | Derived dimensional support for Signal Green: shadows, falloff, extrusion, and environmental depth |
| `--rva-purple` | Vector Purple | `#6230C0` | Secondary accent, selected states, large background fields, CTA surfaces |
| `--rva-stone` | System Gray | `#A4A59F` | Supporting text, metadata |
| `--rva-rule` | Hairline | `rgba(243, 241, 233, 0.16)` | Dividers, borders, grid lines |
| `--rva-media-dark` | Media Black | `#111411` | Media placeholders and secondary dark fields |

These are the official RVA3D digital identity colors.

**Hierarchy:**

1. **Void + Paper** build the field.
2. **Signal Green** is the primary brand signal; **Depth Green** supports its dimensional expression without becoming another accent.
3. **Purple** is the preferred secondary brand color.
4. **Gray** carries quiet supporting structure.

### 3.2 Tertiary system colors

| Token | Name | Value | Allowed role |
|---|---|---:|---|
| `--rva-info` | Terminal Blue | `#3A96DD` | Technical annotation, informational accents, UI details, diagrams, small counters or indices |
| `--rva-process` | Signal Orange | `#F29A2E` | Special emphasis, process states, occasional alternate buttons, caution, special composition breaks |

The screenshot that inspired the palette uses approximately:

- terminal background: `#0C0C0C`
- terminal white: `#CCCCCC`
- terminal green: `#13A10E`
- terminal blue: `#3A96DD`
- terminal amber: `#C19C00`

RVA3D keeps the terminal logic, not a literal copy. Signal Green remains `#D7FF43`, and purple now becomes the official secondary brand color.

### 3.3 Color roles

#### Signal Green `#D7FF43`
Use for:

- the `3D` portion of the wordmark when appropriate;
- primary CTAs and key interactive actions;
- focus states and selected emphasis;
- highlighted proof points;
- a small amount of headline emphasis;
- key interface or conversion moments.

#### Depth Green `#087A14`

Depth Green is an official **derived/dimensional support tone for Signal Green**, not another equal-status accent. It is deliberately dark and highly saturated rather than olive or muted.

Use for:

- shadows beneath or around Signal Green;
- green gradient or glow falloff;
- 3D extrusion and dimensional shading;
- hover depth;
- darker green environmental lighting;
- occasional dark-green surfaces when they clearly derive from Signal Green;
- transitions such as `#D7FF43 → #087A14 → #080A09`.

Do not use Depth Green as:

- a replacement for Signal Green;
- a second competing primary accent;
- ordinary link text;
- the default CTA color;
- the default selected-state color;
- an arbitrary decorative green.

#### Vector Purple `#6230C0`
Use for:

- selected panel or menu backgrounds;
- large CTA background sections;
- accent surfaces that need more presence than gray but less urgency than green;
- standout content blocks on dark pages;
- secondary emphasis fields, especially when breaking up long black sections.

Purple is the **preferred secondary background / accent color** in the brand system.

#### Terminal Blue `#3A96DD`
Use for:

- technical annotations and diagram language;
- numeric counters, indices, or micro-labels when they benefit from a subtle informational accent;
- UI details that should feel technical rather than promotional;
- occasional composition details that need a cool contrast to green and purple.

Blue should usually appear in **small, crisp doses**.

#### Signal Orange `#F29A2E`
Use for:

- occasional special buttons;
- process callouts;
- caution or attention states;
- composition breaks where a warmer, rarer accent is desirable.

Orange is a **special-use color**, not a regular-page default.

### 3.4 Color rules

1. **Neutrals still dominate.** Most brand-controlled surfaces should be RVA Void, RVA Paper, or gray.
2. **Green remains the primary signal.** Use it when the brand needs to act, convert, focus, or punctuate.
3. **Depth Green only gives Signal Green dimension.** It may shade or extend green moments, but it must not read as a second primary accent or replace Signal Green.
4. **Purple is the preferred secondary field color.** Use it to create emphasis blocks, selected states, and section breaks.
5. **Blue is for information and small technical accents.** It should not compete with purple as a large surface color.
6. **Orange is special and occasional.** Treat it like a rare emphasis tool.
7. **Use one dominant signal hue per component.** A given card, row, or CTA should usually be led by either green or purple, with blue and orange remaining subordinate.
8. **Do not color text merely because a page feels dark.** Add color when it communicates hierarchy, role, state, or meaning.
9. **Let the work be colorful.** Brand chrome around case studies should remain restrained enough that client imagery stays in charge.
10. **Avoid large permanent green fills.** Green is strongest as a sharp signal, not a wallpaper color.
11. **Purple may fill larger areas than green.** It is the safer full-section background accent.
12. **Do not use Signal Green as normal-size text on RVA Paper.** On green fills, use RVA Void text.
13. **When purple is used as a fill, use RVA Paper text by default.** Green may then be used as a selective highlight.
14. **No new global accent enters production without a named token and an explicit role in this guide.**

A useful visual proportion is approximately **80–88% neutrals, 6–10% green, 4–8% purple, and only small amounts of blue/orange**. Depth Green is counted as part of a Signal Green dimensional treatment, not as another visible palette allocation. This is a pacing guideline, not a hard rule.

### 3.5 Guidance from the mockups

The recent capabilities mockups suggest several productive uses:

- A **purple selected-row background** in the capabilities list works well because it clearly distinguishes the selected item without making the whole module louder.
- A **purple full-width CTA background** also works well, especially when paired with a subtle dark-to-purple gradient or glow treatment that relates back to the homepage atmosphere.
- The **small blue `03 / 06` index above “Motion Design” can work**, but blue should remain a light-touch informational accent. If blue is also introduced inside the selected purple row, the component may become too busy unless the usage is highly disciplined.

Recommended blue placements:

- small section counters and indices;
- diagram labels;
- subtle UI markers;
- technical chips or metadata;
- occasional case-study separators or utility buttons.

---

## 4. Typography

### 4.1 Font families

**Primary:** Geist Sans  
**Technical voice:** Geist Mono  
**Fallbacks:** Arial, Helvetica, sans-serif

Arial is currently a fallback, not the intended website typeface.

The wordmark may retain its own bold, custom, or Arial-derived construction. The logo and the editorial type system do not have to use the same exact face.

### 4.2 Why Geist works

Geist supports the two sides of RVA3D:

- clean enough for explanatory and client-facing communication;
- technical enough to support interfaces, specifications, diagrams, and metadata;
- variable enough to move from understated body copy to a forceful display statement without adding more font families;
- naturally paired with Geist Mono for a subtle terminal / system reference.

The original Arial Bold direction was not wrong. Its bluntness and confidence were part of the concept. The better rule is to preserve that pressure in the wordmark and short statements rather than making every large heading equally heavy.

### 4.3 Type roles

| Role | Family | Recommended weight | Tracking | Line height |
|---|---|---:|---:|---:|
| Wordmark / brand text | Geist Sans or approved logo artwork | `720–800` | `-0.04em` to `-0.07em` | `0.9–1.0` |
| Major display heading | Geist Sans | `430–520` | `-0.04em` to `-0.07em` | `0.92–1.02` |
| Short payoff / emphatic line | Geist Sans | `650–720` | `-0.04em` to `-0.08em` | `0.9–1.0` |
| Section heading | Geist Sans | `430–520` | `-0.025em` to `-0.055em` | `1.0–1.15` |
| Body copy | Geist Sans | `390–450` | normal | `1.55–1.70` |
| Navigation / controls | Geist Sans | `560–700` | `0.04em` to `0.11em` | `1.0–1.3` |
| Labels / metadata / indices | Geist Mono | `520–620` | `0.08em` to `0.14em` | `1.3–1.5` |

### 4.4 Typography rules

1. **Scale carries most display emphasis.** Large text does not also need to be ultra-bold.
2. **Bold is punctuation, not wallpaper.** Reserve the heaviest weights for the wordmark, buttons, very short payoffs, and a few selected words.
3. **Sans is the human voice. Mono is the system voice.** Use Geist Mono for labels, timestamps, steps, coordinates, technical metadata, and compact annotations. Do not set long paragraphs in mono.
4. **Small uppercase text must be tracked out.** It should feel like a label, not a squeezed sentence.
5. **Large display text may be tightly tracked.** Body text should not.
6. **Do not use all caps for full headlines or paragraphs.**
7. **Keep body copy to a readable measure.** Aim for roughly 55–75 characters per line.
8. **One dominant statement per section.** Do not make every heading compete at hero scale.
9. **Avoid stacking every emphasis device.** A phrase usually gets one primary treatment: scale, weight, or color. A second treatment is allowed only when it clarifies the intended reading.
10. **Do not introduce a third interface font without a clear functional reason.**

### 4.5 Emphasis inside headlines

Use Signal Green to guide the eye, not to decorate random words.

Good uses:

- the action or transformation;
- an opening or closing word that creates rhythm;
- a status, number, or decisive result;
- the `3D` in the RVA3D wordmark;
- a single highlighted word at the end of a phrase on a purple CTA section.

Avoid:

- three or more separately colored fragments in one sentence;
- coloring a phrase that is already bold, underlined, animated, and oversized;
- switching between green, purple, blue, and orange within ordinary marketing copy.

---

## 5. Logo and wordmark

The RVA3D identity should exist as a small system:

1. **Primary wordmark**
2. **Monochrome wordmark**
3. **Compact mark or favicon**
4. **3D / animated interpretation**

The flat identity must remain legible at small sizes. The 3D version may add materials, light, extrusion, motion, or assembly, but should feel like a dimensional interpretation of the same underlying geometry.

Current digital behavior:

- `RVA` in RVA Paper or an equivalent light neutral;
- `3D` in Signal Green;
- tight spacing and a confident heavy weight;
- RVA Void as the preferred background.

Blue and orange do **not** replace the established green-led logo system. Purple may appear in logo-supporting fields or adjacent surfaces, but the core logo remains green-led unless a deliberate alternate lockup is approved.

### 5.1 Current logo source note

The latest working logo package to review for web use is:

- `RVA_Logo_005D_001`
- location: `W:\PROJECTS\_ACTIVE\2026_RVA3D_LogoDesign\output`

Use the cleanest approved version available for web placements such as the capabilities-page footer / CTA area.

---

## 6. Layout and composition

The design should feel structured before it feels decorated.

Use:

- strong alignment and visible hierarchy;
- generous space around important work;
- thin rules, grids, coordinates, and technical framing in moderation;
- dramatic shifts in scale;
- clean, intentional crops;
- asymmetry when it improves movement or focus;
- depth created through media, overlap, motion, and perspective;
- purple background fields as deliberate sectional rhythm, not arbitrary stripes.

Avoid:

- arbitrary colored section stripes;
- decorative blobs and generic gradients with no relationship to the rest of the site;
- repeated card containers around everything;
- large empty color blocks with no narrative purpose;
- clever navigation that must be decoded;
- interface decoration that competes with the portfolio.

A dark page does not automatically need a colored background. Rhythm can come from scale, density, media proportion, whitespace, captions, borders, composition changes, and occasional purple section breaks.

---

## 7. Case studies and imagery

The case study is where the brand proves itself.

1. Finished work should dominate.
2. Process material should explain decisions, not merely prove software was opened.
3. Client / project color may fill the media and occasionally influence a local composition.
4. Global navigation, labels, captions, and controls should stay within the core RVA3D system.
5. Use Signal Green for connective tissue: labels, active states, key figures, links, and proof points.
6. Use Purple to break up long sequences, create emphasis sections, or provide secondary CTA surfaces.
7. Use Blue and Orange sparingly for specialty accents, annotations, or non-standard compositions.
8. Do not apply one heavy-handed color treatment to every case study.
9. Each page may have its own visual personality without inventing a new global brand palette.

---

## 8. Motion language

RVA3D motion should reveal structure and judgment.

Preferred motion grammar:

> **Structure → transformation → resolved image**

Useful behaviors include:

- assembly and disassembly;
- unfolding or sliding planes;
- controlled camera reveals;
- wireframe-to-final transitions;
- restrained inertia and physical response;
- motion that clarifies hierarchy or causality;
- subtle gradients or light falloff that make purple CTA areas feel dimensional rather than flat.

Avoid motion that exists only to prove the page can move. Interaction should feel responsive and intentional, with reduced-motion support preserved.

---

## 9. Written voice

RVA3D should sound:

- specific rather than inflated;
- experienced rather than grandiose;
- technically literate without drowning the buyer in software terminology;
- warm and human without becoming cute at the wrong moment;
- confident enough to use plain language.

Lead with the buyer's problem, the difficult part, the decision, and the result. Tools are supporting evidence.

Avoid vague agency language, long strings of claims, and terminology that makes a buyer decode what RVA3D actually does.

---

## 10. Accessibility and digital behavior

- Normal text should meet at least WCAG AA contrast.
- Signal Green works extremely well against RVA Void and should use RVA Void text when used as a fill.
- Signal Green should not be used as normal-size text on RVA Paper.
- Purple fill areas should default to RVA Paper text for comfort and contrast.
- Focus states must remain clearly visible.
- Color should never be the only indicator of state.
- Motion must respect reduced-motion preferences.
- Buttons and links should remain recognizable without depending only on color.

---

## 11. Governance

The website should have one shared set of design tokens. Page-specific files should consume those tokens rather than inventing new near-duplicate hex values.

Before adding or changing a global color, typeface, radius, spacing convention, or motion behavior, ask:

1. Is this brand, system, or project-specific?
2. What job does it perform?
3. Does an existing token already perform that job?
4. Will the decision remain coherent across the homepage, capabilities pages, work index, case studies, and contact flow?
5. Does it make the work easier to understand or merely make the interface busier?

### Recommended token structure

```css
:root {
  --rva-void: #080a09;
  --rva-paper: #f3f1e9;
  --rva-signal: #d7ff43;
  --rva-depth-green: #087a14;
  --rva-purple: #6230c0;
  --rva-stone: #a4a59f;
  --rva-rule: rgba(243, 241, 233, 0.16);
  --rva-media-dark: #111411;

  /* Tertiary system colors: use for specific jobs only. */
  --rva-info: #3a96dd;
  --rva-process: #f29a2e;
}
```

---

## 12. Immediate design decisions

This draft now recommends:

- **Keep the current acid green.**
- **Adopt Depth Green `#087A14` only as Signal Green's derived dimensional and shadow companion.**
- **Officially adopt purple `#6230C0` as an RVA3D brand color.**
- **Use purple as the preferred secondary background / accent color.**
- **Keep Geist Sans and Geist Mono.**
- **Treat Arial Bold as wordmark / display heritage, not the site-wide text system.**
- **Use blue as a tertiary informational accent in small places.**
- **Use orange as a fourth, occasional special-use accent.**
- **Centralize the tokens before adding more page-level color decisions.**
- **Let case-study imagery provide most of the site's changing color.**

The result should feel like a dark technical workspace that becomes vivid exactly when RVA3D has something important to show.
