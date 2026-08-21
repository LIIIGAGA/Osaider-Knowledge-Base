# OSAIDER COCKPIT UI PROTOTYPE V2.0

Reference: `docs/assets/osaider-cockpit-ui-prototype-v2.0.png`

## Core Perspective

The player observes the Osaider megastructure from inside a compact space vehicle. Cockpit equipment occupies the frame edges while the central observation window remains the primary visual area.

## Left Archive Monitor

Purpose: play recovered audio recordings left inside the structure.

Displayed information:

- Archive channel
- Record timecode
- Audio waveform
- Input level
- Typewriter transcript
- Play / pause state

Screen effects:

- Slow vertical brightness drift
- Thin rolling scan band
- Brief horizontal text displacement
- Single-frame red signal dropout
- Low-amplitude phosphor flicker

Effects must not reduce transcript readability. Provide a reduced-flicker accessibility option.

## Right Item Analyzer

The analyzer contains exactly three independent item slots.

Each slot has:

- Item icon
- Slot number
- Dedicated status lamp
- Signal trace leading toward the Analyze control

### Slot States

- Empty: icon area black, lamp off, trace dark
- Filled: icon visible, lamp steadily lit, trace illuminated
- Invalid: lamp flashes red twice, trace remains dark
- Removed: lamp fades out and trace retracts

## Analyze Control

The Analyze button has its own Ready lamp.

State logic:

1. `0 / 3` to `2 / 3`: button inactive; Ready lamp off.
2. `3 / 3`: button activates; Ready lamp pulses repeatedly.
3. Hover: button border brightens and cursor changes to Interact.
4. Press: Ready lamp holds; three slot traces pulse toward the button.
5. System automatically executes `2D6 + TotalIdeologyValue`.
6. Result feedback appears only after the roll completes.

The player does not manually roll physical dice.

## Ready Lamp Motion

- Pulse duration: 700–900 ms
- Bright phase: 25% of cycle
- Use a double-ring glow rather than a large bloom
- Reduced-motion mode: steady illuminated lamp

## Visual Boundary

- Preserve the colourful low-poly megastructure.
- Use simplified cockpit geometry rather than realistic military hardware.
- Avoid weapon controls, missile labels and faction propaganda.
- Peripheral instruments support atmosphere but must not compete with Archive or Analyze.

