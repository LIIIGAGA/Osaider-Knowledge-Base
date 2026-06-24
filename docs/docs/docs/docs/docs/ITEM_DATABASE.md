# ITEM_DATABASE

Version: Phase 1
Project: Osaider
Engine: Unreal Engine 5.6
Purpose: AI-readable item database for narrative, gameplay, and Dice Check systems

---

# 1. ITEM SYSTEM OVERVIEW

In Osaider, items are not only collectibles.

Each item functions as:

* A narrative clue
* A piece of ideological evidence
* A gameplay token
* A Dice Check modifier
* A memory fragment
* A possible faction signal

Items are collected through environmental interaction, mechanical puzzles, dialogue, or hidden module exploration.

Collected items are stored in the Inventory System and may later be submitted through the Submission System.

When three items are submitted, their ideology values are added to the Dice Check result.

---

# 2. ITEM DATA STRUCTURE

Each item should ideally contain the following fields.

## Required Fields

`ItemName`

The display name of the item.

---

`Icon`

The UI icon displayed in inventory and submission panel.

---

`Description`

The visible item description shown to the player.

---

`IdeologyValue`

Numerical value added to Dice Check.

Positive values currently lean toward Archivist.

Negative values currently lean toward Whalemen.

This may be rebalanced later.

---

## Recommended Future Fields

`ItemID`

Unique internal identifier.

Example:

`ITEM_EMPLOYEE_ID_709`

---

`FactionImplication`

Possible values:

* Archivist
* Whalemen
* Neutral
* Ambiguous

---

`SourceModule`

The module where this item is obtained.

---

`HiddenDescription`

Optional description shown after story progression.

---

`AudioReference`

Optional linked voice log or audio fragment.

---

`UnlockCondition`

Optional condition required before item can be obtained.

---

`CanSubmit`

Boolean.

Whether this item can be used in Dice Check.

---

# 3. IDEOLOGY VALUE SYSTEM

The ideology value system controls how submitted items affect the Dice Check.

Current rule:

`FinalScore = 2D6 + Sum of Ideology Values`

Current threshold:

`7`

Result:

`FinalScore >= 7`

Archivist route.

`FinalScore < 7`

Whalemen route.

---

# 4. VALUE DESIGN GUIDE

Recommended temporary value ranges:

## Strong Archivist Item

Value:

`+2` or `+3`

Meaning:

Strongly supports official history, bureaucracy, or institutional order.

---

## Weak Archivist Item

Value:

`+1`

Meaning:

Slightly supports Archivist interpretation.

---

## Neutral Item

Value:

`0`

Meaning:

Ambiguous or daily-life object.

---

## Weak Whalemen Item

Value:

`-1`

Meaning:

Slightly supports hidden memory, resistance, or doubt.

---

## Strong Whalemen Item

Value:

`-2` or `-3`

Meaning:

Strongly challenges official history.

---

# 5. CURRENT AND PLANNED ITEMS

---

# 5.1 Employee ID Card No.709

## Basic Info

Item Name:

`Employee ID Card No.709`

Possible Item ID:

`ITEM_EMPLOYEE_ID_709`

Source Module:

`BP_Module_NEW_Archivist_02`

Faction Implication:

Ambiguous / Archivist

Recommended Ideology Value:

`+1`

Status:

Implemented or in progress.

---

## Narrative Meaning

This item represents the bureaucratic identity of a citizen-worker.

It connects the individual to the palace’s administrative system.

The number suggests that the person is processed as a record rather than remembered as a human being.

---

## Possible Description

An employee identification card issued by the palace administration.

The name field is partially worn away, but the number remains perfectly legible.

---

## Design Notes

This item should raise questions about the citizen/soldier identity system.

It can be interpreted as:

* Evidence of bureaucratic control
* Evidence of lost individuality
* A trace of someone who once existed
* A key to official access

Because it is an official record, it may lean slightly toward Archivist.

However, because it also preserves a forgotten person, it may remain morally ambiguous.

---

# 5.2 Memory Fragment

## Basic Info

Item Name:

`Memory Fragment`

Possible Item ID:

`ITEM_MEMORY_FRAGMENT`

Source Module:

Unknown / early module / Whalemen-related module

Faction Implication:

Whalemen

Recommended Ideology Value:

`-2`

Status:

Planned or partially implemented.

---

## Narrative Meaning

A fragment of memory that exists outside official records.

It may be a sound, image, object, or incomplete testimony.

The Archivists cannot fully classify it.

The Whalemen may treat it as evidence of erased history.

---

## Possible Description

A small fragment of something remembered but never recorded.

It feels incomplete, as if the missing part has been deliberately removed.

---

## Design Notes

This item should strongly support the Whalemen route.

It should feel intimate and fragile.

It may be connected to hidden audio, personal testimony, or environmental traces.

---

# 5.3 Sanatorium Suit

## Basic Info

Item Name:

`Sanatorium Suit`

Possible Item ID:

`ITEM_SANATORIUM_SUIT`

Source Module:

Sanatorium-related module

Faction Implication:

Ambiguous / Archivist

Recommended Ideology Value:

`+1`

