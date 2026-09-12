IMPORTANT CONTEXT:

This is a three-person hackathon team.

Do NOT aggressively reduce the feature scope on the assumption that one developer is working alone.

We intentionally want to implement the complete feature set described below in parallel. Your job is to architect the system so three developers can work independently with minimal conflicts while sharing a coherent data model and design system.

Prioritize modularity, clear ownership boundaries, reusable components, and stable interfaces between modules.

Do not respond by simply telling us to build fewer features.

The application should be treated as a complete multi-module Ascend OS MVP.

---

# ADDITIONAL FITNESS REQUIREMENTS

The Exercise module should be treated as a substantial first-class component rather than a basic workout logger.

## Workout intelligence

Implement/design support for:

### Automatic session summary

After completing a workout, generate a summary containing:

- duration
- exercises
- sets
- reps
- total volume
- comparison with previous equivalent session
- percentage volume change
- personal records
- estimated 1RM improvements
- most-trained muscle groups
- XP earned
- consistency information

Example:

"Chest & Triceps — 48 min, 14 sets, 6,420 kg total volume, +8% vs previous session, 3 PRs."

The summary can initially be generated using deterministic calculations and templates rather than requiring an LLM.

### Personal record detection

Automatically detect:
- max weight
- max reps
- estimated 1RM
- total exercise volume
- other relevant performance records

Create a PERSONAL_RECORD activity event when a PR occurs.

PRs should feed into:
- XP
- achievements
- notifications/celebrations
- reports
- weekly recap

### Celebration / milestones

Create lightweight celebratory UI for:
- new PR
- first workout
- 10th workout
- 7-day training streak
- highest volume
- goal milestone
- level up

Do not make the entire UI look like a video game.

---

# PROGRESS PHOTOS

Support private progress photos.

Each photo should include:
- timestamp
- photo type: front / back / side / other
- optional bodyweight
- notes

Provide:
- chronological gallery
- side-by-side comparison
- before/after comparison
- draggable comparison slider

Photos should be private by default.

Do not implement automatic body composition or medical analysis.

---

# TRAINING CONSISTENCY HEATMAP

Create a GitHub-style contribution heatmap for training consistency.

It should support:
- workout days
- optionally workout volume/intensity
- monthly/yearly views
- streak calculation

Architect the heatmap component so it can potentially be reused for:
- habits
- goals
- overall activity

---

# FREEFORM TRAINING NOTES

Allow users to attach freeform notes to:
- workouts
- exercises
- sessions

Support hashtags/tags such as:

#shoulderpain
#deload
#greatsession
#lowenergy

Users should be able to:
- filter history by tag
- search notes
- see tagged events

Design the underlying Note/Tag model so notes can eventually be used across Ascend OS.

---

# PAIN / INJURY-AWARE TRAINING

Allow users to record self-reported training discomfort.

Examples:
- left knee pain
- right shoulder discomfort
- lower back soreness

Store:
- body region
- side
- user-provided description
- timestamp
- affected movement/exercise
- severity if provided
- tags

The system may use these inputs to modify exercise recommendations.

IMPORTANT:
This is NOT a medical diagnosis system.

Do not claim to diagnose injuries or provide medical treatment.

Use language such as:
- "You marked shoulder discomfort."
- "Consider alternative exercises."
- "This exercise may involve the movement you flagged."

The system should never present medical conclusions as facts.

---

# EXERCISE SUBSTITUTION ENGINE

Implement "Swap exercise" functionality.

Given an exercise, identify alternatives based on:

- target muscle
- secondary muscles
- movement pattern
- equipment
- difficulty
- exercise type
- user constraints
- reported discomfort

Example:

Bench Press
→ Dumbbell Bench Press
→ Machine Chest Press
→ Push-ups

The system should provide a similarity/relevance score where practical.

This should be implemented as a deterministic recommendation engine initially.

---

# PLATEAU DETECTION

Detect potential training plateaus.

Use simple configurable rules based on:
- repeated performance
- weight
- reps
- volume
- estimated 1RM
- time window

Example:

"If performance on an exercise has remained approximately unchanged for 4 weeks, flag a possible plateau."

Show:

POSSIBLE PLATEAU

Bench Press
4 weeks without meaningful progression.

Potential options:
- change rep range
- modify volume
- use a variation
- attempt a small load increase
- consider a deload

Do not present this as guaranteed physiological analysis.

---

# DELOAD SUGGESTIONS

Create a lightweight readiness/fatigue heuristic based on tracked data.

Potential signals:
- rapidly increasing volume
- increasing training frequency
- performance decline
- repeated hard sessions
- recent deload history

If several signals are present, show:

"Training load has increased significantly recently. Consider a lighter training week."

Allow the user to dismiss the suggestion.

Do not create medical claims.

---

# VOICE / QUICK LOGGING

Design a quick logging interface that can accept natural-language or speech-transcribed input.

Examples:

"Bench 100 kilos 8 reps"

→ Bench Press
→ 100 kg × 8

"Bench 100 for 8, 100 for 7, 95 for 9"

→ three sets

Also consider cross-module commands:

"Spent 35 euros on lunch"

"Finished watching Dune"

"Read 20 pages"

"Completed today's workout"

