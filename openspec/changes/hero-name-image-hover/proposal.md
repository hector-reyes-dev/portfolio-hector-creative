# Hero name letter→tile hover for “Héctor Reyes”

Hover any letter of the Hero “Héctor Reyes” to swap it for one of two replaceable colored tiles, chosen at random on each activation, with a smooth transition in and a short intentional delay before the letter restores on pointer leave. No image-generation route exists in the project, so colored tiles ship as the default visual with a defined swap path for real images later. No visual inspection of the supplied reference was performed (URL returned 403); this proposal implements only the user-described behavior above.

## Quick path

1. Approve per-letter random variant on each hover, delayed restore, and tile placeholders as final-for-now visual.
2. Confirm open questions below (reduce-motion off vs. static swap; touch fully off; delay reuses `release 180ms`).
3. Next: `specs.md` + `design.md` + `tasks.md`, then human-reviewed apply with `pnpm agent:test` plus browser evidence.

## Intent

- Replicate the described title interaction for “Héctor Reyes”: letter → image on hover, letter returns shortly after leave, never instant.
- Each of the 11 letters (space excluded, `é` treated as its own letter) owns exactly 2 visual variants; each hover activation shows one variant picked at random.
- Ship polished, smooth UX without layout shift, without breaking the existing Hero, and without inventing motion/color tokens.
- Proposal only — no production code in this phase.

## Scope

### In scope

- Hero `h1.hero__name` only (“Héctor Reyes”), desktop fine-pointer hover path.
- Per-letter spans generated in `Hero.astro`, overlay tile layer per letter, same-box swap (no reflow).
- Minimal JS initializer in `src/lib/core/` (pattern `HeroPortrait.astro` → `hero-emoji-burst`): random pick per `pointerenter`, delayed restore on `pointerleave`, `matchMedia` gates for hover + reduced motion, idempotent init + cleanup.
- 22 replaceable colored tiles (11 letters × 2) built from existing tokens (`--accent`, `--accent-soft`, canvas/elevated/fill); deferred image loading strategy (CSS `background-image`/lazy, no eager 22-asset cost).
- Contract for swapping tiles for real images later (naming, paths under `public/`, scale in `em`/`ch`).

### Non-goals

- No AI image generation, no new image pipeline, no `astro:assets` adoption.
- No copy/content changes, no other headings, no `HeroContent` contract change.
- No new dependencies, no motion-system refactor, no second chromatic accent.
- No keyboard-operable per-letter action (effect is pointer-only, non-essential delight).
- No touch tap-to-freeze behavior; no 200%-zoom or copy-behavior regressions accepted but verified, not redesigned.

## Affected areas

| Layer / area | What is touched |
|---|---|
| `src/components/organisms/Hero.astro` | Split `h1` text into per-letter inline spans, preserve the inter-word space node and zero extra text (live test contract). Wire initializer import. |
| `src/lib/core/` (new module, e.g. `hero-name-hover`) | Random variant select, enter/leave with restore delay, hover/reduce gates, SSR-safe (no `document` at import), module-level state + cleanup. |
| `src/styles/portfolio/hero.css` | Overlay positioning (`relative` span + absolute tile), transitions only on existing tokens (`--ease-out`, `feedback 150ms` / `release 180ms` / `card-hover 450ms`). No new durations/radii/shadows. |
| Tokens (`tokens.css`, `motion.css`, `DESIGN.md`) | Reuse only; global `prefers-reduced-motion: reduce` rule stays authoritative. |
| Tests / harness | `pnpm agent:test` (`pnpm check && pnpm build`) + new jsdom contract mirroring `hero-emoji-burst` (idempotency, gates, `Math.random` stub) if JS module is added. Browser evidence required (no unit/e2e suite exists). |

## Key decisions

