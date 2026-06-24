# BLUEPRINT_ARCHITECTURE

Version: Phase 1
Project: Osaider
Engine: Unreal Engine 5.6
Purpose: AI-readable Blueprint architecture documentation

---

# 1. ARCHITECTURE OVERVIEW

Osaider is built with a Blueprint-first architecture.

The current technical direction prioritizes:

* Modular systems
* Reusable interactions
* Interface-based communication
* Minimal hard dependencies
* Avoiding unstable parent class hierarchies
* Fast iteration for narrative modules

The project originally considered using a shared module parent Blueprint, but this approach caused instability.

Current rule:

Do not use `BP_ModuleBase`.

Instead, modules communicate through Blueprint Interfaces and clearly defined references.

---

# 2. NAMING CONVENTIONS

Use the following naming conventions consistently.

## Blueprint Actors

Prefix:

`BP_`

Examples:

* `BP_NoCharacterPlayerController`
* `BP_InteractionPoint`
* `BP_CoreDevice`
* `BP_CameraSplinePath`
* `BP_Module_NEW_Archivist_01`
* `BP_Module_NEW_Archivist_02`
* `BP_Module_NEW_Archivist_03`
* `BP_Module_NEW_Archivist_04`
* `BP_Module_NEW_Archivist_05`
* `BP_Module_NEW_Archivist_06`

## Widget Blueprints

Prefix:

`WBP_`

Examples:

* `WBP_InventoryPanel`
* `WBP_SubmissionPanel`
* `WBP_RightMessagePanel`

## Blueprint Interfaces

Prefix:

`BPI_`

Examples:

* `BPI_ModuleInteractable`
* `BPI_CameraModule`

## Blueprint Actor Components

Prefix:

`BPAC_`

Examples:

* `BPAC_ZoomDragItem`

## Structs

Prefix:

`S_`

Examples:

* `S_InteractionPointData`
* `S_DialogueNode`
* `S_DialogueOptionData`

## Game Instance

Prefix:

`GI_`

Example:

* `GIRef`

---

# 3. CORE BLUEPRINTS

## 3.1 BP_NoCharacterPlayerController

`BP_NoCharacterPlayerController` is the central input and camera controller.

The game currently does not use a traditional character walking system.

Instead, the PlayerController handles:

* Mouse hover detection
* Click interaction
* Drag interaction
* Camera transition
* Spline camera movement
* Global structure rotation
* Flashlight toggle
* Communication with interactable actors

---

## 3.2 BP_NoCharacterPlayerController Responsibilities

Main responsibilities:

1. Find and store the active gameplay camera.
2. Detect hovered actors using `HoverTrace`.
3. Send click interaction events.
4. Detect drag targets.
5. Route drag input through `BPI_ModuleInteractable`.
6. Move camera along module splines.
7. Trigger smooth camera transitions.
8. Rotate global palace structure with Space Bar.
9. Toggle mouse-following flashlight decal.
10. Coordinate player-facing interaction flow.

The PlayerController should not contain module-specific puzzle logic.

Module-specific logic should stay inside the relevant module Blueprint.

---

## 3.3 BP_NoCharacterPlayerController Key Variables

### Camera Variables

`ActiveCamera`

The current gameplay camera.

Usually found through actor tag:

`GameplayCamera`

---

`DefaultCamTransform`

Stores the default camera transform.

Used when returning from module view to global view.

---

`CameraSplinePathRef`

Reference to global spline actor.

Expected actor:

`BP_CameraSplinePath`

---

`CameraSplineRef`

Reference to the currently active module camera spline.

Usually obtained from the active module through:

`BPI_CameraModule.GetCameraSpline`

---

`CurrentSplineDistance`

Current distance along the active spline.

---

`CameraMoveSpeed`

Speed multiplier for camera movement along spline.

---

`bCameraSplineEnabled`

Controls whether module spline movement is active.

---

`bHoldingRMB`