Status:

Planned.

---

## Narrative Meaning

A uniform or treatment suit used inside a palace sanatorium.

It suggests that care, discipline, and correction may be part of the same system.

The word “sanatorium” should feel both medical and institutional.

---

## Possible Description

A pale treatment suit folded with administrative precision.

The fabric is clean, but the identification tag has been removed.

---

## Design Notes

This item should connect medical care to social control.

It can imply:

* Rehabilitation
* Correction
* Memory treatment
* Ideological adjustment
* Bureaucratic healthcare

---

# 5.4 Sanatorium Voucher

## Basic Info

Item Name:

`Sanatorium Voucher`

Possible Item ID:

`ITEM_SANATORIUM_VOUCHER`

Source Module:

Sanatorium-related module

Faction Implication:

Archivist

Recommended Ideology Value:

`+2`

Status:

Planned.

---

## Narrative Meaning

A formal document granting access to treatment.

It turns care into a bureaucratic transaction.

It may suggest that citizens are selected, processed, or corrected through official channels.

---

## Possible Description

A stamped voucher authorizing one cycle of restorative treatment.

The signature is printed, not handwritten.

---

## Design Notes

This item should feel highly bureaucratic.

It belongs naturally to the Archivist system because it formalizes the body and memory through documentation.

---

# 5.5 Electro-sleep Helmet

## Basic Info

Item Name:

`Electro-sleep Helmet`

Possible Item ID:

`ITEM_ELECTRO_SLEEP_HELMET`

Source Module:

Sanatorium or treatment module

Faction Implication:

Ambiguous / Archivist

Recommended Ideology Value:

`+1` or `0`

Status:

Planned.

---

## Narrative Meaning

A device used to induce sleep, treatment, correction, or memory alteration.

It may be presented officially as therapy.

Its actual function may be more disturbing.

---

## Possible Description

A medical helmet lined with conductive filaments.

The instruction label says: “For peaceful restoration.”

---

## Design Notes

This item should remain ambiguous.

It may support Archivist ideology if interpreted as treatment.

It may support Whalemen ideology if interpreted as evidence of memory control.

Recommended temporary value:

`0`

until its story role becomes clearer.

---

# 5.6 Sanatorium Plan

## Basic Info

Item Name:

`Sanatorium Plan`

Alternative Name:

`Sanatorium Scheme`

Possible Item ID:

`ITEM_SANATORIUM_PLAN`

Source Module:

Sanatorium-related module

Faction Implication:

Whalemen / Ambiguous

Recommended Ideology Value:

`-1`

Status:

Planned.

---

## Narrative Meaning

A floor plan or internal scheme of the sanatorium.

It may reveal hidden chambers, restricted circulation, or treatment zones not shown on official maps.

---

## Possible Description

A copied floor plan of the sanatorium.

Several rooms exist in the drawing but not in the public directory.

---

## Design Notes

Because this item reveals hidden spatial knowledge, it may lean toward Whalemen.

It can help the player understand that architecture itself is part of the control system.

---

# 5.7 Basic Meal Set

## Basic Info

Item Name:

`Basic Meal Set`

Possible Item ID:

`ITEM_BASIC_MEAL_SET`

Source Module:

Meal distribution or citizen routine module

Faction Implication:

Neutral / Archivist

Recommended Ideology Value:

`0` or `+1`

Status:

Planned.

---

## Narrative Meaning

A standardized meal issued to citizens.

It represents daily routine, rationing, and the normalization of military life.

---

## Possible Description

A sealed meal set issued according to daily production rank.

The contents are identical to yesterday’s.

---

## Design Notes

This item should show how control enters ordinary life.

It may be neutral because it is a mundane object, but it can lean Archivist if tied to ration policy.

---

# 5.8 Long-Life Canned Food

## Basic Info

Item Name:

`Long-Life Canned Food`

Possible Item ID:

`ITEM_LONG_LIFE_CANNED_FOOD`

Source Module:

Storage, canteen, or emergency supply module

Faction Implication:

Neutral / Ambiguous

Recommended Ideology Value:

`0`

Status:

Planned.

---

## Narrative Meaning

Food designed to last indefinitely.

It suggests preparation for endless war, but also reveals the absurdity of a war that never ends.

---

## Possible Description

A can of preserved food with no expiration date.

The label promises freshness until victory.

---

## Design Notes

This item can be humorous, melancholic, or unsettling.

It should reinforce the endless war cycle without clearly supporting either faction.

---

# 5.9 Redacted Medical Records

## Basic Info

Item Name:

`Redacted Medical Records`

Possible Item ID:

`ITEM_REDACTED_MEDICAL_RECORDS`

Source Module:

Sanatorium or archive module

Faction Implication:

Whalemen

Recommended Ideology Value:

`-2`

Status:

Planned.

---

## Narrative Meaning

Official records that hide more than they reveal.

The redactions suggest institutional violence or memory manipulation.

---

## Possible Description

A medical file covered in black bars.

The diagnosis is missing, but the approval stamps remain.

---

## Design Notes

This item should strongly challenge the Archivist system.

It is still an official document, but its missing content exposes the violence of official history.

