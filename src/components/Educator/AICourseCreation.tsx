import React, { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Settings } from "lucide-react";
import { ApiKeySetup } from "../setup/ApiKeySetup";
import { SkillMapGraph } from"./SkillMapGraph";
import { AIGraphGenerator } from"../../services/aiGraphGenerator";
import { ConversationalAgent } from"../../services/conversationalAgent";
import { useGraphStore } from"../../store/graphStore";
import {
	MessageBubble,
	TypingIndicator,
	QuickReplyOptions,
	ChatInput,
	CompletionState,
} from"./ChatComponents";

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

interface Message {
	id: string;
	content: string;
	sender:"ai" |"user";
	timestamp: Date;
}

interface CourseData {
	title: string;
	description: string;
	duration: string;
	level: string;
	targetAudience: string;
	mainFocus: string;
}

const questions = [
	{
		key:"title",
		question:"Let's create your course! What would you like to name it?",
		placeholder:"e.g., Full-Stack Web Development with Node.js",
	},
	{
		key:"description",
		question:
			"Great! Can you describe what learners will achieve in this course?",
		placeholder:
			"e.g., Students will learn to build modern web applications...",
	},
	{
		key:"duration",
		question:"How long will this course run?",
		placeholder:"e.g., 12 weeks, 3 months, 6 weeks",
	},
	{
		key:"level",
		question:"What's the difficulty level?",
		options: ["Application","Awareness","Mastery","Influence"],
	},
	{
		key:"targetAudience",
		question:"Who is this course designed for?",
		placeholder:
			"e.g., Computer science students, career changers, junior developers",
	},
	{
		key:"mainFocus",
		question:"What's the main technical focus or domain?",
		placeholder:"e.g., Backend Development, Full-Stack, JavaScript, Node.js",
	},
];

