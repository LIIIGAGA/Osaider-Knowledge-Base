# GAMEPLAY_SYSTEMS

Version: Phase 1

Project: Osaider

Engine: Unreal Engine 5.6

---

# 1. SYSTEM OVERVIEW

Osaider uses a modular narrative gameplay structure.

The player explores one module at a time, interacts with mechanisms, obtains items, submits three items, performs a Dice Check, and reveals the next module according to the result.

Core gameplay loop:

Explore Module

↓

Interact With Mechanisms

↓

Collect Items

↓

Open Inventory

↓

Submit Three Items

↓

Perform Dice Check

↓

Reveal Next Module

↓

Continue Exploration

---

# 2. CORE SYSTEMS

Current major gameplay systems:

* Camera System
* Interaction System
* Drag Mechanism System
* Inventory System
* Submission System
* Dice Check System
* Module Reveal System
* Dialogue System
* Flashlight System
* Audio Feedback System

---

# 3. CAMERA SYSTEM

## 3.1 Purpose

The Camera System allows the player to explore the floating palace without controlling a walking character.

The game currently uses a no-character camera control style.

The player interacts with modules through mouse input, camera transitions, and spline-based camera movement.

---

## 3.2 Main Blueprint

Main Blueprint:

`BP_NoCharacterPlayerController`

Responsibilities:

* Store active gameplay camera
* Handle player input
* Detect hovered actors
* Trigger interactions
* Control camera transitions
* Enable module camera spline movement
* Handle RMB zoom navigation
* Handle global structure rotation
* Control flashlight decal

---

## 3.3 Important Variables

Important camera-related variables include:

`ActiveCamera`

The active gameplay camera.

Usually found by tag:

`GameplayCamera`

`DefaultCamTransform`

Stores the default camera transform.

Used when returning to the default view.

`CameraSplinePathRef`

Reference to the global camera spline path actor.

Usually:

`BP_CameraSplinePath`

`CameraSplineRef`

Reference to the current module spline.

This is provided by modules through `BPI_CameraModule`.

`CurrentSplineDistance`

Current distance along the spline.

`CameraMoveSpeed`

Controls movement speed along spline.

`bCameraSplineEnabled`

Whether module spline movement is currently enabled.

`bHoldingRMB`

Whether the player is holding right mouse button.

`bCameraTransitioning`

Whether the camera is currently interpolating between views.

`TransitionAlpha`

Progress value for camera transition.

`TransitionDuration`

Duration of camera transition.

`bEnableSplineAfterTransition`

Determines whether spline movement should be enabled after transition finishes.

---

## 3.4 Camera Transition Flow

Typical flow when interacting with a module:

Player clicks `BP_InteractionPoint`

↓

`StartInteraction`

↓

`RevealEnvironment`

↓

PlayerController receives module spline reference

↓

Camera transition begins

↓

Camera moves from default position to module-focused view

↓

RMB spline navigation becomes available

---

## 3.5 RMB Camera Navigation

When the player holds RMB:

* Camera movement along the module spline is enabled.
* Mouse input controls camera distance along spline.
* This allows local inspection of the active module.

RMB navigation is only active when:

* A valid `CameraSplineRef` exists.
* `bCameraSplineEnabled` is true.
* The camera is not currently transitioning.

---

## 3.6 Global Rotation

Input:

`Space Bar`

Function:

Rotates the global structure around its center.

Current behavior:

* Each press rotates the palace by approximately 180 degrees.
* Rotation is handled through `BP_CameraSplinePath`.
* Timeline interpolation is used for smooth transition.

Purpose:

* Allows the player to view the floating palace from another side.
* Supports the architectural object as a rotating spatial puzzle.
* Reinforces the idea of palace as a mechanical structure.

---

# 4. INTERACTION SYSTEM

## 4.1 Purpose

The Interaction System provides a reusable way for the player to click environmental hotspots.

