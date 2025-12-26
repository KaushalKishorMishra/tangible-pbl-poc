import React from 'react';
import { useGraphStore,  type Problem } from '../../store/graphStore';
import { ArrowRight, Clock, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';

interface ProblemSelectionPanelProps {
    onSelectProblem: (problem: Problem) => void;
    onRegenerate?: () => void;
    isGenerating: boolean;
}

export const ProblemSelectionPanel: React.FC<ProblemSelectionPanelProps> = ({ 
    onSelectProblem, 
    onRegenerate,
    isGenerating 
}) => {
    const { generatedProblems, selectedProblem } = useGraphStore();

    if (!generatedProblems || generatedProblems.length === 0) {
        return null;
    }

    return (
        <div className="w-full h-full bg-linear-to-br from-slate-50/50 to-indigo-50/30 p-8 overflow-y-auto scroll-smooth">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-600/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Synthesis Complete
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Choose a Learning Challenge</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        Select a real-world scenario to architect your curriculum. Each challenge is designed to build deep, practical competency.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
                    {generatedProblems.map((problem, idx) => (
                        <div 
                            key={problem.id}
                            style={{ animationDelay: `${idx * 100}ms` }}
                            className={`
                                group relative bg-white/70 backdrop-blur-xl rounded-[32px] border-2 transition-all duration-500 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-4
                                ${selectedProblem?.id === problem.id 
                                    ? 'border-indigo-600 shadow-2xl shadow-indigo-200 ring-1 ring-indigo-600/20 scale-[1.02]' 
                                    : 'border-white/40 shadow-xl shadow-slate-200/50 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2'}
                            `}
                            onClick={() => onSelectProblem(problem)}
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`
                                        px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest
                                        ${problem.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                          problem.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                          'bg-rose-50 text-rose-600 border border-rose-100'}
                                    `}>
                                        {problem.difficulty}
                                    </div>
                                    <div className="flex items-center bg-slate-50 px-4 py-2 rounded-2xl text-slate-500 text-xs font-bold border border-slate-100">
                                        <Clock className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                                        {problem.estimatedTime}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors tracking-tight leading-tight">{problem.title}</h3>
                                <p className="text-slate-500 text-sm mb-10 line-clamp-3 font-medium leading-relaxed opacity-80">
                                    {problem.description}
                                </p>

                                <div className="flex items-center gap-4">
                                    <button 
                                        className={`
                                            flex-1 py-4 px-8 rounded-2xl flex items-center justify-center gap-3 font-black text-sm transition-all duration-300
                                            ${selectedProblem?.id === problem.id
                                                ? 'bg-linear-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200'
                                                : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200'}
                                        `}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating && selectedProblem?.id === problem.id ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Architecting...
                                            </>
                                        ) : (
                                            <>
                                                {selectedProblem?.id === problem.id ? 'Selected' : 'Select Challenge'}
                                                {selectedProblem?.id === problem.id ? <CheckCircle className="w-5 h-5" /> : <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Decorative background element */}
                            <div className={`absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl transition-all duration-500 opacity-20 ${
                                selectedProblem?.id === problem.id ? 'bg-indigo-600 scale-150' : 'bg-slate-200 group-hover:bg-indigo-400'
                            }`}></div>
                        </div>
                    ))}
                </div>

                {onRegenerate && (
                    <div className="mt-16 text-center animate-in fade-in duration-1000 delay-500">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRegenerate();
                            }}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-slate-500 font-black text-sm hover:bg-white hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-100/50 transition-all disabled:opacity-50 border border-transparent hover:border-indigo-100"
                        >
                            <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                            Not what you're looking for? Regenerate Problems
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

