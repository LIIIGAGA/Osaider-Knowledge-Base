# OSAIDER UI VISUAL SYSTEM

Version: Concept V1

Reference board: `docs/assets/osaider-ui-visual-system-v1.png`

---

## 1. Creative Direction

The interface should feel like a bureaucratic instrument that has survived above an endless ocean.

Core idea:

> A salt-corroded archive terminal used to inspect, classify, and rewrite reality.

The UI combines:

- Archival forms and registry numbers
- Maritime navigation instruments
- Oxidized brass and smoked glass
- Restrained institutional typography
- Red official marks and blue memory traces

Red and blue must communicate influence without becoming explicit faction-choice buttons. The player should feel ideological pressure before fully understanding it.

---

## 2. Colour System

### Foundation

- Deep Navy `#081118` — main background
- Slate `#1A232C` — panels and secondary surfaces
- Parchment `#D7D2C3` — documents and high-contrast text fields
- Oxidized Brass `#9A7A48` — outlines, focus and interactive highlights
- Iron `#4A4F55` — inactive controls and dividers

### Narrative Accents

- Wax Red `#7A1E1E` — Archivist influence, official seals, destructive confirmation
- Memory Blue `#1A4A68` — Whalemen influence, recovered memory, hidden information

### Usage Rule

Keep about 80% of each screen neutral. Brass communicates interaction; red and blue communicate narrative contamination or ideological influence.

---

## 3. Typography

Use two roles:

- **Archive Sans Condensed** — navigation, values, controls and registry labels
- **Archive Serif** — documents, item descriptions and recovered testimony

Recommended hierarchy:

- Screen title: 32–40 px, condensed, wide tracking
- Section title: 20–24 px
- Body: 16–18 px
- Metadata: 12–14 px, uppercase, wide tracking

Do not use distressed type for long text. Age should come from the surface treatment, not reduced readability.

---

## 4. Shape and Material Language

- One-pixel or two-pixel brass outlines
- Square panels with very small corner cuts
- Circular registry seals and instrument rings
- Thin rules, ticks and index marks
- Paper only for records, item cards and testimony
- Smoked glass for system-level overlays
- Wax seals for official confirmation or irreversible actions

Avoid ornamental steampunk decoration. Every mark should resemble a functional administrative or mechanical element.

---

## 5. Core Screens

### Exploration HUD

Keep the centre and upper-middle view clear. Display only current record ID, subtle orientation marks, memory/ideology traces, inventory count and submission readiness.

### Interaction Prompt

Anchor near the target or lower centre. Show input key, action verb and optional mechanism category. Use brass for available interaction and iron for unavailable interaction.

### Item Acquired

Present the item as a newly registered document. Include icon, name, registry ID and a short prompt to open inventory. Apply a red or blue mark only when narratively justified.

### Inventory

Use physical artifact cards in a precise filing grid. Selected cards lift slightly, brighten at the edge and reveal metadata. Do not expose raw ideology numbers to the player.

### Submission

Use three equal inspection slots. Empty slots show only registration marks. When all slots are filled, connect them with a faint brass circuit and activate the review action.

### Dice Check

Treat 2D6 as an administrative verdict, not a casino roll. Dice settle inside concentric record rings; the outcome appears like an approved or rejected classification.

### Document Reader

Use a two-column layout: record index on the left and physical document on the right. Hidden or recovered text may appear in memory blue, while official edits use wax red.

### Pause and Settings

Use the smoked-glass terminal language. Keep accessibility, subtitles, UI scale and colour assistance visible rather than hiding them in deeper menus.

---

## 6. Mouse Cursor System

The cursor is a broken circular registry seal with a central instrument needle.

Required states:

1. **Default** — small brass ring and needle
2. **Hover / Interactable** — outer ticks expand and glow
3. **Grab / Drag** — lower grip indicator appears; ring tightens while held
4. **Rotate Mechanism** — segmented circular arrow appears around the ring
5. **Click / Active** — centre contracts briefly; red is reserved for consequential actions
6. **UI Pointer** — simplified needle with a small secondary selection ring

Target sizes:

- Default: 32–40 px
- Interaction states: 48 px
- Rotate state: up to 64 px

Animations should last 80–180 ms. Avoid long cursor trails because precise wheel rotation and drag interactions depend on clear positional feedback.

---

## 7. Motion Rules

- Hover: outline brightens and expands by 2–4 px
- Click: fast inward compression, then return
- Panel open: fade plus 8–12 px mechanical slide
- Item acquired: registry stamp lands once, followed by a short paper settle
- Submission ready: three slots connect sequentially
- Dice result: rings rotate, dice settle, verdict stamps in

Motion should feel mechanical and procedural, never elastic or playful.

---

## 8. Unreal UMG Structure

Suggested reusable widgets:

- `WBP_UIFrame`
- `WBP_ArchiveButton`
- `WBP_InputPrompt`
- `WBP_ItemCard`
- `WBP_SubmissionSlot`
- `WBP_RecordEntry`
- `WBP_StatusSeal`
- `WBP_OsaiderCursor`

Keep cursor state selection and general hover routing in `BP_NoCharacterPlayerController`. Keep module-specific meaning inside the relevant module Blueprint or interface response.

---

## 9. Accessibility

- Never communicate red/blue states by colour alone; pair them with seal shape, line pattern or label.
- Maintain strong contrast on parchment and smoked-glass surfaces.
- Provide UI scale settings.
- Provide reduced motion and cursor-size options.
- Keep body text at least 16 px at the target resolution.

---

## 10. Production Order

1. Colour, type, spacing and reusable frame
2. Button, prompt and focus states
3. Cursor state set
4. Item card and item-acquired popup
5. Inventory and submission panels
6. Dice-check result
7. Document reader
8. Pause/settings and accessibility pass

