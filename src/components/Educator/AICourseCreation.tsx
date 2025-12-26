import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, RefreshCw, ChevronLeft, Sparkles, MessageSquare, Target, BookOpen, PanelLeftClose, PanelLeftOpen, Key } from "lucide-react";

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
} from"./ChatComponents";

import { ProblemSelectionPanel } from "./ProblemSelectionPanel";
import { CompetencyMatrix } from "./CompetencyMatrix";
import type { Problem } from "../../store/graphStore";
import { Layout, List, Save } from "lucide-react";
import { TokenUsageBadge } from "../Common/TokenUsageBadge";
import { NodeDeepDiveModal } from './NodeDeepDiveModal';
import { useCourseStore } from "../../store/courseStore";

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

// Wizard Steps
type WizardStep = 'INTENT' | 'PROBLEMS' | 'FLOW_DESIGN' | 'CONTENT_ENRICHMENT' | 'FINAL_REVIEW';

export const AICourseCreation: React.FC = () => {
	const [currentStep, setCurrentStep] = useState<WizardStep>('INTENT');
	const [deepDiveNodeId, setDeepDiveNodeId] = useState<string | null>(null);
	const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(true); // Default to open
	const [showApiKeyModal, setShowApiKeyModal] = useState(false);
	const [tempApiKey, setTempApiKey] = useState("");
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
    clearAIGeneratedGraphData,
    updateNodeData,
    generatedProblems
  } = useGraphStore();

  // const {
  //   isFlowViewActive
  // } = useCourseStore();

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
	const [formCourseData, setFormCourseData] = useState<Partial<CourseData>>({});
	const [isComplete, setIsComplete] = useState(false);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
	const [, setGeneratedGraphData] = useState<GraphData | null>(null);
	const [graphError, setGraphError] = useState<string | null>(null);
	const [conversationalAgent, setConversationalAgent] = useState<ConversationalAgent | null>(null);

    useEffect(() => {
        if (location.state?.resume) {
            setCurrentStep('FLOW_DESIGN');
        }
    }, [location.state]);
    const [activeView, setActiveView] = useState<'graph' | 'competency'>('graph');
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const [apiKey, setApiKey] = useState<string>(() => {
		return sessionStorage.getItem("api-key") || import.meta.env.VITE_OPENAI_API_KEY || "";
	});
	const [, _setShowSetup] = useState(() => {
		return !sessionStorage.getItem("api-key") && !import.meta.env.VITE_OPENAI_API_KEY;
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
			
			// Remove technical prefixes like [OpenAI Error]:
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
				throw new Error("OpenAI API key not found. Please complete the setup.");
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
				formCourseData as CourseData,
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
	}, [formCourseData, conversationalAgent]);



	const handleCompletion = useCallback(async () => {
		setIsTyping(true);
		setTimeout(async () => {
			const messageId = `completion-${Date.now()}-${Math.random()}`;
			const completionMessage: Message = {
				id: messageId,
				content: `Perfect! I've gathered all the information I need. Based on your course "${formCourseData.title}", I'm now generating some real-world problems for you to choose from.`,
				sender:"ai",
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
                    setCurrentStep('PROBLEMS'); // Move to next step
                    
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
            setCurrentStep('FLOW_DESIGN'); // Move to next step
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
            const { graphData, filterData } = await generator.generateQuestionFlowForProblem(
                problem,
                formCourseData as CourseData
            );

            // 2. Generate Competency Framework
            const competencies = await generator.generateCompetencyFramework(
                problem,
                formCourseData as CourseData
            );

            // Cache the results
            cacheProblemData(problem.id, {
                graphData,
                filterData,
                competencyFramework: competencies
            });

            setGeneratedGraphData(graphData);
            setAIGeneratedGraphData(graphData);
            setAvailableFilters(filterData);
            setSelectedCategories(filterData.category);
            setCompetencyFramework(competencies);
            setCurrentStep('FLOW_DESIGN'); // Move to next step

             const successMessage: Message = {
                id: `success-${Date.now()}`,
                content: `🚀 I've designed the learning flow and competency framework for "${problem.title}".\n\nClick on any node to **Deep Dive** into its specific skills and content.`,
                sender:"ai",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, successMessage]);

        } catch (error) {
            handleError(error);
        } finally {
            setIsGeneratingGraph(false);
        }
    };

    const handleBackToProblems = () => {
        clearAIGeneratedGraphData();
        setSelectedProblem(null);
        setCurrentStep('PROBLEMS');
    };

    const handleNodeClick = async (nodeId: string) => {
        // Open Deep Dive Modal
        setDeepDiveNodeId(nodeId);
        
        // Trigger enrichment if not already present (optimization: check store first)
        // For now, we'll let the modal handle display, but we might need to trigger enrichment here
        // if we want to preload.
        // Let's assume we trigger enrichment on open if data is missing.
        const node = aiGeneratedGraphData?.nodes.find(n => n.id === nodeId);
        if (node && !node.skills) {
             try {
                const generator = new AIGraphGenerator(apiKey);
                const enrichmentData = await generator.enrichNodeWithSkillsAndContent(
                    node.properties.name,
                    formCourseData?.title || ""
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
		if (currentQuestionIndex === 0 && currentStep === 'INTENT') {
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
					setFormCourseData(response.collectedData);
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
			setFormCourseData((prev) => ({
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
						setFormCourseData(response.collectedData);
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
		[conversationalAgent, currentQuestionIndex, askQuestion, handleCompletion, generateGraphWithAI],
	);

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key ==="Enter" && !e.shiftKey) {
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
            problems: generatedProblems
        };

        saveCourse(newCourse);
        navigate('/educator');
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

    const ChatMessage = ({ message, onOptionSelect }: { message: Message; onOptionSelect: (option: string) => void }) => (
        <>
            <MessageBubble message={message} />
            {message.sender === "ai" && message.content.includes("Click the button below to apply changes") && (
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
            {message.sender === "ai" && currentQuestion?.options && !isComplete && (
                <QuickReplyOptions
                    options={currentQuestion.options}
                    onOptionSelect={onOptionSelect}
                />
            )}
        </>
    );

    const renderWizardStep = () => {
        switch (currentStep) {
            case 'INTENT':
                return (
                    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {messages.map((message) => (
                                <ChatMessage 
                                    key={message.id} 
                                    message={message} 
                                    onOptionSelect={handleOptionSelect}
                                />
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white">
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
                );
            
            case 'PROBLEMS':
                return (
                    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Problem to Solve</h2>
                            <ProblemSelectionPanel 
                                onSelectProblem={handleProblemSelect}
                                isGenerating={isGeneratingGraph}
                            />
                        </div>
                    </div>
                );

            case 'FLOW_DESIGN':
            case 'CONTENT_ENRICHMENT':
                return (
                    <div className="flex-1 relative h-full">
                        {/* Header Controls */}
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                            <TokenUsageBadge />
                            
                             <button
                                 onClick={handleBackToProblems}
                                 className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to Problems
                            </button>
                            
                            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex">
                                <button
                                    onClick={() => setActiveView('graph')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        activeView === 'graph' 
                                        ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <Layout className="w-4 h-4" />
                                    Question Flow
                                </button>
                                <button
                                    onClick={() => setActiveView('competency')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        activeView === 'competency' 
                                        ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <List className="w-4 h-4" />
                                    Competency Matrix
                                </button>
                            </div>

                            <button
                                onClick={handleSaveAndExit}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all"
                            >
                                <Save className="w-4 h-4" />
                                Save & Exit
                            </button>
                        </div>

                        {/* Main Graph View */}
                        {isGeneratingGraph ? (
							<div className="flex items-center justify-center h-full">
								<div className="text-center">
									<Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
									<p className="text-gray-600 font-medium">Designing learning architecture...</p>
									<p className="text-sm text-gray-500 mt-2">Generating questions and competencies...</p>
								</div>
							</div>
						) : (
                            activeView === 'competency' ? (
                                <CompetencyMatrix />
                            ) : (
                                <SkillMapGraph 
                                    selectedCategories={selectedCategories} 
                                    graphData={aiGeneratedGraphData}
                                    onNodeClick={handleNodeClick}
                                />
                            )
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
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Left Sidebar - Wizard Progress */}
            <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
                isLeftDrawerOpen ? 'w-64' : 'w-0 opacity-0 overflow-hidden'
            }`}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                        <Sparkles className="w-5 h-5" />
                        <span>Course Wizard</span>
                    </div>
                </div>
                
                <div className="p-4 space-y-1">
                    {[
                        { id: 'INTENT', label: '1. Intent & Context', icon: MessageSquare },
                        { id: 'PROBLEMS', label: '2. Define Problem', icon: Target },
                        { id: 'FLOW_DESIGN', label: '3. Design Flow', icon: Layout },
                        { id: 'CONTENT_ENRICHMENT', label: '4. Enrich Content', icon: BookOpen },
                    ].map((step) => (
                        <div 
                            key={step.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentStep === step.id 
                                    ? 'bg-indigo-50 text-indigo-700' 
                                    : 'text-gray-500'
                            }`}
                        >
                            <step.icon className="w-4 h-4" />
                            {step.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Bar */}
                <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
                            className="p-2 hover:bg-gray-100 rounded-md text-gray-500"
                        >
                            {isLeftDrawerOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                        </button>
                        <h1 className="font-semibold text-gray-800">
                            {currentStep === 'INTENT' && "Define Course Intent"}
                            {currentStep === 'PROBLEMS' && "Select Problem"}
                            {currentStep === 'FLOW_DESIGN' && "Learning Flow Design"}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {currentStep !== 'FLOW_DESIGN' && currentStep !== 'CONTENT_ENRICHMENT' && <TokenUsageBadge />}
                        <button 
                            onClick={() => setShowApiKeyModal(true)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                apiKey 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                        >
                            <Key className="w-3 h-3" />
                            {apiKey ? 'API Key Set' : 'Set API Key'}
                        </button>
                    </div>
                </div>

                {/* Wizard Content */}
                {renderWizardStep()}

            </div>

            {/* API Key Modal */}
            {showApiKeyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Enter OpenAI API Key</h3>
                        <input
                            type="password"
                            value={tempApiKey}
                            onChange={(e) => setTempApiKey(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md mb-4"
                            placeholder="sk-..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowApiKeyModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveApiKey}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Save Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