It avoids placing too much logic directly inside the PlayerController.

---

## 4.2 Main Actor

Main Actor:

`BP_InteractionPoint`

Responsibilities:

* Represent interactable hotspot
* Store owning module reference
* Display hint on hover
* Trigger interaction on click
* Activate module camera
* Reveal environment
* Communicate with PlayerController

---

## 4.3 Hover Detection

Current approach:

Use custom trace channel:

`HoverTrace`

Avoid:

`OnBeginCursorOver`

Reason:

`HoverTrace` is more stable and easier to control, especially when UI widgets may block mouse events.

---

## 4.4 Main Workflow

Player moves mouse

↓

PlayerController performs HoverTrace

↓

Hovered actor is detected

↓

`CurrentHoveredActor` is updated

↓

Hint is displayed

↓

Player presses LMB

↓

`Click_Interaction` is called

↓

`BP_InteractionPoint.StartInteraction` runs

↓

`RevealEnvironment` activates module

---

## 4.5 InteractionPoint Variables

Important variables:

`OwningModuleRef`

Reference to the module actor that owns this interaction point.

`Hint Cache`

Stores text or data used for hover hint display.

`ClickCollision`

Collision component used for interaction detection.

After a module is revealed, this may be hidden or destroyed to avoid repeated triggering.

---

# 5. DRAG MECHANISM SYSTEM

## 5.1 Purpose

The Drag Mechanism System allows the player to physically manipulate environmental mechanisms.

Current supported interactions:

* Wheel rotation
* Gear rotation
* Slider movement
* Locker movement
* Axis-based dragging

The system is designed to be reusable across modules.

---

## 5.2 Main Interface

Interface:

`BPI_DragItem`

Functions:

* `StartDrag`
* `UpdateDrag`
* `EndDrag`

This interface is used instead of hard inheritance.

Reason:

Earlier attempts to use a shared `BP_ModuleBase` caused instability.

The current interface-based approach is more stable and modular.

---

## 5.3 PlayerController Drag Variables

Important variables:

`bDragging`

Whether the player is currently dragging something.

`CurrentDragTarget`

The actor currently receiving drag input.

`LastDragWorldLocation`

Previous drag position in world space.

These variables are used on Tick while LMB is held.

---

## 5.4 Drag Workflow

Player presses LMB on drag target

↓

PlayerController checks whether target implements `BPI_DragItem`

↓

`StartDrag` is called

↓

While LMB is held:

`UpdateDrag` is called every Tick

↓

Mechanism updates rotation or translation

↓

Player releases LMB

↓

`EndDrag` is called

---

## 5.5 Wheel Rotation Logic

For wheel mechanisms, cursor angle is calculated relative to wheel center.

Common method:

`atan2`

The angle difference between current cursor position and previous cursor position becomes the wheel rotation delta.

This delta is corrected for wraparound.

Then it is applied to mechanism movement.

Typical function chain:

`StartDrag`

↓

Set active wheel

↓

`UpdateDrag`

↓

Calculate angle delta

↓

Apply corrected delta

↓

`ApplyMechanismRotation`

↓

Update gears, sliders, or linked components

---

## 5.6 ApplyMechanismRotation

Purpose:

Convert wheel rotation into actual mechanical movement.

Possible outputs:

* Rotate wheel mesh
* Rotate gear mesh
* Translate slider
* Move locker
* Drive linked mechanism

This function is module-specific.

For example:

In `Archivist_01`, wheel rotation drives gear and slider movement.

In `Archivist_02`, wheel rotation drives translation of `Base_1` and locker movement.

---

# 6. BPAC_ZOOMDRAGITEM

## 6.1 Purpose

`BPAC_ZoomDragItem` is a reusable Actor Component for drag-based item or mechanism interactions.

It supports axis-based dragging with configurable limits.

---

## 6.2 Main Variables

`DragAxis`

Defines the movement axis.

`DragDistanceMin`

