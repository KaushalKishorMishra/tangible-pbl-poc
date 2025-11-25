# Backend Implementation Guide - Graph Position Persistence

## Overview
This guide provides detailed implementation instructions for the graph position persistence API endpoints. The frontend team has already created the API service layer and expects these exact endpoint contracts.

---

## Table of Contents
1. [API Endpoints Summary](#api-endpoints-summary)
2. [Database Schema](#database-schema)
3. [Implementation Examples](#implementation-examples)
4. [Security Considerations](#security-considerations)
5. [Performance Optimization](#performance-optimization)
6. [Testing](#testing)

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/graph/positions` | Save node positions | Yes (recommended) |
| GET | `/api/graph/positions/:graphId` | Retrieve saved positions | Yes (recommended) |
| DELETE | `/api/graph/positions/:graphId` | Delete saved positions | Yes (recommended) |

---

## Database Schema

### Option 1: Normalized Table (Recommended for large graphs)

```sql
CREATE TABLE graph_node_positions (
    id SERIAL PRIMARY KEY,
    graph_id VARCHAR(255) NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    x DECIMAL(10, 2) NOT NULL,
    y DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Composite unique constraint
    UNIQUE KEY unique_graph_node (graph_id, node_id),
    
    -- Indexes for performance
    INDEX idx_graph_id (graph_id),
    INDEX idx_node_id (node_id)
);

-- Metadata table (optional but recommended)
CREATE TABLE graph_layout_metadata (
    id SERIAL PRIMARY KEY,
    graph_id VARCHAR(255) NOT NULL UNIQUE,
    layout_algorithm VARCHAR(50),
    saved_by VARCHAR(255),
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_graph_id (graph_id)
);
```

### Option 2: JSON Blob (Simpler, good for smaller graphs)

```sql
CREATE TABLE graph_layouts (
    id SERIAL PRIMARY KEY,
    graph_id VARCHAR(255) NOT NULL UNIQUE,
    positions JSON NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_graph_id (graph_id)
);
```

**Recommendation**: Use Option 2 (JSON) for simplicity unless you have graphs with 1000+ nodes.

---

## Implementation Examples

### Node.js + Express + PostgreSQL

```javascript
const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Middleware for authentication (implement based on your auth system)
const authenticate = (req, res, next) => {
  // Your authentication logic here
  // Example:
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  // Verify token and attach user to req.user
  next();
};

// Middleware for graph access validation
const validateGraphAccess = async (req, res, next) => {
  const { graphId } = req.params;
  const userId = req.user?.id; // From authentication middleware
  
  // Verify user has access to this graph
  // This depends on your application's permission model
  // Example:
  // const hasAccess = await checkUserGraphAccess(userId, graphId);
  // if (!hasAccess) {
  //   return res.status(403).json({ 
  //     success: false, 
  //     error: 'Forbidden',
  //     message: 'You do not have access to this graph'
  //   });
  // }
  
  next();
};

/**
 * POST /api/graph/positions
 * Save node positions for a graph
 */
router.post('/api/graph/positions', authenticate, async (req, res) => {
  const { graphId, positions, metadata } = req.body;
  
  // Validation
  if (!graphId) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'Missing required field: graphId'
    });
  }
  
  if (!positions || typeof positions !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Invalid request',
      message: 'Missing or invalid field: positions'
    });
  }
  
  // Validate positions structure
  for (const [nodeId, pos] of Object.entries(positions)) {
    if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: `Invalid position for node ${nodeId}: x and y must be numbers`
      });
    }
  }
  
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Using JSON blob approach (Option 2)
      const query = `
        INSERT INTO graph_layouts (graph_id, positions, metadata, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (graph_id) 
        DO UPDATE SET 
          positions = EXCLUDED.positions,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      await client.query(query, [
        graphId,
        JSON.stringify(positions),
        JSON.stringify(metadata || {})
      ]);
      
      await client.query('COMMIT');
      
      res.status(200).json({
        success: true,
        message: 'Positions saved successfully',
        graphId,
        nodeCount: Object.keys(positions).length,
        savedAt: new Date().toISOString()
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error saving positions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to save positions'
    });
  }
});

/**
 * GET /api/graph/positions/:graphId
 * Retrieve saved positions for a graph
 */
router.get('/api/graph/positions/:graphId', authenticate, validateGraphAccess, async (req, res) => {
  const { graphId } = req.params;
  
  try {
    const query = 'SELECT positions, metadata FROM graph_layouts WHERE graph_id = $1';
    const result = await pool.query(query, [graphId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Positions not found',
        message: `No saved positions for graph: ${graphId}`
      });
    }
    
    const row = result.rows[0];
    
    res.status(200).json({
      success: true,
      graphId,
      positions: row.positions,
      metadata: row.metadata
    });
    
  } catch (error) {
    console.error('Error retrieving positions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve positions'
    });
  }
});

/**
 * DELETE /api/graph/positions/:graphId
 * Delete saved positions for a graph
 */
router.delete('/api/graph/positions/:graphId', authenticate, validateGraphAccess, async (req, res) => {
  const { graphId } = req.params;
  
  try {
    const query = 'DELETE FROM graph_layouts WHERE graph_id = $1';
    const result = await pool.query(query, [graphId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Positions not found',
        message: `No saved positions for graph: ${graphId}`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Positions deleted successfully',
      graphId
    });
    
  } catch (error) {
    console.error('Error deleting positions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete positions'
    });
  }
});

module.exports = router;
```