True while the right mouse button is held.

Used for camera movement along module spline.

---

`bCameraTransitioning`

True while the camera is interpolating between transforms.

---

`TransitionAlpha`

Current transition progress.

---

`TransitionDuration`

Total transition duration.

---

`bEnableSplineAfterTransition`

If true, enables spline camera control after camera transition finishes.

---

### Hover and Click Variables

`CurrentHoveredActor`

Reference to the current hovered actor.

Expected type:

`BP_InteractionPoint` reference or interactable actor reference.

---

### Drag Variables

`bDragging`

Whether the player is currently dragging an object.

---

`CurrentDragTarget`

Current actor receiving drag input.

Should implement:

`BPI_ModuleInteractable`

---

`LastDragWorldLocation`

Stores previous drag world location.

Used to calculate drag delta.

---

### Flashlight Variables

`MouseFlashlightRef`

Reference to mouse-following flashlight actor or decal.

---

`bFlashlightEnabled`

Whether flashlight is currently active.

Input:

`L`

---

# 4. BP_INTERACTIONPOINT

## 4.1 Purpose

`BP_InteractionPoint` is the main environmental hotspot actor.

It connects player input with module activation.

The player does not interact directly with every object in the module at first.

Instead, the player often clicks an interaction point to reveal or focus on a module.

---

## 4.2 Responsibilities

`BP_InteractionPoint` handles:

* Hover hint data
* Click response
* Owning module reference
* Camera transition trigger
* Module reveal event
* Optional UI message display
* Click collision management

---

## 4.3 Key Variables

`OwningModuleRef`

Reference to the module actor controlled by this interaction point.

This allows the interaction point to ask the module for camera spline data or trigger local events.

---

`Hint Cache`

Cached hint text or interaction data displayed when player hovers.

---

`ClickCollision`

Collision component used for click and hover detection.

After reveal, this may be hidden or destroyed to prevent repeated interaction.

---

## 4.4 Main Functions

### StartInteraction

Called when player clicks the interaction point.

Expected behavior:

1. Validate owning module.
2. Optionally open message panel.
3. Trigger module reveal or camera transition.
4. Call `RevealEnvironment`.

---

### RevealEnvironment

Activates the module exploration state.

Expected behavior:

1. Get PlayerController.
2. Get module camera spline through `BPI_CameraModule`.
3. Set PlayerController `CameraSplineRef`.
4. Start camera transition.
5. Enable RMB camera movement after transition.
6. Hide or disable click collision if needed.

---

# 5. BP_COREDDEVICE

## 5.1 Purpose

`BP_CoreDevice` controls the item submission and Dice Check flow.

It acts as the central evaluation device.

The player submits three collected items.

The system calculates ideological result.

The next module is revealed according to the result.

---

## 5.2 Responsibilities

`BP_CoreDevice` handles:

* Submission slot validation
* Submitted item storage
* Ideology value summation
* Dice roll calculation
* Threshold comparison
* Faction result selection
* Module reveal by tag
* Clearing submission slots
* Resetting temporary values

---

## 5.3 Important Variables

`SubmittedItems`

Array of submitted items.

Expected length:

3

---

`DiceThreshold`

Current threshold:

`7`

---

`IdeologySum`

Sum of ideology values from submitted items.

---

`FinalScore`

Result of:

`2D6 + IdeologySum`

---

`SpawnedModules`

Array or set of modules already revealed.

Used to avoid selecting the same module repeatedly.

---

## 5.4 Main Functions

### AreAllSlotsFilled

Checks whether all three submission slots are filled.

Expected return:

Boolean

---

### BeginCheck

Main entry point for Dice Check.

Expected flow:

1. Check whether all slots are filled.
2. If not filled, stop.
3. Roll 2D6.
4. Sum ideology values.
5. Calculate final score.
6. Compare final score with threshold.
7. Determine Archivist or Whalemen result.
8. Reveal module by faction tag.
9. Clear submitted items.
10. Reset temporary values.

