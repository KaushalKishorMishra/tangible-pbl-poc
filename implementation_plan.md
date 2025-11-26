# Node Hover Info Implementation Plan

## Goal Description
Implement a feature to display detailed information about a node's connections when hovered. This includes listing all connected edges, their direction (incoming/outgoing), the connected node, and edge properties.

## User Review Required
> [!NOTE]
> I will create a `NodeHoverInfo` component.
> It will appear as a panel (e.g., top-right or bottom-right) when a node is hovered.
> It will list:
> - **Outgoing Edges**: "-> [Target Node] : [Relationship Type] (Properties)"
> - **Incoming Edges**: "<- [Source Node] : [Relationship Type] (Properties)"

## Proposed Changes

### Components
#### [NEW] `src/components/Graph/NodeHoverInfo.tsx`
- Uses `useRegisterEvents` to listen to `enterNode` and `leaveNode`.
- Uses `useSigma` to access the graph instance.
- Maintains state for the currently hovered node and its edges.
- Renders a panel with the formatted information.

#### [MODIFY] `src/App.tsx`
- Import and add `NodeHoverInfo` to the `GraphContainer`.

## Verification Plan

### Manual Verification
- Hover over a node.
- Verify a panel appears showing connected edges.
- Check if direction and properties are correct.
- Move mouse away, panel should disappear (or persist until another node is hovered? User said "when i hover", usually implies transient).