Minimum allowed drag distance.

`DragDistanceMax`

Maximum allowed drag distance.

`StartComponentLocation`

Original component location.

`CurrentDragDistance`

Current accumulated drag distance.

`MoveSpeed`

Speed multiplier for movement.

---

## 6.3 Main Events

`StartZoomDrag`

Begins drag interaction.

`UpdateZoomDrag`

Updates movement while dragging.

`EndZoomDrag`

Ends drag interaction.

`OnMouseButtonDown`

Can open item popup or trigger reward logic.

---

## 6.4 Design Notes

The component is useful when a mechanism should move linearly rather than rotate.

Examples:

* Pulling a drawer
* Sliding a locker
* Moving a base platform
* Dragging an object out of a slot

The component should be reused for future modules whenever possible.

---

# 7. INVENTORY SYSTEM

## 7.1 Purpose

The Inventory System stores collected narrative items.

Items are not only rewards.

They are also ideological evidence used in the Dice Check system.

---

## 7.2 Item Data

Each item should contain:

* Name
* Icon
* Description
* Ideology Value

Optional future fields:

* Item ID
* Source Module
* Faction Affiliation
* Unlock Conditions
* Hidden Description
* Audio Log Reference

---

## 7.3 Main UI

Widget:

`WBP_InventoryPanel`

Main function:

`InitInventory`

Purpose:

Refresh and display collected items.

---

## 7.4 Inventory Workflow

Player obtains item

↓

Item data is added to Inventory Array

↓

Inventory UI refreshes

↓

Item becomes available for submission

---

# 8. SUBMISSION SYSTEM

## 8.1 Purpose

The Submission System allows the player to select three collected items for ideological evaluation.

The player does not directly choose Archivist or Whalemen.

Instead, submitted items influence the Dice Check result.

---

## 8.2 Main UI

Widget:

`WBP_SubmissionPanel`

Contains:

* Submission Slot 1
* Submission Slot 2
* Submission Slot 3

Empty options should auto-hide.

Buttons should auto-size based on available options.

---

## 8.3 Main Data

Submitted items are stored in:

`SubmittedItems`

Located in:

`BP_CoreDevice`

---

## 8.4 Important Function

`AreAllSlotsFilled`

Purpose:

Checks whether all three submission slots contain valid items.

---

## 8.5 Submission Workflow

Player opens submission panel

↓

Player selects item

↓

Item assigned to slot

↓

System checks if all three slots are filled

↓

If yes:

Dice Check becomes available

---

# 9. DICE CHECK SYSTEM

## 9.1 Purpose

The Dice Check System determines the next narrative direction.

It combines randomness with accumulated ideological value.

This creates a semi-authored, semi-systemic narrative flow.

---

## 9.2 Main Blueprint

Blueprint:

`BP_CoreDevice`

Responsibilities:

* Validate submitted items
* Calculate ideology sum
* Roll 2D6
* Calculate final score
* Compare threshold
* Select faction route
* Trigger module reveal
* Clear submitted slots

---

## 9.3 Formula

Current formula:

`FinalScore = Roll2D6 + TotalIdeologyValue`

Where:

`Roll2D6`

Random value from two six-sided dice.

`TotalIdeologyValue`

Sum of ideology values from three submitted items.

---

## 9.4 Threshold

Current threshold:

`7`

Result:

`FinalScore >= 7`

Archivist route.

`FinalScore < 7`

Whalemen route.

---

## 9.5 Dice Check Workflow

Player submits three items

↓

`BeginCheck` is called

↓

System verifies all slots are filled

↓

Roll 2D6

↓

Calculate item ideology sum

↓

Calculate final score

↓

Compare with threshold

↓

Determine faction result

↓

Reveal one module from matching faction pool

↓

Clear slots

↓

Reset ideology sum

---

# 10. MODULE REVEAL SYSTEM

## 10.1 Purpose

The Module Reveal System controls narrative progression.

