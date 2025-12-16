import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface GraphErrorStateProps {
	error: string;
	onRetry: () => void;
}

export const GraphErrorState: React.FC<GraphErrorStateProps> = ({
	error,
	onRetry,
}) => {
	return (
		<div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
			<div className="bg-red-50 p-4 rounded-full mb-4">
				<AlertCircle className="w-12 h-12 text-red-500" />
			</div>
			<h3 className="text-xl font-semibold text-gray-900 mb-2">
				Generation Failed
			</h3>
			<p className="text-gray-600 mb-6 max-w-md">
				{error || "We encountered an issue while generating your skill map. Please try again."}
			</p>
			<button
				onClick={onRetry}
				className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
			>
				<RefreshCw className="w-4 h-4" />
				<span>Retry Generation</span>
			</button>
		</div>
	);
};
