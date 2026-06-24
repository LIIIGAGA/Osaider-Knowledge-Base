# MODULE_DATABASE

Version: Phase 1
Project: Osaider
Engine: Unreal Engine 5.6
Purpose: AI-readable database of current and planned story modules

---

# 1. MODULE SYSTEM OVERVIEW

Osaider uses a modular storylet structure.

A module is a self-contained gameplay and narrative space.

Each module may contain:

* Environmental storytelling
* Mechanical interaction
* Item reward
* Camera spline
* Faction implication
* Narrative clue
* Optional dialogue
* Optional audio
* Optional VFX

Modules are connected through the Dice Check and Module Reveal System.

---

# 2. MODULE REVEAL PHILOSOPHY

Modules are not spawned dynamically during gameplay.

Instead, future modules are pre-placed in the level.

At BeginPlay, they are:

* Hidden
* Collision disabled

When selected by the Module Reveal System, they are:

* Unhidden
* Collision enabled
* Registered as revealed

This approach is used because it is easier to debug and more stable for a visually complex architecture game.

---

# 3. MODULE TAGGING SYSTEM

The current module reveal system relies on actor tags.

Current examples:

`Spawn_Archivist_Phase1`

`Spawn_Whalemen_Phase1`

Recommended future pattern:

`Spawn_[Faction]_[Phase]`

Examples:

* `Spawn_Archivist_Phase1`
* `Spawn_Archivist_Phase2`
* `Spawn_Whalemen_Phase1`
* `Spawn_Whalemen_Phase2`
* `Spawn_Neutral_Phase1`

---

# 4. MODULE DATA TEMPLATE

Use this template when designing a new module.

## Module Name

Internal Blueprint Name:

Display Name:

Faction:

Phase:

Tags:

Status:

Purpose:

---

## Narrative Function

What does this module reveal about the world?

---

## Gameplay Function

What does the player do in this module?

---

## Main Interaction

Interaction type:

* Click
* Drag
* Wheel
* Slider
* Locker
* Camera inspection
* Dialogue
* Dice-related
* Submission-related

---

## Item Reward

Item name:

Ideology value:

Faction implication:

---

## Required Blueprints

List required actors, components, widgets, or interfaces.

---

## AI Notes

Special instructions for future AI assistance.

---

# 5. IMPLEMENTED MODULES

---

# 5.1 BP_Module_NEW_Archivist_01

## Basic Info

Internal Blueprint Name:

`BP_Module_NEW_Archivist_01`

Faction:

Archivist

Phase:

Phase 1

Likely Tag:

`Spawn_Archivist_Phase1`

Status:

Implemented / In Progress

---

## Narrative Function

This module represents the mechanical and bureaucratic side of the Archivist system.

It should feel like a machine that processes, adjusts, or stabilizes official truth.

The player interacts with wheels and gears, reinforcing the idea that history is mechanically operated.

---

## Gameplay Function

The player manipulates two wheels.

The wheels drive linked mechanical components such as gears and slider.

This creates a physical puzzle interaction.

---

## Main Mechanics

Known components:

* `WheelA`
* `WheelB`
* `GearPivotA`
* `GearPivotB`
* Slider linkage
* `DragPlaneA`
* `DragPlaneB`

Interaction type:

Rotational drag.

---

## Drag Logic

Expected function chain:

`StartDrag`

↓

Identify active wheel by tag

↓

Store initial cursor angle

↓

`UpdateDrag`

↓

Calculate current cursor angle with `atan2`

↓

Calculate angle delta

↓

Correct angle wraparound

↓

Call `ApplyMechanismRotation`

↓

Update wheel, gear, and slider movement

↓

`EndDrag`

---

## Interface Usage

Uses:

`BPI_DragItem`

Functions:

* `StartDrag`
* `UpdateDrag`
* `EndDrag`

May also use:

`BPI_CameraModule`

If module has a local camera spline.

---

## Technical Notes

Wheel identification may be based on tags such as:

* `WheelA`
* `WheelB`

