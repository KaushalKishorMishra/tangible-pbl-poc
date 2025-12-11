# Skill Map Modal Design

## Overview
The Educator Interface has been redesigned to improve the skill map visualization experience. The previous design showed a split-screen layout with the chat on the left and a basic card-based skill view on the right. The new design uses a **modal-based approach** with proper graph node rendering using Sigma.js.

## Previous Design Issues

### Layout Problems
- Split screen (50/50) reduced usable space for both chat and visualization
- The "Skill Map Visualization" placeholder appeared on the right side
- Skills were rendered as static cards in a grid, not as actual graph nodes
- No proper graph visualization with nodes and edges

### Code Issues
```
// Old approach - just cards, no actual graph nodes
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {graphSkills.map((skill, index) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
      <p className="font-medium text-blue-900">{skill}</p>
    </div>
  ))}
</div>
```

## New Design Solution

### Key Improvements

1. **Full-Width Chat Interface**
   - Chat now uses the full width for better readability
   - More space for conversation and skill suggestions
   - Cleaner, less cluttered interface

2. **Modal-Based Skill Map**
   - Skills visualization opens in a large modal overlay
   - Modal takes up 11/12 width and 5/6 height of the screen
   - Provides dedicated space for proper graph visualization
   - Can be toggled on/off as needed

3. **Actual Graph Node Rendering**
   - Uses Sigma.js properly with `SkillGraphRenderer` component
   - Renders skills as actual nodes in a circular layout
   - Creates edges between nodes to show relationships
   - Interactive graph with proper positioning

4. **Skills Summary Bar**
   - Compact banner at top of chat showing skill count
   - Quick-access button to open the skill map modal
   - Visible when skills are added

### Component Structure

```
EducatorInterface
├── Header (when not started)
│   └── Settings menu for role switching
├── ChatInterface (full width)
│   ├── Skills Summary Bar (conditional)
│   ├── Message List
│   │   └── Skill Selection Buttons
│   └── Input Area
└── SkillMapModal (overlay)
    ├── Modal Header
    │   ├── Title & Stats
    │   └── Action Buttons
    └── Modal Content
        ├── Graph Visualization (Sigma.js)
        │   └── SkillGraphRenderer
        └── Skills List Sidebar
            ├── Skill Items (removable)
            └── Next Steps Card
```

## Technical Implementation

### SkillGraphRenderer Component
```typescript
// Renders actual graph nodes inside Sigma.js
const SkillGraphRenderer: React.FC<{ skills: string[] }> = ({ skills }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  useEffect(() => {
    // Clear and rebuild graph
    graph.clear();
    
    // Add nodes in circular layout
    skills.forEach((skill, index) => {
      const angle = (index / skills.length) * 2 * Math.PI;
      graph.addNode(skill, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        size: 15,
        label: skill,
        color: "#3B82F6"
      });
    });
    
    // Add edges between nodes
    // ...
  }, [skills, sigma, graph]);
};
```

### SkillMapModal Component
```typescript
// Large modal overlay for skill visualization
const SkillMapModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  skills: string[];
  onRemoveSkill: (skill: string) => void;
}> = ({ isOpen, onClose, skills, onRemoveSkill }) => {
  // Fixed overlay with large modal
  // Contains GraphContainer with SkillGraphRenderer
  // Plus sidebar with skill list and actions
};
```

## User Experience Flow

1. **Initial State**
   - User sees clean, centered chat interface
   - AI assistant ready to help create courses

2. **Adding Skills**
   - User describes course topic
   - AI suggests skills with clickable buttons
   - Skills added one-by-one or all at once

3. **Skills Summary**
   - Banner appears showing skill count
   - "View Skill Map" button becomes available

4. **Viewing Skill Map**
   - Click "View Skill Map" button
   - Modal opens with full graph visualization
   - Nodes rendered in circular layout with connections
   - Sidebar shows list view of all skills

5. **Managing Skills**
   - Remove skills via X button in sidebar
   - Graph updates in real-time
   - Close modal to return to chat

## Benefits

### For Educators
- ✅ Clearer visualization of skill relationships
- ✅ More space to work with course design
- ✅ Easy to toggle between chat and visualization
- ✅ Better overview of entire skill map

### For Development
- ✅ Proper use of Sigma.js library
- ✅ Cleaner component separation
- ✅ Better state management
- ✅ More maintainable code structure

### For UX
- ✅ Less visual clutter
- ✅ Focus on one task at a time
- ✅ Larger visualization area when needed
- ✅ Responsive and intuitive controls

## Future Enhancements

### Possible Additions
1. **Graph Layouts**
   - Hierarchical layout for prerequisite skills
   - Force-directed layout for complex relationships
   - Custom positioning with drag-and-drop

2. **Skill Relationships**
   - Mark prerequisite dependencies
   - Group related skills visually
   - Show difficulty levels with color coding

3. **Export Options**
   - Download skill map as image
   - Export to PDF for documentation
   - Share link to interactive view

4. **Collaboration**
   - Multiple educators working on same map
   - Comments and annotations on skills
   - Version history of skill map changes

## Code Location
- Main file: `src/components/Educator/EducatorInterface.tsx`
- Graph container: `src/components/Graph/GraphContainer.tsx`
- Uses: `@react-sigma/core` for graph rendering