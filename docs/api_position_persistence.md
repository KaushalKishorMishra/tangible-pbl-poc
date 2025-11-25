# Graph Node Position Persistence API

## Overview
This document describes the API endpoints needed to save and retrieve graph node positions. This allows the frontend to persist the layout after users have arranged nodes using the ForceAtlas2 algorithm.

## Use Case
1. User loads graph for the first time → nodes are positioned using ForceAtlas2 algorithm
2. User (or system) saves the layout → positions are stored in backend
3. User returns later → positions are loaded from backend, maintaining the same visual layout

---

## API Endpoints

### 1. Save Node Positions

**Endpoint**: `POST /api/graph/positions`

**Description**: Saves the x,y coordinates for all nodes in a graph.

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <token> (if authentication is required)
```

**Request Body**:
```json
{
  "graphId": "string",
  "positions": {
    "nodeId1": {
      "x": 123.45,
      "y": 678.90
    },
    "nodeId2": {
      "x": 234.56,
      "y": 789.01
    }
  },
  "metadata": {
    "layoutAlgorithm": "forceatlas2",
    "savedAt": "2025-11-24T12:00:00Z",
    "savedBy": "userId" 
  }
}
```

**Request Body Schema**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `graphId` | string | Yes | Unique identifier for the graph |
| `positions` | object | Yes | Map of nodeId to {x, y} coordinates |
| `positions[nodeId].x` | number | Yes | X coordinate (can be negative) |
| `positions[nodeId].y` | number | Yes | Y coordinate (can be negative) |
| `metadata` | object | No | Additional context about the save |
| `metadata.layoutAlgorithm` | string | No | Algorithm used (e.g., "forceatlas2") |
| `metadata.savedAt` | string (ISO 8601) | No | Timestamp of save |
| `metadata.savedBy` | string | No | User who saved the layout |

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "message": "Positions saved successfully",
  "graphId": "string",
  "nodeCount": 14,
  "savedAt": "2025-11-24T12:00:00Z"
}
```

**Response (Error - 400 Bad Request)**:
```json
{
  "success": false,
  "error": "Invalid request",
  "message": "Missing required field: graphId"
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "success": false,
  "error": "Graph not found",
  "message": "No graph exists with id: xyz"
}
```

---

### 2. Get Node Positions

**Endpoint**: `GET /api/graph/positions/:graphId`

**Description**: Retrieves saved positions for a specific graph.

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `graphId` | string | Yes | Unique identifier for the graph |

**Request Headers**:
```
Authorization: Bearer <token> (if authentication is required)
```

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "graphId": "string",
  "positions": {
    "nodeId1": {
      "x": 123.45,
      "y": 678.90
    },
    "nodeId2": {
      "x": 234.56,
      "y": 789.01
    }
  },
  "metadata": {
    "layoutAlgorithm": "forceatlas2",
    "savedAt": "2025-11-24T12:00:00Z",
    "savedBy": "userId"
  }
}
```

**Response (No positions saved - 404 Not Found)**:
```json
{
  "success": false,
  "error": "Positions not found",
  "message": "No saved positions for graph: xyz"
}
```

---

### 3. Delete Node Positions (Optional)

**Endpoint**: `DELETE /api/graph/positions/:graphId`

**Description**: Deletes saved positions for a graph (useful for resetting layout).

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `graphId` | string | Yes | Unique identifier for the graph |

**Response (Success - 200 OK)**:
```json
{
  "success": true,
  "message": "Positions deleted successfully",
  "graphId": "string"
}
```

---

## Database Schema Suggestion

### Table: `graph_node_positions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID/INT | PRIMARY KEY | Unique identifier |
| `graph_id` | VARCHAR(255) | NOT NULL, INDEX | Graph identifier |
| `node_id` | VARCHAR(255) | NOT NULL | Node identifier |
| `x` | DECIMAL(10,2) | NOT NULL | X coordinate |
| `y` | DECIMAL(10,2) | NOT NULL | Y coordinate |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Composite Index**: `(graph_id, node_id)` for fast lookups

**Alternative**: Store as JSON blob
```sql
CREATE TABLE graph_layouts (
  id UUID PRIMARY KEY,
  graph_id VARCHAR(255) NOT NULL UNIQUE,
  positions JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Notes

### For Backend Developer

1. **Validation**:
   - Ensure `graphId` exists in your system
   - Validate that all `nodeId`s in positions exist in the graph
   - Validate x,y are valid numbers (can be negative, can be decimals)

2. **Performance**:
   - Consider using UPSERT (INSERT ON CONFLICT UPDATE) for save operation
   - Add indexes on `graph_id` for fast retrieval
   - Consider caching frequently accessed positions

3. **Security**:
   - Verify user has permission to modify the graph
   - Sanitize input to prevent injection attacks
   - Rate limit save operations to prevent abuse

4. **Versioning** (Optional but recommended):
   - Consider storing multiple versions of layouts
   - Allow users to revert to previous layouts
   - Track who made changes and when

---

## Example Workflows

### Workflow 1: First Time Load
```
1. Frontend requests graph data: GET /api/graph/:graphId
2. Frontend requests positions: GET /api/graph/positions/:graphId
3. Backend returns 404 (no positions saved)
4. Frontend runs ForceAtlas2 algorithm to position nodes
5. User clicks "Save Layout" button
6. Frontend sends positions: POST /api/graph/positions
7. Backend saves positions and returns success
```

### Workflow 2: Subsequent Load
```
1. Frontend requests graph data: GET /api/graph/:graphId
2. Frontend requests positions: GET /api/graph/positions/:graphId
3. Backend returns saved positions
4. Frontend applies positions directly (no layout algorithm needed)
5. Graph displays instantly with saved layout
```

### Workflow 3: Reset Layout
```
1. User clicks "Reset Layout" button
2. Frontend sends: DELETE /api/graph/positions/:graphId
3. Backend deletes saved positions
4. Frontend re-runs ForceAtlas2 algorithm
5. New layout is displayed
```

---

## Testing Checklist

- [ ] Save positions for a graph with 1 node
- [ ] Save positions for a graph with 100+ nodes
- [ ] Retrieve positions for existing graph
- [ ] Retrieve positions for non-existent graph (should return 404)
- [ ] Update positions for graph that already has saved positions
- [ ] Delete positions for a graph
- [ ] Verify positions persist after server restart
- [ ] Test with negative coordinates
- [ ] Test with decimal coordinates
- [ ] Test concurrent saves (race conditions)
