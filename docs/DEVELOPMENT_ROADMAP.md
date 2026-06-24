# DEVELOPMENT_ROADMAP

Version: Phase 1
Project: Osaider
Engine: Unreal Engine 5.6
Purpose: AI-readable development roadmap for Osaider

---

# 1. CURRENT DEVELOPMENT STAGE

Osaider is currently in:

`Phase 1 Vertical Slice`

The current goal is not to complete the entire game.

The current goal is to build one complete and convincing gameplay cycle that proves the core structure works.

A complete Phase 1 cycle should include:

1. Player explores initial modules.
2. Player interacts with environmental mechanisms.
3. Player obtains multiple items.
4. Player opens inventory.
5. Player submits three items.
6. Player performs Dice Check.
7. Dice Check result determines faction direction.
8. One new Archivist or Whalemen module is revealed.
9. Player understands that their collected items affect progression.

---

# 2. CORE DEVELOPMENT GOAL

The main development goal is:

Build a reusable modular narrative system that can support future expansion.

This means Phase 1 should prioritize:

* System clarity
* Blueprint stability
* Reusable interaction logic
* One complete playable loop
* Strong visual and narrative identity
* Clear AI-readable documentation

Do not over-expand content before the core loop is stable.

---

# 3. CURRENTLY IMPLEMENTED OR PARTIALLY IMPLEMENTED SYSTEMS

## 3.1 Camera System

Status:

`Implemented / In Progress`

Main Blueprint:

`BP_NoCharacterPlayerController`

Current features:

* Active gameplay camera
* Default camera transform
* Smooth camera transition
* Module spline camera movement
* RMB camera navigation
* Global structure rotation using Space Bar

Needs polish:

* Better transition feedback
* More stable spline activation timing
* Optional camera reset logic
* Visual indication when module camera mode is active

---

## 3.2 Interaction System

Status:

`Implemented / In Progress`

Main Blueprint:

`BP_InteractionPoint`

Current features:

* HoverTrace detection
* Interaction hint
* LMB click interaction
* Owning module reference
* Module reveal / camera activation flow

Needs polish:

* Clearer hover feedback
* Better interaction prompt UI
* Safer handling after interaction point is used
* More consistent collision setup

---

## 3.3 Drag Mechanism System

Status:

`Implemented / In Progress`

Main Interface:

`BPI_ModuleInteractable`

Current features:

* StartDrag
* UpdateDrag
* EndDrag
* Wheel rotation
* Gear linkage
* Slider movement
* Axis-based dragging through reusable component

Needs polish:

* More visual feedback during drag
* Sound feedback for wheels
* Better drag state reset when UI opens
* Clearer debugging prints for drag target selection

---

## 3.4 BPAC_ZoomDragItem

Status:

`Implemented / In Progress`

Purpose:

Reusable Actor Component for linear dragging.

Current features:

* Axis-based movement
* Distance limits
* Drag start / update / end events
* Possible item popup integration

Needs polish:

* Better item reward trigger rules
* More reliable pause when popup opens
* Clearer component documentation
* Testing across multiple module types

---

## 3.5 Inventory System

Status:

`Implemented / In Progress`

Main UI:

`WBP_InventoryPanel`

Current features:

* Item storage
* Inventory display
* Item name / icon / description
* Ideology value stored in item data

Needs polish:

* UI visual style
* Item selection feedback
* Clearer inventory refresh logic
* Better item popup integration

---

## 3.6 Submission System

Status:

`Implemented / In Progress`

Main UI:

`WBP_SubmissionPanel`

Current features:

* Three submission slots
* SubmittedItems array
* Slot fill validation
* `AreAllSlotsFilled`

Needs polish:

* Prevent duplicate item submission if not intended
* Clear slot UI after Dice Check
* More obvious “ready for Dice Check” state
* Better empty slot handling

---

## 3.7 Dice Check System

Status:

`Implemented / In Progress`

Main Blueprint:

`BP_CoreDevice`

Current formula:

`FinalScore = 2D6 + TotalIdeologyValue`

