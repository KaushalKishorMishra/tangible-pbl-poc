import { X, Plus, FileText, Video, File, HelpCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import type { ResourceType, ContentResource } from '../../types/course';
import { useState } from 'react';

export const NodeContentEditor: React.FC = () => {
    const [showSaved, setShowSaved] = useState(false);
    const { 
        isNodeEditorOpen, 
        editingNodeId, 
        courseData, 
        closeNodeEditor,
        addNodeResource,
        removeNodeResource,
        updateNodeContent,
        saveCourseToStorage,
        reorderNodes
    } = useCourseStore();

    const [isAdding, setIsAdding] = useState(false);
    const [newResource, setNewResource] = useState<Partial<ContentResource>>({ type: 'article' });

    const [quizData, setQuizData] = useState({
        question: '',
        options: ['', '', '', ''],
        correctOption: 0
    });

    const handleSave = () => {
        saveCourseToStorage();
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
    };

    if (!isNodeEditorOpen || !editingNodeId || !courseData) return null;

    const nodeIndex = courseData.nodes.findIndex(n => n.id === editingNodeId);
    const node = courseData.nodes[nodeIndex];
    if (!node) return null;

    const isFirst = nodeIndex === 0;
    const isLast = nodeIndex === courseData.nodes.length - 1;

    const handleMoveUp = () => {
        if (!isFirst) {
            reorderNodes(nodeIndex, nodeIndex - 1);
        }
    };

    const handleMoveDown = () => {
        if (!isLast) {
            reorderNodes(nodeIndex, nodeIndex + 1);
        }
    };

    const handleAddResource = () => {
        if (!newResource.title) return;

        let content = newResource.content;
        if (newResource.type === 'quiz') {
            content = JSON.stringify(quizData);
        }

        const resource: ContentResource = {
            id: `res-${Date.now()}`,
            title: newResource.title,
            type: newResource.type || 'article',
            url: newResource.url,
            content: content,
            duration: newResource.duration
        };

        addNodeResource(editingNodeId, resource);
        setIsAdding(false);
        setNewResource({ type: 'article' });
        setQuizData({ question: '', options: ['', '', '', ''], correctOption: 0 });
    };

    const getIcon = (type: ResourceType) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4 text-blue-500" />;
            case 'pdf': return <File className="w-4 h-4 text-red-500" />;
            case 'quiz': return <HelpCircle className="w-4 h-4 text-purple-500" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-white/20 flex flex-col font-sans">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-white">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Edit Content</h3>
                    <p className="text-sm text-indigo-600 font-medium truncate max-w-[300px]">{node.title}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        <button 
                            onClick={handleMoveUp}
                            disabled={isFirst}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
                            title="Move Up"
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
                        <button 
                            onClick={handleMoveDown}
                            disabled={isLast}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
                            title="Move Down"
                        >
                            <ArrowDown className="w-4 h-4" />
                        </button>
                    </div>
                    <button 
                        onClick={closeNodeEditor} 
                        className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 text-gray-400 hover:text-gray-600 group ml-1"
                    >
                        <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-24">
                {/* Node Details */}
                <section className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            className="w-full p-4 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none h-32 transition-all duration-200 placeholder:text-gray-500 text-gray-900"
                            placeholder="What will students learn in this module?"
                            value={node.description || ''}
                            onChange={(e) => updateNodeContent(editingNodeId, { description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Estimated Time</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full p-3 pl-10 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-500"
                                placeholder="e.g. 15 min"
                                value={node.estimatedTime || ''}
                                onChange={(e) => updateNodeContent(editingNodeId, { estimatedTime: e.target.value })}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resources */}
                <section className="space-y-4">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Learning Resources</label>
                        {!isAdding && (
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 font-semibold transition-all duration-200"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Resource
                            </button>
                        )}
                    </div>

                    {isAdding && (
                        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-500/5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-gray-900">New Resource</h4>
                                <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md font-medium">Draft</span>
                            </div>
                            
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Title (e.g. Introduction to Hooks)"
                                    className="w-full p-3 text-sm bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                    value={newResource.title || ''}
                                    onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                />
                                
                                <div className="relative">
                                    <select
                                        className="w-full p-3 text-sm bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer text-gray-900"
                                        value={newResource.type}
                                        onChange={e => setNewResource({ ...newResource, type: e.target.value as ResourceType })}
                                    >
                                        <option value="article">📄 Article / Text</option>
                                        <option value="video">🎥 Video</option>
                                        <option value="pdf">📚 PDF Document</option>
                                        <option value="quiz">❓ Quiz</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                
                                {newResource.type === 'quiz' ? (
                                    <div className="space-y-3 pt-2">
                                        <input
                                            type="text"
                                            placeholder="Question?"
                                            className="w-full p-3 text-sm bg-indigo-50/50 border-indigo-100 border rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-gray-900 placeholder:text-indigo-400"
                                            value={quizData.question}
                                            onChange={e => setQuizData({ ...quizData, question: e.target.value })}
                                        />
                                        <div className="space-y-2 bg-gray-50 p-3 rounded-xl">
                                            <label className="text-xs font-semibold text-gray-500 ml-1">Options & Correct Answer</label>
                                            {quizData.options.map((opt, idx) => (
                                                <div key={idx} className="flex items-center gap-3 group">
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="radio"
                                                            name="correctOption"
                                                            checked={quizData.correctOption === idx}
                                                            onChange={() => setQuizData({ ...quizData, correctOption: idx })}
                                                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-indigo-500 checked:border-4 transition-all cursor-pointer"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder={`Option ${idx + 1}`}
                                                        className={`flex-1 p-2 text-sm border-b-2 border-transparent bg-transparent focus:border-indigo-500 focus:bg-white rounded-md outline-none transition-all ${quizData.correctOption === idx ? 'text-indigo-700 font-medium' : 'text-gray-900'}`}
                                                        value={opt}
                                                        onChange={e => {
                                                            const newOptions = [...quizData.options];
                                                            newOptions[idx] = e.target.value;
                                                            setQuizData({ ...quizData, options: newOptions });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : newResource.type === 'video' || newResource.type === 'pdf' ? (
                                    <input
                                        type="text"
                                        placeholder="Paste URL here..."
                                        className="w-full p-3 text-sm bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                        value={newResource.url || ''}
                                        onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                    />
                                ) : (
                                    <textarea
                                        placeholder="Write content here..."
                                        className="w-full p-3 text-sm bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-24 transition-all text-gray-900 placeholder:text-gray-500"
                                        value={newResource.content || ''}
                                        onChange={e => setNewResource({ ...newResource, content: e.target.value })}
                                    />
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleAddResource}
                                    disabled={!newResource.title}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    Add Resource
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 bg-white border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:text-gray-900 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {node.resources.length === 0 && !isAdding && (
                            <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                                <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-3">
                                    <Plus className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">No resources yet</p>
                                <p className="text-xs text-gray-400 mt-1">Add videos, docs, or quizzes to this module</p>
                            </div>
                        )}
                        {node.resources.map(resource => (
                            <div key={resource.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-colors ${
                                        resource.type === 'video' ? 'bg-blue-50 text-blue-600' :
                                        resource.type === 'pdf' ? 'bg-red-50 text-red-600' :
                                        resource.type === 'quiz' ? 'bg-purple-50 text-purple-600' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {getIcon(resource.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{resource.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                                {resource.type}
                                            </span>
                                            {resource.duration && (
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    • {resource.duration}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeNodeResource(editingNodeId, resource.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Remove resource"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Footer with Save Button */}
            <div className="p-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                <button
                    onClick={handleSave}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                        showSaved 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                        : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                >
                    {showSaved ? (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Saved to Storage
                        </>
                    ) : (
                        <>
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
