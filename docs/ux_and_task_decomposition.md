Below is a **complete UX wireframe sequence** followed by a **full task decomposition**.
Everything is written in a clean, product-spec style so you can hand it directly to design or engineering teams.

If you want, I can also turn this into **Mermaid wireframes**, **Figma-ready node lists**, or a **Jira ticket breakdown**.

---

# **UX WIREFRAME SEQUENCE (SCREEN-BY-SCREEN)**

This is a **linear wireframe specification** describing:

1. Layout
2. Components visible
3. Actions available
4. Expected transitions

You can translate this directly into Figma frames.

---

# **1. Onboarding & Orientation**

## **Screen 1: Persona Selection**

**Layout**

* Title: “Choose your role”
* Cards: Educator / Learner / Admin
* “Educator” card highlighted on hover.

**Actions**

* Click “Educator” → Continue

**Transitions**
→ Go to Guided Tour Intro

---

## **Screen 2: Guided Tour – Intro**

**Layout**

* Header: Welcome Educator
* Multi-step tour menu on left:

  * What is a Skill Map?
  * Skill Nodes & Levels
  * Courses & Skills Relationship
  * Learner Progress Visualization
* Right side: visual graphic of a graph network.

**Actions**

* Next / Skip / Back

**Transitions**
→ Step 1, 2, 3, 4 → Complete Onboarding → Dashboard

---

# **2. Skill-Based Course Planning**

## **Screen 3: Educator Dashboard**

**Layout**

* Top Bar: Home, My Courses, Skill Map, Settings
* CTA Button: “Create Course / Program”
* Cards: Past courses, analytics snapshots.

**Actions**

* Click “Create Course / Program”

**Transitions**
→ Course Type Modal

---

## **Screen 4: Create Course Modal**

**Layout**

* Two options:

  * “Design using Skill Map”
  * “Start from Template”
* CTA: Continue

**Actions**

* Click “Design using Skill Map” → Continue

**Transitions**
→ Skill Map Builder

---

## **Screen 5: Skill Map Builder**

**Layout**

* Left Panel: Domain Filters (AI, Data, Product, Communication…)
* Center: Zoomable skill graph (Google Maps style)
* Node tooltips: Name, Description, Target Levels
* Right Panel: Learning Outcomes List (initially empty)

**Actions**

* Filter, zoom, click nodes, add to outcomes
* Set target level (dropdown: Awareness → Influence)
* Remove items from outcomes list

**Transitions**
→ "Structure Course" Button

---

# **3. Module & Simulation Design**

## **Screen 6: Course Structure Builder**

**Layout**

* Left: Learning Outcomes List
* Center: Module/Week timeline grid
* Right: Simulation Suggestions Panel

**Interactions**

* Drag skill → Week 1/Module 1
* System suggests:

  * Recommended PBL scenarios
  * “Create Your Own Simulation” button

**Simulation Creation Modal**

* Skill tags auto-filled
* Rubric viewer on right side
* Inputs for task description, deliverables, scoring rules

**Transitions**
→ Save Module → Next Step (Content Tagging)

---

# **4. Content Tagging & Publishing**

## **Screen 7: Module Detail View**

**Layout**

* Tabs: Content | Skills Covered | Rubric
* “Skills Covered” tab shows:

  * List of skill tags
  * Add/Remove Skill button
  * Search box

**If skill not found**
→ “Request New Skill” modal

**Transitions**
→ Publish Button

---

## **Screen 8: Publish Review**

**Layout**

* Summary:

  * Course metadata
  * Modules
  * Skills covered
* Warning sections:

  * “Pending Skills”
  * “Unassigned Outcomes”
  * “Unlinked Simulation”

**Actions**

* Confirm Publish

**Transitions**
→ Learners can now view course

---

# **5. Evaluation Flow**

## **Screen 9: Submissions Review**

**Layout**

* Table:

  * Learner
  * Submission Type
  * Skill Suggestions (badges: Awareness/Application/…)
  * Status: Pending / Reviewed
* Sidebar:

  * Selected submission details
  * Auto-suggested levels
  * Override dropdowns
  * Feedback textbox

**Actions**

* Approve suggested skill levels
* Bulk approve

**Transitions**
→ Skill Map updated for learners

---

# **6. Cohort Monitoring**

## **Screen 10: Cohort Skill Map**

