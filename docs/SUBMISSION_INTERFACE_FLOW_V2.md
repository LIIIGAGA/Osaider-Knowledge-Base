# Submission Interface Flow V2

Project: Osaider  
Engine: Unreal Engine 5.6  
Purpose: Upgrade the existing three-item Submission / Dice Check flow without replacing the stable Inventory and Module Reveal systems.

## 1. Target player flow

### First Dice Check

1. At `BeginPlay`, the three initial environment modules remain placed, visible, and interactive.
2. Every initial module reports its first successful trigger to `BP_CoreDevice`.
3. Items continue to enter the existing Inventory array.
4. Submission becomes ready only when:
   - three unique initial modules have been triggered; and
   - Inventory contains at least three valid submit-able items.
5. Reuse `WBP_InputPrompt` to show: `D  OPEN SUBMISSION`.
6. On the first D press, do not immediately open the circular panel. Pulse the top-right red Submission icon and show a short click prompt.
7. Clicking the red icon opens `WBP_SubmissionPanel` in the centre of the screen.
8. Clicking any of the three circular slots opens the existing `WBP_InventoryPanel` for that slot.
9. Selecting an Inventory item assigns it to `SubmittedItems[ActiveSlotIndex]` and refreshes the circular slot icon.
10. When all three slots are filled, the central red button becomes enabled.
11. Clicking the central red button locks the panel and starts the lower outer ring rotating for 1.5 seconds with ease-in/ease-out.
12. The Dice result may be calculated at button press, but the selected module must remain hidden while the ring is moving.
13. Only when the rotation animation finishes does `BP_CoreDevice` reveal the pending pre-placed module.
14. After reveal succeeds, the circular panel fades out and normal game input returns.

### Later Dice Checks

- After the first tutorial opening, D directly opens the Submission panel whenever Submission is ready.
- The top-right icon remains a mouse-accessible alternative.
- D is ignored while the panel is already checking or fading out.

## 2. Preserve the existing architecture

### `BP_NoCharacterPlayerController`

Keep responsibility limited to input and UI mode:

- Enhanced Input action `IA_OpenSubmission`, mapped to D.
- Ask `BP_CoreDevice.CanOpenSubmission` before opening.
- First-time D behaviour: highlight the top-right launcher.
- Later D behaviour: call `OpenSubmissionPanel` directly.
- Switch between Game Only and Game + UI input modes.
- Disable world click/drag routing while the circular panel is open.

Do not move Dice, Inventory, ideology, or module-selection logic into the PlayerController.

### `BP_CoreDevice`

Continue to own:

- `SubmittedItems`
- `AreAllSlotsFilled`
- ideology sum
- 2D6 roll
- faction result
- filtering already revealed modules
- selecting a module by the existing spawn/reveal tags
- clearing temporary submission values

Add a two-phase check so animation and reveal cannot race:

#### `PrepareDiceCheck`

Inputs: none  
Outputs: `Success`, optional failure reason

Flow:

1. Reject if a check is already running.
2. Call `AreAllSlotsFilled`.
3. Validate that the three submitted item references are unique and valid.
4. Calculate `Roll2D6`, `IdeologySum`, `FinalScore`, and faction.
5. Find one unused actor in the matching tagged pool.
6. Store it in `PendingRevealModule`.
7. Set `bCheckInProgress = true`.
8. Do not unhide it yet.

#### `CommitPendingReveal`

Inputs: none  
Outputs: `Success`

Flow:

1. Validate `PendingRevealModule`.
2. Call the current module reveal path / `BPI_SpawnReveal` if that is already wired.
3. Otherwise use the existing operations: `SetActorHiddenInGame(false)` and enable collision.
4. Add the actor to `SpawnedModules` / revealed set.
5. Clear `PendingRevealModule`.
6. Clear the submitted slots and temporary ideology values using the existing cleanup function.
7. Set `bCheckInProgress = false`.
8. Broadcast `OnModuleRevealCommitted`.

Important: despite the player-facing word “spawn”, do not use `SpawnActor` for the major story modules. The current project deliberately uses pre-placed, hidden modules for stable references.

### `WBP_InventoryPanel`

Keep using `InitInventory`.

Add or preserve these inputs:

- `SubmissionPanelRef`
- `ActiveSlotIndex`
- optional `ExcludedSubmittedItems`

Inventory item click:

1. Reject an item already used by another slot.
2. Call `SubmissionPanelRef.AssignItemToSlot(ActiveSlotIndex, ItemData)`.
3. Close or collapse the Inventory window.
4. Return focus to the Submission panel.

Do not duplicate the Inventory array inside the widget.

