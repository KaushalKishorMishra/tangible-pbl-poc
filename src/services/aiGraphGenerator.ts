import OpenAI from "openai";
import { useTokenStore } from "../store/tokenStore";
import type { CourseData, Problem, GraphData, NodeData, RelationshipData, SkillCompetency, FilterData } from "../store/graphStore";



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
	private openai: OpenAI;

	constructor(apiKey: string) {
		this.openai = new OpenAI({ 
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Required for client-side usage
        });
	}

	private logTokenUsage(response: OpenAI.Chat.Completions.ChatCompletion) {
		if (response.usage) {
			useTokenStore.getState().logUsage({
				prompt_tokens: response.usage.prompt_tokens,
				completion_tokens: response.usage.completion_tokens,
				total_tokens: response.usage.total_tokens,
				model: response.model
			});
		}
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
			const response = await this.openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
                    { role: "system", content: "You are a helpful assistant that generates JSON data." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
			});

			this.logTokenUsage(response);

			const content = response.choices[0].message.content;
			if (!content) {
				throw new Error("No response text from AI model");
			}

            const parsedData = JSON.parse(content);

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



	async generateQuestionFlowForProblem(
		problem: Problem,
		courseData: CourseData
	): Promise<{
		graphData: GraphData;
		filterData: FilterData;
	}> {
		const prompt = `You are a Question-Based Content Structuring Agent.
		
		Problem: "${problem.title}"
		Description: "${problem.description}"
		Course Context: "${courseData.title}" (${courseData.level})

		Generate a structured flow of QUESTION-BASED CONTENT UNITS that a student needs to answer to solve this problem.
		
		IMPORTANT RULES:
		1. Nodes must be QUESTIONS (e.g., "What is X?", "How do I configure Y?", "Why use Z?").
		2. The flow should be logical: Foundation questions -> Application questions -> Advanced/Edge-case questions.
		3. Relationship type MUST be "PREREQUISITE" (answering A helps answer B).
		4. Create 7-12 question nodes.
        5. Node IDs must be sequential numbers starting from "0".
		
		Response format (MUST be valid JSON):
		{
			"nodes": [
				{
					"id": "0",
					"labels": ["Question"],
					"properties": {
						"level": "Awareness",
						"name": "What is the core concept behind...?",
						"source": "${problem.title}",
						"category": "Foundational"
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
			const response = await this.openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
                    { role: "system", content: "You are a helpful assistant that generates JSON data." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
			});

			this.logTokenUsage(response);

			const content = response.choices[0].message.content;
			if (!content) {
				throw new Error("No response text from AI model");
			}

			const parsedData = JSON.parse(content);
			const graphData = this.formatGraphData(parsedData);
			const filterData = this.generateFilters(graphData);

			return { graphData, filterData };
		} catch (error) {
			console.error("Error generating question flow:", error);
			throw new Error("Failed to generate question flow for problem");
		}
	}

    async generateCompetencyFramework(
        problem: Problem,
        courseData: CourseData
    ): Promise<SkillCompetency[]> {
        const prompt = `You are a Skills & Competency Agent.

        Problem: "${problem.title}"
        Course: "${courseData.title}"

        Identify 3-5 key skills emerging from solving this problem.
        For EACH skill, define the competency levels (Awareness, Application, Mastery, Influence) with a description, proof of work, and a brief rubric.

        Response format (MUST be valid JSON array):
        {
            "competencies": [
                {
                    "skill": "Problem Decomposition",
                    "levels": [
                        {
                            "level": "Awareness",
                            "description": "Recognizes sub-problems",
                            "proofOfWork": "Lists components",
                            "rubric": "Can identify at least 3 sub-components."
                        },
                        {
                            "level": "Application",
                            "description": "Decomposes guided problems",
                            "proofOfWork": "Structured breakdown",
                            "rubric": "Creates a valid breakdown for a standard problem."
                        },
                        {
                            "level": "Mastery",
                            "description": "Decomposes novel problems",
                            "proofOfWork": "Independent solution",
                            "rubric": "Handles complex, ambiguous problems effectively."
                        },
                        {
                            "level": "Influence",
                            "description": "Teaches decomposition",
                            "proofOfWork": "Framework or critique",
                            "rubric": "Creates new frameworks or critiques existing ones."
                        }
                    ]
                }
            ]
        }

        Return ONLY the JSON object containing the "competencies" array.`;

        try {
            const response = await this.openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
                    { role: "system", content: "You are a helpful assistant that generates JSON data." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
			});

			this.logTokenUsage(response);

            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error("No response text from AI model");
            }

            const parsed = JSON.parse(content);
            return parsed.competencies || parsed;
        } catch (error) {
            console.error("Error generating competency framework:", error);
            throw new Error("Failed to generate competency framework");
        }
    }

    async enrichNodeWithSkillsAndContent(
        nodeName: string,
        courseContext: string
    ): Promise<{
        skills: GraphData;
        competencies: SkillCompetency[];
        content: { type: 'video' | 'pdf' | 'text'; url: string; title: string; description?: string }[];
    }> {
        const prompt = `You are a Content Enrichment Agent.
        
        Topic: "${nodeName}"
        Context: "${courseContext}"

        1. Generate a mini-skill graph (5-8 nodes) specifically for this topic.
        2. Define competency levels for the main skill of this topic.
        3. Suggest 3 learning resources (1 Video, 1 PDF/Article, 1 Text explanation).

        Response format (MUST be valid JSON):
        {
            "skills": {
                "nodes": [
                    { "id": "0", "labels": ["Skill"], "properties": { "level": "Awareness", "name": "Sub-skill 1", "source": "Enrichment", "category": "Core" } }
                ],
                "relationships": [
                    { "id": "0", "type": "PREREQUISITE", "start": "0", "end": "1", "properties": {} }
                ]
            },
            "competencies": [
                {
                    "skill": "${nodeName}",
                    "levels": [
                        { "level": "Awareness", "description": "...", "proofOfWork": "...", "rubric": "..." }
                    ]
                }
            ],
            "content": [
                { "type": "video", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "title": "Intro to ${nodeName}", "description": "A comprehensive guide." },
                { "type": "pdf", "url": "https://example.com/guide.pdf", "title": "Deep Dive PDF", "description": "Technical documentation." },
                { "type": "text", "url": "", "title": "Key Concepts", "description": "Detailed explanation..." }
            ]
        }
        
        Return ONLY the JSON object.`;

        try {
            const response = await this.openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
                    { role: "system", content: "You are a helpful assistant that generates JSON data." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
			});

			this.logTokenUsage(response);

            const content = response.choices[0].message.content;
            if (!content) throw new Error("No response text");

            const parsed = JSON.parse(content);

            return {
                skills: this.formatGraphData(parsed.skills),
                competencies: parsed.competencies,
                content: parsed.content
            };
        } catch (error) {
            console.error("Error enriching node:", error);
            throw new Error("Failed to enrich node content");
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
