import { GoogleGenAI } from "@google/genai";

interface Question {
	key: string;
	question: string;
	placeholder?: string;
	options?: string[];
}

interface CourseData {
	title: string;
	description: string;
	duration: string;
	level: string;
	targetAudience: string;
	mainFocus: string;
}

export class ConversationalAgent {
	private ai: GoogleGenAI;
	private chat: ReturnType<typeof this.ai.chats.create> | null = null;
	private questions: Question[];
	private collectedData: Partial<CourseData> = {};
	private currentQuestionIndex = 0;
	private conversationHistory: Array<{ role: "user" | "model"; content: string }> = [];
	private isInRefinementMode = false;
	private generatedGraphContext: string | null = null;

	constructor(apiKey: string, questions: Question[]) {
		this.ai = new GoogleGenAI({ apiKey });
		this.questions = questions;
	}

	/**
	 * Initialize the chat session
	 */
	async initialize(): Promise<string> {
		this.chat = this.ai.chats.create({
			model: "gemini-2.5-flash",
		});

		// Create initial greeting with first question
		const firstQuestion = this.questions[0];
		const greeting = `Hello! I'm your AI course design assistant. I'll help you create a skill-mapped course tailored to your needs. Let's start by gathering some information.\n\n${firstQuestion?.question || "Let's create your course! What would you like to name it?"}`;
		
		this.conversationHistory.push({ role: "model", content: greeting });
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
		if (!this.chat) {
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

		// Send message to chat using sendMessage method
		const response = await this.chat!.sendMessage({ message: analysisPrompt });
		const aiResponse = response.text || "";

		// Check if we should move to next question or need clarification
		const needsClarification = this.detectClarificationNeeded(aiResponse);
		
		if (!needsClarification) {
			this.currentQuestionIndex++;
			// If not the last question, ask next one
			if (this.currentQuestionIndex < this.questions.length) {
				const nextQuestion = this.questions[this.currentQuestionIndex];
				const nextPrompt = `Great! ${nextQuestion.question}`;
				this.conversationHistory.push({ role: "model", content: nextPrompt });
				return {
					aiResponse: nextPrompt,
					needsClarification: false,
					collectedData: { ...this.collectedData },
					isComplete: false,
				};
			}
		}

		this.conversationHistory.push({ role: "model", content: aiResponse });

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
		if (!this.chat) {
			return "";
		}

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

		const response = await this.chat.sendMessage({ message: contextPrompt });
		const contextStr = response.text || "";
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

		this.conversationHistory.push({ role: "model", content: refinementPrompt });
		return refinementPrompt;
	}

	/**
	 * Handle refinement conversation after graph generation
	 */
	async refineGraph(userRequest: string): Promise<{
		aiResponse: string;
		refinementAction?: "add_skills" | "modify_depth" | "adjust_connections" | "explain" | "export" | "none";
		refinementDetails?: string;
	}> {
		if (!this.chat) {
			throw new Error("Chat session not initialized");
		}

		this.conversationHistory.push({ role: "user", content: userRequest });

		const refinementPrompt = `User wants to refine their skill map. Course: "${this.collectedData.title}"

Previous context:
${this.generatedGraphContext || ""}

User's refinement request: "${userRequest}"

Analyze what the user wants to do and provide helpful guidance. If they want to:
- Add skills: Ask what topics/skills to add
- Modify depth: Ask which areas need more/less detail
- Adjust connections: Ask what relationships to change
- Explain: Provide clear explanations of skill connections
- Export/share: Guide them through options

Respond naturally and helpfully as a course design assistant.`;

		const response = await this.chat.sendMessage({ message: refinementPrompt });
		const aiResponse = response.text || "I'm here to help you refine your skill map. What would you like to change?";

		this.conversationHistory.push({ role: "model", content: aiResponse });

		// Detect refinement action type
		const actionType = this.detectRefinementAction(userRequest, aiResponse);

		return {
			aiResponse,
			refinementAction: actionType,
			refinementDetails: userRequest,
		};
	}

	/**
	 * Detect what type of refinement the user wants
	 */
	private detectRefinementAction(userRequest: string, _aiResponse: string): "add_skills" | "modify_depth" | "adjust_connections" | "explain" | "export" | "none" {
		const lowerRequest = userRequest.toLowerCase();

		if (lowerRequest.includes("add") || lowerRequest.includes("more skills") || lowerRequest.includes("include")) {
			return "add_skills";
		}
		if (lowerRequest.includes("depth") || lowerRequest.includes("detail") || lowerRequest.includes("simplify") || lowerRequest.includes("complex")) {
			return "modify_depth";
		}
		if (lowerRequest.includes("connection") || lowerRequest.includes("relationship") || lowerRequest.includes("link")) {
			return "adjust_connections";
		}
		if (lowerRequest.includes("explain") || lowerRequest.includes("why") || lowerRequest.includes("how") || lowerRequest.includes("what")) {
			return "explain";
		}
		if (lowerRequest.includes("export") || lowerRequest.includes("share") || lowerRequest.includes("download")) {
			return "export";
		}

		return "none";
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
		return this.chat?.getHistory() || [];
	}

	/**
	 * Reset the conversation
	 */
	reset(): void {
		this.chat = null;
		this.collectedData = {};
		this.currentQuestionIndex = 0;
		this.conversationHistory = [];
		this.isInRefinementMode = false;
		this.generatedGraphContext = null;
	}
}