---

### RevealModuleGroup

Purpose:

Reveal one hidden module from a matching module pool.

Expected flow:

1. Receive faction result.
2. Convert result into tag.
3. Find all actors with that tag.
4. Filter out actors already revealed.
5. Randomly select one valid actor.
6. Set hidden in game to false.
7. Enable collision.
8. Add actor to spawned or revealed list.

---

# 6. BP_CAMERASPLINEPATH

## 6.1 Purpose

`BP_CameraSplinePath` controls global camera movement and global structure rotation.

It is used for the palace-level view.

---

## 6.2 Responsibilities

* Store global camera spline
* Control global camera path
* Handle Space Bar rotation support
* Provide reference for PlayerController
* Support 180-degree palace rotation

---

## 6.3 Global Rotation Logic

Input is received by:

`BP_NoCharacterPlayerController`

Then the global structure or camera path rotates through:

`BP_CameraSplinePath`

Current behavior:

Each Space press rotates approximately 180 degrees.

Implementation note:

Timeline interpolation is used for smooth rotation.

---

# 7. BLUEPRINT INTERFACES

## 7.1 Interface Philosophy

Interfaces are used to avoid tight coupling between systems.

Current design avoids creating a shared `BP_ModuleBase`.

Use interfaces when:

* PlayerController needs to communicate with module
* InteractionPoint needs to get camera spline
* Drag system needs to communicate with draggable objects
* Multiple objects share behavior but should not share parent class

---

## 7.2 BPI_ModuleInteractable

### Purpose

`BPI_ModuleInteractable` defines common drag behavior.

Used by:

* Wheel mechanisms
* Slider mechanisms
* Drag planes
* Locker interactions
* Future mechanical devices

---

### Functions

`StartDrag`

Called when drag begins.

Expected behavior:

* Store initial drag position.
* Set active wheel or active component.
* Initialize drag state.

---

`UpdateDrag`

Called repeatedly while LMB is held.

Expected behavior:

* Calculate drag delta.
* Apply rotation or translation.
* Update linked mechanism.

---

`EndDrag`

Called when LMB is released.

Expected behavior:

* Clear active drag state.
* Stop drag sound if needed.
* Commit final mechanism state.

---

## 7.3 BPI_CameraModule

### Purpose

Allows any module to provide its camera spline to the PlayerController.

This avoids hard references to specific module classes.

---

### Function

`GetCameraSpline`

Expected return:

Spline Component reference.

Used by:

* `BP_InteractionPoint`
* `BP_NoCharacterPlayerController`

---

## 7.4 BPI_SpawnReveal

### Purpose

`BPI_SpawnReveal` defines the lifecycle interface for modules that can be
hidden and revealed at runtime.

Used by:

* `BP_Module_NEW_Archivist_03`
* `BP_Module_NEW_Archivist_04`
* `BP_Module_NEW_Archivist_06`

---

### Functions

`RevealModuleGroup`

Called to make the module and its owned interaction points visible and active.

Observed behavior (source: detailed developer comment node in
`BP_Module_NEW_Archivist_03` and `BP_Module_NEW_Archivist_06` event graphs;
node co-location confirmed, exact pin-level wiring not verified):

* Unhide the module Actor.
* Enable Actor collision.
* Enable Actor Tick.
* Iterate `OwnedInteractionPoints` and unhide, enable collision, enable Tick for each.
* Set `OwningModuleRef` on each interaction point to self.

---

`HideModuleGroup`

Called to hide the module and its owned interaction points.

Observed behavior (source: action nodes co-located under a section-label comment
`"HideModuleGroup"` in `BP_Module_NEW_Archivist_03` event graph; unlike
`RevealModuleGroup`, no step-by-step developer comment exists for this function —
behavior inferred from node list and symmetry with `RevealModuleGroup`; exact
pin-level wiring not verified. Note: `BP_Module_NEW_Archivist_06` routes this
event through an intermediate function call rather than directly to action nodes):

