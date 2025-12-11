# **Educator User Flow (End-to-End)**

Persona: **University Lecturer / Bootcamp Instructor / Corporate L&D Trainer**
Primary Goal: **Design skill-mapped, simulation-driven courses and monitor learner progress on the skill map.**

---

# **1. Onboarding & Orientation Flow**

### Entry

Educator → Signup/Login → Selects persona: **Educator**

### Steps

1. System launches **Guided Skill Map Tour**:

   * What a Skill Graph is.
   * Concepts: skill nodes, relationships, levels (Awareness → Influence).
   * How courses, simulations, and learner progress connect to skills.

2. Educator views a **demo skill map overlay**:

   * Sample course: “AI Foundations”.
   * Sample learner progression visualisation.

### System Actions

* Assign educator role.
* Load global skill graph in read-only mode.
* Log onboarding-complete event.

---

# **2. Learning Outcome Planning via Skill Map**

### Entry

Educator Dashboard → **Create Course / Program** → Select “Design via Skill Map”

### Steps

1. Opens **Skill Map Builder Interface**:

   * Left panel: domain filters (AI, Data, Product…)
   * Center: zoomable/clustered skill map.
   * Right panel: auto-building “Learning Outcomes List”.

2. Educator:

   * Filters to relevant domains.
   * Zooms and inspects clusters (Prompt Engineering, Data Literacy, etc.).
   * Clicks nodes to see definitions + rubrics.
   * Selects skills.
   * Sets **target level** per skill (A/A/M/I).

3. System:

   * Builds the “Learning Outcomes List” on the right.

### System Actions

* Create draft course entity.
* Add course → skill relationships with target levels.

---

# **3. Designing Modules & PBL Simulations**

### Entry

Course Editor → **Structure Course**

### Steps

1. Educator sees:

   * Outcome list on left.
   * Module/week planner in center.
   * Simulation recommendations panel.

2. For each module/week:

   * Drag one or more target skills into the module timeline.
   * System suggests:

     * Existing PBL simulations aligned to those skills.
     * Option to **Create New Simulation**.

3. Creating a simulation:

   * Form auto-filled with selected skills.
   * Rubrics for those skills displayed on the side.
   * Educator sets scoring → skill-level mapping.

### System Actions

* Link module/assignments → skills with ASSESS relationship.
* Attach simulations to skills.
* Store rubric mapping rules.

---

# **4. Tagging Course Content & Publishing**

### Entry

Course Editor → **Skills Covered** for each module

### Steps

1. Educator reviews skill tags:

   * Add/remove skills.
   * Adjust expected level.

2. If skill doesn’t exist:

   * Search → No result.
   * Click **Request New Skill**:

     * Provide name, description, indicators, relationships.
   * Skill marked as **Pending** but usable.

3. Educator clicks **Publish Course**.

### System Actions

* Confirm all course → skill links.
* Store draft/pending skill metadata.
* Publish course to learner catalog.

---

# **5. Learner Evaluation & Skill Update Loop (Educator Role in Evaluation)**

### Entry

Learners submit work → Educator dashboard shows evaluations pending

### Steps (Educator side)

1. Educator reviews submissions:

   * Lesson quizzes
   * PBL simulations
   * Projects
   * AI interview results

2. System auto-suggests skill levels based on scoring & rubric mapping.

3. Educator:

   * Confirms or bulk-approves suggested levels.
   * Overrides if necessary.
   * Leaves feedback tied to specific skills.

### System Actions

* Update learner skill edges with {level, confidence, source}.
* Create evidence nodes linked to skill progress.

---

# **6. Cohort Monitoring on Skill Map**

### Entry

Course Dashboard → **Cohort Skill Map**

### Steps

1. Educator selects:

   * Cohort (e.g., “AI Bootcamp – Nov 2025”)
   * Time range (last 7 days, last 2 weeks)

2. Skill Map visualizes:

   * Node shading = % of learners meeting the target level.
   * Filters available:

     * Domain filter (AI only, Data only…)
     * Level focus (Mastery-target skills, etc.)

3. Clicking a skill node shows:

   * Awareness → Influence distribution.
   * List of learners below target.

### System Actions

* Aggregate learner skill edges.
* Cache data for dashboard performance.
* Log map interactions.

---

# **7. Gap Analysis & Curriculum Adjustment**

### Entry

Course Dashboard → **Role Alignment**

### Steps

1. Educator selects a target job role.

2. System overlays:

   * Role-required skills.
   * Skills already covered by course.
   * Skills missing (gaps).

3. Educator sees:

   * Performance gaps (cohort underperforming).
   * Skill coverage gaps (course missing role-critical skills).

4. Actions available:

   * Add micro-module or extra assignment.
   * Add recommended simulation for missing skills.
   * Adjust rubrics if expectations are too high/low.
   * Update the course structure.

### System Actions

* Compare role → skill map vs course → skill map.
* Suggest aligned content.
* Update relationships upon course revision.

---

# **Full High-Level Educator Journey Summary (Linear View)**

1. **Onboard → Learn about Skill Map**
2. **Plan course outcomes using Skill Map**
3. **Design modules & PBL simulations around skills**
4. **Tag all course content to correct skills**
5. **Publish**
6. **Evaluate learners → confirm skill levels**
7. **Monitor cohort progress on the Skill Map**
8. **Do gap analysis & refine curriculum**

This is your complete **Educator-side user flow** with all systemic and interactive details distilled from the original document.