Instead of spawning actors at runtime, modules are pre-placed in the level and hidden.

---

## 10.2 Main Philosophy

Do not dynamically spawn major story modules during gameplay.

Instead:

At BeginPlay:

* Hide future modules
* Disable collision

When selected:

* Unhide selected module
* Enable collision
* Mark as spawned or used

Advantages:

* Stable references
* Easier debugging
* Easier visual layout
* Better control over module composition

---

## 10.3 Tags

Current tag examples:

`Spawn_Archivist_Phase1`

`Spawn_Whalemen_Phase1`

Possible future tag pattern:

`Spawn_[Faction]_[Phase]`

Examples:

`Spawn_Archivist_Phase2`

`Spawn_Whalemen_Phase2`

`Spawn_Neutral_Phase1`

---

## 10.4 Reveal Workflow

Dice result generated

↓

Determine faction

↓

Find all actors with matching tag

↓

Filter out already revealed modules

↓

Randomly select one available module

↓

Set actor hidden in game to false

↓

Enable collision

↓

Register as revealed

---

# 11. DIALOGUE SYSTEM

## 11.1 Current Status

Dialogue exists as an optional narrative system.

Earlier implementation used:

`WBP_RightMessagePanel`

`VerticalBox_Options`

Dialogue data structures:

`S_InteractionPointData`

`S_DialogueNode`

`S_DialogueOptionData`

---

## 11.2 Dialogue Node

`S_DialogueNode` may contain:

* Dialogue Text
* Voice Audio
* Available Options

---

## 11.3 Dialogue Option

`S_DialogueOptionData` may contain:

* Option Text
* Next Node
* Conditions
* Optional result

---

## 11.4 HandleDialogueOption

Purpose:

Handles the result of selecting a dialogue option.

Typical behavior:

* Read selected option
* Find next dialogue node
* Update dialogue display
* Trigger optional event
* Stop or play voice audio

---

# 12. FLASHLIGHT SYSTEM

## 12.1 Purpose

The flashlight system helps the player inspect the module visually.

Input:

`L`

Current implementation:

Mouse-following flashlight decal.

Important variables:

`MouseFlashlightRef`

`bFlashlightEnabled`

The flashlight is implemented using a Deferred Decal material.

---

# 13. AUDIO SYSTEM

## 13.1 Current Notes

Voice audio is managed so that previous voice lines can stop before new ones begin.

Important reference:

`GIRef.CurrentVoiceComp`

Purpose:

Store currently playing voice audio component.

Before playing new voice:

* Stop previous voice audio
* Update current voice component
* Play new voice audio

Wheel sound effects should be separate from voice audio.

---

# 14. DESIGN RULES FOR FUTURE SYSTEMS

When adding new gameplay systems:

1. Prefer Blueprint Interfaces over inheritance.
2. Avoid reintroducing `BP_ModuleBase`.
3. Reuse `BPI_DragItem` for drag-based mechanics.
4. Reuse `BPAC_ZoomDragItem` for linear drag interactions.
5. Use tags for module categorization.
6. Keep each module self-contained.
7. Avoid hardcoded references when interface calls are enough.
8. Keep PlayerController responsible for input, not module-specific logic.
9. Keep module Blueprints responsible for local mechanical behavior.
10. Keep `BP_CoreDevice` responsible for submission and Dice Check flow.

---

# 15. CURRENT HIGH PRIORITY TASKS

High priority:

* Complete one full Phase 1 gameplay cycle
* Add at least one Whalemen module
* Improve item popup feedback
* Polish Dice Check visual/audio feedback
* Confirm module reveal reliability
* Improve documentation for AI-assisted development

Medium priority:

* Save system
* Dialogue polish
* More VFX feedback
* More audio layers
* More item descriptions
* Additional module variations

Low priority:

* Large-scale procedural expansion
* More complex faction reputation
* Full branching ending system
* Advanced UI animation