### Python + FastAPI + PostgreSQL

```python
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Dict, Optional
from datetime import datetime
import asyncpg
import json

router = APIRouter()

# Database connection pool
async def get_db_pool():
    return await asyncpg.create_pool(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )

# Pydantic models
class NodePosition(BaseModel):
    x: float
    y: float

class PositionMetadata(BaseModel):
    layoutAlgorithm: Optional[str] = None
    savedAt: Optional[str] = None
    savedBy: Optional[str] = None

class SavePositionsRequest(BaseModel):
    graphId: str = Field(..., min_length=1)
    positions: Dict[str, NodePosition]
    metadata: Optional[PositionMetadata] = None

class SavePositionsResponse(BaseModel):
    success: bool
    message: str
    graphId: str
    nodeCount: int
    savedAt: str

class GetPositionsResponse(BaseModel):
    success: bool
    graphId: str
    positions: Dict[str, NodePosition]
    metadata: Optional[PositionMetadata] = None

# Dependency for authentication
async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Your authentication logic here
    # Return user object
    pass

# Dependency for graph access validation
async def validate_graph_access(graph_id: str, user = Depends(get_current_user)):
    # Your authorization logic here
    # Raise HTTPException if user doesn't have access
    pass

@router.post("/api/graph/positions", response_model=SavePositionsResponse)
async def save_positions(
    request: SavePositionsRequest,
    user = Depends(get_current_user),
    pool = Depends(get_db_pool)
):
    """Save node positions for a graph"""
    
    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                query = """
                    INSERT INTO graph_layouts (graph_id, positions, metadata, updated_at)
                    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                    ON CONFLICT (graph_id) 
                    DO UPDATE SET 
                        positions = EXCLUDED.positions,
                        metadata = EXCLUDED.metadata,
                        updated_at = CURRENT_TIMESTAMP
                """
                
                positions_json = json.dumps({
                    k: {"x": v.x, "y": v.y} 
                    for k, v in request.positions.items()
                })
                
                metadata_json = json.dumps(
                    request.metadata.dict() if request.metadata else {}
                )
                
                await conn.execute(
                    query,
                    request.graphId,
                    positions_json,
                    metadata_json
                )
        
        return SavePositionsResponse(
            success=True,
            message="Positions saved successfully",
            graphId=request.graphId,
            nodeCount=len(request.positions),
            savedAt=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save positions"
        )

@router.get("/api/graph/positions/{graph_id}", response_model=GetPositionsResponse)
async def get_positions(
    graph_id: str,
    user = Depends(get_current_user),
    access = Depends(validate_graph_access),
    pool = Depends(get_db_pool)
):
    """Retrieve saved positions for a graph"""
    
    try:
        async with pool.acquire() as conn:
            query = "SELECT positions, metadata FROM graph_layouts WHERE graph_id = $1"
            row = await conn.fetchrow(query, graph_id)
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No saved positions for graph: {graph_id}"
                )
            
            positions = json.loads(row['positions'])
            metadata = json.loads(row['metadata']) if row['metadata'] else None
            
            return GetPositionsResponse(
                success=True,
                graphId=graph_id,
                positions=positions,
                metadata=metadata
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve positions"
        )

@router.delete("/api/graph/positions/{graph_id}")
async def delete_positions(
    graph_id: str,
    user = Depends(get_current_user),
    access = Depends(validate_graph_access),
    pool = Depends(get_db_pool)
):
    """Delete saved positions for a graph"""
    
    try:
        async with pool.acquire() as conn:
            query = "DELETE FROM graph_layouts WHERE graph_id = $1"
            result = await conn.execute(query, graph_id)
            
            if result == "DELETE 0":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No saved positions for graph: {graph_id}"
                )
            
            return {
                "success": True,
                "message": "Positions deleted successfully",
                "graphId": graph_id
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete positions"
        )
```

