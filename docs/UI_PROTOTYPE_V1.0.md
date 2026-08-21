# OSAIDER UI PROTOTYPE V1.0

Reference: `docs/assets/osaider-ui-prototype-v1.0.png`

## Direction

V1.0 is derived directly from the current game screenshots. It uses a flat, abstract, low-poly interface language.

Core phrase:

> Floating signal frames inside a black theatrical void.

## Visual Rules

- Preserve the black background and saturated 3D world as the primary image.
- Build UI from flat translucent planes, thin lines, square nodes, brackets and cropped bars.
- Use no paper, corrosion, brass, bevels or physical material simulation.
- Use white for reading, red for official/action focus and cyan for discovered/interactive information.
- Sample magenta and green only as secondary scene-responsive accents.
- Keep corners square and geometry deliberately fragmented.

## Layout Changes

### Narrative Rail

- Reduce the width of the existing left panel.
- Use `#101012` at approximately 82–88% opacity.
- Split long narrative text into short readable blocks.
- Keep one compact action button close to the final paragraph.
- Use thin red corner brackets instead of a full heavy border.

### Inventory Ribbon

- Replace white item cards with dark translucent tiles.
- Preserve the current red, blue and white line-art icons.
- Use an outline and a small lower label rather than a large card background.
- Selected official item: red outline.
- Selected memory item: cyan outline.

### Submission Slots

- Keep three vertical slots on the right.
- Reduce them to thin geometric frames with a central plus mark.
- Filled slots inherit the submitted item's red, cyan or neutral-white signal colour.
- Connect all three slots with a short animated line when submission becomes available.

### Item Found

- Use a small cyan bracketed notification at the lower right.
- Show icon, `ITEM FOUND` and item name only.
- Avoid a large opaque rectangle across the scene.

### Dice Check

- Represent opposing values as red and cyan diamonds.
- Display the resolved state in a thin horizontal result frame.
- Use no physical dice or realistic effects.

## Cursor Set

The cursor is derived from a split diamond surrounded by four incomplete directional brackets.

- Default: white split diamond
- Interact: cyan diamond with expanded brackets
- Inspect: red diamond with four small focus ticks
- Drag: doubled white diamond
- Rotate: cyan segmented angular ring
- Click: compressed red point inside a small diamond

Recommended size is 32 px by default and 40–48 px for interaction states.

## Motion

- Panels appear as two offset layers snapping into alignment.
- Hover brackets expand 3–5 px over 100 ms.
- Selection outlines draw clockwise in 140 ms.
- Item-found notification enters from the right, holds, then collapses into a cyan node.
- Cursor click compresses for 60 ms and returns in 80 ms.
- Avoid bounce, paper movement and physically realistic inertia.

## UMG Components

- `WBP_SignalFrame`
- `WBP_NarrativeRail`
- `WBP_ChoiceButton`
- `WBP_ItemTile`
- `WBP_InventoryRibbon`
- `WBP_SubmissionSlot`
- `WBP_ItemFoundToast`
- `WBP_DiceSignal`
- `WBP_OsaiderCursor`
