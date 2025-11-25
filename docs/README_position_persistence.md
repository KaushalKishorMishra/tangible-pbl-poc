# Graph Position Persistence - Complete Guide

## 📚 Documentation Overview

This folder contains complete documentation for implementing graph node position persistence.

### For Backend Developers
📄 **[API Position Persistence](./api_position_persistence.md)**
- Complete API specification with endpoints
- Request/Response schemas
- Database schema suggestions
- Implementation notes and testing checklist

### For Frontend Developers
📄 **[Frontend Integration Guide](./frontend_position_integration.md)**
- Step-by-step integration examples
- Usage patterns and best practices
- Auto-save implementation
- Mock service for testing

---

## 🚀 Quick Start

### Backend Setup
1. Read [api_position_persistence.md](./api_position_persistence.md)
2. Implement the 3 endpoints:
   - `POST /api/graph/positions` - Save positions
   - `GET /api/graph/positions/:graphId` - Get positions
   - `DELETE /api/graph/positions/:graphId` - Delete positions
3. Set up database table (schema provided in docs)
4. Test using the provided checklist

### Frontend Setup
1. Set environment variable:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

2. Use the service (already created at `src/services/graphPositionService.ts`):
   ```typescript
   import { getGraphPositions, saveGraphPositions } from './services/graphPositionService';
   
   // Load positions
   const positions = await getGraphPositions('graph-id');
   
   // Save positions
   await saveGraphPositions({
     graphId: 'graph-id',
     positions: { nodeId: { x: 10, y: 20 } }
   });
   ```

3. See [frontend_position_integration.md](./frontend_position_integration.md) for complete examples

---

## 📁 Files Created

```
src/
├── services/
│   └── graphPositionService.ts    # API service layer (✅ Created)
└── ...

docs/
├── api_position_persistence.md           # Backend API spec (✅ Created)
├── frontend_position_integration.md      # Frontend guide (✅ Created)
└── README_position_persistence.md        # This file
```

---

## 🔄 Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     First Time Load                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Frontend: GET /api/graph/positions/:graphId             │
│ 2. Backend: Returns 404 (no positions saved)               │
│ 3. Frontend: Runs ForceAtlas2 to position nodes            │
│ 4. User: Clicks "Save Layout"                              │
│ 5. Frontend: POST /api/graph/positions                     │
│ 6. Backend: Saves positions to database                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Subsequent Loads                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Frontend: GET /api/graph/positions/:graphId             │
│ 2. Backend: Returns saved positions                        │
│ 3. Frontend: Applies positions directly                    │
│ 4. Graph displays instantly with saved layout              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Benefits

1. **Consistent Layout**: Users see the same graph layout every time
2. **Faster Load**: No need to run layout algorithm on subsequent loads
3. **User Control**: Users can save their preferred arrangement
4. **Collaboration**: Teams can share the same graph layout
5. **Performance**: Reduces client-side computation

---

## 🧪 Testing

### Backend Testing
Use the checklist in [api_position_persistence.md](./api_position_persistence.md#testing-checklist)

### Frontend Testing
```bash
# 1. Start your backend server
npm run server

# 2. Start the frontend
npm run dev

# 3. Test the flow:
# - Load graph (should use ForceAtlas2)
# - Click "Save Layout" button
# - Refresh page
# - Graph should load with saved positions
```

---

## 🔧 Environment Variables

```env
# .env
VITE_API_BASE_URL=http://localhost:3000

# .env.production
VITE_API_BASE_URL=https://api.yourapp.com
```

---

## 📞 Next Steps

1. **Backend Developer**: 
   - Implement the 3 API endpoints
   - Set up database
   - Test with provided examples

2. **Frontend Developer**:
   - Review integration examples
   - Add "Save Layout" button to UI
   - Test with mock service first
   - Connect to real API when ready

3. **Both**:
   - Coordinate on `graphId` format
   - Agree on authentication method
   - Test end-to-end flow

---

## 💡 Tips

- Start with the mock service for frontend development
- Use localStorage as fallback if API is unavailable
- Consider auto-save for better UX (see integration guide)
- Add loading states for better user feedback
- Implement proper error handling

---

## 🐛 Troubleshooting

**Issue**: Positions not saving
- Check network tab for API errors
- Verify `VITE_API_BASE_URL` is correct
- Check backend logs

**Issue**: Positions not loading
- Verify `graphId` matches between save and load
- Check if positions exist in database
- Verify API returns correct format

**Issue**: Graph looks wrong after loading positions
- Verify all nodeIds in positions match actual nodes
- Check if coordinate system is correct (Sigma uses any coordinate system)
- Ensure positions are numbers, not strings

---

## 📖 Additional Resources

- [React Sigma Documentation](https://sim51.github.io/react-sigma/)
- [Graphology Documentation](https://graphology.github.io/)
- [ForceAtlas2 Algorithm](https://github.com/gephi/gephi/wiki/Force-Atlas-2)
