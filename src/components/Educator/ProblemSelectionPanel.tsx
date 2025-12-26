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
        <div className="w-full h-full bg-gray-50/50 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkles className="w-3 h-3" />
                        AI Generated Problems
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Choose a Challenge</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Select a real-world problem to generate a tailored learning architecture and competency framework.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                    {generatedProblems.map((problem) => (
                        <div 
                            key={problem.id}
                            className={`
                                group relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1
                                ${selectedProblem?.id === problem.id 
                                    ? 'border-indigo-600 ring-4 ring-indigo-50' 
                                    : 'border-slate-100 hover:border-indigo-200'}
                            `}
                            onClick={() => onSelectProblem(problem)}
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`
                                        px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide
                                        ${problem.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700' :
                                          problem.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700' :
                                          'bg-rose-50 text-rose-700'}
                                    `}>
                                        {problem.difficulty}
                                    </span>
                                    <div className="flex items-center text-slate-400 text-sm font-medium">
                                        <Clock className="w-4 h-4 mr-1.5" />
                                        {problem.estimatedTime}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{problem.title}</h3>
                                <p className="text-slate-600 text-sm mb-8 line-clamp-3 leading-relaxed">
                                    {problem.description}
                                </p>

                                <button 
                                    className={`
                                        w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-200
                                        ${selectedProblem?.id === problem.id
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'}
                                    `}
                                    disabled={isGenerating}
                                >
                                    {isGenerating && selectedProblem?.id === problem.id ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Architecting...
                                        </>
                                    ) : (
                                        <>
                                            {selectedProblem?.id === problem.id ? 'Selected' : 'Select Challenge'}
                                            {selectedProblem?.id === problem.id ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {onRegenerate && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRegenerate();
                            }}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            Not what you're looking for? Regenerate Problems
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