Drag input may be received through drag planes:

* `DragPlaneA`
* `DragPlaneB`

The module should keep local mechanical logic inside itself.

Do not move wheel-specific logic into PlayerController.

---

## AI Notes

When helping with this module:

1. Keep wheel logic modular.
2. Do not create a new base module class.
3. Use existing `BPI_DragItem`.
4. Keep PlayerController responsible only for input routing.
5. Store wheel-specific multipliers inside the module.
6. Keep gear and slider transform updates inside `ApplyMechanismRotation`.

---

# 5.2 BP_Module_NEW_Archivist_02

## Basic Info

Internal Blueprint Name:

`BP_Module_NEW_Archivist_02`

Faction:

Archivist

Phase:

Phase 1

Likely Tag:

`Spawn_Archivist_Phase1`

Status:

Implemented / In Progress

---

## Narrative Function

This module appears to connect bureaucratic machinery with personal identity or stored information.

It includes a locker or hidden container, suggesting that official systems conceal personal records.

The item reward currently associated with this module includes:

`Employee ID Card No.709`

---

## Gameplay Function

The player manipulates a wheel.

The wheel drives movement of a base or locker mechanism.

This module combines rotational input with linear translation.

---

## Main Mechanics

Known components:

* Wheel
* `Base_1`
* Locker
* Linear movement system

Interaction type:

* Wheel drag
* Axis-based drag
* Item popup

---

## Mechanical Logic

Wheel rotation drives translation of:

`Base_1`

Likely movement axis:

X axis

Direction may be inverted using a multiplier.

Movement distance may be controlled with:

`MoveDistance`

---

## BPAC_ZoomDragItem Usage

This module may use:

`BPAC_ZoomDragItem`

For:

* Locker movement
* Pulling object
* Dragging item
* Opening hidden compartment

---

## Item Reward

Known item:

`Employee ID Card No.709`

Potential narrative meaning:

* Worker identity
* Bureaucratic record
* Evidence of citizen/soldier dual identity
* Link between personhood and archive

Potential ideology value:

To be balanced.

---

## AI Notes

When helping with this module:

1. Use `BPAC_ZoomDragItem` for linear drag when possible.
2. Keep wheel-to-translation logic inside module Blueprint.
3. Use multipliers to invert direction instead of duplicating logic.
4. Keep reward popup separate from drag state.
5. If UI popup blocks drag, pause drag while popup is open.
6. Do not move locker logic into PlayerController.

---

# 6. PLANNED MODULE CATEGORIES

---

# 6.1 Archivist Modules

Archivist modules should emphasize:

* Records
* Red light
* Official documents
* Mechanical bureaucracy
* Monumental symmetry
* Controlled movement
* Procedural rituals
* Stamps, seals, files, ledgers
* Official memory production

Gameplay mechanics may include:

* Filing
* Sorting
* Stamping
* Rotating archive devices
* Revealing redacted text
* Aligning historical records
* Connecting bureaucratic machines

Possible item rewards:

* Redacted Medical Records
* Official Access Document
* Sanatorium Voucher
* Employee ID Card
* Archive Seal
* Historical Correction Notice

---

# 6.2 Whalemen Modules

Whalemen modules should emphasize:

* Blue light
* Water
* Rust
* Pipes
* Hidden passages
* Scratched messages
* Submerged memory
* Audio fragments
* Improvised tools
* Resistance traces

Gameplay mechanics may include:

* Tuning signals
* Following sound
* Unlocking hidden compartments
* Revealing erased messages
* Restoring memory fragments
* Connecting pipes or currents
* Reading unofficial testimonies

Possible item rewards:

* Memory Fragment
* Recruitment Letter
* Smuggled Audio Tape
* Whale Bone Token
* Rusted Worker Badge
* Hidden Map Fragment

---

# 6.3 Neutral or Ambiguous Modules

Neutral modules should avoid clearly supporting either faction.

They should create ambiguity.

Possible themes:

* Daily routine
* Food distribution
* Factory dormitory
* Sanatorium
* Public ceremony
* Training room
* Children’s education
* Ocean observation deck

