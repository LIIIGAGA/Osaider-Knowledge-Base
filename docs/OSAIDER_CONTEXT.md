# OSAIDER PROJECT CONTEXT

Version: Phase 1

Engine: Unreal Engine 5.6

Project Type:

Narrative Exploration Game

Primary Goal:

Create a modular storylet-based narrative game where player ideology influences procedural narrative progression.

---

# HIGH LEVEL CONCEPT

Osaider is a floating palace suspended above an endless ocean.

The palace functions simultaneously as:

- A nation
- A government
- A weapons factory
- A historical archive

The society believes it is engaged in a perpetual war against an external enemy known as Osaider.

However, evidence gradually suggests that:

- The enemy may not exist.
- The war may be manufactured.
- History itself may have been rewritten.

The player explores fragments of this world through a sequence of modular narrative spaces.

---

# CORE THEMES

## Constructed History

History is not discovered.

History is produced.

The Archivists continuously rewrite reality through documentation.

---

## Memory

Memory exists independently from official records.

The Whalemen attempt to preserve memories that have been erased from history.

---

## Bureaucracy

The palace survives through endless administrative procedures.

Documents become more important than reality.

---

## Endless Production

Weapons are manufactured every day.

Weapons are destroyed every night.

The system exists only to sustain itself.

---

## Ideology

Player choices do not immediately branch the narrative.

Instead they gradually influence ideological alignment.

---

# FACTIONS

## Archivist

Color:

Red

Role:

Official authority.

Responsibilities:

- Record history
- Edit history
- Manufacture historical narratives
- Maintain social order

Core Belief:

History is constructed.

Truth exists only through documentation.

Narrative Function:

Represents institutional power.

---

## Whalemen

Color:

Blue

Role:

Underground resistance.

Responsibilities:

- Preserve memories
- Share hidden knowledge
- Challenge official narratives

Core Belief:

Memory survives even when history is erased.

Narrative Function:

Represents counter-history.

---

# PLAYER ROLE

The player begins as an ordinary citizen.

The player is not explicitly aligned with any faction.

Alignment emerges through:

- Exploration
- Collected items
- Dice Check outcomes
- Narrative choices

The player gradually develops ideological tendencies.

---

# GAME STRUCTURE

The game uses a Storylet Architecture.

A storylet is:

A self-contained narrative module that can be connected to multiple other modules.

Each module contains:

- Environment
- Interactions
- Items
- Narrative fragments

Modules can appear in different orders.

This allows narrative variation while preserving authored content.

---

# CORE GAMEPLAY LOOP

1. Explore current module

2. Interact with mechanisms

3. Discover narrative information

4. Obtain item rewards

5. Store items in inventory

6. Submit three items

7. Perform Dice Check

8. Generate next module

9. Repeat

---

# IDEOLOGY SYSTEM

Every collectible item contains:

- Narrative meaning
- Ideology value

Example:

Archivist items:

Positive value

Whalemen items:

Negative value

Current implementation may change during balancing.

---

# DICE CHECK SYSTEM

Formula:

Final Score = 2D6 + Ideology Value Sum

Threshold:

7

Results:

Score >= 7

Archivist Route

Score < 7

Whalemen Route

The Dice Check determines which module pool becomes available.

---

# MODULE GENERATION PHILOSOPHY

The game does not spawn modules dynamically.

Instead:

All future modules already exist in the level.

At BeginPlay:

- Hidden
- Collision disabled

When selected:

- Unhidden
- Collision enabled

Advantages:

- Better performance
- Easier debugging
- More predictable behaviour

---

# CURRENT PHASE

Phase 1 Vertical Slice

Target:

One complete gameplay cycle.

Current Systems:

✓ Camera System

✓ Interaction System

✓ Drag Mechanism System

✓ Inventory System

✓ Submission System

✓ Dice Check System

✓ Module Spawn System

In Progress:

- Additional Archivist Modules
- Whalemen Content
- Environmental Storytelling
- Audio Polish