**Layout**

* Left: cohort picker + time filter
* Center: aggregated skill map (heatmap shading)
* Right: Skill detail panel for selected node:

  * Distribution bars
  * List of learners below target

**Actions**

* Filter by domain
* Filter by target level
* Click node to view learners

---

# **7. Gap Analysis & Curriculum Adjustment**

## **Screen 11: Role Alignment Map**

**Layout**

* Left: select role
* Center: skill map with:

  * Green = covered by course
  * Grey = role-required, not covered (gap)
  * Red = cohort underperforming
* Right: Recommendations Panel:

  * Suggested simulations
  * Suggested micro-modules

**Actions**

* Add module or simulation
* Edit existing module

**Transitions**
→ Update course structure

---

# **TASK DECOMPOSITION (PRODUCT + ENGINEERING)**

Below is a hierarchical breakdown (EPIC → Feature → Task).

---

# **EPIC 1: Educator Onboarding**

### **Feature 1.1: Persona Selection**

* Implement persona selection screen.
* Store persona = educator in DB.
* Redirect to tour.

### **Feature 1.2: Guided Tour**

* Create 4-step onboarding flow.
* Build map visualization demo.
* Track completion analytics.

---

# **EPIC 2: Skill Map-Based Course Planning**

### **Feature 2.1: Skill Map Explorer**

Tasks:

* Build zoomable map UI.
* Implement domain filter logic.
* Add node hover + click card with rubrics.
* Add “Add to Outcomes” action.

### **Feature 2.2: Outcome Builder**

Tasks:

* Build right side list with CRUD actions.
* Add target-level selector.
* Associate outcomes with course draft entity.

---

# **EPIC 3: Course Structure & Simulation Design**

### **Feature 3.1: Module Builder**

Tasks:

* Drag-and-drop skills → modules/weeks grid.
* Auto-generate module placeholders.
* Add module detail drawer.

### **Feature 3.2: Simulation Suggestion Engine**

Tasks:

* Query simulations by matching skills.
* Rank suggestions.
* Build UI panel.

### **Feature 3.3: Simulation Creator**

Tasks:

* Auto-fill skill tags.
* Load corresponding rubrics.
* Form for task, deliverables, scoring.
* Save simulation to DB.

---

# **EPIC 4: Content Tagging & Publishing**

### **Feature 4.1: Skills Covered UI**

Tasks:

* Add skill tag list (CRUD)
* Add search UX
* Integrate request-new-skill modal

### **Feature 4.2: Publish Flow**

Tasks:

* Validate unlinked outcomes
* Display pending skills
* Confirm publish
* Update course visibility

---

# **EPIC 5: Learner Evaluation & Skill Updating**

### **Feature 5.1: Submissions Queue**

Tasks:

* Build submissions table
* Sorting and filters
* Sidebar detail viewer

### **Feature 5.2: Auto-Level Suggestion**

Tasks:

* Implement rubric scoring → level mapping
* Confidence weighting
* Override functionality

### **Feature 5.3: Evidence Creation**

Tasks:

* Create skill evidence node
* Link evidence to user and skill

---

# **EPIC 6: Cohort Monitoring**

### **Feature 6.1: Aggregated Skill Map**

Tasks:

* Compute aggregated learner-skill stats
* Heatmap shading logic
* Node detail drawer with learner list

### **Feature 6.2: Filtering & Analytics**

Tasks:

* Time filters
* Domain filters
* Export analytics snapshot (optional)

---

# **EPIC 7: Role Alignment & Gap Analysis**

### **Feature 7.1: Course-to-Role Overlay**

Tasks:

* Compare course outcomes vs role skills
* Visualize skill map with color-coded nodes

### **Feature 7.2: Recommendations Engine**

Tasks:

* Suggest simulations for missing skills
* Suggest small modules or resources
* Update course structure on acceptance

---

# **EPIC 8: Graph Data Layer (System Actions)**

### **Feature 8.1: Graph Relationship Handling**

Tasks:

* Course → Skill (COVERS)
* Module/Simulation → Skill (ASSESS)
* User → Skill (HAS_SKILL)
* Evidence nodes
* Role → Skill (REQUIRES)

### **Feature 8.2: Caching & Performance**

Tasks:

* Dashboard cache for cohort maps
* Precomputed skill-level summaries
* Index skill graph for fast search