---

# 5.10 Weapon Fragment

## Basic Info

Item Name:

`Weapon Fragment`

Possible Item ID:

`ITEM_WEAPON_FRAGMENT`

Source Module:

Factory or undersea steelworks module

Faction Implication:

Whalemen / Ambiguous

Recommended Ideology Value:

`-1`

Status:

Planned.

---

## Narrative Meaning

A fragment of a weapon that may have been produced, destroyed, and recycled many times.

It reveals the material loop of the palace.

---

## Possible Description

A broken piece of weapon casing.

Its surface has been melted and re-stamped more than once.

---

## Design Notes

This item should connect to the daily production and nightly melting cycle.

It may support Whalemen because it exposes the futility of the war machine.

---

# 5.11 Nuclear Weapon

## Basic Info

Item Name:

`Nuclear Weapon`

Possible Item ID:

`ITEM_NUCLEAR_WEAPON`

Source Module:

Late phase / restricted weapons module

Faction Implication:

Archivist / Catastrophic / Ambiguous

Recommended Ideology Value:

`+3` or special case

Status:

Planned.

---

## Narrative Meaning

A final extreme expression of deterrence logic.

The palace may produce ultimate weapons not to use them, but to justify its own existence.

---

## Possible Description

A sealed device labeled as the final guarantee of peace.

No one knows whether it has ever been armed.

---

## Design Notes

This item may need special handling.

It may be too significant to behave like a normal Dice Check item.

Possible future treatment:

* Cannot be submitted normally
* Triggers special event
* Unlocks late-game route
* Acts as a final ideological object

---

# 5.12 Whalemen Recruitment Letter

## Basic Info

Item Name:

`Whalemen Recruitment Letter`

Possible Item ID:

`ITEM_WHALEMEN_RECRUITMENT_LETTER`

Source Module:

Whalemen recruitment module

Faction Implication:

Whalemen

Recommended Ideology Value:

`-3`

Status:

Planned.

---

## Narrative Meaning

A direct invitation from the underground resistance.

It suggests that the player has been noticed by the Whalemen.

---

## Possible Description

A folded letter hidden behind a layer of rust.

The ink has blurred, but the final sentence remains clear: someone is waiting below.

---

## Design Notes

This item is a strong Whalemen signal.

It may eventually function as a route-breaking object.

---

# 5.13 Senior Official Access

## Basic Info

Item Name:

`Senior Official Access`

Possible Item ID:

`ITEM_SENIOR_OFFICIAL_ACCESS`

Source Module:

Archivist high-level module

Faction Implication:

Archivist

Recommended Ideology Value:

`+3`

Status:

Planned.

---

## Narrative Meaning

A high-level permission object within the palace bureaucracy.

It grants access not through physical force, but through administrative legitimacy.

---

## Possible Description

A senior access credential stamped with multiple layers of approval.

The holder is permitted to enter rooms that officially do not exist.

---

## Design Notes

This item is a strong Archivist signal.

It may eventually function as a route-breaking object.

---

# 6. ROUTE-BREAKING ITEMS

Some items may become more important than ordinary Dice Check modifiers.

Possible route-breaking items:

* `Senior Official Access`
* `Whalemen Recruitment Letter`

If the player obtains one of these, the normal loop may break.

Possible behavior:

* Directly join Archivist
* Directly join Whalemen
* Unlock special module
* Override normal Dice Check
* Trigger end of Phase 1 loop

This is not fully implemented yet.

---

# 7. ITEM UI NOTES

Item UI should clearly communicate:

* Item name
* Icon
* Short description
* Optional faction tone

But it should not directly show ideology value to the player unless intentionally designed.

For AI and developer documentation, ideology value should be visible.

For player-facing UI, ideology should remain implied through narrative.

---

# 8. ITEM POPUP NOTES

Recent design direction:

Major item granting has moved toward drag interactions and item popup UI.

Important rule:

If popup opens during drag, pause or stop drag state to avoid interaction conflicts.

Possible UI behavior:

1. Player completes interaction.
2. Item popup appears.
3. Drag input is disabled.
4. Player confirms item.
5. Item is added to inventory.
6. UI closes.
7. Drag state resets safely.

---

# 9. AI NOTES FOR ITEM DESIGN

When AI designs a new item for Osaider, include:

* Item name
* Internal item ID
* Source module
* Faction implication
* Recommended ideology value
* Player-facing description
* Hidden narrative meaning
* Dice Check role
* UI notes
* Possible future use

AI should avoid generic items.

Every item should connect to at least one core theme:

* Constructed history
* Memory
* Bureaucracy
* Endless production
* Citizen/soldier identity
* Palace as machine
* War as possible fiction

---

# 10. CURRENT BALANCING NOTES

The ideology values are temporary.

The Dice Check threshold is currently:

`7`

Because 2D6 naturally centers around 7, item ideology values can strongly influence but should not completely remove uncertainty.

Possible balancing rules:

* Most normal items should be between `-1` and `+1`.
* Strong evidence items can be `-2` or `+2`.
* Route-breaking items can be `-3` or `+3`.
* Special items may bypass normal Dice Check.