| Topic | Decision |
|---|---|
| Randomness | Per-activation JS random (`Math.random` pick of 2 variants on `pointerenter`). CSS-only rejected: CSS cannot pick randomly per hover. Build-time random rejected: does not satisfy “randomly per activation”. |
| Visual default | Colored tiles from system palette, `em`-scaled, absolutely overlaid in the letter box. Real images are a later drop-in via documented `public/` naming convention. |
| Restore delay | Reuse `release 180ms` (fallback candidate `feedback 150ms`); no new duration invented per DESIGN.md. Exact value confirmed in design phase. |
| Reduced motion | Disable the effect entirely (precedent: `hero-emoji-burst` emits nothing under reduce); no perceptible restore delay. Alternative (static swap, no animation/delay) listed as open question. |
| Touch / pointer | Gate on `(hover: hover) and (pointer: fine)` + `event.pointerType === 'mouse'` (precedent `magnetic-hover`, `spotlight`, `hero-emoji-burst`). Touch devices see the static name; no sticky-letter state. |
| No-reflow | Tile overlays letter box (`position: relative` span, absolute tile, reserved width); relative units only so 56px → 40px breakpoints, 320/390/768/1280px widths, and 520px column hold without CLS or horizontal scroll. |
| Accessibility | `h1` keeps single accessible name “Héctor Reyes”; tiles are `aria-hidden` / `alt=""` (or pure `background-image` so letter text remains the name); no `tabindex`/roles/buttons; text nodes preserved so copy (`Ctrl+C`) and selection still yield the name. |
| Test guardrails | Must keep `navigation-semantics.test.ts` green (exactly one `h1`, text exactly `Héctor Reyes` after tag-stripping → space node mandatory, no sr-only text inside `h1`); `portfolio-consistency.test.ts` (no `font-size` on `.hero__section-title`); `ssr-safety`; `complexity-contracts` pattern for the new initializer. |

## Risks

- **Space-node loss** — splitting into spans can collapse “Héctor Reyes” to “HéctorReyes” under the tag-stripping extractor → breaks `navigation-semantics`. Mitigation: explicit space text node + test run in apply.
- **Sticky letter on touch** — `:hover`-only CSS leaves the tile stuck after tap. Mitigation: media + `pointerType` gates (effect off on touch).
- **Reduced-motion violation** — custom delay/transition could bypass the global `.01ms` neutralization. Mitigation: disable path under reduce (default), verify in browser.
- **Kerning / line-break shift** — inline spans can perturb kerning and tracking (`-0.035em` / `-0.03em`) or widen the 520px column. Mitigation: relative units, same-box overlay, visual check at 320/390/768/1280px + zoom.
- **Review budget (400 lines)** — 22 tile definitions + CSS + JS + tests may approach the limit. Mitigation: `ask-on-risk` applies — pause and ask about chained delivery rather than inventing a chain or claiming an exception.
- **Reference unverified** — 403 means timing/easing fidelity is to the written description only, not pixel-matched. Stated explicitly so review does not assume visual parity.

## Rollback

- Revert the `Hero.astro` span split + initializer import + `hero.css` block + new `src/lib/core/` module (single coherent revert; no data migration, no content change).
- Fallback state is today's plain-text `h1`; no leftover assets because tiles reuse tokens (no binary assets added).
- Verify rollback with `pnpm agent:test` + one desktop hover pass confirming a static name.

## Success criteria

- [ ] Hovering a letter shows one of its 2 tiles at random; repeated hovers on the same letter can show either variant.
- [ ] Pointer leave restores the letter after a short intentional (non-instant) delay using an existing token duration.
- [ ] No layout shift, no horizontal overflow, name scale intact at 56px / 40px across 320/390/768/1280px.
- [ ] `h1` outline intact: exactly one `h1`, accessible/copy text exactly “Héctor Reyes”.
- [ ] Reduced-motion: effect off (or decided alternative), no perceptible delay.
- [ ] Touch (390/320px, `hover: none`): static name, no stuck tile.
- [ ] Tiles use only system colors; swap contract for real images documented; no eager 22-asset load.
- [ ] `pnpm agent:test` green + browser evidence (desktop enter/leave/delay/both variants, touch, reduced motion, breakpoints).

## Open product questions

1. Reduce-motion: disable entirely (recommended, consistent with `hero-emoji-burst`) or keep an instant static swap with no animation and no delay?
2. Restore delay: confirm reuse of `release 180ms` — or is `feedback 150ms` the preferred feel?
3. Touch: confirm fully off on `(hover: none)` — or is a tap-with-timed-restore variant desired despite the stuck-letter risk?
4. Real images: are colored tiles acceptable as the standing visual, with user-supplied images arriving later under the documented `public/` convention — and if so, who supplies them and when?
5. Delivery: if apply approaches the 400-line budget, prefer a chained follow-up (tiles → JS → polish) or a single PR held under the limit?

## Next step

After human approval of this proposal, author `specs.md` (SHALL/MUST + verifiable scenarios) and a brief `design.md` (files, contracts, tokens), then `tasks.md` closing with `pnpm agent:test` and the browser-evidence matrix above.
