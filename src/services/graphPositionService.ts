// API service for graph position persistence

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface NodePosition {
  x: number;
  y: number;
}

export interface GraphPositions {
  [nodeId: string]: NodePosition;
}

export interface SavePositionsRequest {
  graphId: string;
  positions: GraphPositions;
  metadata?: {
    layoutAlgorithm?: string;
    savedAt?: string;
    savedBy?: string;
  };
}

export interface SavePositionsResponse {
  success: boolean;
  message: string;
  graphId: string;
  nodeCount: number;
  savedAt: string;
}

export interface GetPositionsResponse {
  success: boolean;
  graphId: string;
  positions: GraphPositions;
  metadata?: {
    layoutAlgorithm?: string;
    savedAt?: string;
    savedBy?: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

/**
 * Save node positions to the backend
 */
export const saveGraphPositions = async (
  request: SavePositionsRequest
): Promise<SavePositionsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/graph/positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Failed to save positions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving graph positions:', error);
    throw error;
  }
};

/**
 * Get saved node positions from the backend
 */
export const getGraphPositions = async (
  graphId: string
): Promise<GetPositionsResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/graph/positions/${graphId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (response.status === 404) {
      // No positions saved yet
      return null;
    }

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Failed to get positions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting graph positions:', error);
    throw error;
  }
};

/**
 * Delete saved node positions from the backend
 */
export const deleteGraphPositions = async (graphId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/graph/positions/${graphId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Failed to delete positions');
    }
  } catch (error) {
    console.error('Error deleting graph positions:', error);
    throw error;
  }
};
