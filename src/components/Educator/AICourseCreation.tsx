import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
	Loader2,
	RefreshCw,
	Sparkles,
	MessageSquare,
	Target,
	BookOpen,
	PanelLeftClose,
	PanelLeftOpen,
	Key,
	CheckCircle,
	X,
} from "lucide-react";

import { SkillMapGraph } from "./SkillMapGraph";
import { GraphErrorState } from "./GraphErrorState";
import { AIGraphGenerator } from "../../services/aiGraphGenerator";
import { ConversationalAgent } from "../../services/conversationalAgent";
import { useGraphStore } from "../../store/graphStore";
import type { Problem, GraphData } from "../../store/graphStore";
import {
	MessageBubble,
	TypingIndicator,
	QuickReplyOptions,
	ChatInput,
	FloatingChatButton,
} from "./ChatComponents";

import { ProblemSelectionPanel } from "./ProblemSelectionPanel";
import { CompetencyMatrix } from "./CompetencyMatrix";
import { Layout, List, Save, Eye } from "lucide-react";
import { TokenUsageBadge } from "../Common/TokenUsageBadge";
import { NodeDeepDiveModal } from "./NodeDeepDiveModal";
import { useCourseStore } from "../../store/courseStore";
import { StudyFlow } from "../StudyFlow/StudyFlow";
import { linearizeGraph } from "../../utils/flowUtils";

interface Message {
	id: string;
	content: string;
	sender: "ai" | "user";
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
		key: "title",
		question: "Let's create your course! What would you like to name it?",
		placeholder: "e.g., Full-Stack Web Development with Node.js",
	},
	{
		key: "description",
		question:
			"Great! Can you describe what learners will achieve in this course?",
		placeholder:
			"e.g., Students will learn to build modern web applications...",
	},
	{
		key: "duration",
		question: "How long will this course run?",
		placeholder: "e.g., 12 weeks, 3 months, 6 weeks",
	},
	{
		key: "level",
		question: "What's the difficulty level?",
		options: ["Application", "Awareness", "Mastery", "Influence"],
	},
	{
		key: "targetAudience",
		question: "Who is this course designed for?",
		placeholder:
			"e.g., Computer science students, career changers, junior developers",
	},
	{
		key: "mainFocus",
		question: "What's the main technical focus or domain?",
		placeholder: "e.g., Backend Development, Full-Stack, JavaScript, Node.js",
	},
];

// Wizard Steps
type WizardStep =
	| "INTENT"
	| "PROBLEMS"
	| "FLOW_DESIGN"
	| "CONTENT_ENRICHMENT"
	| "LMS_VIEW"
	| "FINAL_REVIEW";