Current threshold:

`7`

Current result logic:

`FinalScore >= 7`

Archivist route.

`FinalScore < 7`

Whalemen route.

Needs polish:

* Dice visual feedback
* Audio feedback
* UI result display
* Better debug output
* Balance item ideology values
* Decide whether route-breaking items override Dice Check

---

## 3.8 Module Reveal System

Status:

`Implemented / In Progress`

Main Blueprint:

`BP_CoreDevice`

Current approach:

Pre-place future modules in level.

At BeginPlay:

* Hide future modules
* Disable collision

When selected:

* Unhide selected module
* Enable collision

Current tags:

* `Spawn_Archivist_Phase1`
* `Spawn_Whalemen_Phase1`

Needs polish:

* Confirm all hidden modules disable collision correctly
* Avoid selecting already revealed modules
* Add visual reveal effect
* Add audio reveal effect
* Add debug display for selected module name

---

## 3.9 Dialogue System

Status:

`Optional / Reworked`

Earlier UI:

`WBP_RightMessagePanel`

Earlier data structures:

* `S_InteractionPointData`
* `S_DialogueNode`
* `S_DialogueOptionData`

Current direction:

Dialogue is optional.

Major item acquisition is moving toward direct environmental interaction and item popup.

Needs decision:

* Whether to keep branching dialogue in Phase 1
* Whether dialogue should remain as secondary system
* Whether voice audio should be used only for important fragments

---

## 3.10 Flashlight System

Status:

`Implemented / Experimental`

Input:

`L`

Current implementation:

Mouse-following flashlight using Deferred Decal material.

Needs polish:

* Visual style
* Performance check
* Better toggle feedback
* Decide whether flashlight is core mechanic or atmosphere tool

---

# 4. CURRENT MODULE STATUS

## 4.1 Initial Modules

Status:

`To Confirm`

Current design:

Three initial modules are visible at the start.

Purpose:

* Introduce exploration
* Teach interaction
* Provide first items
* Prepare for first Dice Check

Needs work:

* Define exact three initial modules
* Define item rewards
* Confirm interaction order
* Confirm visual composition

---

## 4.2 BP_Module_NEW_Archivist_01

Status:

`Implemented / In Progress`

Faction:

Archivist

Known mechanics:

* WheelA
* WheelB
* GearPivotA
* GearPivotB
* Slider linkage
* DragPlaneA
* DragPlaneB

Needs polish:

* Confirm final item reward
* Add visual feedback for successful mechanism state
* Add audio for wheel movement
* Add module-specific documentation screenshots
* Confirm integration with Dice Check module reveal

---

## 4.3 BP_Module_NEW_Archivist_02

Status:

`Implemented / In Progress`

Faction:

Archivist

Known mechanics:

* Wheel
* Base_1 translation
* Locker
* Possible `BPAC_ZoomDragItem`

Known item:

`Employee ID Card No.709`

Needs polish:

* Confirm locker open condition
* Confirm item popup flow
* Confirm drag pause when popup opens
* Add sound feedback
* Add visual highlight for obtained item

---

## 4.4 Whalemen Phase 1 Modules

Status:

`In Progress — Placed in Level, Mechanics Pending`

Modules:

* `BP_Module_Whalemen_01`
* `BP_Module_Whalemen_02`
* `BP_Module_Whalemen_03`

All three exist and are placed in the level,
referenced in Prototype_03, Prototype_04, Prototype_06, and Prototype_06_2.

Design question (unresolved):

How should Whalemen module interaction differ from Archivist modules?
The distinction needs to reflect narrative alignment — Archivist and Whalemen
represent opposing relationships to memory and official record.
This design decision is pending and will affect mechanics, pacing, and item rewards.

Note: These modules use `BP_Module_Whalemen_XX` naming without the `_NEW_` prefix,
unlike Archivist modules. This is a naming inconsistency but does not affect functionality.

---

# 5. PHASE 1 PRIORITIES

## Priority 1: Complete Core Loop

Goal:

Make sure the player can complete the full loop from exploration to module reveal.

Checklist:

* Player can click initial module.
* Camera transitions correctly.
* Player can interact with mechanism.
* Player can obtain item.
* Item appears in inventory.
* Player can submit item.
* Player can fill three slots.
* Player can press Enter to trigger Dice Check.
* Dice Check calculates score correctly.
* Correct faction result is selected.
* One module is revealed.
* Revealed module has collision enabled.
* Previously hidden module becomes playable.

---

## Priority 2: Design and Complete Whalemen Content

Status:

`In Progress — Modules placed in level, core design unresolved.`

Whalemen_01~03 have been created and placed in the level.
However, the full gameplay experience for this route is not yet defined.

Key open question:

How should the Whalemen interaction mechanic differ from the Archivist route?
This distinction must be grounded in narrative — the two factions represent
opposing approaches to knowledge and memory.

Remaining tasks:

* Define Whalemen interaction mechanic (distinct from Archivist approach).
* Align mechanic design with narrative identity of the Whalemen faction.
* Add blue visual identity across Whalemen modules.
* Define and add Whalemen item reward.
* Add Whalemen item to Item Database.
* Test Whalemen reveal through Dice Check.

---

## Priority 3: Polish Item Feedback

Goal:

Make item acquisition feel meaningful.

Tasks:

* Add item popup UI.
* Display item name.
* Display item icon.
* Display short description.
* Add sound feedback.
* Add inventory update feedback.
* Prevent drag conflict when popup opens.

---

## Priority 4: Polish Dice Check Feedback

Goal:

Make the Dice Check legible to the player.

Tasks:

* Show dice roll result.
* Show submitted item contribution indirectly or directly.
* Show final result.
* Show faction outcome visually.
* Use red for Archivist.
* Use blue for Whalemen.
* Add audio cue.
* Add short delay before module reveal.

---

## Priority 5: Document Blueprint Systems

Goal:

Make the project easier for AI and future development.

Tasks:

* Add screenshots of each major Blueprint.
* Link screenshots in documentation.
* Add function descriptions.
* Add variable descriptions.
* Add known bugs.
* Add test procedures.

---

# 6. RECOMMENDED DEVELOPMENT ORDER

Recommended next steps:

1. Confirm current initial modules.
2. Confirm current item list.
3. Finalize `BP_CoreDevice.BeginCheck`.
4. Finalize `RevealModuleGroup`.
5. Add or finish one Whalemen module.
6. Test both Archivist and Whalemen reveal outcomes.
7. Improve item popup.
8. Improve Dice Check feedback.
9. Add screenshots to GitHub.
10. Update documentation after each major change.

---

# 7. TESTING CHECKLIST

## 7.1 Camera Test

* Does default camera initialize correctly?
* Does module camera transition start correctly?
* Does transition finish smoothly?
* Does RMB spline movement work?
* Does Space rotation still work after module interaction?
* Does camera return to default if needed?

---

## 7.2 Interaction Test

* Does HoverTrace detect interaction point?
* Does hint display correctly?
* Does LMB click call `StartInteraction`?
* Does `RevealEnvironment` run?
* Does ClickCollision disable after use if intended?

---

## 7.3 Drag Test

* Does LMB start drag?
* Does target implement `BPI_ModuleInteractable`?
* Does `StartDrag` fire?
* Does `UpdateDrag` fire every Tick?
* Does `EndDrag` fire on release?
* Does drag state reset if popup opens?
* Does mechanism move in correct direction?
* Does movement clamp correctly?

---

## 7.4 Inventory Test

* Does item get added to inventory?
* Does item have valid name?
* Does item have valid icon?
* Does item have valid description?
* Does item have valid ideology value?
* Does inventory UI refresh?

---

## 7.5 Submission Test

* Can player add item to slot?
* Are all three slots detected?
* Does `AreAllSlotsFilled` return true correctly?
* Does UI prevent invalid empty submission?
* Are slots cleared after Dice Check?

---

## 7.6 Dice Check Test

