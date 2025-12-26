import React from 'react';
import { useGraphStore,  type Problem } from '../../store/graphStore';
import { ArrowRight, Clock, BarChart, CheckCircle } from 'lucide-react';

interface ProblemSelectionPanelProps {
    onSelectProblem: (problem: Problem) => void;
    isGenerating: boolean;
}

export const ProblemSelectionPanel: React.FC<ProblemSelectionPanelProps> = ({ onSelectProblem, isGenerating }) => {
    const { generatedProblems, selectedProblem } = useGraphStore();

    if (!generatedProblems || generatedProblems.length === 0) {
        return null;
    }

    return (
        <div className="w-full h-full bg-gray-50 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Problem to Solve</h2>
                    <p className="text-gray-600">
                        Select a real-world problem to generate a tailored study plan.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {generatedProblems.map((problem) => (
                        <div 
                            key={problem.id}
                            className={`
                                relative bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-md
                                ${selectedProblem?.id === problem.id 
                                    ? 'border-indigo-600 ring-2 ring-indigo-100' 
                                    : 'border-transparent hover:border-indigo-200'}
                            `}
                            onClick={() => onSelectProblem(problem)}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`
                                        px-3 py-1 rounded-full text-xs font-semibold
                                        ${problem.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                          problem.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-red-100 text-red-700'}
                                    `}>
                                        {problem.difficulty}
                                    </span>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {problem.estimatedTime}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2">{problem.title}</h3>
                                <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                                    {problem.description}
                                </p>

                                <button 
                                    className={`
                                        w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors
                                        ${selectedProblem?.id === problem.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                                    `}
                                    disabled={isGenerating}
                                >
                                    {isGenerating && selectedProblem?.id === problem.id ? (
                                        <>Generating Plan...</>
                                    ) : (
                                        <>
                                            {selectedProblem?.id === problem.id ? 'Selected' : 'Select Problem'}
                                            {selectedProblem?.id === problem.id ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