export const AICourseCreation: React.FC = () => {
	const [currentStep, setCurrentStep] = useState<WizardStep>("INTENT");
	const [deepDiveNodeId, setDeepDiveNodeId] = useState<string | null>(null);
	const [isWizardSidebarOpen, setIsWizardSidebarOpen] = useState(true); // Default to open
	const [showApiKeyModal, setShowApiKeyModal] = useState(false);
	const [tempApiKey, setTempApiKey] = useState("");
	const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const {
		setAIGeneratedGraphData,
		setAvailableFilters,
		aiGeneratedGraphData,
		setGeneratedProblems,
		setSelectedProblem,
		setCompetencyFramework,
		problemDataCache,
		cacheProblemData,
		updateNodeData,
		applyStructuralChanges,
		generatedProblems,
		selectedProblem,
	} = useGraphStore();

	const { setCourseData } = useCourseStore();

	const [messages, setMessages] = useState<Message[]>(() => {
		const saved = localStorage.getItem("tangible_chat_history");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				return parsed.map(
					(m: {
						id: string;
						content: string;
						sender: string;
						timestamp: string;
					}) => ({
						...m,
						sender: m.sender as "ai" | "user",
						timestamp: new Date(m.timestamp),
					}),
				);
			} catch (e) {
				console.error("Failed to parse chat history", e);
			}
		}
		return [
			{
				id: "1",
				content:
					"Hello! I'm your AI course design assistant. I'll help you create a skill-mapped course tailored to your needs. Let's start by gathering some information.",
				sender: "ai",
				timestamp: new Date(),
			},
		];
	});
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [formCourseData, setFormCourseData] = useState<Partial<CourseData>>({});
	const [isComplete, setIsComplete] = useState(false);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
	const [, setGeneratedGraphData] = useState<GraphData | null>(null);
	const [graphError, setGraphError] = useState<string | null>(null);
	const [notification, setNotification] = useState<{
		message: string;
		type: "success" | "info";
	} | null>(null);
	const [conversationalAgent, setConversationalAgent] =
		useState<ConversationalAgent | null>(null);

	useEffect(() => {
		if (location.state?.resume) {
			setCurrentStep("FLOW_DESIGN");
		}
	}, [location.state]);

	useEffect(() => {
		if (notification) {
			const timer = setTimeout(() => setNotification(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [notification]);

	useEffect(() => {
		localStorage.setItem("tangible_chat_history", JSON.stringify(messages));
	}, [messages]);
	const [activeView, setActiveView] = useState<"graph" | "competency">("graph");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const [apiKey, setApiKey] = useState<string>(() => {
		return (
			sessionStorage.getItem("api-key") ||
			import.meta.env.VITE_OPENAI_API_KEY ||
			""
		);
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
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleError = (error: unknown) => {
		console.error("Error encountered:", error);
		setIsTyping(false);
		setIsGeneratingGraph(false);

		let errorMessage =
			"I'm sorry, I encountered an unexpected error. Please try again.";

		if (error instanceof Error) {
			// Format the error message for non-technical users
			let cleanMessage = error.message;

			// Remove technical prefixes like [OpenAI Error]:
			cleanMessage = cleanMessage.replace(/\[.*?\]:?\s*/g, "");
			// Remove "Error:" prefix if present
			cleanMessage = cleanMessage.replace(/^Error:\s*/i, "");

			// Humanize common errors
			if (
				cleanMessage.includes("401") ||
				cleanMessage.includes("403") ||
				cleanMessage.toLowerCase().includes("api key")
			) {
				errorMessage =
					"It looks like your API key is invalid or expired. Please check your settings.";
			} else if (
				cleanMessage.includes("429") ||
				cleanMessage.toLowerCase().includes("quota")
			) {
				errorMessage =
					"I'm currently overwhelmed (quota exceeded). Please try again in a moment.";
			} else if (
				cleanMessage.includes("503") ||
				cleanMessage.toLowerCase().includes("overloaded")
			) {
				errorMessage =
					"The AI service is a bit busy right now. Please try again.";
			} else if (
				cleanMessage.toLowerCase().includes("fetch failed") ||
				cleanMessage.toLowerCase().includes("network")
			) {
				errorMessage =
					"I'm having trouble connecting to the internet. Please check your connection.";
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

			console.log(apiKey);

			if (!apiKey) {
				throw new Error("OpenAI API key not found. Please complete the setup.");
			}

			// Generate enriched context from conversational agent
			let conversationContext = "";
			if (conversationalAgent) {
				try {
					conversationContext =
						await conversationalAgent.generateGraphContext();
					console.log("Generated conversation context:", conversationContext);
				} catch (error) {
					console.error("Error generating context:", error);
				}
			}

			const generator = new AIGraphGenerator(apiKey);
			const { graphData, filterData } = await generator.generateGraphFromCourse(
				formCourseData as CourseData,
				conversationContext,
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
				sender: "ai",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, successMessage]);

			// Enter refinement mode for post-generation conversation
			if (conversationalAgent) {
				setTimeout(async () => {
					const refinementPrompt =
						await conversationalAgent.enterRefinementMode({
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
	}, [formCourseData, conversationalAgent]);

	const handleCompletion = useCallback(async () => {
		setIsTyping(true);
		setTimeout(async () => {
			const messageId = `completion-${Date.now()}-${Math.random()}`;
			const completionMessage: Message = {
				id: messageId,
				content: `Perfect! I've gathered all the information I need. Based on your course "${formCourseData.title}", I'm now generating some real-world problems for you to choose from.`,
				sender: "ai",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, completionMessage]);
			setIsTyping(false);
			setIsComplete(true);

			// Generate Problems instead of full graph
			setIsGeneratingGraph(true);
			try {
				if (conversationalAgent) {
					const problems = await conversationalAgent.generateProblems();
					console.log("DEBUG: Generated problems:", problems);
					setGeneratedProblems(problems);
					setCurrentStep("PROBLEMS"); // Move to next step

					const problemsMsg: Message = {
						id: `prob-${Date.now()}`,
						content: `I've found ${problems.length} interesting problems. Please select one from the panel on the right to generate your study plan.`,
						sender: "ai",
						timestamp: new Date(),
					};
					setMessages((prev) => [...prev, problemsMsg]);
				}
			} catch (error) {
				handleError(error);
			} finally {
				setIsGeneratingGraph(false);
			}
		}, 1000);
	}, [formCourseData, conversationalAgent, setGeneratedProblems]);

	const handleRegenerateProblems = async () => {
		setIsGeneratingGraph(true);
		try {
			if (conversationalAgent) {
				const problems = await conversationalAgent.generateProblems();
				setGeneratedProblems(problems);

				const problemsMsg: Message = {
					id: `prob-regen-${Date.now()}`,
					content: `I've found some fresh problems for you. Take a look!`,
					sender: "ai",
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, problemsMsg]);
			}
		} catch (error) {
			handleError(error);
		} finally {
			setIsGeneratingGraph(false);
		}
	};

	const handleRegenerateFlow = async () => {
		if (!selectedProblem) return;

		setIsGeneratingGraph(true);
		setGraphError(null);

		try {
			if (!apiKey) throw new Error("OpenAI API key not found.");
			const generator = new AIGraphGenerator(apiKey);

			const { graphData, filterData } =
				await generator.generateQuestionFlowForProblem(
					selectedProblem,
					formCourseData as CourseData,
				);

			const competencies = await generator.generateCompetencyFramework(
				selectedProblem,
				formCourseData as CourseData,
			);

			// Update cache and state
			cacheProblemData(selectedProblem.id, {
				graphData,
				filterData,
				competencyFramework: competencies,
			});

			setGeneratedGraphData(graphData);
			setAIGeneratedGraphData(graphData);
			setAvailableFilters(filterData);
			setSelectedCategories(filterData.category);
			setCompetencyFramework(competencies);

			const successMessage: Message = {
				id: `success-regen-${Date.now()}`,
				content: `🚀 I've redesigned the learning flow with a fresh perspective.`,
				sender: "ai",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, successMessage]);
		} catch (error) {
			handleError(error);
		} finally {
			setIsGeneratingGraph(false);
		}
	};

	const handleProblemSelect = async (problem: Problem) => {
		setSelectedProblem(problem);

		// Check cache first
		if (problemDataCache[problem.id]) {
			const cached = problemDataCache[problem.id];
			console.log("Loading from cache for problem:", problem.id);
			setGeneratedGraphData(cached.graphData);
			setAIGeneratedGraphData(cached.graphData);
			setAvailableFilters(cached.filterData);
			setSelectedCategories(cached.filterData.category);
			setCompetencyFramework(cached.competencyFramework);
			setCurrentStep("FLOW_DESIGN"); // Move to next step
			return;
		}

		setIsGeneratingGraph(true);
		setGraphError(null);

		try {
			// Get API key from state
			if (!apiKey) {
				throw new Error("OpenAI API key not found.");
			}

			const generator = new AIGraphGenerator(apiKey);

			// 1. Generate Question Flow (was Linear Graph)
			const { graphData, filterData } =
				await generator.generateQuestionFlowForProblem(
					problem,
					formCourseData as CourseData,
				);

			// 2. Generate Competency Framework
			const competencies = await generator.generateCompetencyFramework(
				problem,
				formCourseData as CourseData,
			);

			// Cache the results
			cacheProblemData(problem.id, {
				graphData,
				filterData,
				competencyFramework: competencies,
			});

			setGeneratedGraphData(graphData);
			setAIGeneratedGraphData(graphData);
			setAvailableFilters(filterData);
			setSelectedCategories(filterData.category);
			setCompetencyFramework(competencies);
			setCurrentStep("FLOW_DESIGN"); // Move to next step

			const successMessage: Message = {
				id: `success-${Date.now()}`,
				content: `🚀 I've designed the learning flow and competency framework for "${problem.title}".\n\nClick on any node to **Deep Dive** into its specific skills and content.`,
				sender: "ai",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, successMessage]);
		} catch (error) {
			handleError(error);
		} finally {
			setIsGeneratingGraph(false);
		}
	};

	const handlePreviewLMS = () => {
		if (!aiGeneratedGraphData) return;

		// 1. Linearize the graph to create content units
		const selectedNodeIds = aiGeneratedGraphData.nodes.map((n) => n.id);
		const contentUnits = linearizeGraph(selectedNodeIds, aiGeneratedGraphData);

		// 2. Populate courseStore with this temporary data for preview
		setCourseData({
			id: "preview-course",
			title: formCourseData.title || "Preview Course",
			description: formCourseData.description || "",
			nodes: contentUnits,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// 3. Switch to LMS View step
		setCurrentStep("LMS_VIEW");
	};

	const handleNodeClick = async (nodeId: string) => {
		// Open Deep Dive Modal
		setDeepDiveNodeId(nodeId);

		// Trigger enrichment if not already present (optimization: check store first)
		// For now, we'll let the modal handle display, but we might need to trigger enrichment here
		// if we want to preload.
		// Let's assume we trigger enrichment on open if data is missing.
		const node = aiGeneratedGraphData?.nodes.find((n) => n.id === nodeId);
		if (node && !node.skills) {
			try {
				const generator = new AIGraphGenerator(apiKey);
				const enrichmentData = await generator.enrichNodeWithSkillsAndContent(
					node.properties.name,
					formCourseData?.title || "",
				);

				// Update the node in the graph data
				updateNodeData(nodeId, enrichmentData);
				console.log("Enrichment Data Saved:", enrichmentData);
			} catch (e) {
				console.error("Enrichment failed", e);
			}
		}
	};

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
					sender: "ai",
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
		if (currentQuestionIndex === 0 && currentStep === "INTENT") {
			// Ask first question after initial greeting
			setTimeout(() => {
				askQuestion(0);
			}, 1000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentStep]);

	const handleSendMessage = React.useCallback(async () => {
		if (!inputValue.trim()) return;

		const userInput = inputValue;
		setInputValue("");

		const messageId = `msg-${Date.now()}-${Math.random()}`;
		const userMessage: Message = {
			id: messageId,
			content: userInput,
			sender: "user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);

		// Use conversational agent if available
		if (conversationalAgent) {
			setIsTyping(true);
			try {
				// Check if in refinement mode (post-generation)
				if (conversationalAgent.getIsInRefinementMode()) {
					const refinementResponse =
						await conversationalAgent.refineGraph(userInput);

					setTimeout(async () => {
						const aiMessage: Message = {
							id: `ai-${Date.now()}-${Math.random()}`,
							content: refinementResponse.aiResponse,
							sender: "ai",
							timestamp: new Date(),
						};
						setMessages((prev) => [...prev, aiMessage]);
						setIsTyping(false);

						// Handle structural changes
						if (refinementResponse.structuralChanges) {
							applyStructuralChanges(refinementResponse.structuralChanges);
							setNotification({
								message: `Applied changes: ${refinementResponse.structuralChanges.action.replace("_", " ")}`,
								type: "success",
							});
						}

						// Handle graph regeneration
						if (refinementResponse.shouldRegenerateGraph) {
							console.log(
								"User confirmed regeneration:",
								refinementResponse.refinementDetails,
							);

							// Add regeneration message with explicit action
							setTimeout(() => {
								const confirmMessage: Message = {
									id: `confirm-regen-${Date.now()}`,
									content:
										"I can update the map based on your feedback. Click the button below to apply changes.",
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
					setFormCourseData(response.collectedData);
					setCurrentQuestionIndex(
						conversationalAgent.getCurrentQuestionIndex(),
					);

					// Add AI response
					setTimeout(() => {
						const aiMessage: Message = {
							id: `ai-${Date.now()}-${Math.random()}`,
							content: response.aiResponse,
							sender: "ai",
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
			setFormCourseData((prev) => ({
				...prev,
				[currentQuestion.key]: userInput,
			}));
			setCurrentQuestionIndex((prev) => prev + 1);

			setTimeout(() => {
				askQuestion(currentQuestionIndex + 1);
			}, 500);
		}
	}, [
		inputValue,
		conversationalAgent,
		currentQuestionIndex,
		askQuestion,
		handleCompletion,
		generateGraphWithAI,
	]);

	const handleOptionSelect = React.useCallback(
		async (option: string) => {
			const messageId = `msg-${Date.now()}-${Math.random()}`;
			const userMessage: Message = {
				id: messageId,
				content: option,
				sender: "user",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, userMessage]);

			// Use conversational agent if available
			if (conversationalAgent) {
				setIsTyping(true);
				try {
					// Check if in refinement mode (post-generation)
					if (conversationalAgent.getIsInRefinementMode()) {
						const refinementResponse =
							await conversationalAgent.refineGraph(option);

						setTimeout(async () => {
							const aiMessage: Message = {
								id: `ai-${Date.now()}-${Math.random()}`,
								content: refinementResponse.aiResponse,
								sender: "ai",
								timestamp: new Date(),
							};
							setMessages((prev) => [...prev, aiMessage]);
							setIsTyping(false);

							// Handle structural changes
							if (refinementResponse.structuralChanges) {
								applyStructuralChanges(refinementResponse.structuralChanges);
								setNotification({
									message: `Applied changes: ${refinementResponse.structuralChanges.action.replace("_", " ")}`,
									type: "success",
								});
							}

							// Handle graph regeneration
							if (refinementResponse.shouldRegenerateGraph) {
								console.log(
									"User confirmed regeneration:",
									refinementResponse.refinementDetails,
								);

								// Add regeneration message
								setTimeout(() => {
									const regenMessage: Message = {
										id: `regen-${Date.now()}`,
										content:
											"🔄 Regenerating your skill map with the requested changes...",
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
						setFormCourseData(response.collectedData);
						setCurrentQuestionIndex(
							conversationalAgent.getCurrentQuestionIndex(),
						);

						// Add AI response
						setTimeout(() => {
							const aiMessage: Message = {
								id: `ai-${Date.now()}-${Math.random()}`,
								content: response.aiResponse,
								sender: "ai",
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
				setFormCourseData((prev) => ({
					...prev,
					[currentQuestion.key]: option,
				}));
				setCurrentQuestionIndex((prev) => prev + 1);

				setTimeout(() => {
					askQuestion(currentQuestionIndex + 1);
				}, 500);
			}
		},
		[
			conversationalAgent,
			currentQuestionIndex,
			askQuestion,
			handleCompletion,
			generateGraphWithAI,
		],
	);

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const { saveCourse } = useCourseStore();

	const handleSaveAndExit = () => {
		if (!aiGeneratedGraphData) return;

		const newCourse = {
			id: `course-${Date.now()}`,
			title: formCourseData.title || "Untitled Course",
			description: formCourseData.description || "",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			graphData: aiGeneratedGraphData,
			courseData: formCourseData,
			problems: generatedProblems,
		};

		saveCourse(newCourse);
		navigate("/educator");
	};

	const currentQuestion = questions[currentQuestionIndex];

	const handleSaveApiKey = () => {
		setApiKey(tempApiKey);
		sessionStorage.setItem("api-key", tempApiKey);
		setShowApiKeyModal(false);
		// Re-initialize agent with new key
		if (tempApiKey) {
			try {
				const agent = new ConversationalAgent(tempApiKey, questions);
				setConversationalAgent(agent);
				console.log("Conversational agent re-initialized with new key");
			} catch (error) {
				console.error("Error re-initializing conversational agent:", error);
			}
		}
	};

	const ChatMessage = ({
		message,
		onOptionSelect,
	}: {
		message: Message;
		onOptionSelect: (option: string) => void;
	}) => (
		<div className="w-full max-w-3xl mx-auto">
			<MessageBubble message={message} />
			{message.sender === "ai" &&
				message.content.includes("Click the button below to apply changes") && (
					<div className="flex justify-center mt-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
						<button
							onClick={generateGraphWithAI}
							className="flex items-center gap-3 bg-gradient-to-br from-indigo-600 to-violet-700 text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-200 font-bold active:scale-95"
						>
							<RefreshCw className="w-5 h-5" />
							<span>Apply Structural Changes</span>
						</button>
					</div>
				)}
			{message.sender === "ai" && currentQuestion?.options && !isComplete && (
				<div className="ml-10">
					<QuickReplyOptions
						options={currentQuestion.options}
						onOptionSelect={onOptionSelect}
					/>
				</div>
			)}
		</div>
	);

	const renderWizardStep = () => {
		switch (currentStep) {
			case "INTENT":
				return (
					<div className="flex-1 flex flex-col h-full overflow-hidden relative">
						<div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
							<div className="max-w-3xl mx-auto pt-10 pb-20">
								{messages.map((message) => (
									<ChatMessage
										key={message.id}
										message={message}
										onOptionSelect={handleOptionSelect}
									/>
								))}
								{isTyping && (
									<div className="max-w-3xl mx-auto">
										<TypingIndicator />
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>
						</div>

						{/* Floating Input Area */}
						<div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20">
							<div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[32px] p-2 ring-1 ring-black/5">
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
							</div>
						</div>
					</div>
				);

			case "PROBLEMS":
				return (
					<div className="flex-1 h-full overflow-hidden">
						<ProblemSelectionPanel
							onSelectProblem={handleProblemSelect}
							onRegenerate={handleRegenerateProblems}
							isGenerating={isGeneratingGraph}
						/>
					</div>
				);

			case "FLOW_DESIGN":
			case "CONTENT_ENRICHMENT":
				return (
					<div className="flex-1 relative h-full">
						{/* Premium Header Controls */}
						<div className="absolute top-6 right-6 z-20 flex items-center gap-4">
							<div className="flex items-center gap-2 bg-white/40 backdrop-blur-2xl p-1.5 rounded-2xl shadow-2xl border border-white/40 ring-1 ring-black/5">
								<TokenUsageBadge />
							</div>

							<div className="flex items-center gap-1 bg-white/40 backdrop-blur-2xl p-1.5 rounded-2xl shadow-2xl border border-white/40 ring-1 ring-black/5">
								<button
									onClick={() => setActiveView("graph")}
									className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
										activeView === "graph"
											? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
											: "text-slate-400 hover:text-slate-600 hover:bg-white/50"
									}`}
								>
									<Layout className="w-4 h-4" />
									Architecture
								</button>
								<button
									onClick={() => setActiveView("competency")}
									className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
										activeView === "competency"
											? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
											: "text-slate-400 hover:text-slate-600 hover:bg-white/50"
									}`}
								>
									<List className="w-4 h-4" />
									Competency
								</button>
							</div>

							<div className="flex items-center gap-2 bg-white/40 backdrop-blur-2xl p-1.5 rounded-2xl shadow-2xl border border-white/40 ring-1 ring-black/5">
								<button
									onClick={handleRegenerateFlow}
									disabled={isGeneratingGraph}
									className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white/50 rounded-xl transition-all duration-300"
									title="Regenerate Flow"
								>
									<RefreshCw
										className={`w-5 h-5 ${isGeneratingGraph ? "animate-spin" : ""}`}
									/>
								</button>

								<div className="w-px h-6 bg-slate-200/50 mx-1" />

								<button
									onClick={handlePreviewLMS}
									className="flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 border border-indigo-100 hover:border-indigo-600"
								>
									<Eye className="w-4 h-4" />
									Preview
								</button>

								<button
									onClick={handleSaveAndExit}
									className="flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all duration-300"
								>
									<Save className="w-4 h-4" />
									Save
								</button>
							</div>
						</div>

						{/* Main Graph View */}
						{isGeneratingGraph ? (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
									<p className="text-gray-600 font-medium">
										Designing learning architecture...
									</p>
									<p className="text-sm text-gray-500 mt-2">
										Generating questions and competencies...
									</p>
								</div>
							</div>
						) : activeView === "competency" ? (
							<CompetencyMatrix />
						) : (
							<SkillMapGraph
								selectedCategories={selectedCategories}
								graphData={aiGeneratedGraphData}
								onNodeClick={handleNodeClick}
							/>
						)}

						{/* Deep Dive Modal */}
						{deepDiveNodeId && (
							<NodeDeepDiveModal
								nodeId={deepDiveNodeId}
								onClose={() => setDeepDiveNodeId(null)}
							/>
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
				);

			case "LMS_VIEW":
				return (
					<div className="flex-1 h-full overflow-hidden">
						<StudyFlow
							onBack={() => setCurrentStep("FLOW_DESIGN")}
							hideHeader={false}
						/>
					</div>
				);

			case "FINAL_REVIEW":
				return (
					<div className="flex-1 h-full overflow-auto p-8">
						<div className="max-w-4xl mx-auto">
							<div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 p-8 shadow-xl">
								<h2 className="text-3xl font-black text-slate-900 mb-6">
									Final Review
								</h2>
								<div className="space-y-6">
									<div className="bg-indigo-50 rounded-2xl p-6">
										<h3 className="text-lg font-bold text-indigo-900 mb-3">
											Course Summary
										</h3>
										<p className="text-sm text-indigo-700">
											Review your course structure and content before
											finalizing.
										</p>
									</div>
									<div className="flex gap-4">
										<button
											onClick={() => setCurrentStep("FLOW_DESIGN")}
											className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
										>
											Back to Edit
										</button>
										<button
											onClick={handleSaveAndExit}
											className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
										>
											Finalize Course
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				);

			default: {
				const exhaustiveCheck: never = currentStep;
				throw new Error(`Unhandled wizard step: ${exhaustiveCheck}`);
			}
		}
	};

	return (
		<div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 overflow-hidden font-sans text-slate-900">
			{/* Left Sidebar - Wizard Progress */}
			<div
				className={`relative z-50 transition-all duration-500 ease-in-out flex flex-col ${
					isWizardSidebarOpen ? "w-80" : "w-0 opacity-0 -translate-x-full pointer-events-none overflow-hidden"
				}`}
			>
				<div className="h-full bg-white/40 backdrop-blur-2xl border-r border-white/20 shadow-[20px_0_50px_-20px_rgba(79,70,229,0.1)] flex flex-col rounded-r-[40px]">
					<div className="p-8 pb-4">
						<div className="flex items-center gap-3 bg-gradient-to-br from-indigo-600 to-violet-700 w-fit p-3 rounded-2xl shadow-lg shadow-indigo-200 mb-6">
							<Sparkles className="w-6 h-6 text-white" />
						</div>
						<h2 className="text-2xl font-black text-slate-900 tracking-tight font-title">
							Course Wizard
						</h2>
						<p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">
							AI Design Studio
						</p>
					</div>

					<div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
						{[
							{
								id: "INTENT",
								label: "Define Intent",
								icon: MessageSquare,
								desc: "Gathering context",
							},
							{
								id: "PROBLEMS",
								label: "Select Challenge",
								icon: Target,
								desc: "Real-world focus",
							},
							{
								id: "FLOW_DESIGN",
								label: "Design Flow",
								icon: Layout,
								desc: "Architecture",
							},
							{
								id: "CONTENT_ENRICHMENT",
								label: "Enrich Content",
								icon: BookOpen,
								desc: "Deep dive",
							},
							{
								id: "LMS_VIEW",
								label: "LMS Preview",
								icon: Eye,
								desc: "Final check",
							},
							{
								id: "FINAL_REVIEW",
								label: "Final Review",
								icon: CheckCircle,
								desc: "Complete",
							},
						].map((step, idx) => {
							const isActive = currentStep === step.id;
							const isPast =
								[
									"INTENT",
									"PROBLEMS",
									"FLOW_DESIGN",
									"CONTENT_ENRICHMENT",
									"LMS_VIEW",
									"FINAL_REVIEW",
								].indexOf(currentStep) > idx;

							return (
								<div
									key={step.id}
									className={`group relative flex items-center gap-4 px-5 py-4 rounded-[24px] transition-all duration-300 ${
										isActive
											? "bg-white shadow-xl shadow-indigo-100/50 ring-1 ring-black/5 translate-x-2"
											: "hover:bg-white/50"
									}`}
								>
									<div
										className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
											isActive
												? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
												: isPast
													? "bg-emerald-100 text-emerald-600"
													: "bg-slate-100 text-slate-400"
										}`}
									>
										<step.icon className="w-5 h-5" />
									</div>
									<div>
										<span
											className={`text-sm font-black tracking-tight font-title ${isActive ? "text-indigo-600" : "text-slate-600"}`}
										>
											{step.label}
										</span>
										<div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
											{step.desc}
										</div>
									</div>
									{isActive && (
										<div className="absolute right-4 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></div>
									)}
								</div>
							);
						})}
					</div>

					<div className="p-6 border-t border-white/20">
						<div className="bg-indigo-600/5 rounded-2xl p-4 border border-indigo-600/10">
							<div className="flex items-center gap-2 mb-2">
								<div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
								<span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
									AI Status
								</span>
							</div>
							<p className="text-[11px] text-indigo-900/60 font-medium leading-relaxed">
								Assistant is analyzing your inputs to generate the best learning
								path.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col h-full overflow-hidden relative">
				{/* Top Bar */}
				<div className="h-20 flex items-center justify-between px-8 shrink-0 z-30">
					<div className="flex items-center gap-6">
						<button
							onClick={() => setIsWizardSidebarOpen(!isWizardSidebarOpen)}
							className="p-3 bg-white/50 backdrop-blur-md hover:bg-white rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-white/40 active:scale-90"
						>
							{isWizardSidebarOpen ? (
								<PanelLeftClose size={20} />
							) : (
								<PanelLeftOpen size={20} />
							)}
						</button>
						<div>
							<h1 className="text-xl font-black text-slate-900 tracking-tight">
								{currentStep === "INTENT" && "Define Course Intent"}
								{currentStep === "PROBLEMS" && "Select Problem"}
								{currentStep === "FLOW_DESIGN" && "Learning Flow Design"}
								{currentStep === "CONTENT_ENRICHMENT" && "Content Enrichment"}
								{currentStep === "LMS_VIEW" && "LMS Preview"}
								{currentStep === "FINAL_REVIEW" && "Final Review"}
							</h1>
							<div className="flex items-center gap-2 mt-0.5">
								<div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
								<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
									Step{" "}
									{[
										"INTENT",
										"PROBLEMS",
										"FLOW_DESIGN",
										"CONTENT_ENRICHMENT",
										"LMS_VIEW",
										"FINAL_REVIEW",
									].indexOf(currentStep) + 1}{" "}
									of 6
								</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						{currentStep !== "FLOW_DESIGN" &&
							currentStep !== "CONTENT_ENRICHMENT" && (
								<div className="bg-white/50 backdrop-blur-md p-1 rounded-2xl border border-white/40 shadow-sm">
									<TokenUsageBadge />
								</div>
							)}
						<button
							onClick={() => setShowApiKeyModal(true)}
							className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm border ${
								apiKey
									? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
									: "bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100 animate-pulse"
							}`}
						>
							<Key className="w-4 h-4" />
							{apiKey ? "API SECURE" : "CONFIGURE API"}
						</button>
					</div>
				</div>

				{/* Wizard Content */}
				{renderWizardStep()}
			</div>

			{/* Right Sidebar - AI Chat */}
			{currentStep !== "INTENT" && (
				<div
					className={`fixed top-20 right-6 bottom-24 z-40 transition-all duration-500 ease-in-out flex flex-col ${
						isChatSidebarOpen
							? "w-96 opacity-100 translate-x-0"
							: "w-96 opacity-0 translate-x-12 pointer-events-none"
					}`}
				>
					<div className="flex-1 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden flex flex-col ring-1 ring-black/5">
						<div className="p-5 border-b border-gray-100/50 flex items-center justify-between bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-200">
									<Sparkles className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="font-bold text-gray-900 text-sm">
										AI Design Assistant
									</h3>
									<div className="flex items-center gap-1.5">
										<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
										<span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
											Online
										</span>
									</div>
								</div>
							</div>
							<button
								onClick={() => setIsChatSidebarOpen(false)}
								className="p-2 hover:bg-white/80 rounded-xl text-gray-400 hover:text-gray-600 transition-all active:scale-90"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto p-5 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
							{messages.map((message) => (
								<MessageBubble key={message.id} message={message} />
							))}
							{isTyping && <TypingIndicator />}
							<div ref={messagesEndRef} />
						</div>

						<div className="p-5 bg-gray-50/50 border-t border-gray-100/50">
							<ChatInput
								value={inputValue}
								onChange={setInputValue}
								onSend={handleSendMessage}
								onKeyPress={handleKeyPress}
								placeholder="Ask me anything..."
								inputRef={inputRef}
							/>
							<p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
								AI can make mistakes. Check important info.
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Floating Toggle Button */}
			{currentStep !== "INTENT" && (
				<FloatingChatButton
					isOpen={isChatSidebarOpen}
					onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
				/>
			)}

			{/* API Key Modal */}
			{showApiKeyModal && (
				<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
					<div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-10 w-full max-w-md shadow-2xl border border-white/40 ring-1 ring-black/5 animate-in zoom-in-95 duration-500">
						<div className="flex items-center gap-4 mb-8">
							<div className="p-3 bg-indigo-600/10 rounded-2xl">
								<Key className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<h3 className="text-xl font-black text-slate-900 tracking-tight">
									OpenAI API Key
								</h3>
								<p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
									Required for AI Generation
								</p>
							</div>
						</div>

						<div className="space-y-6">
							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
									Your API Key
								</label>
								<input
									type="password"
									value={tempApiKey}
									onChange={(e) => setTempApiKey(e.target.value)}
									className="w-full px-6 py-4 bg-white/50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all shadow-inner"
									placeholder="sk-..."
								/>
								<p className="text-[10px] text-slate-400 mt-3 font-medium leading-relaxed">
									Your key is stored locally in your browser session and is
									never sent to our servers.
								</p>
							</div>

							<div className="flex gap-4 pt-2">
								<button
									onClick={() => setShowApiKeyModal(false)}
									className="flex-1 px-6 py-4 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition-all"
								>
									Cancel
								</button>
								<button
									onClick={handleSaveApiKey}
									className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200"
								>
									Save Key
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Notification Toast */}
			{notification && (
				<div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
					<div
						className={`px-8 py-4 rounded-[24px] shadow-2xl border backdrop-blur-xl flex items-center gap-4 ring-1 ring-black/5 ${
							notification.type === "success"
								? "bg-emerald-500/90 border-emerald-400/50 text-white shadow-emerald-200/50"
								: "bg-indigo-600/90 border-indigo-400/50 text-white shadow-indigo-200/50"
						}`}
					>
						<div className="p-1.5 bg-white/20 rounded-lg">
							{notification.type === "success" ? (
								<CheckCircle className="w-5 h-5" />
							) : (
								<Sparkles className="w-5 h-5" />
							)}
						</div>
						<span className="text-sm font-black uppercase tracking-widest">
							{notification.message}
						</span>
					</div>
				</div>
			)}
		</div>
	);
};
