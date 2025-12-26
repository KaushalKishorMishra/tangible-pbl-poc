import React from 'react';
import { useGraphStore } from '../../store/graphStore';
import { CheckCircle, BookOpen, Award, Zap } from 'lucide-react';

export const CompetencyMatrix: React.FC = () => {
    const { competencyFramework } = useGraphStore();

    if (!competencyFramework || competencyFramework.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No competency framework generated yet.
            </div>
        );
    }

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'Awareness': return <BookOpen className="w-4 h-4 text-blue-500" />;
            case 'Application': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'Mastery': return <Award className="w-4 h-4 text-purple-500" />;
            case 'Influence': return <Zap className="w-4 h-4 text-yellow-500" />;
            default: return <BookOpen className="w-4 h-4" />;
        }
    };

    return (
        <div className="w-full h-full bg-gray-50 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Competency Framework</h2>
                    <p className="text-gray-600">Skills, levels, rubrics, and proof of work for this problem.</p>
                </div>

                <div className="space-y-8">
                    {competencyFramework.map((skillItem, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800">{skillItem.skill}</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                {skillItem.levels.map((levelData, lIndex) => (
                                    <div key={lIndex} className="p-6 flex flex-col h-full hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-2 mb-3">
                                            {getLevelIcon(levelData.level)}
                                            <span className="font-semibold text-sm uppercase tracking-wider text-gray-500">
                                                {levelData.level}
                                            </span>
                                        </div>
                                        
                                        <div className="mb-4 flex-grow">
                                            <p className="text-gray-900 font-medium mb-2">{levelData.description}</p>
                                            <p className="text-xs text-gray-500 italic">{levelData.rubric}</p>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <span className="text-xs font-semibold text-gray-400 block mb-1">PROOF OF WORK</span>
                                            <p className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block">
                                                {levelData.proofOfWork}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
