import React from "react";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";

interface GraphErrorStateProps {
	error: string;
	onRetry: () => void;
}

export const GraphErrorState: React.FC<GraphErrorStateProps> = ({
	error,
	onRetry,
}) => {
	return (
		<div className="flex flex-col items-center justify-center h-full p-10 text-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 animate-in fade-in duration-500">
			<div className="relative mb-8">
				<div className="bg-rose-50 p-6 rounded-[32px] relative z-10 shadow-xl shadow-rose-100/50 border border-rose-100">
					<AlertCircle className="w-12 h-12 text-rose-500" />
				</div>
				<div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
			</div>

			<div className="mb-2 flex items-center justify-center gap-2">
				<div className="p-1 bg-rose-500/10 rounded-md">
					<Sparkles className="w-3 h-3 text-rose-500" />
				</div>
				<span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">
					System Interruption
				</span>
			</div>

			<h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">
				Generation Failed
			</h3>
			<p className="text-slate-500 mb-10 max-w-md font-medium leading-relaxed opacity-80">
				{error ||
					"We encountered an unexpected issue while designing your learning architecture. Our AI architects are standing by."}
			</p>
			<button
				onClick={onRetry}
				className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-200 font-black text-xs uppercase tracking-widest group"
			>
				<RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
				<span>Retry Generation</span>
			</button>
		</div>
	);
};
