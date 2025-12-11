# AI-Powered Skill Map Generation

This feature uses Google's Gemini AI to automatically generate custom skill maps based on course questionnaire responses.

## Setup

1. **Get Google AI API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create or sign in to your account
   - Generate a new API key

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your API key to `.env`:
     ```
     VITE_GOOGLE_AI_API_KEY=your_actual_api_key_here
     ```

3. **Install Dependencies** (if not already done)
   ```bash
   npm install @google/genai
   ```

## How It Works

### 1. Course Questionnaire
The AI assistant asks 6 questions to gather course information:
- Course title
- Learning objectives/description
- Duration
- Difficulty level
- Target audience
- Main technical focus

### 2. AI Generation
After completing the questionnaire, the system:
- Sends course data to Google's Gemini AI model
- Generates 30-60 skill nodes with appropriate levels (Awareness, Application, Mastery)
- Creates meaningful relationships between skills (PREREQUISITE, PART_OF, etc.)
- Organizes skills into logical categories

### 3. Output Format
The AI generates data in the exact same format as `nodes.json` and `filters.json`:

**Graph Data Structure:**
```json
{
  "nodesCount": 45,
  "relationshipsCount": 67,
  "nodes": [
    {
      "id": "0",
      "labels": ["Skill"],
      "properties": {
        "level": "Awareness",
        "name": "JavaScript",
        "source": "Full-Stack Web Development",
        "category": "Core Concepts"
      }
    }
  ],
  "relationships": [
    {
      "id": "0",
      "type": "PREREQUISITE",
      "start": "0",
      "end": "1",
      "properties": {
        "mandatory": true,
        "rationale": "Node.js requires JavaScript"
      }
    }
  ]
}
```

**Filter Data Structure:**
```json
{
  "level": ["Awareness", "Application", "Mastery"],
  "source": ["Full-Stack Web Development"],
  "category": ["Core Concepts", "Tools", "Frameworks"],
  "relationshipType": ["PREREQUISITE", "PART_OF", ...],
  "name": ["JavaScript", "React", "Node.js", ...]
}
```

## Implementation Details

### Files Created/Modified

1. **`src/services/aiGraphGenerator.ts`** (NEW)
   - `AIGraphGenerator` class handles AI interactions
   - Builds structured prompts with course data
   - Validates and formats AI responses
   - Generates filter data from nodes

2. **`src/components/Educator/AICourseCreation.tsx`** (MODIFIED)
   - Added AI generation state management
   - Integrated `generateGraphWithAI()` function
   - Shows loading state during generation
   - Passes generated data to SkillMapGraph

3. **`src/components/Educator/SkillMapGraph.tsx`** (MODIFIED)
   - Accepts optional `graphData` prop
   - Falls back to static `nodes.json` if no data provided
   - Seamlessly handles both static and AI-generated data

### Relationship Types
The AI uses these valid relationship types:
- `PREREQUISITE` - Skill A must be learned before skill B
- `PART_OF` - Skill A is a component of skill B
- `BROADENS` - Skill B expands on skill A
- `SPECIALIZES` - Skill B is a specialized form of skill A
- `DERIVES_FROM` - Skill B is derived from skill A
- `CONFLICTS_WITH` - Skills are incompatible
- `COMPLEMENTS` - Skills work well together
- `ALIAS_OF` - Different names for same concept
- `EQUIVALENT_TO` - Skills are equivalent
- `SUPERSEDED_BY` - Skill A replaced by skill B
- `ALTERNATIVE_TO` - Different approaches to same goal
- `CO_OCCURS_WITH` - Skills often used together
- `SIMILAR_TO` - Skills are similar
- `REQUIRES_POLICY` - Skill requires specific policy
- `ANTIPATTERN_OF` - Bad practice version of skill

### Skill Levels
- **Awareness (40%)** - Basic understanding, familiarity
- **Application (40%)** - Practical usage, implementation
- **Mastery (20%)** - Advanced expertise, optimization

## Usage

1. Navigate to the AI Course Creation interface
2. Answer the 6 questionnaire questions
3. Wait 10-30 seconds for AI generation
4. Explore the custom skill map on the right side
5. Use filters, search, and controls to navigate

## Troubleshooting

**Error: "Google AI API key not found"**
- Make sure you created `.env` file
- Verify `VITE_GOOGLE_AI_API_KEY` is set
- Restart the dev server after adding the key

**Error: "Failed to generate skill graph"**
- Check your internet connection
- Verify API key is valid
- Check browser console for detailed error messages

**Generated graph looks wrong**
- The AI generates based on course description
- Provide more detailed answers in the questionnaire
- Try regenerating by refreshing and starting over

## API Costs

- Google Gemini API has a free tier
- Each generation uses ~1500-2000 tokens
- Free tier: 15 requests per minute, 1,500 per day
- Check [pricing](https://ai.google.dev/pricing) for current limits

## Future Enhancements

- [ ] Allow manual editing of generated graph
- [ ] Save/export generated skill maps
- [ ] Compare multiple course designs
- [ ] Suggest learning paths through the skill map
- [ ] Integration with LMS systems