These modules may provide items with mild ideology values or mixed implications.

---

# 7. CURRENT STORYLET FLOW

Current Phase 1 intended flow:

Initial modules visible

↓

Player explores and collects items

↓

Player submits three items

↓

Dice Check performed

↓

Result determines next faction pool

↓

One Archivist or Whalemen module is revealed

↓

Player continues exploration

---

# 8. INITIAL MODULES

The project currently begins with three initial modules visible.

These serve as the first exploration set.

Their purpose:

* Teach interaction
* Introduce inventory
* Provide first items
* Prepare for first Dice Check

Future documentation should list these initial modules explicitly once finalized.

---

# 9. MODULE DESIGN RULES

## Rule 1

Each module should be self-contained.

The module should not require heavy changes to PlayerController.

---

## Rule 2

Each module should expose only necessary references.

Use interfaces to communicate with other systems.

---

## Rule 3

Each module should have a clear faction implication.

Even if ambiguous, the module should still contribute to the ideological structure.

---

## Rule 4

Each module should provide at least one of the following:

* Item reward
* Narrative reveal
* Mechanical puzzle
* Faction clue
* Environmental storytelling detail

---

## Rule 5

Each module should be reusable in the storylet structure.

Avoid making modules depend too heavily on one exact previous module unless it is a major story moment.

---

## Rule 6

Each module should support AI-readable documentation.

Every new module should eventually be added to this database.

---

# 10. MODULE CREATION CHECKLIST

When creating a new module:

1. Create Blueprint Actor.
2. Name using `BP_Module_NEW_[Faction]_[Number]`.
3. Add module meshes.
4. Add interaction points.
5. Add camera spline if needed.
6. Implement `BPI_CameraModule` if needed.
7. Add draggable actors or components if needed.
8. Use `BPI_DragItem` for drag interactions.
9. Add item reward if needed.
10. Add faction and phase tag.
11. Hide module at BeginPlay if it is not initially visible.
12. Disable collision at BeginPlay if hidden.
13. Test reveal through Dice Check.
14. Add module entry to this document.

---

# 11. FUTURE MODULE IDEAS

## Whalemen Recruitment Chamber

Faction:

Whalemen

Visual direction:

Blue, hidden, underwater, improvised.

Gameplay:

Player reveals a hidden message by moving mechanical panels or tuning sound.

Item:

Whalemen Recruitment Letter

---

## Archivist Record Correction Room

Faction:

Archivist

Visual direction:

Red, archive, official machine.

Gameplay:

Player rotates wheels to align document fragments.

Item:

Historical Correction Notice

---

## Sanatorium Treatment Room

Faction:

Ambiguous

Visual direction:

Clinical, bureaucratic, unsettling.

Gameplay:

Player inspects medical devices and redacted records.

Items:

* Sanatorium Suit
* Electro-sleep Helmet
* Redacted Medical Records

---

## Undersea Steelworks Shaft

Faction:

Whalemen or ambiguous

Visual direction:

Industrial, blue, deep ocean, molten metal.

Gameplay:

Player follows weapon fragments through recycling system.

Item:

Weapon Fragment

---

## Citizen Meal Distribution Station

Faction:

Neutral / Archivist

Visual direction:

Factory canteen, ration system.

Gameplay:

Player unlocks meal system or reads ration rules.

Items:

* Basic Meal Set
* Long-Life Canned Food

---

# 12. AI NOTES FOR MODULE GENERATION

When AI proposes a new module, always include:

* Internal Blueprint name
* Faction
* Phase
* Actor tag
* Visual direction
* Narrative function
* Gameplay mechanic
* Required Blueprints or interfaces
* Item reward
* Ideology value suggestion
* Integration notes

AI should avoid generic puzzle ideas.

Every module should reinforce at least one Osaider core theme:

* Constructed history
* Memory
* Bureaucracy
* Endless production
* Citizen/soldier identity
* Palace as machine
* War as possible fiction