---

## Security Considerations

### 1. Authentication
```javascript
// Always verify the user is authenticated
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};
```

### 2. Authorization
```javascript
// Verify user has access to the specific graph
const validateGraphAccess = async (req, res, next) => {
  const { graphId } = req.params || req.body;
  const userId = req.user.id;
  
  // Check if user owns the graph or has been granted access
  const hasAccess = await db.query(
    'SELECT 1 FROM graph_permissions WHERE graph_id = $1 AND user_id = $2',
    [graphId, userId]
  );
  
  if (hasAccess.rows.length === 0) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'You do not have access to this graph'
    });
  }
  
  next();
};
```

### 3. Input Validation
```javascript
// Validate and sanitize all inputs
const validatePositions = (positions) => {
  if (!positions || typeof positions !== 'object') {
    throw new Error('Invalid positions format');
  }
  
  for (const [nodeId, pos] of Object.entries(positions)) {
    // Validate nodeId format (prevent injection)
    if (!/^[a-zA-Z0-9_-]+$/.test(nodeId)) {
      throw new Error(`Invalid node ID: ${nodeId}`);
    }
    
    // Validate coordinates
    if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      throw new Error(`Invalid coordinates for node: ${nodeId}`);
    }
    
    // Validate coordinate ranges (optional, based on your needs)
    if (Math.abs(pos.x) > 100000 || Math.abs(pos.y) > 100000) {
      throw new Error(`Coordinates out of range for node: ${nodeId}`);
    }
  }
  
  return true;
};
```

### 4. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const positionSaveLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each user to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/api/graph/positions', positionSaveLimit, authenticate, savePositions);
```

---

## Performance Optimization

### 1. Database Indexing
```sql
-- Essential indexes
CREATE INDEX idx_graph_layouts_graph_id ON graph_layouts(graph_id);
CREATE INDEX idx_graph_layouts_updated_at ON graph_layouts(updated_at);

-- For normalized approach
CREATE INDEX idx_positions_graph_node ON graph_node_positions(graph_id, node_id);
```

### 2. Caching
```javascript
const Redis = require('redis');
const redisClient = Redis.createClient();

// Cache frequently accessed positions
router.get('/api/graph/positions/:graphId', authenticate, async (req, res) => {
  const { graphId } = req.params;
  const cacheKey = `graph:positions:${graphId}`;
  
  try {
    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // Fetch from database
    const result = await pool.query(
      'SELECT positions, metadata FROM graph_layouts WHERE graph_id = $1',
      [graphId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ /* ... */ });
    }
    
    const response = {
      success: true,
      graphId,
      positions: result.rows[0].positions,
      metadata: result.rows[0].metadata
    };
    
    // Cache for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
    
    res.json(response);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ /* ... */ });
  }
});