## 3. `WBP_SubmissionPanel` hierarchy

Use the two split textures on one identical `1672 × 941` design canvas.

```text
WBP_SubmissionPanel
└─ Canvas_Root (full screen)
   ├─ Button_BackdropBlocker
   └─ Overlay_Submission (centred, aspect-preserving)
      ├─ Image_OuterRing
      ├─ Image_InnerLineArt
      ├─ Button_Slot0
      │  └─ Image_Item0
      ├─ Button_Slot1
      │  └─ Image_Item1
      ├─ Button_Slot2
      │  └─ Image_Item2
      ├─ Button_Check
      └─ optional WBP_InventoryPanel
```

Textures:

- `WBP_SubmissionPanel_v2_OuterRing_RotationSquare.png` (recommended for animation; 941 × 941, pivot 0.5 / 0.5)
- `WBP_SubmissionPanel_v2_OuterRing.png` (full-canvas alignment/reference version)
- `WBP_SubmissionPanel_v2_InnerThreeSlots_Triangle_LineArt_NoBlackEdge.png`

If using the full-canvas outer ring, both images use the same anchors, alignment, size, and scale. If using the recommended square outer ring, place it at the same visual centre as the full inner layer and keep its slot `Clipping` set to `Inherit` / `On Demand`, not `Clip to Bounds`.

Reference hit-area centres from the V2 canvas:

- Slot 0 centre: approximately `(594, 303)`
- Slot 1 centre: approximately `(1076, 303)`
- Slot 2 centre: approximately `(835, 703)`
- Check button centre: approximately `(835, 452)`
- Outer ring rotation centre: approximately `(835, 470)`

Use invisible UMG Buttons over the artwork instead of baking interaction into the texture.

## 4. Submission UI state

Recommended enum: `E_SubmissionUIState`

- `Closed`
- `Selecting`
- `Ready`
- `Checking`
- `FadingOut`

Recommended widget variables:

- `CoreDeviceRef`
- `PlayerControllerRef`
- `ActiveSlotIndex`
- `SubmissionState`
- `InventoryPanelRef`

### Slot click

`Button_SlotN.OnClicked`

1. Require state `Selecting` or `Ready`.
2. Set `ActiveSlotIndex = N`.
3. Create/show Inventory panel.
4. Call `InitInventory`.
5. Pass current submitted items so duplicates can be disabled.

### Assign item

`AssignItemToSlot(Index, ItemData)`

1. Set `BP_CoreDevice.SubmittedItems[Index]` through the current setter or a new small setter function.
2. Update the corresponding slot icon.
3. Call `RefreshSubmissionState`.
4. If `AreAllSlotsFilled` is true, set state `Ready`; otherwise `Selecting`.

### Central button click

`Button_Check.OnClicked`

1. Require `SubmissionState == Ready`.
2. Disable all three slot Buttons and the Check Button immediately.
3. Close the Inventory panel if open.
4. Call `BP_CoreDevice.PrepareDiceCheck`.
5. If false: unlock the UI, flash invalid slots, and return to `Selecting` or `Ready`.
6. If true: set state `Checking` and play `Anim_CheckSequence`.

## 5. Rotation and fade animation

### `Anim_CheckSequence` — 1.5 seconds

Animate only `Image_OuterRing`:

- `0.000 s`: angle `0°`
- `0.375 s`: angle `56.25°`
- `0.750 s`: angle `180°`
- `1.125 s`: angle `303.75°`
- `1.500 s`: angle `360°`

Set transform keys to cubic / auto interpolation. These values approximate smoothstep (`3t² - 2t³`), producing a visible ease-in and ease-out without a sudden stop.

Recommended square outer-ring Render Transform Pivot:

- X: `0.5`
- Y: `0.5`

Legacy full-canvas outer-ring Pivot:

- X: `0.4994`
- Y: `0.4995`

Also allowed during the 1.5 seconds:

- central Button scale `1.00 → 0.96 → 1.00`
- mild red opacity pulse
- one restrained mechanical sound

Do not rotate the three item slots, their icons, or the central button.

### Animation Finished

Bind specifically to `Anim_CheckSequence`:

1. Call `BP_CoreDevice.CommitPendingReveal`.
2. If success, play `Anim_PanelFadeOut`.
3. If failure, restore the panel and enable Check again; do not consume items.

### `Anim_PanelFadeOut` — 0.35 to 0.50 seconds

- Root opacity `1 → 0` with ease-out.
- Optional scale `1.00 → 0.985`.
- On finished: remove or collapse the panel and restore Game Only input.

Do not begin fading until module reveal has successfully started.

## 6. First-time prompt and top-right launcher

