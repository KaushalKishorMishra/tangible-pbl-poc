import React, { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Settings, RefreshCw, Database, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import nodesData from "../../data/nodes.json";
import { ApiKeySetup } from "../setup/ApiKeySetup";
import { StudyFlow } from "../StudyFlow/StudyFlow";
import { SkillMapGraph } from "./SkillMapGraph";
import { GraphErrorState } from "./GraphErrorState";
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
	const { setAIGeneratedGraphData, 		setAvailableFilters, 
		isFlowViewActive,
		aiGeneratedGraphData,
        isAICourseDesignerCollapsed,
        setAICourseDesignerCollapsed
	} = useGraphStore();
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
	const [graphError, setGraphError] = useState<string | null>(null);
	const [conversationalAgent, setConversationalAgent] = useState<ConversationalAgent | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const [apiKey, setApiKey] = useState<string>(() => {
		return sessionStorage.getItem("api-key") || import.meta.env.VITE_GOOGLE_AI_API_KEY || "";
	});
	const [showSetup, setShowSetup] = useState(() => {
		return !sessionStorage.getItem("api-key") && !import.meta.env.VITE_GOOGLE_AI_API_KEY;
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

	const handleError = (error: unknown) => {
		console.error("Error encountered:", error);
		setIsTyping(false);
		setIsGeneratingGraph(false);

		let errorMessage = "I'm sorry, I encountered an unexpected error. Please try again.";
		
		if (error instanceof Error) {
			// Format the error message for non-technical users
			let cleanMessage = error.message;
			
			// Remove technical prefixes like [GoogleGenerativeAI Error]:
			cleanMessage = cleanMessage.replace(/\[.*?\]:?\s*/g, '');
			// Remove "Error:" prefix if present
			cleanMessage = cleanMessage.replace(/^Error:\s*/i, '');

			// Humanize common errors
			if (cleanMessage.includes("401") || cleanMessage.includes("403") || cleanMessage.toLowerCase().includes("api key")) {
				errorMessage = "It looks like your API key is invalid or expired. Please check your settings.";
			} else if (cleanMessage.includes("429") || cleanMessage.toLowerCase().includes("quota")) {
				errorMessage = "I'm currently overwhelmed (quota exceeded). Please try again in a moment.";
			} else if (cleanMessage.includes("503") || cleanMessage.toLowerCase().includes("overloaded")) {
				errorMessage = "The AI service is a bit busy right now. Please try again.";
			} else if (cleanMessage.toLowerCase().includes("fetch failed") || cleanMessage.toLowerCase().includes("network")) {
				errorMessage = "I'm having trouble connecting to the internet. Please check your connection.";
			} else {
				errorMessage = `I encountered an issue: ${cleanMessage}. Please try again or check your settings.`;
			}
		}

		const errorMsg: Message = {
			id: `error-${Date.now()}`,
			content: errorMessage,
			sender: "ai",
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, errorMsg]);
		
		// Set graph error state to show error UI in the panel
		setGraphError(errorMessage);
	};

	const generateGraphWithAI = useCallback(async () => {
		setIsGeneratingGraph(true);
		setGraphError(null); // Clear previous errors
		
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
			handleError(error);
		} finally {
			setIsGeneratingGraph(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [courseData, conversationalAgent]);

	const handleLoadStaticData = useCallback(async () => {
		setIsGeneratingGraph(true);
		setGraphError(null);

		try {
			// Simulate loading delay
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Use AIGraphGenerator just to generate filters (hacky but works)
			// We need an instance, apiKey doesn't matter for this method
			const generator = new AIGraphGenerator("dummy-key");
			const filterData = generator.generateFilters(nodesData as unknown as GraphData);

			const graphData = nodesData as unknown as GraphData;

			setGeneratedGraphData(graphData);
			setAIGeneratedGraphData(graphData);
			setAvailableFilters(filterData);
			setSelectedCategories(filterData.category.slice(0, 5));

			const successMessage: Message = {
				id: `static-load-${Date.now()}`,
				content: `📂 Loaded static dataset with ${graphData.nodesCount} nodes and ${graphData.relationshipsCount} relationships.`,
				sender: "ai",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, successMessage]);
			setIsComplete(true);

		} catch (error) {
			console.error("Error loading static data:", error);
			handleError(error);
		} finally {
			setIsGeneratingGraph(false);
		}
	}, [setAIGeneratedGraphData, setAvailableFilters]);

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
							
							// Add regeneration message with explicit action
							setTimeout(() => {
								const confirmMessage: Message = {
									id: `confirm-regen-${Date.now()}`,
									content: "I can update the map based on your feedback. Click the button below to apply changes.",
									sender: "ai",
									timestamp: new Date(),
								};
								setMessages((prev) => [...prev, confirmMessage]);
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
				handleError(error);
				
				// Fallback to manual collection if it's not a critical API error? 
				// For now, let's just show the error and let the user retry or reset.
				// If we want to fallback, we'd need to check the error type.
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
					handleError(error);
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
		sessionStorage.setItem("api-key", key);
		setShowSetup(false);
	};

	const handleResetKey = () => {
		setApiKey("");
		sessionStorage.removeItem("api-key");
		setShowSetup(true);
	};

	const handleCancelSetup = () => {
		if (apiKey) {
			setShowSetup(false);
		}
	};



	if (showSetup) {
		return <ApiKeySetup onComplete={handleSetupComplete} onCancel={apiKey ? handleCancelSetup : undefined} />;
	}

	const isGraphVisible = !!generatedGraphData || isGeneratingGraph || !!graphError;

	return (
		<div className="h-screen flex bg-gray-50 transition-colors duration-300 relative">
            {/* Floating Icon when Collapsed */}
            {isGraphVisible && isAICourseDesignerCollapsed && (
                <button
                    onClick={() => setAICourseDesignerCollapsed(false)}
                    className="absolute bottom-6 left-6 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 animate-in fade-in zoom-in duration-300"
                    title="Open AI Course Designer"
                >
                    <Bot className="w-6 h-6" />
                </button>
            )}

			{/* Chat Interface */}
			<div 
				className={`
					flex flex-col bg-white border-r border-gray-200 transition-all duration-500 ease-in-out relative
					${isGraphVisible 
                        ? (isAICourseDesignerCollapsed ? 'w-0 overflow-hidden border-none' : 'w-[25%]') 
                        : 'w-full max-w-3xl mx-auto shadow-xl my-8 rounded-xl border-l border-t border-b'}
				`}
			>
                {/* Collapse Toggle Button */}
                {isGraphVisible && !isAICourseDesignerCollapsed && (
                    <button
                        onClick={() => setAICourseDesignerCollapsed(true)}
                        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-md z-50 hover:bg-gray-50 text-gray-500"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}

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
                    <div className="flex gap-2">
                        <button
                            onClick={handleLoadStaticData}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Load Static Data (Dev)"
                        >
                            <Database className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleResetKey}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Reset API Key"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
				</div>

				{/* Messages & Input */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}

                    {isTyping && <TypingIndicator />}

                    {currentQuestion?.options && !isComplete && (
                        <QuickReplyOptions
                            options={currentQuestion.options}
                            onOptionSelect={handleOptionSelect}
                        />
                    )}

                    {messages.length > 0 && messages[messages.length - 1].content.includes("Click the button below to apply changes") && (
                        <div className="flex justify-center mt-2">
                            <button
                                onClick={generateGraphWithAI}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Update Graph</span>
                            </button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

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

                {isComplete && !conversationalAgent?.getIsInRefinementMode() && (
                    <CompletionState selectedCategories={selectedCategories} />
                )}
			</div>

			{/* Skill Map */}
			{isGraphVisible && (
				<div className={`${isAICourseDesignerCollapsed ? 'w-full' : 'w-[75%]'} relative bg-gray-100 transition-all duration-500 animate-in fade-in slide-in-from-right-10`}>
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
							isFlowViewActive ? (
								<StudyFlow />
							) : (
								<SkillMapGraph 
									selectedCategories={selectedCategories} 
									graphData={aiGeneratedGraphData} 
								/>
							)
						)}

						{graphError && !isGeneratingGraph && (
							<div className="absolute inset-0 bg-white z-20">
								<GraphErrorState 
									error={graphError} 
									onRetry={generateGraphWithAI} 
								/>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
