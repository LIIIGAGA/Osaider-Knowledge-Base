# AI_INSTRUCTIONS

Version: Phase 1
Project: Osaider
Engine: Unreal Engine 5.6
Purpose: Instructions for AI assistants working on Osaider

---

# 1. READ THIS FIRST

This file defines how AI assistants should understand and assist with the Osaider project.

Osaider is not a generic puzzle game.

It is a narrative exploration game about:

* Constructed history
* Bureaucracy
* Memory
* Endless production
* Ideology
* Player agency

Any AI-generated design, code suggestion, Blueprint explanation, module idea, or documentation should preserve these themes.

---

# 2. DEVELOPMENT CONTEXT

The project is currently developed in:

`Unreal Engine 5.6`

Primary implementation mode:

`Blueprint`

The project should remain Blueprint-first unless the user explicitly asks for C++.

Current development stage:

`Phase 1 Vertical Slice`

Primary goal:

Complete one full playable storylet cycle.

---

# 3. CORE PROJECT RULES

## Rule 1: Prefer Blueprint Solutions

When suggesting implementation, assume Blueprint unless told otherwise.

Do not default to C++.

If C++ would be helpful, explain it as optional.

---

## Rule 2: Do Not Reintroduce BP_ModuleBase

Previous attempts to use a shared parent Blueprint such as:

`BP_ModuleBase`

caused instability.

Do not suggest reintroducing it unless the user explicitly asks.

Current architecture uses:

* Blueprint Interfaces
* Actor Components
* Actor Tags
* Local module logic

---

## Rule 3: Prefer Interfaces Over Hard Casting

Use Blueprint Interfaces whenever possible.

Current important interfaces:

`BPI_DragItem`

Functions:

* `StartDrag`
* `UpdateDrag`
* `EndDrag`

`BPI_CameraModule`

Function:

* `GetCameraSpline`

Avoid unnecessary Cast nodes to specific module classes.

---

## Rule 4: Keep PlayerController Generic

`BP_NoCharacterPlayerController` should handle:

* Input
* Hover detection
* Click routing
* Drag routing
* Camera control
* Flashlight toggle
* Global structure rotation

It should not contain module-specific puzzle logic.

Wheel, gear, slider, locker, and item reward logic should stay inside the relevant module Blueprint or reusable component.

---

## Rule 5: Keep Module Logic Local

Each module Blueprint should own its own local mechanisms.

Examples:

`BP_Module_NEW_Archivist_01`

should own:

* WheelA logic
* WheelB logic
* Gear linkage
* Slider linkage
* `ApplyMechanismRotation`

`BP_Module_NEW_Archivist_02`

should own:

* Wheel-to-Base_1 translation
* Locker movement
* Item reward logic

---

## Rule 6: Use HoverTrace

Current hover detection uses a custom trace channel:

`HoverTrace`

Do not suggest `OnBeginCursorOver` as the main method unless the user specifically asks.

`HoverTrace` is preferred because it is more controllable with UI and camera interactions.

---

## Rule 7: Module Reveal Is Not Runtime Spawn

Current module progression does not use runtime actor spawning.

Future modules are pre-placed in the level.

At BeginPlay:

* Hidden
* Collision disabled

When selected:

* Unhidden
* Collision enabled

Do not suggest replacing this with runtime spawning unless there is a strong reason.

---

## Rule 8: Respect Faction Colors

Archivist:

Red

Whalemen:

Blue

This color distinction is important and should remain consistent.

---

# 4. CORE BLUEPRINTS TO KNOW

## BP_NoCharacterPlayerController

Main input and camera controller.

Handles:

* HoverTrace
* LMB click interaction
* LMB drag routing
* RMB camera spline movement
* Space global rotation
* Enter Dice Check trigger
* L flashlight toggle

---

## BP_InteractionPoint

Environmental hotspot.

Handles:

* Hover hint
* Click interaction
* Owning module reference
* Module reveal
* Camera transition trigger