* Hide the module Actor.
* Disable Actor collision.
* Disable Actor Tick.
* Iterate `OwnedInteractionPoints` and hide, disable collision, disable Tick for each.

---

`SetAlreadyRevealed`

Called to record that this module has already been revealed.

Expected behavior:

* Set `bAlreadyRevealed` to true on the implementing Actor.

---

`GetAlreadyRevealed`

Returns whether this module has already been revealed.

Confirmed: interface defines this function with a return value (2 nodes in the
interface graph indicate an input pin and a return pin).

Current implementation status: none of the three known implementing Blueprints
(`BP_Module_NEW_Archivist_03`, `_04`, `_06`) call this function in their event graphs.

Note: The caller of this function has not been verified. Any assumption about
which Blueprint calls it is unverified and is not documented here.

---

Note: `BP_Module_NEW_Archivist_05` does not yet implement this interface.
See Section 4.6 of DEVELOPMENT_ROADMAP.md for details.

---

# 8. REUSABLE COMPONENTS

## 8.1 BPAC_ZoomDragItem

`BPAC_ZoomDragItem` is a reusable Actor Component for linear drag interaction.

It is useful for objects that move along an axis rather than rotate.

---

## 8.2 BPAC_ZoomDragItem Variables

`DragAxis`

Defines movement axis.

---

`DragDistanceMin`

Minimum allowed distance.

---

`DragDistanceMax`

Maximum allowed distance.

---

`StartComponentLocation`

Original component location.

---

`CurrentDragDistance`

Current drag distance.

---

`MoveSpeed`

Movement speed multiplier.

---

## 8.3 BPAC_ZoomDragItem Events

`StartZoomDrag`

Begins drag.

---

`UpdateZoomDrag`

Updates drag movement.

---

`EndZoomDrag`

Ends drag.

---

`OnMouseButtonDown`

May open item popup or trigger reward.

---

## 8.4 Usage Notes

Use `BPAC_ZoomDragItem` for:

* Lockers
* Drawers
* Pulling objects
* Sliding components
* Linear mechanical puzzles

Do not create a new drag system if this component can be reused.

---

# 9. MODULE BLUEPRINT STRUCTURE

## 9.1 General Module Requirements

Each module should ideally contain:

* Visible mesh structure
* Interactable objects
* Optional camera spline
* Optional item reward
* Optional dialogue or popup
* Optional local mechanical puzzle
* Faction tag
* Phase tag

---

## 9.2 Required Tags

Current module reveal uses actor tags.

Examples:

`Spawn_Archivist_Phase1`

`Spawn_Whalemen_Phase1`

Future pattern:

`Spawn_[Faction]_[Phase]`

Examples:

`Spawn_Archivist_Phase2`

`Spawn_Whalemen_Phase2`

`Spawn_Neutral_Phase1`

---

## 9.3 Required Interface Support

If a module needs custom camera movement:

Implement:

`BPI_CameraModule`

Return:

Local camera spline component.

If a module has drag objects:

Implement or use actors/components that implement:

`BPI_ModuleInteractable`

---

# 10. ARCHIVIST MODULES

## 10.1 BP_Module_NEW_Archivist_01

Known mechanics:

* WheelA
* WheelB
* GearPivotA
* GearPivotB
* Slider linkage
* DragPlaneA
* DragPlaneB

Interaction type:

Rotational drag.

Main logic:

Wheel rotation drives linked gears and slider movement.

Expected function chain:

`StartDrag`

↓

Select active wheel by tag

↓

`UpdateDrag`

↓

Calculate angle using `atan2`

↓

Apply corrected delta

↓

`ApplyMechanismRotation`

↓

Update wheel, gear, and slider transforms

---

## 10.2 BP_Module_NEW_Archivist_02

Known mechanics:

* Single wheel
* Moving `Base_1`
* Locker
* Linear translation behavior