The initial implementation may use speech-to-text plus deterministic parsing.

Do not build a complex autonomous agent.

---

# COACH EXPORT

Provide an exportable training report.

Potential formats:
- PDF
- shareable read-only web page

Include:
- workout frequency
- total volume
- PRs
- major exercise progression
- muscle distribution
- consistency
- recent training history

Keep this simple but polished.

---

# GLOBAL WEEKLY RECAP

The weekly recap must NOT be limited to Exercise.

Create a unified "Your Week" report aggregating:

Fitness:
- workouts
- volume
- PRs
- consistency

Goals:
- goals completed
- progress
- milestones

Habits:
- completion rate
- streaks

Entertainment:
- books completed
- movies watched
- anime/manga progress
- other tracked media

Finance:
- total spending
- income
- budget utilization
- major category changes

Overall:
- XP
- level progression
- longest streak
- total activities

Generate natural-language insights where possible.

Example:

"You trained 4/4 planned days, increased volume by 8%, and achieved 3 PRs."

"Your reading goal is 12% behind schedule."

"You spent 22% more on dining than last week."

---

# PERSONAL TIMELINE

Create a unified chronological timeline of user activity.

Example:

11:42
WORKOUT COMPLETED
Chest & Triceps
+180 XP

10:13
EXPENSE
€14.50
Lunch

09:20
ENTERTAINMENT
Read 25 pages
Dune
+20 XP

08:15
HABIT COMPLETED
Morning Workout
+25 XP

The timeline should support filtering by:
- category
- activity type
- date
- tags

This timeline should be powered directly by the centralized ActivityEvent system.

---

# EXPANDED SYSTEM ARCHITECTURE

Ascend OS should be organized into:

TRACK:
- Entertainment
- Finance
- Exercise
- Habits
- Journal

ACHIEVE:
- Goals
- Quests
- XP
- Levels
- Streaks
- Achievements

UNDERSTAND:
- Timeline
- Reports
- Heatmaps
- Trends
- PR detection
- Plateau detection
- Budget analysis

ASSIST:
- Recommendations
- Weekly recap
- Voice logging
- Exercise substitutions
- Deload suggestions
- Natural language commands

REFLECT:
- Journal
- Progress photos
- Notes
- Tags
- Private data

---

# THREE-DEVELOPER PARALLEL DEVELOPMENT

Create explicit ownership boundaries.

Recommended initial ownership:

Developer A:
- core application
- authentication
- database
- ActivityEvent
- XP
- levels
- streaks
- achievements
- goals
- habits
- dashboard
- timeline

Developer B:
- Exercise
- MuscleWiki integration
- workout logging
- workout analytics
- PR detection
- substitutions
- plateau detection
- deload recommendations
- progress photos
- heatmaps
- voice logging
- coach export

Developer C:
- Entertainment
- Finance
- XML import
- budgets
- Journal
- encryption
- Reports
- analytics
- weekly recap
- insights

Identify dependencies between these areas and define stable interfaces/contracts so development can happen concurrently.

---

# CRITICAL ARCHITECTURAL REQUIREMENT

The modules must NOT become isolated applications.

Design shared infrastructure for:

- ActivityEvent
- XP
- streaks
- achievements
- notes
- tags
- notifications
- analytics
- user preferences

For example:

Workout completed
→ ActivityEvent
→ XP
→ streak update
→ PR detection
→ achievement check
→ goal progress
→ report data

Book completed
→ ActivityEvent
→ XP
→ goal progress
→ achievement check
→ timeline
→ weekly recap

Transaction created
→ ActivityEvent
→ budget recalculation
→ warning
→ timeline
→ financial report

Habit completed
→ ActivityEvent
→ streak update
→ XP
→ goal progress
→ timeline

---

# DEVELOPMENT PLAN REQUIREMENT

After designing the architecture, produce a dependency-aware implementation plan specifically optimized for three developers working simultaneously.

For every task identify:

- owner
- dependencies
- files/modules affected
- interface/API contract
- estimated effort
- whether it can be done independently
- integration point

Create a parallel work graph.

Use this structure:

PHASE 0 — Shared foundation
↓
PHASE 1A — Developer A
PHASE 1B — Developer B
PHASE 1C — Developer C
↓
PHASE 2 — Integration
↓
PHASE 3 — Cross-module intelligence
↓
PHASE 4 — UI polish
↓
PHASE 5 — Demo

Explicitly identify where developers may conflict when editing the same files.

---

# HACKATHON PRINCIPLE

We are intentionally building a broad MVP.

Do not eliminate features merely because the feature list is large.

Instead:
- simplify implementation
- use deterministic rules where AI is unnecessary
- use adapters for external APIs
- use reusable components
- keep database models straightforward
- create good interfaces between modules
- implement shallow versions of broad features before deepening individual features

The goal is for the application to contain all major modules while making the most important flows feel polished.

At the end, provide:

1. Complete architecture
2. Database schema
3. API contracts
4. Component architecture
5. Developer A task list
6. Developer B task list
7. Developer C task list
8. Shared integration contracts
9. Dependency graph
10. Hour-by-hour parallel development plan
11. Integration checklist
12. Demo flow
13. Definition of done

DO NOT implement code yet.