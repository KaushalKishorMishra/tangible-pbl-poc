# Educator Flow User Guide

## Overview

This guide explains how the **AI-Driven Course Creation Flow** works in the Tangible PBL platform. The new implementation combines conversational AI with interactive skill mapping to create an intuitive course design experience.

---

## Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Role Selection Screen                     │
│                     (Choose Educator)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Educator Dashboard                        │
│  • Quick Stats (Courses, Learners, Progress)                │
│  • Create Course Button ──────────────────┐                 │
│  • Manage Courses                         │                 │
│  • Learner Analytics                      │                 │
└───────────────────────────────────────────┼─────────────────┘
                                            │
                                            ▼
                    ┌───────────────────────────────────┐
                    │   AI Course Creation Flow          │
                    └───────────────────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
            Phase 1: Chat           Phase 2: Mapping      Phase 3: Review
        (Full Screen)           (20% Chat / 80% Graph)    (Coming Soon)
```

---

## Phase 1: Conversational Data Collection

### What Happens

When you click **"Create Course"** from the dashboard, you enter an AI-driven chat interface that asks you questions one by one.

### Questions Asked

1. **Course Title**
   - Example: "Full-Stack Web Development with Node.js"
   - Purpose: Names your course

2. **Course Description**
   - Example: "Students will learn to build modern web applications using Node.js, Express, and databases"
   - Purpose: Defines learning outcomes and scope

3. **Duration**
   - Example: "12 weeks", "3 months", "6 weeks"
   - Purpose: Sets course timeline

4. **Difficulty Level** (Quick Reply Buttons)
   - Options: Beginner | Intermediate | Advanced
   - Purpose: Targets appropriate audience

5. **Target Audience**
   - Example: "Computer science students, career changers, junior developers"
   - Purpose: Helps tailor content complexity

6. **Main Technical Focus**
   - Example: "Backend Development", "Node.js", "JavaScript", "Full-Stack"
   - Purpose: **CRITICAL** - Determines which skills are shown in the map

### User Experience

- ✅ One question at a time (no overwhelming forms)
- ✅ AI responds naturally with context
- ✅ Typing indicators show AI is "thinking"
- ✅ Quick-reply buttons for multiple choice questions
- ✅ Enter key to submit text answers
- ✅ Progress indicator shows "Question X of 6"

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [AI Icon] AI Course Designer       Question 1 of 6     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [AI] Hello! I'm your AI course design assistant...     │
│                                                          │
│       [You] Full-Stack Web Development                  │
│                                                          │
│  [AI] Great! Can you describe what learners will...     │
│                                                          │
│       [Input Box]  Type your answer...        [Send]    │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 2: Skill Mapping Visualization

### Transition

After answering all 6 questions, the interface **automatically transitions**:

**Before:**
- Chat takes 100% of screen width

**After:**
- Chat shrinks to **20%** (left side)
- Skill map appears at **80%** (right side)

### Smart Category Filtering

The system analyzes your "Main Technical Focus" answer and automatically selects relevant skill categories:

| Your Input Contains | Categories Shown |
|---------------------|------------------|
| "JavaScript" or "JS" | JavaScript, Backend, Node Core |
| "Node" or "Backend" | Node Core, Backend |
| "Async" | Async, JavaScript |
| "Database" or "DB" | Database, Backend |
| "Testing" | Testing |
| "API" | API Development, Backend |
| *Default (no match)* | JavaScript, Backend, Node Core |

### Skill Map Features

#### Visual Indicators

**Color Coding:**
- 🟢 **Green nodes** = Awareness level skills
- 🔵 **Blue nodes** = Application level skills
- 🟣 **Purple nodes** = Mastery level skills
- ⚪ **Gray nodes** = Other/unclassified

**Node Connections:**
- Lines between nodes show relationships (prerequisites, specializations, etc.)

#### Interactive Elements

1. **Course Overview Card** (Top Right)
   - Shows all collected data:
     - Title
     - Level
     - Duration
     - Focus area
   - Displays skill level legend

2. **Selected Categories** (Bottom Left)
   - Shows which skill categories are currently displayed
   - Example: `JavaScript` `Backend` `Node Core`

3. **Graph Controls** (Built-in)
   - Zoom in/out
   - Pan around the map
   - Click nodes for details
   - Hover for tooltips

#### Auto-Selection

For demonstration purposes, the system automatically selects **8 relevant skills** from the filtered categories. These appear highlighted in the graph.

### Layout (Phase 2)

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│          │  ┌────────────────────────────────────────────────────────┐  │
│          │  │ Course Overview                                        │  │
│  Chat    │  │ Title: Full-Stack Web Development                      │  │
│  History │  │ Level: Intermediate | Duration: 12 weeks               │  │
│  (20%)   │  └────────────────────────────────────────────────────────┘  │
│          │                                                               │
│  [AI]    │                    🟢 JavaScript                              │
│  Perfect!│                       │                                       │
│  I've    │              🔵 Node.js ──── 🔵 Express                      │
│  mapped  │                       │                                       │
│  skills  │                    🟣 Async                                   │
│  ...     │                                                               │
│          │  ┌────────────────────────────────────────┐                  │
│          │  │ Selected Categories                    │                  │
│  [✓]     │  │ JavaScript  Backend  Node Core         │                  │
│  Done!   │  └────────────────────────────────────────┘                  │
│          │                                                               │
└──────────┴──────────────────────────────────────────────────────────────┘
     20%                              80%
```

---

## Navigation Structure

### Available Routes