---

## BP_CoreDevice

Submission and Dice Check controller.

Handles:

* Submitted items
* Slot validation
* 2D6 roll
* Ideology sum
* Threshold comparison
* Module reveal by tag

---

## BP_CameraSplinePath

Global camera path and global structure rotation support.

---

## BPAC_ZoomDragItem

Reusable Actor Component for linear drag interactions.

Use this for:

* Lockers
* Drawers
* Sliding panels
* Pullable objects
* Axis-based item interactions

---

# 5. CORE SYSTEMS TO PRESERVE

## Camera System

Uses:

* Active gameplay camera
* Default camera transform
* Module camera splines
* RMB spline navigation
* Smooth transitions
* Global rotation

AI should not suggest a walking character controller unless the user asks.

---

## Interaction System

Uses:

* HoverTrace
* BP_InteractionPoint
* LMB input
* Interaction hints
* Module activation

---

## Drag System

Uses:

* `BPI_DragItem`
* `StartDrag`
* `UpdateDrag`
* `EndDrag`

Current mechanics include:

* Rotating wheels
* Gear transmission
* Sliders
* Lockers
* Linear drag components

---

## Inventory System

Stores collected items.

Each item should include:

* Name
* Icon
* Description
* Ideology Value

---

## Submission System

Player submits exactly three items.

The system checks:

`AreAllSlotsFilled`

before Dice Check.

---

## Dice Check System

Formula:

`FinalScore = 2D6 + TotalIdeologyValue`

Threshold:

`7`

Result:

`FinalScore >= 7`

Archivist route.

`FinalScore < 7`

Whalemen route.

---

## Module Reveal System

Uses actor tags.

Examples:

`Spawn_Archivist_Phase1`

`Spawn_Whalemen_Phase1`

Flow:

Dice result

↓

Determine faction

↓

Find actors with matching tag

↓

Filter already revealed modules

↓

Randomly choose one

↓

Unhide and enable collision

---

# 6. RESPONSE STYLE FOR AI ASSISTANTS

When explaining Blueprint logic to the user:

1. Use clear step-by-step flow.
2. Explain which Blueprint owns each part.
3. Mention important variables.
4. Avoid vague descriptions.
5. Provide both technical and design meaning when useful.
6. Use Chinese if the user asks in Chinese.
7. Use English technical terms where Unreal terms are clearer.
8. Do not overcomplicate beginner explanations.

---

# 7. WHEN PROPOSING A NEW MODULE

Always include:

* Module name
* Blueprint name
* Faction
* Phase
* Required tag
* Narrative function
* Gameplay mechanic
* Required interfaces
* Required components
* Item reward
* Ideology value suggestion
* Integration steps
* Testing checklist

Use this format:

```markdown
## Module Name

Blueprint:

Faction:

Phase:

Tag:

Narrative Purpose:

Gameplay Mechanic:

Item Reward:

Ideology Value:

Required Blueprints:

Integration Steps:

Testing Checklist:
```

---

# 8. WHEN PROPOSING A NEW ITEM

Always include:

* Item name
* Internal ID
* Faction implication
* Ideology value
* Source module
* Player-facing description
* Hidden meaning
* Dice Check role
* UI note

Use this format:

```markdown
## Item Name

Item ID:

Faction Implication:

Ideology Value:

Source Module:

Player Description:

Hidden Meaning:

Dice Check Role:

UI Note:
```

---

# 9. WHEN EXPLAINING A BLUEPRINT SCREENSHOT

When the user uploads a Blueprint screenshot:

1. Identify the function or event name if visible.
2. Explain the execution flow from left to right.
3. Explain what each major node group does.
4. Translate function names when helpful.
5. Connect the logic to the project system.
6. Mention possible issues or improvements.
7. Keep the explanation suitable for portfolio or interview use if requested.

---

# 10. WHEN WRITING TECHNICAL DOCUMENTATION