Interaction type:

Wheel-driven translation and zoom drag component.

Main logic:

Wheel rotation drives `Base_1` movement along X direction.

Locker movement may be handled by:

`BPAC_ZoomDragItem`

Design note:

Direction can be inverted through multiplier.

Movement amplitude can be controlled by:

`MoveDistance`

---

# 11. UI BLUEPRINTS

## 11.1 WBP_InventoryPanel

Purpose:

Display collected items.

Important function:

`InitInventory`

Expected behavior:

* Read inventory array.
* Create item buttons or entries.
* Display icon and name.
* Allow item selection for submission.

---

## 11.2 WBP_SubmissionPanel

Purpose:

Allow player to submit three items.

Expected behavior:

* Display three slots.
* Allow player to assign items.
* Auto-hide empty options.
* Auto-size buttons.
* Notify `BP_CoreDevice` when slots are filled.

---

## 11.3 WBP_RightMessagePanel

Status:

Earlier or optional dialogue system.

Purpose:

* Display narrative text
* Display dialogue options
* Play voice audio
* Handle branching conversation

Current note:

Major item rewards have moved toward drag interactions and popup UI.

Dialogue may remain optional.

---

# 12. DIALOGUE STRUCTS

## 12.1 S_InteractionPointData

Possible purpose:

Store data for interaction points.

May include:

* Hint text
* Dialogue reference
* Voice reference
* Interaction type

---

## 12.2 S_DialogueNode

Stores:

* Dialogue text
* Voice audio
* Available options

---

## 12.3 S_DialogueOptionData

Stores:

* Option text
* Next node reference
* Conditions
* Optional effect

---

# 13. AUDIO REFERENCES

## 13.1 GIRef.CurrentVoiceComp

Purpose:

Store currently playing voice component.

Usage:

Before playing a new voice line:

1. Check current voice component.
2. Stop previous voice if valid.
3. Set new voice component.
4. Play new audio.

Wheel sound effects should be managed separately from voice audio.

---

# 14. INPUT SUMMARY

Current input mapping:

`LMB`

* Click interaction
* Start drag
* Continue drag while held
* Release to end drag

`RMB`

* Hold to move camera along active module spline

`Space`

* Rotate global palace structure

`Enter`

* Trigger Dice Check when submission slots are filled

`L`

* Toggle flashlight

---

# 15. IMPORTANT ARCHITECTURE RULES

## Rule 1

Do not create or reintroduce `BP_ModuleBase`.

Reason:

Previous implementation caused instability.

Current architecture uses interfaces.

---

## Rule 2

Use `HoverTrace`.

Avoid:

`OnBeginCursorOver`

Reason:

Trace-based hover is more reliable with UI and camera interaction.

---

## Rule 3

Keep PlayerController generic.

Do not add module-specific puzzle logic to `BP_NoCharacterPlayerController`.

---

## Rule 4

Keep module behavior local.

Wheel logic, gear logic, and slider logic should remain inside the module Blueprint.

---

## Rule 5

Use tags for module grouping.

Do not hardcode every module reference unless necessary.

---

## Rule 6

Prefer reusable Actor Components for repeated interaction patterns.

Example:

Use `BPAC_ZoomDragItem` for linear drag.

---

## Rule 7

Use interfaces for communication.

Do not cast to specific module classes unless there is no alternative.

---

# 16. AI DEVELOPMENT NOTES

When assisting with this project, AI should:

1. Assume Unreal Engine 5.6 Blueprint workflow.
2. Prefer Blueprint implementation over C++.
3. Reuse existing interfaces.
4. Avoid unnecessary inheritance hierarchy.
5. Keep systems modular.
6. Preserve the storylet structure.
7. Respect the Archivist red / Whalemen blue distinction.
8. Avoid changing core architecture without explicit instruction.
9. When proposing new modules, include required tags and interface requirements.
10. When proposing new mechanics, describe which Blueprint owns the logic.
