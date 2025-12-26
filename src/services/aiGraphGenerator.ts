import { GoogleGenAI } from "@google/genai";

interface CourseData {
	title: string;
	description: string;
	duration: string;
	level: string;
	targetAudience: string;
	mainFocus: string;
}

interface Problem {
	id: string;
	title: string;
	description: string;
	difficulty: string;
	estimatedTime: string;
}

interface NodeData {
	id: string;
	labels: string[];
	properties: {
		level: string;
		name: string;
		source: string;
		category: string;
	};
}

interface RelationshipData {
	id: string;
	type: string;
	start: string;
	end: string;
	properties: Record<string, unknown>;
}

interface GraphData {
	nodesCount: number;
	relationshipsCount: number;
	nodes: NodeData[];
	relationships: RelationshipData[];
}

interface FilterData {
	level: string[];
	source: string[];
	category: string[];
	relationshipType: string[];
	name: string[];
}

const RELATIONSHIP_TYPES = [
	"PREREQUISITE",
	"PART_OF",
	"BROADENS",
	"SPECIALIZES",
	"DERIVES_FROM",
	"CONFLICTS_WITH",
	"COMPLEMENTS",
	"ALIAS_OF",
	"EQUIVALENT_TO",
	"SUPERSEDED_BY",
	"ALTERNATIVE_TO",
	"CO_OCCURS_WITH",
	"SIMILAR_TO",
	"REQUIRES_POLICY",
	"ANTIPATTERN_OF",
];

const SKILL_LEVELS = ["Awareness", "Application", "Mastery", "Influence"];

export class AIGraphGenerator {
	private ai: GoogleGenAI;

	constructor(apiKey: string) {
		this.ai = new GoogleGenAI({ apiKey });
	}

	async generateGraphFromCourse(
		courseData: CourseData,
		conversationContext?: string
	): Promise<{
		graphData: GraphData;
		filterData: FilterData;
	}> {
		const prompt = this.buildPrompt(courseData, conversationContext);
		
		try {
			const response = await this.ai.models.generateContent({
				model: "gemini-2.5-flash-lite",
				contents: prompt,
			});

			if (!response.text) {
				throw new Error("No response text from AI model");
			}

		const jsonText = this.extractJSON(response.text);
		const parsedData = JSON.parse(jsonText);

		// Log parsed data for debugging
		console.log("Parsed data structure:", {
			hasNodes: !!parsedData.nodes,
			hasRelationships: !!parsedData.relationships,
			nodesCount: parsedData.nodes?.length,
			relationshipsCount: parsedData.relationships?.length
		});

		// Validate the parsed data structure
		if (!parsedData.nodes || !Array.isArray(parsedData.nodes)) {
			console.error("Invalid data structure. Expected 'nodes' array, got:", parsedData);
			throw new Error("AI response missing 'nodes' array. The AI might have returned an unexpected format.");
		}

		if (!parsedData.relationships || !Array.isArray(parsedData.relationships)) {
			console.error("Invalid data structure. Expected 'relationships' array, got:", parsedData);
			throw new Error("AI response missing 'relationships' array. The AI might have returned an unexpected format.");
		}

		// Validate and format the response - pass the whole parsedData, not just nodes
		const graphData = this.formatGraphData(parsedData);
		const filterData = this.generateFilters(graphData);

		return { graphData, filterData };
	} catch (error) {
		console.error("Error generating graph from AI:", error);
		if (error instanceof SyntaxError) {
			throw new Error("Failed to parse AI response as JSON. The AI might have returned malformed data.");
		}
		throw new Error("Failed to generate skill graph from course data");
		}
	}



