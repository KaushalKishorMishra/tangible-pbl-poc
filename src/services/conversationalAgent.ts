import OpenAI from "openai";
import { useTokenStore } from "../store/tokenStore";
import type { CourseData, Problem } from "../store/graphStore";

interface Question {
	key: string;
	question: string;
	placeholder?: string;
	options?: string[];
}



export class ConversationalAgent {
	private openai: OpenAI;
	private questions: Question[];
	private collectedData: Partial<CourseData> = {};
	private currentQuestionIndex = 0;
	private conversationHistory: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
	private isInRefinementMode = false;
	private generatedGraphContext: string | null = null;

	constructor(apiKey: string, questions: Question[]) {
		this.openai = new OpenAI({ 
            apiKey: apiKey,
            dangerouslyAllowBrowser: true 
        });
		this.questions = questions;
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

	/**
	 * Initialize the chat session
	 */
	async initialize(): Promise<string> {
        // Clear history on init
        this.conversationHistory = [
            { role: "system", content: "You are a helpful AI course design assistant." }
        ];

		// Create initial greeting with first question
		const firstQuestion = this.questions[0];
		const greeting = `Hello! I'm your AI course design assistant. I'll help you create a skill-mapped course tailored to your needs. Let's start by gathering some information.\n\n${firstQuestion?.question || "Let's create your course! What would you like to name it?"}`;
		
		this.conversationHistory.push({ role: "assistant", content: greeting });
		return greeting;
	}

	/**
	 * Send user's response and get AI's next question or clarification
	 */
	async sendMessage(
		userMessage: string
	): Promise<{
		aiResponse: string;
		needsClarification: boolean;
		collectedData: Partial<CourseData>;
		isComplete: boolean;
	}> {
		if (this.conversationHistory.length === 0) {
			await this.initialize();
		}

		// Store user message in history
		this.conversationHistory.push({ role: "user", content: userMessage });

		// Store the user's answer for the current question
		const currentQuestion = this.questions[this.currentQuestionIndex];
		if (currentQuestion) {
			this.collectedData[currentQuestion.key as keyof CourseData] = userMessage;
		}

		// Build context prompt for AI to analyze response
		const analysisPrompt = this.buildAnalysisPrompt(currentQuestion, userMessage);

        // We don't want to add the analysis prompt to the permanent history visible to the user, 
        // but we need the AI to see it. 
        // However, the previous implementation seemed to send it as a message.
        // Let's stick to the pattern: User sends message -> AI analyzes and responds.
        // But here we are injecting a prompt *about* the user's message.
        
        // To keep it simple and stateless-ish with OpenAI:
        // We'll send the history + the analysis instruction as the last user message?
        // No, the user message is already added.
        // Let's append a system instruction for this specific turn or just rely on the AI to be smart.
        
        // The previous code sent `analysisPrompt` INSTEAD of `userMessage` to the chat model?
        // `this.chat!.sendMessage({ message: analysisPrompt });`
        // Yes. So the model saw the analysis prompt.
        
        // Let's replicate that behavior:
        // We'll create a temporary messages array for this call.
        const messagesForCall = [
            ...this.conversationHistory.slice(0, -1), // All history except the last user message we just added
            { role: "user" as const, content: analysisPrompt } // Replace last user message with analysis prompt
        ];

		const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messagesForCall
        });

        this.logTokenUsage(response);

		const aiResponse = response.choices[0].message.content || "";

		// Check if we should move to next question or need clarification
		const needsClarification = this.detectClarificationNeeded(aiResponse);
		
		if (!needsClarification) {
			this.currentQuestionIndex++;
			// If not the last question, ask next one
			if (this.currentQuestionIndex < this.questions.length) {
				const nextQuestion = this.questions[this.currentQuestionIndex];
				const nextPrompt = `Great! ${nextQuestion.question}`;
				this.conversationHistory.push({ role: "assistant", content: nextPrompt });
				return {
					aiResponse: nextPrompt,
					needsClarification: false,
					collectedData: { ...this.collectedData },
					isComplete: false,
				};
			}
		}

		this.conversationHistory.push({ role: "assistant", content: aiResponse });

		const isComplete = this.currentQuestionIndex >= this.questions.length;