// Invalidate cache on save
router.post('/api/graph/positions', authenticate, async (req, res) => {
  const { graphId } = req.body;
  
  // ... save logic ...
  
  // Invalidate cache
  await redisClient.del(`graph:positions:${graphId}`);
  
  // ... return response ...
});
```

### 3. Batch Operations (for normalized schema)
```javascript
// If using normalized schema, use batch inserts
const saveBatchPositions = async (graphId, positions) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Delete existing positions
    await client.query('DELETE FROM graph_node_positions WHERE graph_id = $1', [graphId]);
    
    // Batch insert new positions
    const values = [];
    const params = [];
    let paramIndex = 1;
    
    for (const [nodeId, pos] of Object.entries(positions)) {
      values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`);
      params.push(graphId, nodeId, pos.x, pos.y);
      paramIndex += 4;
    }
    
    if (values.length > 0) {
      const query = `
        INSERT INTO graph_node_positions (graph_id, node_id, x, y)
        VALUES ${values.join(', ')}
      `;
      await client.query(query, params);
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

---

## Testing

### Unit Tests (Jest + Supertest)
```javascript
const request = require('supertest');
const app = require('../app');

describe('Graph Position API', () => {
  let authToken;
  const testGraphId = 'test-graph-001';
  
  beforeAll(async () => {
    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' });
    authToken = response.body.token;
  });
  
  describe('POST /api/graph/positions', () => {
    it('should save positions successfully', async () => {
      const response = await request(app)
        .post('/api/graph/positions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          graphId: testGraphId,
          positions: {
            'node1': { x: 10.5, y: 20.3 },
            'node2': { x: 30.1, y: 40.7 }
          },
          metadata: {
            layoutAlgorithm: 'forceatlas2'
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.nodeCount).toBe(2);
    });
    
    it('should return 400 for missing graphId', async () => {
      const response = await request(app)
        .post('/api/graph/positions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          positions: { 'node1': { x: 10, y: 20 } }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/graph/positions')
        .send({
          graphId: testGraphId,
          positions: { 'node1': { x: 10, y: 20 } }
        });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/graph/positions/:graphId', () => {
    it('should retrieve saved positions', async () => {
      const response = await request(app)
        .get(`/api/graph/positions/${testGraphId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.positions).toBeDefined();
    });
    
    it('should return 404 for non-existent graph', async () => {
      const response = await request(app)
        .get('/api/graph/positions/non-existent-graph')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('DELETE /api/graph/positions/:graphId', () => {
    it('should delete positions successfully', async () => {
      const response = await request(app)
        .delete(`/api/graph/positions/${testGraphId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
```

### Integration Test Checklist
- [ ] Save positions for graph with 1 node
- [ ] Save positions for graph with 100+ nodes
- [ ] Save positions with negative coordinates
- [ ] Save positions with decimal coordinates
- [ ] Retrieve positions for existing graph
- [ ] Retrieve positions for non-existent graph (404)
- [ ] Update existing positions (upsert)
- [ ] Delete positions
- [ ] Verify positions persist after server restart
- [ ] Test concurrent saves (race conditions)
- [ ] Test with invalid authentication
- [ ] Test with unauthorized access
- [ ] Test rate limiting
- [ ] Test with malformed data

---

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Indexes created
- [ ] Environment variables configured
- [ ] Authentication/Authorization implemented
- [ ] Rate limiting configured
- [ ] Error logging set up
- [ ] Monitoring/alerts configured
- [ ] API documentation published
- [ ] Load testing completed
- [ ] Backup strategy in place

---

## API Contract Summary

The frontend expects **exactly** these response formats:

### Success Response (Save)
```json
{
  "success": true,
  "message": "Positions saved successfully",
  "graphId": "string",
  "nodeCount": 14,
  "savedAt": "2025-11-24T12:00:00Z"
}
```

### Success Response (Get)
```json
{
  "success": true,
  "graphId": "string",
  "positions": {
    "nodeId": { "x": 123.45, "y": 678.90 }
  },
  "metadata": {
    "layoutAlgorithm": "forceatlas2",
    "savedAt": "2025-11-24T12:00:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human readable message"
}
```

**Important**: The frontend service expects these exact field names and structure. Do not deviate from this contract.