	async generateLinearGraphForProblem(
		problem: Problem,
		courseData: CourseData
	): Promise<{
		graphData: GraphData;
		filterData: FilterData;
	}> {
		const prompt = `You are a curriculum designer creating a step-by-step study plan to solve a specific problem.
		
		Problem: "${problem.title}"
		Description: "${problem.description}"
		Course Context: "${courseData.title}" (${courseData.level})

		Generate a LINEAR sequence of 5-10 steps (nodes) that a student must follow to solve this problem.
		
		IMPORTANT RULES:
		1. The graph MUST be linear: Node 0 -> Node 1 -> Node 2 ... -> Node N.
		2. Relationship type MUST be "PREREQUISITE".
		3. Each node represents a specific task, concept, or sub-problem to solve.
		4. Node IDs must be sequential numbers starting from "0".
		
		Response format (MUST be valid JSON):
		{
			"nodes": [
				{
					"id": "0",
					"labels": ["Task"],
					"properties": {
						"level": "Application",
						"name": "Step 1: Setup Environment",
						"source": "${problem.title}",
						"category": "Setup"
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
						"mandatory": true
					}
				}
			]
		}
		
		Return ONLY the JSON object.`;

		try {
			const response = await this.ai.models.generateContent({
				model: "gemini-2.5-flash-lite",
				contents: prompt,
			});

			if (!response.text) {
				throw new Error("No response text from AI model");
			}

			const jsonText = this.extractJSON(response.text);
			const parsedData = JSON.parse(jsonText);
			const graphData = this.formatGraphData(parsedData);
			const filterData = this.generateFilters(graphData);

			return { graphData, filterData };
		} catch (error) {
			console.error("Error generating linear graph:", error);
			throw new Error("Failed to generate study plan for problem");
		}
	}

	private buildPrompt(courseData: CourseData, conversationContext?: string): string {
		const contextSection = conversationContext
			? `\n\nCONVERSATION CONTEXT:\n${conversationContext}\n\nUse this additional context from the conversation to create a more personalized and relevant skill map.\n`
			: "";

		return `You are a curriculum design expert. Based on the following course information, generate a comprehensive skill map with nodes and relationships.
${contextSection}
Course Details:
- Title: ${courseData.title}
- Description: ${courseData.description}
- Duration: ${courseData.duration}
- Level: ${courseData.level}
- Target Audience: ${courseData.targetAudience}
- Main Focus: ${courseData.mainFocus}

Generate a JSON response with nodes and relationships that represent the skill graph for this course.

IMPORTANT RULES:
1. Each node must have: id (string), labels (array with "Skill"), properties (level, name, source, category)
2. Skill levels MUST be one of: ${SKILL_LEVELS.join(", ")}
3. Relationship types MUST be one of: ${RELATIONSHIP_TYPES.join(", ")}
4. Source should be: "${courseData.title}"
5. Create 30-60 nodes representing skills, concepts, tools, and technologies
6. Create meaningful relationships between nodes (PREREQUISITE for dependencies, PART_OF for hierarchies, etc.)
7. Categories should be logical groupings (e.g., "Core Concepts", "Tools", "Frameworks", "Advanced Topics")
8. Distribute skills across levels: Awareness (40%), Application (40%), Mastery (20%)
9. Node IDs should be sequential numbers starting from "0"
10. Relationship IDs should be sequential numbers

Response format (MUST be valid JSON):
{
  "nodes": [
    {
      "id": "0",
      "labels": ["Skill"],
      "properties": {
        "level": "Awareness",
        "name": "Skill Name",
        "source": "${courseData.title}",
        "category": "Category Name"
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
        "rationale": "Why this relationship exists"
      }
    }
  ]
}

Return ONLY the JSON object, no markdown formatting or explanation.`;
	}

	private extractJSON(text: string): string {
		// Find the first '{' and the last '}'
		const start = text.indexOf('{');
		const end = text.lastIndexOf('}');

		if (start === -1 || end === -1 || start > end) {
			// If no valid JSON object structure is found, return the cleaned text
			// to let JSON.parse fail naturally, or return empty if it's just noise
			console.warn("Could not find JSON object in response text");
			return text.trim();
		}

		// Extract the JSON substring
		const jsonCandidate = text.substring(start, end + 1);
		
		// console.log("Extracted JSON candidate:", jsonCandidate);
		
		return jsonCandidate;
	}

	private formatGraphData(rawData: {
		nodes: NodeData[];
		relationships: RelationshipData[];
	}): GraphData {
		return {
			nodesCount: rawData.nodes.length,
			relationshipsCount: rawData.relationships.length,
			nodes: rawData.nodes,
			relationships: rawData.relationships,
		};
	}

	public generateFilters(graphData: GraphData): FilterData {
		const levels = new Set<string>();
		const sources = new Set<string>();
		const categories = new Set<string>();
		const names = new Set<string>();

		graphData.nodes.forEach((node) => {
			levels.add(node.properties.level);
			sources.add(node.properties.source);
			categories.add(node.properties.category);
			names.add(node.properties.name);
		});

		return {
			level: Array.from(levels).sort(),
			source: Array.from(sources).sort(),
			category: Array.from(categories).sort(),
			relationshipType: RELATIONSHIP_TYPES,
			name: Array.from(names).sort(),
		};
	}
}