Use AI-readable Markdown.

Prefer:

* Clear headings
* Short sections
* Explicit variable names
* Explicit Blueprint names
* System workflows
* Implementation notes
* Design rules

Avoid:

* Overly poetic language
* Unclear metaphors
* Long paragraphs without structure
* Assuming missing implementation details as fact

If something is uncertain, label it as:

`To Confirm`

or

`Assumption`

---

# 11. WHEN HELPING WITH DEBUGGING

Debugging process should follow this order:

1. Identify which Blueprint owns the problem.
2. Identify input event.
3. Check references.
4. Check interface implementation.
5. Check collision and trace channel.
6. Check tags.
7. Check hidden/collision state.
8. Check arrays and stored variables.
9. Add Print String for state visibility.
10. Simplify to minimum reproducible Blueprint path.

Common Osaider debugging areas:

* HoverTrace not hitting
* UI blocking drag
* Interface message not firing
* Module tag mismatch
* Module already marked as spawned
* Collision still disabled after reveal
* CameraSplineRef not set
* Drag target not implementing `BPI_DragItem`
* Dice Check triggered before all slots filled
* SubmittedItems not cleared after check

---

# 12. WHEN HELPING WITH INTERVIEWS OR PORTFOLIO

If the user asks how to present the project:

Frame Osaider as:

* A modular Blueprint system
* A narrative systems design project
* A reusable interaction framework
* A storylet-based progression prototype
* A Technical Designer / Technical Artist portfolio piece

Important terms:

* Blueprint Interface
* Reusable Component
* Modular Interaction System
* Data-driven Narrative Logic
* Storylet Architecture
* Dice Check Progression
* Spline Camera System
* Environmental Interaction Framework

Avoid describing it only as “a game with puzzles.”

---

# 13. WORLD AND WRITING RULES

When generating narrative content:

1. Keep the war ambiguous.
2. Do not reveal too early whether Osaider exists.
3. Keep Archivist and Whalemen morally complex.
4. Use bureaucracy, archive, factory, ocean, memory, and ritual imagery.
5. Avoid generic fantasy tropes.
6. Prefer environmental storytelling.
7. Let objects imply history.
8. Keep tone mysterious, melancholic, and political.
9. Do not make factions purely good or evil.
10. Preserve the palace as both architecture and machine.

---

# 14. CURRENT KNOWN MODULES

## BP_Module_NEW_Archivist_01

Known mechanics:

* WheelA
* WheelB
* GearPivotA
* GearPivotB
* Slider linkage
* DragPlaneA
* DragPlaneB

Uses:

`BPI_DragItem`

Important local function:

`ApplyMechanismRotation`

---

## BP_Module_NEW_Archivist_02

Known mechanics:

* Wheel
* Base_1 translation
* Locker
* Possible `BPAC_ZoomDragItem`

Known item:

`Employee ID Card No.709`

---

# 15. CURRENT KNOWN ITEMS

Known or planned items:

* Sanatorium Suit
* Sanatorium Voucher
* Electro-sleep Helmet
* Sanatorium Plan
* Memory Fragment
* Employee ID Card No.709
* Basic Meal Set
* Long-Life Canned Food
* Redacted Medical Records
* Weapon Fragment
* Nuclear Weapon
* Whalemen Recruitment Letter
* Senior Official Access

---

# 16. FINAL INSTRUCTION

Before making major suggestions, read these files:

1. `docs/OSAIDER_CONTEXT.md`
2. `docs/WORLD_BUILDING.md`
3. `docs/GAMEPLAY_SYSTEMS.md`
4. `docs/BLUEPRINT_ARCHITECTURE.md`
5. `docs/MODULE_DATABASE.md`
6. `docs/ITEM_DATABASE.md`
7. `docs/AI_INSTRUCTIONS.md`

The goal is not just to make the game work.

The goal is to preserve the relationship between:

architecture, memory, bureaucracy, ideology, and player agency.