* Does Enter trigger Dice Check only when ready?
* Does 2D6 roll generate valid value from 2 to 12?
* Is ideology sum correct?
* Is final score correct?
* Does threshold comparison work?
* Does result match expected faction?
* Does debug print show readable result?

---

## 7.7 Module Reveal Test

* Are future modules hidden at BeginPlay?
* Is collision disabled when hidden?
* Does correct tag search run?
* Are already revealed modules filtered?
* Is one module selected?
* Does selected module unhide?
* Is collision enabled?
* Can the player interact with the revealed module?

---

# 8. KNOWN TECHNICAL RISKS

## Risk 1: UI Blocking Drag

Problem:

Popup UI or inventory UI may block mouse input while drag is active.

Mitigation:

Pause or end drag when popup opens.

Ensure `bDragging` resets safely.

---

## Risk 2: Module Tag Mismatch

Problem:

Module reveal fails because actor tag is misspelled.

Mitigation:

Use consistent tag naming.

Print selected tag before search.

Recommended pattern:

`Spawn_[Faction]_[Phase]`

---

## Risk 3: Hidden Module Collision Still Active

Problem:

Hidden modules may still block traces or clicks.

Mitigation:

At BeginPlay, always disable collision on hidden modules.

When revealing, enable collision explicitly.

---

## Risk 4: CameraSplineRef Not Set

Problem:

RMB camera navigation fails.

Mitigation:

Check whether module implements `BPI_CameraModule`.

Print returned spline reference.

---

## Risk 5: PlayerController Becoming Too Large

Problem:

Too much module-specific logic gets added to PlayerController.

Mitigation:

Keep PlayerController generic.

Move local mechanism logic into module Blueprints or Actor Components.

---

## Risk 6: Dice Check Too Random or Too Controlled

Problem:

If ideology values are too small, player choices feel meaningless.

If ideology values are too large, randomness disappears.

Mitigation:

Balance most items around `-1`, `0`, and `+1`.

Use `-2`, `+2`, `-3`, `+3` only for important items.

---

# 9. FUTURE PHASES

## Phase 1

Goal:

Complete vertical slice.

Includes:

* One playable loop
* Initial modules
* Archivist branch
* Whalemen branch
* Inventory
* Submission
* Dice Check
* Module Reveal

---

## Phase 2

Goal:

Expand storylet variety.

Possible additions:

* More Archivist modules
* More Whalemen modules
* More ambiguous modules
* More item types
* Better UI
* More audio logs
* First save system

---

## Phase 3

Goal:

Develop faction progression.

Possible additions:

* Faction alignment tracking
* Route-breaking items
* More explicit Archivist / Whalemen consequences
* Multiple endings or loop breaks

---

## Phase 4

Goal:

Polish for public demo.

Possible additions:

* Visual polish
* Performance optimization
* Audio pass
* Full tutorialization
* Better onboarding
* Export build
* Website documentation
* Trailer or gameplay video

---

# 10. AI DEVELOPMENT NOTES

When AI assists with roadmap planning:

1. Prioritize finishing the playable loop before expanding content.
2. Do not suggest large new systems before Phase 1 is stable.
3. Keep all new features compatible with the current Blueprint architecture.
4. Always mention which Blueprint should own new logic.
5. Always include testing steps for new mechanics.
6. Preserve the storylet-based structure.
7. Respect the distinction between Archivist and Whalemen.
8. Keep documentation updated after design changes.

---

# 11. IMMEDIATE NEXT TASK LIST

Current recommended immediate tasks:

1. Finish or confirm current three initial modules.
2. Confirm current item data structure.
3. Test item collection to inventory.
4. Test submission panel with three items.
5. Test Dice Check with debug values.
6. Test Archivist module reveal.
7. Define Whalemen interaction mechanic (distinct from Archivist).
8. Test Whalemen module reveal through Dice Check.
9. Add item popup polish.
10. Add Dice Check visual feedback.
11. Add Blueprint screenshots to repository.
12. Update documentation after testing.