export const AICourseCreation: React.FC = () => {
	const { setAIGeneratedGraphData, setAvailableFilters } = useGraphStore();
	const [messages, setMessages] = useState<Message[]>([
		{
			id:"1",
			content:
				"Hello! I'm your AI course design assistant. I'll help you create a skill-mapped course tailored to your needs. Let's start by gathering some information.",
			sender:"ai",
			timestamp: new Date(),
		},
	]);
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [courseData, setCourseData] = useState<Partial<CourseData>>({});
	const [isComplete, setIsComplete] = useState(false);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
	const [generatedGraphData, setGeneratedGraphData] = useState<GraphData | null>(null);
	const [conversationalAgent, setConversationalAgent] = useState<ConversationalAgent | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const [apiKey, setApiKey] = useState<string>(() => {
		return localStorage.getItem("api-key") || import.meta.env.VITE_GOOGLE_AI_API_KEY || "";
	});
	const [showSetup, setShowSetup] = useState(() => {
		return !localStorage.getItem("api-key") && !import.meta.env.VITE_GOOGLE_AI_API_KEY;
	});

	// Initialize conversational agent
	useEffect(() => {
		const initAgent = async () => {
			if (apiKey) {
				try {
					const agent = new ConversationalAgent(apiKey, questions);
					setConversationalAgent(agent);
					console.log("Conversational agent initialized");
				} catch (error) {
					console.error("Error initializing conversational agent:", error);
				}
			}
		};

		initAgent();
	}, [apiKey]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
	};

	const generateGraphWithAI = useCallback(async () => {
		setIsGeneratingGraph(true);
		
		try {
			// Get API key from state
			// const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

			console.log(apiKey)
			
			if (!apiKey) {
				throw new Error("Google AI API key not found. Please complete the setup.");
			}

			// Generate enriched context from conversational agent
			let conversationContext = "";
			if (conversationalAgent) {
				try {
					conversationContext = await conversationalAgent.generateGraphContext();
					console.log("Generated conversation context:", conversationContext);
				} catch (error) {
					console.error("Error generating context:", error);
				}
			}

			const generator = new AIGraphGenerator(apiKey);
			const { graphData, filterData } = await generator.generateGraphFromCourse(
				courseData as CourseData,
				conversationContext
			);
			
			// Store generated data in local state
			setGeneratedGraphData(graphData);
			
			// Store in Zustand global store
			setAIGeneratedGraphData(graphData);
			setAvailableFilters(filterData);
			
			// Extract categories for filtering
			setSelectedCategories(filterData.category.slice(0, 5)); // Show first 5 categories by default
			
			// Add success message and enter refinement mode
			const successMessage: Message = {
				id: `success-${Date.now()}`,
				content: `✨ Success! I've generated ${graphData.nodesCount} skills and ${graphData.relationshipsCount} relationships for your course. You can now explore the skill map on the right!`,
				sender:"ai",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, successMessage]);

			// Enter refinement mode for post-generation conversation
			if (conversationalAgent) {
				setTimeout(async () => {
					const refinementPrompt = await conversationalAgent.enterRefinementMode({
						nodesCount: graphData.nodesCount,
						relationshipsCount: graphData.relationshipsCount,
					});

					const refinementMessage: Message = {
						id: `refinement-${Date.now()}`,
						content: refinementPrompt,
						sender: "ai",
						timestamp: new Date(),
					};
					setMessages((prev) => [...prev, refinementMessage]);
				}, 1500);
			}
		} catch (error) {
			console.error("Error generating graph:", error);
			
			// Add error message
			const errorMessage: Message = {
				id: `error-${Date.now()}`,
				content: `I encountered an error generating the skill map: ${error instanceof Error ? error.message :'Unknown error'}. Please make sure you have set up your Google AI API key.`,
				sender:"ai",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsGeneratingGraph(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [courseData, conversationalAgent]);

	const handleCompletion = useCallback(async () => {
		setIsTyping(true);
		setTimeout(async () => {
			const messageId = `completion-${Date.now()}-${Math.random()}`;
			const completionMessage: Message = {
				id: messageId,
				content: `Perfect! I've gathered all the information I need. Based on your course"${courseData.title}" focused on ${courseData.mainFocus}, I'm now generating a custom skill map for your curriculum. This will take a moment...`,
				sender:"ai",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, completionMessage]);
			setIsTyping(false);
			setIsComplete(true);

			// Generate graph using AI
			await generateGraphWithAI();
		}, 1000);
	}, [courseData, generateGraphWithAI]);

	const askQuestion = React.useCallback(
		(index: number) => {
			if (index >= questions.length) {
				// All questions answered
				handleCompletion();
				return;
			}

			const question = questions[index];
			setIsTyping(true);

			setTimeout(() => {
				const messageId = `ai-${Date.now()}-${Math.random()}`;
				const aiMessage: Message = {
					id: messageId,
					content: question.question,
					sender:"ai",
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, aiMessage]);
				setIsTyping(false);
			}, 800);
		},
		[handleCompletion],
	);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (currentQuestionIndex === 0) {
			// Ask first question after initial greeting
			setTimeout(() => {
				askQuestion(0);
			}, 1000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSendMessage = React.useCallback(async () => {
		if (!inputValue.trim()) return;

		const userInput = inputValue;
		setInputValue("");

		const messageId = `msg-${Date.now()}-${Math.random()}`;
		const userMessage: Message = {
			id: messageId,
			content: userInput,
			sender:"user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);

		// Use conversational agent if available
		if (conversationalAgent) {
			setIsTyping(true);
			try {
				// Check if in refinement mode (post-generation)
				if (conversationalAgent.getIsInRefinementMode()) {
					const refinementResponse = await conversationalAgent.refineGraph(userInput);
					
					setTimeout(async () => {
						const aiMessage: Message = {
							id: `ai-${Date.now()}-${Math.random()}`,
							content: refinementResponse.aiResponse,
							sender:"ai",
							timestamp: new Date(),
						};
						setMessages((prev) => [...prev, aiMessage]);
						setIsTyping(false);

						// Handle graph regeneration
						if (refinementResponse.shouldRegenerateGraph) {
							console.log("User confirmed regeneration:", refinementResponse.refinementDetails);
							
							// Add regeneration message
							setTimeout(() => {
								const regenMessage: Message = {
									id: `regen-${Date.now()}`,
									content: "🔄 Regenerating your skill map with the requested changes...",
									sender: "ai",
									timestamp: new Date(),
								};
								setMessages((prev) => [...prev, regenMessage]);
								
								// Regenerate graph with updated context
								generateGraphWithAI();
							}, 1000);
						}
					}, 800);
				} else {
					// Normal data collection flow
					const response = await conversationalAgent.sendMessage(userInput);
					
					// Update course data
					setCourseData(response.collectedData);
					setCurrentQuestionIndex(conversationalAgent.getCurrentQuestionIndex());

					// Add AI response
					setTimeout(() => {
						const aiMessage: Message = {
							id: `ai-${Date.now()}-${Math.random()}`,
							content: response.aiResponse,
							sender:"ai",
							timestamp: new Date(),
						};
						setMessages((prev) => [...prev, aiMessage]);
						setIsTyping(false);

						// Check if complete
						if (response.isComplete) {
							handleCompletion();
						}
					}, 800);
				}
			} catch (error) {
				console.error("Error in conversation:", error);
				setIsTyping(false);
				// Fallback to manual collection
				const currentQuestion = questions[currentQuestionIndex];
				if (currentQuestion) {
					setCourseData((prev) => ({
						...prev,
						[currentQuestion.key]: userInput,
					}));
					setCurrentQuestionIndex((prev) => prev + 1);
					askQuestion(currentQuestionIndex + 1);
				}
			}
		} else {
			// Fallback when agent not available
			const currentQuestion = questions[currentQuestionIndex];
			setCourseData((prev) => ({
				...prev,
				[currentQuestion.key]: userInput,
			}));
			setCurrentQuestionIndex((prev) => prev + 1);

			setTimeout(() => {
				askQuestion(currentQuestionIndex + 1);
			}, 500);
		}
	}, [inputValue, conversationalAgent, currentQuestionIndex, askQuestion, handleCompletion, generateGraphWithAI]);

	const handleOptionSelect = React.useCallback(
		async (option: string) => {
			const messageId = `msg-${Date.now()}-${Math.random()}`;
			const userMessage: Message = {
				id: messageId,
				content: option,
				sender:"user",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, userMessage]);

			// Use conversational agent if available
			if (conversationalAgent) {
				setIsTyping(true);
				try {
					// Check if in refinement mode (post-generation)
					if (conversationalAgent.getIsInRefinementMode()) {
						const refinementResponse = await conversationalAgent.refineGraph(option);
						
						setTimeout(async () => {
							const aiMessage: Message = {
								id: `ai-${Date.now()}-${Math.random()}`,
								content: refinementResponse.aiResponse,
								sender:"ai",
								timestamp: new Date(),
							};
							setMessages((prev) => [...prev, aiMessage]);
							setIsTyping(false);

							// Handle graph regeneration
							if (refinementResponse.shouldRegenerateGraph) {
								console.log("User confirmed regeneration:", refinementResponse.refinementDetails);
								
								// Add regeneration message
								setTimeout(() => {
									const regenMessage: Message = {
										id: `regen-${Date.now()}`,
										content: "🔄 Regenerating your skill map with the requested changes...",
										sender: "ai",
										timestamp: new Date(),
									};
									setMessages((prev) => [...prev, regenMessage]);
									
									// Regenerate graph with updated context
									generateGraphWithAI();
								}, 1000);
							}
						}, 800);
					} else {
						// Normal data collection flow
						const response = await conversationalAgent.sendMessage(option);
						
						// Update course data
						setCourseData(response.collectedData);
						setCurrentQuestionIndex(conversationalAgent.getCurrentQuestionIndex());

						// Add AI response
						setTimeout(() => {
							const aiMessage: Message = {
								id: `ai-${Date.now()}-${Math.random()}`,
								content: response.aiResponse,
								sender:"ai",
								timestamp: new Date(),
							};
							setMessages((prev) => [...prev, aiMessage]);
							setIsTyping(false);

							// Check if complete
							if (response.isComplete) {
								handleCompletion();
							}
						}, 800);
					}
				} catch (error) {
					console.error("Error in conversation:", error);
					setIsTyping(false);
				}
			} else {
				// Fallback when agent not available
				const currentQuestion = questions[currentQuestionIndex];
				setCourseData((prev) => ({
					...prev,
					[currentQuestion.key]: option,
				}));
				setCurrentQuestionIndex((prev) => prev + 1);

				setTimeout(() => {
					askQuestion(currentQuestionIndex + 1);
				}, 500);
			}
		},
		[conversationalAgent, currentQuestionIndex, askQuestion, handleCompletion, generateGraphWithAI],
	);

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key ==="Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const currentQuestion = questions[currentQuestionIndex];

	const handleSetupComplete = (key: string) => {
		setApiKey(key);
		localStorage.setItem("api-key", key);
		setShowSetup(false);
	};

	const handleResetKey = () => {
		setApiKey("");
		localStorage.removeItem("api-key");
		setShowSetup(true);
	};

	if (showSetup) {
		return <ApiKeySetup onComplete={handleSetupComplete} />;
	}

	const isGraphVisible = !!generatedGraphData || isGeneratingGraph;

	return (
		<div className="h-screen flex bg-gray-50 transition-colors duration-300">
			{/* Chat Interface */}
			<div 
				className={`
					flex flex-col bg-white border-r border-gray-200 transition-all duration-500 ease-in-out
					${isGraphVisible ? 'w-[20%]' : 'w-full max-w-3xl mx-auto shadow-xl my-8 rounded-xl border-l border-t border-b'}
				`}
			>

				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<div>
						<h2 className="text-lg font-semibold text-gray-900">AI Course Designer</h2>
						<p className="text-sm text-gray-500">
							{isComplete
								? "Mapping Skills"
								: `Question ${currentQuestionIndex + 1} of ${questions.length}`}
						</p>
					</div>
					<button
						onClick={handleResetKey}
						className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
						title="Reset API Key"
					>
						<Settings className="w-5 h-5" />
					</button>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{messages.map((message) => (
						<MessageBubble key={message.id} message={message} />
					))}

					{/* Typing Indicator */}
					{isTyping && <TypingIndicator />}

					{/* Quick Reply Options */}
					{currentQuestion?.options && !isComplete && (
						<QuickReplyOptions
							options={currentQuestion.options}
							onOptionSelect={handleOptionSelect}
						/>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Input Area - Show for initial questions OR refinement mode */}
				{(!isComplete && !currentQuestion?.options) || (conversationalAgent?.getIsInRefinementMode()) ? (
					<ChatInput
						value={inputValue}
						onChange={setInputValue}
						onSend={handleSendMessage}
						onKeyPress={handleKeyPress}
						placeholder={
							conversationalAgent?.getIsInRefinementMode() 
								? "Ask me anything about your skill map..." 
								: currentQuestion?.placeholder || "Type your answer..."
						}
						inputRef={inputRef}
					/>
				) : null}

				{/* Completion State - Only show while generating, hide when in refinement mode */}
				{isComplete && !conversationalAgent?.getIsInRefinementMode() && (
					<CompletionState selectedCategories={selectedCategories} />
				)}
			</div>

			{/* Skill Map - Only visible when graph is generated or generating */}
			{isGraphVisible && (
				<div className="w-[80%] relative bg-gray-100 transition-colors duration-300 animate-in fade-in slide-in-from-right-10 duration-700">
					<div className="absolute inset-0">
						{isGeneratingGraph ? (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
									<p className="text-gray-600 font-medium">Generating your skill map...</p>
									<p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
								</div>
							</div>
						) : (
							<SkillMapGraph 
								selectedCategories={selectedCategories} 
								graphData={generatedGraphData}
							/>
						)}

						{/* Overlay Info - Show only if course is complete */}
						{isComplete && (
							<div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 transition-colors duration-300">
								<h3 className="font-semibold text-gray-900 mb-2">
									Course Overview
								</h3>
								<div className="space-y-2 text-sm">
									<div>
										<span className="text-gray-600">Title:</span>
										<span className="ml-2 font-medium text-gray-900">
											{courseData.title}
										</span>
									</div>
									<div>
										<span className="text-gray-600">Level:</span>
										<span className="ml-2 font-medium text-gray-900">
											{courseData.level}
										</span>
									</div>
									<div>
										<span className="text-gray-600">Duration:</span>
										<span className="ml-2 font-medium text-gray-900">
											{courseData.duration}
										</span>
									</div>
									<div>
										<span className="text-gray-600">Focus:</span>
										<span className="ml-2 font-medium text-gray-900">
											{courseData.mainFocus}
										</span>
									</div>
								</div>
								<div className="mt-3 pt-3 border-t border-gray-200">
									<p className="text-xs text-gray-600">
										Skills are color-coded by proficiency level:
									</p>
									<div className="flex items-center space-x-3 mt-2">
										<div className="flex items-center space-x-1">
											<div className="w-3 h-3 rounded-full bg-emerald-500"></div>
											<span className="text-xs text-gray-700">Awareness</span>
										</div>
										<div className="flex items-center space-x-1">
											<div className="w-3 h-3 rounded-full bg-blue-500"></div>
											<span className="text-xs text-gray-700">Application</span>
										</div>
										<div className="flex items-center space-x-1">
											<div className="w-3 h-3 rounded-full bg-violet-500"></div>
											<span className="text-xs text-gray-700">Mastery</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