		return {
			aiResponse,
			needsClarification,
			collectedData: { ...this.collectedData },
			isComplete,
		};
	}

	/**
	 * Build analysis prompt for AI
	 */
	private buildAnalysisPrompt(question: Question | undefined, userResponse: string): string {
		if (!question) return userResponse;

		return `The user was asked: "${question.question}"
Their response: "${userResponse}"

Analyze this response:
1. If the response is clear and complete, respond with just "OK"
2. If the response is vague or incomplete, ask a brief clarifying question (under 20 words)

Your response:`;
	}

	/**
	 * Generate final context for graph generation
	 */
	async generateGraphContext(): Promise<string> {
		const conversationSummary = this.conversationHistory
			.map((msg) => `${msg.role}: ${msg.content}`)
			.join("\n");

		const contextPrompt = `Based on this conversation about creating a course:

${conversationSummary}

Provide a detailed summary (under 150 words) focusing on:
- Key technologies and concepts mentioned
- Learning progression and structure
- Specific tools or frameworks
- Target audience needs
- Any unique requirements

Summary:`;

		const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: contextPrompt }]
        });

        this.logTokenUsage(response);

		const contextStr = response.choices[0].message.content || "";
		this.generatedGraphContext = contextStr;
		return contextStr;
	}

	/**
	 * Enter refinement mode after graph generation
	 */
	async enterRefinementMode(graphData: { nodesCount: number; relationshipsCount: number }): Promise<string> {
		this.isInRefinementMode = true;
		const refinementPrompt = `Great! I've successfully generated a skill map for "${this.collectedData.title}" with ${graphData.nodesCount} skills and ${graphData.relationshipsCount} connections.

Would you like to:
- Refine or adjust any aspects of the skill map?
- Add more skills or learning paths?
- Modify the complexity or depth of certain topics?
- Get explanations about specific skill connections?
- Export or share the skill map?

How would you like to proceed?`;

		this.conversationHistory.push({ role: "assistant", content: refinementPrompt });
		return refinementPrompt;
	}

	/**
	 * Handle refinement conversation after graph generation
	 */
	async refineGraph(userRequest: string): Promise<{
		aiResponse: string;
		refinementAction?: "add_content" | "update_content" | "add_sub_content" | "add_resource" | "modify_depth" | "adjust_connections" | "explain" | "export" | "regenerate" | "confirm_regenerate" | "none";
		refinementDetails?: string;
		shouldRegenerateGraph?: boolean;
		needsConfirmation?: boolean;
        structuralChanges?: any;
	}> {
		this.conversationHistory.push({ role: "user", content: userRequest });

		const refinementPrompt = `User wants to refine their skill map. Course: "${this.collectedData.title}"

Previous context:
${this.generatedGraphContext || ""}

User's refinement request: "${userRequest}"

Analyze what the user wants to do:
- If they want to ADD content/topics: Acknowledge what they want to add and ask if they'd like to update the map.
- If they want to UPDATE existing content: Acknowledge the change and ask if they want to update the map.
- If they want to ADD sub-content/break down topics: Acknowledge and ask if they want to update the map.
- If they want to ADD resources (videos, links): Acknowledge and ask if they want to update the map.
- If they want to MODIFY depth/complexity: Acknowledge the change and ask if they want to update the map.
- If they want to ADJUST connections: Acknowledge and ask if they'd like to regenerate with updated relationships.
- If they just want EXPLANATIONS: Provide clear explanations without asking about regeneration.
- If they want to EXPORT/share: Guide them through options.
- If they explicitly say "yes", "regenerate", "update", "generate": Confirm you'll update the map.

IMPORTANT: If the user wants to make a specific structural change (add/update/delete nodes or resources), please include a JSON block at the end of your response in the following format:
\`\`\`json
{
  "action": "add_content" | "update_content" | "add_sub_content" | "add_resource",
  "details": { ... }
}
\`\`\`

Respond naturally and helpfully as a course design assistant.`;

        // We send the refinement prompt as the user message for this turn
        const messagesForCall = [
            ...this.conversationHistory.slice(0, -1),
            { role: "user" as const, content: refinementPrompt }
        ];

		const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messagesForCall
        });

        this.logTokenUsage(response);

		const aiResponse = response.choices[0].message.content || "I'm here to help you refine your skill map. What would you like to change?";

		this.conversationHistory.push({ role: "assistant", content: aiResponse });

		// Detect refinement action type
		const actionType = this.detectRefinementAction(userRequest, aiResponse);
		const shouldRegenerate = this.shouldRegenerateGraph(userRequest, aiResponse, actionType);
		const needsConfirmation = this.needsRegenerationConfirmation(userRequest, actionType);

        // Extract structural changes if present
        let structuralChanges = null;
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            try {
                structuralChanges = JSON.parse(jsonMatch[1]);
            } catch (e) {
                console.error("Failed to parse structural changes JSON:", e);
            }
        }

		return {
			aiResponse: aiResponse.replace(/```json\n[\s\S]*?\n```/, "").trim(),
			refinementAction: actionType,
			refinementDetails: userRequest,
			shouldRegenerateGraph: shouldRegenerate,
			needsConfirmation,
            structuralChanges
		};
	}

	/**
	 * Detect what type of refinement the user wants
	 */
	private detectRefinementAction(userRequest: string, _aiResponse: string): "add_content" | "update_content" | "add_sub_content" | "add_resource" | "modify_depth" | "adjust_connections" | "explain" | "export" | "regenerate" | "none" {
		const lowerRequest = userRequest.toLowerCase();

		if (lowerRequest.includes("add") || lowerRequest.includes("new topic") || lowerRequest.includes("new content")) {
			return "add_content";
		}
		if (lowerRequest.includes("update") || lowerRequest.includes("change content") || lowerRequest.includes("modify content")) {
			return "update_content";
		}
		if (lowerRequest.includes("sub-content") || lowerRequest.includes("break down") || lowerRequest.includes("sub-topic")) {
			return "add_sub_content";
		}
		if (lowerRequest.includes("resource") || lowerRequest.includes("link") || lowerRequest.includes("url") || lowerRequest.includes("video")) {
			return "add_resource";
		}
		if (lowerRequest.includes("depth") || lowerRequest.includes("detail") || lowerRequest.includes("simplify") || lowerRequest.includes("complex")) {
			return "modify_depth";
		}
		if (lowerRequest.includes("connection") || lowerRequest.includes("relationship") || lowerRequest.includes("link")) {
			return "adjust_connections";
		}
		if (lowerRequest.includes("regenerate") || lowerRequest.includes("rebuild") || lowerRequest.includes("recreate")) {
			return "regenerate";
		}
		if (lowerRequest.includes("explain") || lowerRequest.includes("why") || lowerRequest.includes("how") || lowerRequest.includes("what") || lowerRequest.includes("tell me")) {
			return "explain";
		}
		if (lowerRequest.includes("export") || lowerRequest.includes("share") || lowerRequest.includes("download")) {
			return "export";
		}

		return "none";
	}

	/**
	 * Determine if graph should be regenerated based on user request and AI response
	 */
	private shouldRegenerateGraph(userRequest: string, _aiResponse: string, actionType: string): boolean {
		const lowerRequest = userRequest.toLowerCase();

		// Only regenerate on explicit user confirmation
		const confirmationKeywords = [
			"yes", "yeah", "sure", "ok", "okay", "please",
			"regenerate", "generate", "update it", "do it",
			"go ahead", "proceed", "confirm"
		];

		// Check if it's an explicit regeneration command
		if (actionType === "regenerate" || actionType === "confirm_regenerate") {
			return true;
		}

		// Check for confirmation keywords
		const isConfirmation = confirmationKeywords.some(keyword => lowerRequest.includes(keyword));
		
		return isConfirmation;
	}

	/**
	 * Check if the request needs regeneration confirmation
	 */
	private needsRegenerationConfirmation(_userRequest: string, actionType: string): boolean {
		// These actions should prompt for confirmation
		return actionType === "add_content" || 
               actionType === "update_content" ||
               actionType === "add_sub_content" ||
               actionType === "add_resource" ||
		       actionType === "modify_depth" || 
		       actionType === "adjust_connections";
	}

	/**
	 * Check if agent is in refinement mode
	 */
	getIsInRefinementMode(): boolean {
		return this.isInRefinementMode;
	}

	/**
	 * Detect if AI is asking for clarification
	 */
	private detectClarificationNeeded(aiResponse: string): boolean {
		const clarificationIndicators = [
			"can you clarify",
			"could you elaborate",
			"can you be more specific",
			"what do you mean",
			"tell me more about",
			"can you explain",
		];

		const lowerResponse = aiResponse.toLowerCase();
		return clarificationIndicators.some((indicator) =>
			lowerResponse.includes(indicator)
		);
	}

	/**
	 * Get current collected data
	 */
	getCollectedData(): Partial<CourseData> {
		return { ...this.collectedData };
	}

	/**
	 * Get current question index
	 */
	getCurrentQuestionIndex(): number {
		return this.currentQuestionIndex;
	}

	/**
	 * Get chat history (useful for debugging)
	 */
	getChatHistory() {
		return this.conversationHistory;
	}

	/**
	 * Reset the conversation
	 */
	reset(): void {
		this.collectedData = {};
		this.currentQuestionIndex = 0;
		this.conversationHistory = [];
		this.isInRefinementMode = false;
		this.generatedGraphContext = null;
	}
	/**
	 * Generate 5 distinct problems based on the collected course data
	 */
	async generateProblems(): Promise<Problem[]> {
		const prompt = `Based on the course "${this.collectedData.title}" and the context gathered so far, generate 5 distinct, real-world problems or projects that a student could solve to demonstrate their mastery of the material.

		Requirements:
		1. Problems should vary in complexity but fit within the course level (${this.collectedData.level}).
		2. Each problem should be authentic and "hands-on".
		3. Provide a title, brief description, difficulty level, estimated time, specific learning goals, and constraints.

		Response format (MUST be valid JSON array):
		{
			"problems": [
				{
					"id": "1",
					"title": "Problem Title",
					"description": "Brief description of the problem...",
					"difficulty": "Beginner/Intermediate/Advanced",
					"estimatedTime": "2 hours",
					"goals": ["Goal 1", "Goal 2"],
					"constraints": ["Constraint 1", "Constraint 2"]
				}
			]
		}
		
		Return ONLY the JSON object containing the "problems" array.`;

		try {
			const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    ...this.conversationHistory,
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            this.logTokenUsage(response);

			const text = response.choices[0].message.content || "{}";
			const parsed = JSON.parse(text);
			return parsed.problems || [];
		} catch (error) {
			console.error("Error generating problems:", error);
			throw new Error("Failed to generate problems");
		}
	}
}
