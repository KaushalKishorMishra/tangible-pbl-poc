import React from "react";
import { Send, MessageSquare, X, Sparkles } from "lucide-react";

// Message Bubble Component
interface MessageBubbleProps {
	message: {
		id: string;
		content: string;
		sender: "ai" | "user";
		timestamp: Date;
	};
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
	const isAI = message.sender === "ai";
	
	return (
		<div className={`flex w-full mb-4 ${isAI ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
			<div className={`flex max-w-[85%] ${isAI ? "flex-row" : "flex-row-reverse"} items-end gap-2`}>
				{isAI && (
					<div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
						<Sparkles className="w-4 h-4 text-white" />
					</div>
				)}
				<div
					className={`relative px-4 py-3 rounded-2xl shadow-sm ${
						isAI
							? "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
							: "bg-linear-to-br from-indigo-600 to-violet-700 text-white rounded-br-none shadow-indigo-200"
					}`}
				>
					<p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
					<div className={`text-[10px] mt-1.5 font-medium opacity-50 ${isAI ? "text-gray-500" : "text-indigo-100"}`}>
						{new Date(message.timestamp).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

// Typing Indicator Component
export const TypingIndicator: React.FC = () => {
	return (
		<div className="flex justify-start mb-4 animate-in fade-in duration-300">
			<div className="flex items-center gap-2">
				<div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
					<Sparkles className="w-4 h-4 text-white" />
				</div>
				<div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
					<div className="flex space-x-1.5">
						<div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
						<div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
						<div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Quick Reply Options Component
interface QuickReplyOptionsProps {
	options: string[];
	onOptionSelect: (option: string) => void;
}

export const QuickReplyOptions: React.FC<QuickReplyOptionsProps> = ({
	options,
	onOptionSelect,
}) => {
	return (
		<div className="flex flex-wrap gap-2 mt-2 mb-4 animate-in fade-in slide-in-from-bottom-1 duration-500">
			{options.map((option) => (
				<button
					key={option}
					onClick={() => onOptionSelect(option)}
					className="px-4 py-2 bg-white text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all text-sm font-semibold border border-indigo-100 shadow-sm hover:shadow-indigo-200 active:scale-95"
				>
					{option}
				</button>
			))}
		</div>
	);
};

// Chat Input Component
interface ChatInputProps {
	value: string;
	onChange: (value: string) => void;
	onSend: () => void;
	onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	placeholder?: string;
	disabled?: boolean;
	inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
	value,
	onChange,
	onSend,
	onKeyPress,
	placeholder = "Type a message...",
	disabled = false,
	inputRef,
}) => {
	return (
		<div className="relative group">
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyPress}
				placeholder={placeholder}
				className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-all outline-none text-sm shadow-inner"
				disabled={disabled}
			/>
			<button
				onClick={onSend}
				disabled={!value.trim() || disabled}
				className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-indigo-200 active:scale-90"
			>
				<Send className="w-4 h-4" />
			</button>
		</div>
	);
};

// Floating Chat Button Component
interface FloatingChatButtonProps {
	isOpen: boolean;
	onClick: () => void;
	hasUnread?: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ isOpen, onClick, hasUnread }) => {
	return (
		<button
			onClick={onClick}
			className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group ${
				isOpen 
					? "bg-white text-gray-500 rotate-90 scale-90 border border-gray-100" 
					: "bg-linear-to-br from-indigo-600 to-violet-700 text-white hover:scale-110 hover:shadow-indigo-300"
			}`}
		>
			{isOpen ? (
				<X className="w-6 h-6" />
			) : (
				<div className="relative">
					<MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-12" />
					{hasUnread && (
						<span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
					)}
				</div>
			)}
			
			{!isOpen && (
				<div className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
					AI Design Assistant
					<div className="absolute top-1/2 -translate-y-1/2 left-full border-4 border-transparent border-l-gray-900"></div>
				</div>
			)}
		</button>
	);
};

