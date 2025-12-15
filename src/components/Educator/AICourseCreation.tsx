import React, { useState, useRef, useEffect, useCallback } from"react";
import { Loader2 } from"lucide-react";
import { SkillMapGraph } from"./SkillMapGraph";
import { AIGraphGenerator } from"../../services/aiGraphGenerator";
import { useGraphStore } from"../../store/graphStore";
import {
	MessageBubble,
	TypingIndicator,
	QuickReplyOptions,
	ChatInput,
	ChatHeader,
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
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
	};

	const generateGraphWithAI = useCallback(async () => {
		setIsGeneratingGraph(true);
		
		try {
			// Get API key from environment variable
			const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

			console.log(apiKey)
			
			if (!apiKey) {
				throw new Error("Google AI API key not found. Please add VITE_GOOGLE_AI_API_KEY to your .env file");
			}

			const generator = new AIGraphGenerator(apiKey);
			const { graphData, filterData } = await generator.generateGraphFromCourse(courseData as CourseData);
			
			// Store generated data in local state
			setGeneratedGraphData(graphData);
			
			// Store in Zustand global store
			setAIGeneratedGraphData(graphData);
			setAvailableFilters(filterData);
			
			// Extract categories for filtering
			setSelectedCategories(filterData.category.slice(0, 5)); // Show first 5 categories by default
			
			// Add success message
			const successMessage: Message = {
				id: `success-${Date.now()}`,
				content: `✨ Success! I've generated ${graphData.nodesCount} skills and ${graphData.relationshipsCount} relationships for your course. You can now explore the skill map on the right!`,
				sender:"ai",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, successMessage]);
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
	}, [courseData]);

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

	const handleSendMessage = React.useCallback(() => {
		if (!inputValue.trim()) return;

		const messageId = `msg-${Date.now()}-${Math.random()}`;
		const userMessage: Message = {
			id: messageId,
			content: inputValue,
			sender:"user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);

		const currentQuestion = questions[currentQuestionIndex];
		setCourseData((prev) => ({
			...prev,
			[currentQuestion.key]: inputValue,
		}));

		setInputValue("");
		setCurrentQuestionIndex((prev) => prev + 1);

		// Ask next question
		setTimeout(() => {
			askQuestion(currentQuestionIndex + 1);
		}, 500);
	}, [askQuestion, currentQuestionIndex, inputValue]);

	const handleOptionSelect = React.useCallback(
		(option: string) => {
			const currentQuestion = questions[currentQuestionIndex];

			const messageId = `msg-${Date.now()}-${Math.random()}`;
			const userMessage: Message = {
				id: messageId,
				content: option,
				sender:"user",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, userMessage]);

			setCourseData((prev) => ({
				...prev,
				[currentQuestion.key]: option,
			}));

			setCurrentQuestionIndex((prev) => prev + 1);

			// Ask next question
			setTimeout(() => {
				askQuestion(currentQuestionIndex + 1);
			}, 500);
		},
		[askQuestion, currentQuestionIndex],
	);

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key ==="Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const currentQuestion = questions[currentQuestionIndex];

	return (
		<div className="h-screen flex bg-gray-50 transition-colors duration-300">
			{/* Chat Interface - Always 20% width */}
			<div className="w-[20%] flex flex-col bg-white border-r border-gray-200 transition-colors duration-300">

				{/* Header */}
				<ChatHeader
					title="AI Course Designer"
					subtitle={
						isComplete
							?"Mapping Skills"
							: `Question ${currentQuestionIndex + 1} of ${questions.length}`
					}
				/>

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

				{/* Input Area */}
				{!isComplete && !currentQuestion?.options && (
					<ChatInput
						value={inputValue}
						onChange={setInputValue}
						onSend={handleSendMessage}
						onKeyPress={handleKeyPress}
						placeholder={currentQuestion?.placeholder ||"Type your answer..."}
						inputRef={inputRef}
					/>
				)}

				{/* Completion State */}
				{isComplete && <CompletionState selectedCategories={selectedCategories} />}
			</div>

			{/* Skill Map - Always 80% width */}
			<div className="w-[80%] relative bg-gray-100 transition-colors duration-300">
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

					{/* Skills Legend - Always visible */}
					{/* <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
						<h4 className="text-sm font-semibold text-gray-900 mb-2">
							Skill Map
						</h4>
						<div className="flex items-center space-x-3">
							<div className="flex items-center space-x-1">
								<div className="w-3 h-3 rounded-full bg-green-500"></div>
								<span className="text-xs text-gray-700">Awareness</span>
							</div>
							<div className="flex items-center space-x-1">
								<div className="w-3 h-3 rounded-full bg-blue-500"></div>
								<span className="text-xs text-gray-700">Application</span>
							</div>
							<div className="flex items-center space-x-1">
								<div className="w-3 h-3 rounded-full bg-purple-500"></div>
								<span className="text-xs text-gray-700">Mastery</span>
							</div>
						</div>
					</div> */}
				</div>
			</div>
		</div>
	);
};