From the Educator Dashboard, you can navigate to:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/educator` | EducatorDashboard | Main landing page |
| `/educator/create-course` | AICourseCreation | AI-driven course builder |
| `/educator/cohorts/:id?` | CohortSkillMap | Monitor cohort progress |
| `/educator/learners/:id/progress` | LearnerProgressTracker | Individual learner tracking |
| `/educator/evaluate/:id?` | EvaluationInterface | Assess student work |
| `/educator/role-alignment` | RoleAlignmentAnalyzer | Gap analysis tool |

### Dashboard Quick Actions

1. **Create New Course** → Takes you to AI course creation
2. **Manage Courses** → Course list (placeholder)
3. **Learner Analytics** → Cohort monitoring

---

## Data Sources

### Skills Data (`nodes.json`)

Contains **68 skills** from Node.js roadmap:
- Each skill has:
  - `id`: Unique identifier
  - `name`: Display name
  - `level`: Awareness | Application | Mastery
  - `category`: JavaScript, Backend, Testing, etc.
  - `source`: Original source document

### Filters (`filters.json`)

Defines available filter options:
- **Levels**: Awareness, Application, Mastery
- **Categories**: 22 categories (JavaScript, Backend, Database, etc.)
- **Relationship Types**: PREREQUISITE, SPECIALIZES, etc.

### How Filtering Works

1. User answers "Main Technical Focus" question
2. System extracts keywords (JavaScript, Node, Backend, etc.)
3. Matches keywords to categories in `filters.json`
4. Filters `nodes.json` to show only matching categories
5. Renders filtered skills in graph

---

## Technical Implementation

### Key Components

#### `AICourseCreation.tsx`
- Main component orchestrating the flow
- Manages conversation state
- Handles layout transitions
- Integrates with Sigma.js graph

#### `GraphLoader` (sub-component)
- Loads nodes from `nodes.json`
- Applies category filters
- Creates graph structure
- Handles relationships

### State Management

Uses Zustand store for:
- User role
- Selected node IDs
- Graph interactions
- Onboarding status

### Technologies

- **React 18** + TypeScript
- **React Router v6** for navigation
- **Sigma.js** for graph visualization
- **Graphology** for graph data structure
- **Tailwind CSS** for styling
- **Lucide React** for icons

---

## Mock Data vs Real Implementation

### Current State (Mock)

✅ **Implemented with Mock Data:**
- Question flow and conversation
- Layout transitions
- Graph visualization
- Category filtering
- Node selection

❌ **Not Yet Implemented:**
- Backend API calls
- Database persistence
- Actual course creation
- Module design integration
- Publishing workflow

### Next Steps for Production

1. **Backend Integration**
   - Create course API endpoints
   - Store course data in database
   - Persist user selections

2. **Enhanced AI**
   - Use real LLM for conversations
   - Smart skill recommendations
   - Context-aware follow-up questions

3. **Complete Wizard**
   - After skill mapping, continue to module design
   - Add simulation selection
   - Content tagging
   - Publishing review

---

## User Tips

### For Best Results

1. **Be Specific in "Main Focus"**
   - Good: "Backend Development with Node.js and Express"
   - Less ideal: "Programming"
   - Why: More specific = better skill filtering

2. **Use Keywords**
   - Include terms like: JavaScript, Node, Database, Testing, API
   - System recognizes these and shows relevant skills

3. **Experiment with Different Focus Areas**
   - Try: "Database Management and ORMs"
   - Try: "Testing and Quality Assurance"
   - Try: "Full-Stack JavaScript Development"
   - See how different skills appear!

### Keyboard Shortcuts

- `Enter` - Send message (during chat phase)
- `Mouse wheel` - Zoom graph (during mapping phase)
- `Click + Drag` - Pan around graph

---

## Troubleshooting

### Graph Not Showing

**Cause**: No categories matched your "Main Focus" input

**Solution**: 
- System falls back to default categories (JavaScript, Backend, Node Core)
- Check bottom-left "Selected Categories" panel

### Skills Not Relevant

**Cause**: Limited skill data (only Node.js roadmap currently)

**Solution**:
- This is expected behavior with current data
- Production version will have broader skill ontology

### Chat Not Progressing

**Cause**: Need to answer current question

**Solution**:
- Type answer and press Enter
- OR click quick-reply button if shown

---

## Development Notes

### Adding New Skills

Edit `/src/data/nodes.json`:
```json
{
  "id": "69",
  "labels": ["Skill"],
  "properties": {
    "level": "Application",
    "name": "Your Skill Name",
    "source": "your-source.pdf",
    "category": "Your Category"
  }
}
```

### Adding New Categories

Edit `/src/data/filters.json`:
```json
{
  "category": [
    "Existing Category",
    "Your New Category"
  ]
}
```

### Customizing Questions

Edit `AICourseCreation.tsx`:
```typescript
const questions = [
  {
    key: 'yourField',
    question: "Your question text?",
    placeholder: "Hint text..."
  }
];
```

---

## Future Enhancements

### Planned Features

1. **AI-Generated Suggestions**
   - Recommend skills based on course title
   - Suggest learning paths
   - Auto-generate module structure

2. **Collaborative Editing**
   - Multiple educators co-design courses
   - Real-time updates
   - Version control

3. **Template Library**
   - Pre-built course templates
   - Industry-standard skill sets
   - Best practice patterns

4. **Export Options**
   - PDF course outline
   - Syllabus generator
   - LMS integration

---

## Support

For questions or issues:
1. Check this guide first
2. Review `/docs/CURRENT_IMPLEMENTATION.md` for technical details
3. Contact the development team

---

**Last Updated**: After implementing AI-driven course creation flow
**Version**: 1.0
**Status**: Production-ready UI with mock data