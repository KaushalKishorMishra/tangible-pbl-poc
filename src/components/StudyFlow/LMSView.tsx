import React, { useState, useEffect } from 'react';
import { useCourseStore } from '../../store/courseStore';
import { BookOpen, ChevronLeft, ChevronRight, Play, FileText, File, HelpCircle, Menu, CheckCircle, Clock } from 'lucide-react';
import type { ResourceType } from '../../types/course';


const QuizRenderer = ({ content, onComplete, isCompleted }: { content: string, onComplete: () => void, isCompleted: boolean }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // If already completed, show success state immediately
    useEffect(() => {
        if (isCompleted) {
            setIsSubmitted(true);
        }
    }, [isCompleted]);

    let quizData;
    try {
        quizData = JSON.parse(content);
    } catch (e) {
        return <p className="text-red-500 text-sm mt-2">Error loading quiz.</p>;
    }

    const { question, options, correctOption } = quizData;

    const handleSubmit = () => {
        setIsSubmitted(true);
        if (selectedOption === correctOption) {
            onComplete();
        }
    };

    const handleRetry = () => {
        setIsSubmitted(false);
        setSelectedOption(null);
    };

    const isCorrect = selectedOption === correctOption || (isCompleted && isSubmitted);

    return (
        <div className="mt-4 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
            <p className="font-semibold text-gray-900 mb-3">{question}</p>
            <div className="space-y-2">
                {options.map((option: string, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => !isSubmitted && setSelectedOption(idx)}
                        disabled={isSubmitted}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
                            isSubmitted
                                ? idx === correctOption
                                    ? 'bg-green-100 border-green-200 text-green-800'
                                    : idx === selectedOption
                                        ? 'bg-red-100 border-red-200 text-red-800'
                                        : 'bg-white border-gray-200 text-gray-500 opacity-60'
                                : selectedOption === idx
                                    ? 'bg-indigo-100 border-indigo-300 text-indigo-900 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-indigo-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {isSubmitted && idx === correctOption && (
                                <span className="text-green-600 font-bold text-xs">Correct Answer</span>
                            )}
                            {isSubmitted && idx === selectedOption && idx !== correctOption && (
                                <span className="text-red-600 font-bold text-xs">Your Answer</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Submit Answer
                    </button>
                ) : (
                    <div className="flex items-center gap-3 w-full">
                        <div className={`flex-1 p-2 rounded-lg text-sm font-medium text-center ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isCorrect ? '🎉 Correct! Well done.' : '❌ Incorrect. Try again?'}
                        </div>
                        {!isCorrect && (
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const LMSView: React.FC = () => {
    const { courseData, completedResources, markResourceCompleted, nodeProgress, updateTimeSpent } = useCourseStore();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (courseData?.nodes.length && !selectedNodeId) {
            setSelectedNodeId(courseData.nodes[0].id);
        }
    }, [courseData, selectedNodeId]);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (selectedNodeId) {
            interval = setInterval(() => {
                updateTimeSpent(selectedNodeId, 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [selectedNodeId, updateTimeSpent]);

    if (!courseData) return null;

    const selectedNodeIndex = courseData.nodes.findIndex(n => n.id === selectedNodeId);
    const selectedNode = courseData.nodes[selectedNodeIndex];

    // Helper to parse HH:MM or HH:MM:SS to seconds
    const getRequiredSeconds = (timeStr?: string) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.some(isNaN)) return 0;
        
        if (parts.length === 3) {
            return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        }
        if (parts.length === 2) {
            return (parts[0] * 3600) + (parts[1] * 60);
        }
        return 0;
    };

    // Check if a node is completed (all resources are marked completed AND time requirement met)
    const isNodeCompleted = (node: typeof courseData.nodes[0] | undefined) => {
        if (!node) return false;
        
        // 1. Check Resources
        const resourcesCompleted = node.resources.length === 0 || node.resources.every(r => completedResources.includes(r.id));
        
        // 2. Check Time
        const requiredSeconds = getRequiredSeconds(node.estimatedTime);
        const timeSpent = nodeProgress[node.id]?.timeSpent || 0;
        const timeCompleted = timeSpent >= requiredSeconds;

        return resourcesCompleted && timeCompleted;
    };

    // Calculate the furthest unlocked index
    // A node is unlocked if the previous node is completed
    let maxUnlockedIndex = 0;
    for (let i = 0; i < courseData.nodes.length; i++) {
        if (isNodeCompleted(courseData.nodes[i])) {
            maxUnlockedIndex = i + 1;
        } else {
            break;
        }
    }
    // Ensure we don't go out of bounds
    maxUnlockedIndex = Math.min(maxUnlockedIndex, courseData.nodes.length - 1);

    const handleNext = () => {
        if (selectedNodeIndex < courseData.nodes.length - 1 && isNodeCompleted(selectedNode)) {
            setSelectedNodeId(courseData.nodes[selectedNodeIndex + 1].id);
        }
    };

    const handlePrev = () => {
        if (selectedNodeIndex > 0) {
            setSelectedNodeId(courseData.nodes[selectedNodeIndex - 1].id);
        }
    };

    const getIcon = (type: ResourceType) => {
        switch (type) {
            case 'video': return <Play className="w-4 h-4" />;
            case 'pdf': return <File className="w-4 h-4" />;
            case 'quiz': return <HelpCircle className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div className="flex h-full bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-bold text-gray-800 truncate" title={courseData.title}>{courseData.title}</h2>
                    <p className="text-xs text-gray-500 mt-1">{courseData.nodes.length} Units</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {courseData.nodes.map((node, idx) => {
                        const isLocked = idx > maxUnlockedIndex;
                        const isCompleted = isNodeCompleted(node);
                        
                        return (
                            <button
                                key={node.id}
                                onClick={() => !isLocked && setSelectedNodeId(node.id)}
                                disabled={isLocked}
                                className={`w-full text-left p-3 rounded-xl text-sm transition-all flex items-start gap-3 ${
                                    selectedNodeId === node.id 
                                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm ring-1 ring-indigo-200' 
                                    : isLocked 
                                        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                                        : 'hover:bg-gray-50 text-gray-600'
                                }`}
                            >
                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                                    isCompleted 
                                        ? 'bg-green-100 text-green-600' 
                                        : selectedNodeId === node.id 
                                            ? 'bg-indigo-200 text-indigo-700' 
                                            : isLocked 
                                                ? 'bg-gray-200 text-gray-400'
                                                : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {isCompleted ? '✓' : isLocked ? '🔒' : idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="line-clamp-2">{node.label || node.title}</p>
                                    <div className="flex items-center gap-2 mt-1.5 opacity-70">
                                        <span className="text-[10px] flex items-center gap-1">
                                            <BookOpen className="w-3 h-3" /> {node.resources.length}
                                        </span>
                                        {node.estimatedTime && (
                                            <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-md">
                                                {node.estimatedTime}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="font-bold text-gray-800 text-lg truncate max-w-2xl">
                            {selectedNode ? (selectedNode.label || selectedNode.title) : 'Select a Unit'}
                        </h1>
                    </div>
                    
                    {selectedNode && (
                        <div className="flex items-center gap-2 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className={`${
                                (nodeProgress[selectedNode.id]?.timeSpent || 0) >= getRequiredSeconds(selectedNode.estimatedTime) 
                                ? 'text-green-600' 
                                : 'text-gray-600'
                            }`}>
                                {(() => {
                                    const spent = nodeProgress[selectedNode.id]?.timeSpent || 0;
                                    const required = getRequiredSeconds(selectedNode.estimatedTime);
                                    const remaining = Math.max(0, required - spent);
                                    
                                    const formatTime = (seconds: number) => {
                                        const h = Math.floor(seconds / 3600);
                                        const m = Math.floor((seconds % 3600) / 60);
                                        const s = seconds % 60;
                                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                    };

                                    return remaining > 0 ? `Time Remaining: ${formatTime(remaining)}` : 'Time Requirement Met';
                                })()}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={selectedNodeIndex <= 0}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={selectedNodeIndex >= courseData.nodes.length - 1 || !isNodeCompleted(selectedNode)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title={!isNodeCompleted(selectedNode) ? "Complete all resources to proceed" : "Next Unit"}
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    {selectedNode ? (
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Description */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
                                        <BookOpen className="w-5 h-5" />
                                    </span>
                                    Overview
                                </h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {selectedNode.description || "No description available for this unit."}
                                </p>
                            </div>

                            {/* Resources */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 px-1">Learning Resources</h3>
                                {selectedNode.resources.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                                        <p className="text-gray-500">No resources available for this unit yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {selectedNode.resources.map(resource => {
                                            const isResourceCompleted = completedResources.includes(resource.id);
                                            
                                            return (
                                                <div key={resource.id} className={`bg-white p-5 rounded-xl border transition-all group ${
                                                    isResourceCompleted ? 'border-green-200 shadow-sm' : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                                }`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={`p-3 rounded-xl ${
                                                            isResourceCompleted ? 'bg-green-50 text-green-600' :
                                                            resource.type === 'video' ? 'bg-blue-50 text-blue-600' :
                                                            resource.type === 'pdf' ? 'bg-red-50 text-red-600' :
                                                            resource.type === 'quiz' ? 'bg-purple-50 text-purple-600' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {isResourceCompleted ? <CheckCircle className="w-4 h-4" /> : getIcon(resource.type)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className={`font-bold transition-colors ${isResourceCompleted ? 'text-green-800' : 'text-gray-900 group-hover:text-indigo-700'}`}>
                                                                    {resource.title}
                                                                </h4>
                                                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                                                                    isResourceCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400'
                                                                }`}>
                                                                    {isResourceCompleted ? 'Completed' : resource.type}
                                                                </span>
                                                            </div>
                                                            {resource.content && resource.type !== 'quiz' && (
                                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{resource.content}</p>
                                                            )}
                                                            {resource.url && (
                                                                <a 
                                                                    href={resource.url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium mt-3 hover:underline"
                                                                    onClick={() => !isResourceCompleted && markResourceCompleted(resource.id)}
                                                                >
                                                                    Open Resource <ChevronRight className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                            {resource.type === 'quiz' && resource.content && (
                                                                <QuizRenderer 
                                                                    content={resource.content} 
                                                                    onComplete={() => markResourceCompleted(resource.id)}
                                                                    isCompleted={isResourceCompleted}
                                                                />
                                                            )}
                                                            
                                                            {/* Manual Complete Button for non-quiz/non-url resources or just explicit action */}
                                                            {!isResourceCompleted && resource.type !== 'quiz' && (
                                                                <button
                                                                    onClick={() => markResourceCompleted(resource.id)}
                                                                    className="mt-3 text-xs font-semibold text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                                                >
                                                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 hover:border-indigo-500"></div>
                                                                    Mark as Completed
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a unit from the sidebar to start learning</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
