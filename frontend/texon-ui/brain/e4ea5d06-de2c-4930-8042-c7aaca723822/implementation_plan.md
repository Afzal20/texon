# Global Spacing and Padding Standardization

## Background

The application currently suffers from inconsistent card padding, vertical rhythm, and overflowing decorative elements. We need to standardize our spacing tokens to follow a unified scale (e.g., a 4px/8px-based scale like `1.5rem` / `24px` for cards) and remove ad-hoc inline overrides.

## User Review Required

> [!IMPORTANT]  
> Please review the proposed spacing token values and the strategy for standardizing card paddings.
> - Proposed base card padding (`--card-padding`): `1.5rem` (24px).
> - Proposed gap between major page sections: `space-y-6` (24px) standard.
> - Removing inline overrides like `p-4`, `p-6`, `pb-2` from `CardHeader` and `CardContent` globally. If certain cards specifically need `p-0` (like edge-to-edge tables), they will use a specific modifier (e.g. `px-0` or a utility) but keeping them minimal.

## Proposed Changes

### Spacing Tokens (`components/ui/card.tsx`)

- Redefine `--card-spacing` to a consistent `1.5rem` (24px) for desktop and `1rem` (16px) for mobile if needed, or simply a flat `1.5rem` default. (Currently it is `1.25rem`).
- Update the `Card` flex layout to ensure internal paddings (Header, Content, Footer) are consistently spaced. Currently, `Card` uses `py-(--card-spacing)` and `gap-(--card-spacing)`, and inner elements use `px-(--card-spacing)`. This is a solid approach, but inline classes across the app break it.

### Dashboard (`app/page.tsx`)

- **Fix Issue 1 (Overflowing Element):** The "Delay Risk" card has an absolute positioned graphic. We will reposition it to `right-4 top-4` (or similar) or apply the `overflow-hidden` correctly to ensure it respects the card's boundary without ugly clipping.
- **Fix Issue 2 & 4 (Padding inconsistencies):** Remove inline `pb-2`, `pb-0`, and `pt-2` from `CardHeader` and `CardContent`.
- **Fix Issue 3 (Vertical Rhythm):** Ensure the gap between the KPI row and the charts row is `gap-6` or `gap-8`.

### Performance (`app/performance/page.tsx`)

- Remove inline `pb-2`, `p-4`, `p-3`, `p-6` from `CardHeader` and `CardContent` across all cards.
- Exception: The "Line-wise Efficiency Table" card needs `p-0` on `CardContent` so the table hits the edges. This will be preserved as a deliberate exception.

### Compliance (`app/compliance/page.tsx`)

- Remove inline padding Overrides (`pb-2`, `pb-4`, `p-6`) on all cards.
- Exception: The "AI Docu-Track" table needs `p-0` on `CardContent`.

### Global Audit

- Scan all other pages (e.g. Inventory, HR, Modules, Security, etc.) for `CardHeader` and `CardContent` inline padding classes and remove them, replacing them with the standard `Card` gap/padding system.

## Verification Plan

- Run a global regex search to verify no unauthorized `p-*`, `px-*`, `py-*` classes remain on `CardHeader` or `CardContent` (except for intentional `p-0` on tables).
- Verify UI visually through Next.js dev server rendering.