Persistent HUD widget: reuse the existing top-right red icon or wrap it in `Button_SubmissionLauncher`.

Readiness event:

`BP_CoreDevice.OnSubmissionAvailabilityChanged(true)`

First-time response:

1. `WBP_InputPrompt.ShowPrompt(D, "OPEN SUBMISSION")`.
2. D press plays `Anim_LauncherAttention` on the red icon.
3. Show a short tooltip next to it: `CLICK TO START CHECK`.
4. Icon click calls `OpenSubmissionPanel`.
5. After `OpenSubmissionPanel` returns success, set `BP_CoreDevice.SubmissionTutorialState = Completed` through a setter; keep Pointing state if widget creation fails.

Later response:

- D calls `OpenSubmissionPanel` directly.
- The icon can still open it by mouse.

## 7. Initial module tracking

Track only the three explicitly marked initial module instances, after their granted item is successfully added to Inventory.

In `BP_CoreDevice`:

- `TriggeredInitialModules` — Actor array or ID set
- `RequiredInitialModuleCount = 3`
- `NotifyInitialModuleTriggered(ModuleActor)`
- `SubmissionTutorialState` — `CollectingInitialItems`, `WaitingForFirstD`, `PointingToLauncher`, `Completed`

Each module class defaults `bCountsTowardInitialUnlock` to false; only the three initial placed instances set it true. After Inventory `ADD`, the module uses `bHasReportedInitialTrigger` and calls the notification once. The CoreDevice notification accepts calls only while state is `CollectingInitialItems`. Do not call it from Reveal/Hide functions.

First tutorial unlock becomes:

```text
TriggeredInitialModules.Num >= 3
AND ValidInventoryItemCount >= 3
AND !bCheckInProgress
```

If every initial module always grants exactly one item, the first condition is still useful: it prevents unrelated debug items from unlocking the tutorial prematurely.

After the launcher is clicked, state becomes `Completed` and must never be reset by Commit or loop cleanup. Later revealed/spawned module instances therefore cannot replay tutorial UI.

## 8. Input and focus rules

When the panel opens:

- `Set Input Mode Game and UI`
- show mouse cursor
- focus `WBP_SubmissionPanel`
- set a controller flag such as `bUIInteractionLocked = true`
- suppress world hover/click/drag and camera navigation

When the panel closes:

- `Set Input Mode Game Only`
- hide cursor only if that matches the existing game mode
- clear UI focus
- set `bUIInteractionLocked = false`

During `Checking` and `FadingOut`:

- D ignored
- slot clicks ignored
- Inventory cannot open
- panel cannot be manually closed
- repeated central-button clicks impossible

## 9. Important edge cases

- Fewer than three eligible items: show the D prompt only when readiness is true.
- Duplicate submitted item: disable it in Inventory and validate again in `PrepareDiceCheck`.
- No unused module in the selected faction pool: `PrepareDiceCheck` fails before animation; keep items and show a short system warning.
- Pending module becomes invalid during animation: `CommitPendingReveal` fails, UI returns to Ready, items remain.
- Player presses D repeatedly: reuse the existing widget reference; never create two Submission panels.
- Panel removed during level transition: clear `PendingRevealModule` and reset `bCheckInProgress` safely.
- Do not change whether submitted items are consumed or retained unless the current project already does so; preserve the existing item lifecycle.

## 10. Recommended implementation order

1. Add D input and one-instance panel open/close logic.
2. Replace the old top-right three slots with the three circular hit areas.
3. Reconnect slot click → `WBP_InventoryPanel.InitInventory` → assign item.
4. Remove the old Enter-to-check binding.
5. Split `BeginCheck` into prepare and commit phases.
6. Add the 1.5-second outer-ring animation.
7. Commit module reveal only from animation finished.
8. Add panel fade-out and input restoration.
9. Add first-time D / red-icon onboarding.
10. Test the first cycle and at least two later cycles.

## 11. Acceptance checklist

- Three initial modules begin visible and can each report first activation.
- Readiness does not appear before three triggers and three valid items.
- First D press points the player to the red top-right icon.
- Red icon opens exactly one centred Submission panel.
- Each circular slot opens Inventory and fills the correct slot.
- Duplicate item assignment is blocked.
- Central button is disabled until all slots are filled.
- Enter no longer starts the Dice Check.
- Central click starts one 1.5-second eased rotation.
- No module becomes visible before rotation finishes.
- Exactly one pre-placed module is revealed after animation completion.
- Panel fades out only after reveal succeeds.
- Later D presses directly reopen the panel.
- No duplicate panel, duplicate check, or duplicate module reveal occurs.
