import React from"react";
import { Send } from"lucide-react";

// Message Bubble Component
interface MessageBubbleProps {
	message: {
		id: string;
		content: string;
		sender:"ai" |"user";
		timestamp: Date;
	};
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
	return (
		<div
			className={`flex ${message.sender ==="user" ?"justify-end" :"justify-start"}`}
		>
			<div
				className={`max-w-[80%] rounded-lg px-4 py-3 ${
					message.sender ==="user"
						?"bg-blue-600 text-white"
						:"bg-gray-100 text-gray-900"
				}`}
			>
				<p className="text-sm whitespace-pre-wrap">{message.content}</p>
				<span className="text-xs opacity-70 mt-1 block">
					{message.timestamp.toLocaleTimeString([], {
						hour:"2-digit",
						minute:"2-digit",
					})}
				</span>
			</div>
		</div>
	);
};

// Typing Indicator Component
export const TypingIndicator: React.FC = () => {
	return (
		<div className="flex justify-start">
			<div className="bg-gray-100 rounded-lg px-4 py-3">
				<div className="flex space-x-2">
					<div
						className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
						style={{ animationDelay:"0ms" }}
					></div>
					<div
						className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
						style={{ animationDelay:"150ms" }}
					></div>
					<div
						className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
						style={{ animationDelay:"300ms" }}
					></div>
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
		<div className="flex flex-wrap gap-2">
			{options.map((option) => (
				<button
					key={option}
					onClick={() => onOptionSelect(option)}
					className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
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
	placeholder ="Type your answer...",
	disabled = false,
	inputRef,
}) => {
	return (
		<div className="p-4 border-t border-gray-200 bg-white transition-colors duration-300">
			<div className="flex space-x-2">
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyPress={onKeyPress}
					placeholder={placeholder}
					className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
					autoFocus
					disabled={disabled}
				/>
				<button
					onClick={onSend}
					disabled={!value.trim() || disabled}
					className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
				>
					<Send className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
};

// Chat Header Component
interface ChatHeaderProps {
	title: string;
	subtitle: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title, subtitle }) => {
	return (
		<div className="p-4 bg-linear-to-r from-blue-600 to-blue-700 text-white transition-colors duration-300">
			<div className="flex items-center space-x-3">
				<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
				</div>
				<div>
					<h2 className="text-lg font-semibold">{title}</h2>
					<p className="text-blue-100 text-xs">{subtitle}</p>
				</div>
			</div>
		</div>
	);
};

// Completion State Component
interface CompletionStateProps {
	selectedCategories: string[];
}

export const CompletionState: React.FC<CompletionStateProps> = ({
	selectedCategories,
}) => {
	return (
		<div className="p-4 border-t border-gray-200 bg-linear-to-r from-green-50 to-blue-50 transition-colors duration-300">
			<div className="text-center">
				<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
					<svg
						className="w-6 h-6 text-green-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<p className="text-sm font-medium text-gray-900">Skills Mapped!</p>
				<p className="text-xs text-gray-600 mt-1">
					{selectedCategories.length} categories selected
				</p>
			</div>
		</div>
	);
};
