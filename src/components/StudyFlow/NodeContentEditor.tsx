import React, { useState } from 'react';
import { X, Plus, FileText, Video, File, HelpCircle, Trash2 } from 'lucide-react';
import { useGraphStore } from '../../store/graphStore';
import type { ResourceType, ContentResource } from '../../types/course';

export const NodeContentEditor: React.FC = () => {
    const { 
        isNodeEditorOpen, 
        editingNodeId, 
        courseData, 
        closeNodeEditor,
        addNodeResource,
        removeNodeResource,
        updateNodeContent
    } = useGraphStore();

    const [isAdding, setIsAdding] = useState(false);
    const [newResource, setNewResource] = useState<Partial<ContentResource>>({ type: 'article' });

    if (!isNodeEditorOpen || !editingNodeId || !courseData) return null;

    const node = courseData.nodes.find(n => n.id === editingNodeId);
    if (!node) return null;

    const handleAddResource = () => {
        if (!newResource.title) return;

        const resource: ContentResource = {
            id: `res-${Date.now()}`,
            title: newResource.title,
            type: newResource.type || 'article',
            url: newResource.url,
            content: newResource.content,
            duration: newResource.duration
        };

        addNodeResource(editingNodeId, resource);
        setIsAdding(false);
        setNewResource({ type: 'article' });
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
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="font-semibold text-gray-900">Edit Content</h3>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{node.title}</p>
                </div>
                <button onClick={closeNodeEditor} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Node Details */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                    <textarea
                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-24"
                        placeholder="Add a description for this learning module..."
                        value={node.description || ''}
                        onChange={(e) => updateNodeContent(editingNodeId, { description: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Estimated Time</label>
                    <input
                        type="text"
                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. 15 min"
                        value={node.estimatedTime || ''}
                        onChange={(e) => updateNodeContent(editingNodeId, { estimatedTime: e.target.value })}
                    />
                </div>

                {/* Resources */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-gray-500 uppercase">Learning Resources</label>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            <Plus className="w-3 h-3" /> Add New
                        </button>
                    </div>

                    {isAdding && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <input
                                type="text"
                                placeholder="Resource Title"
                                className="w-full p-2 text-sm border border-gray-200 rounded bg-white"
                                value={newResource.title || ''}
                                onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                            />
                            <select
                                className="w-full p-2 text-sm border border-gray-200 rounded bg-white"
                                value={newResource.type}
                                onChange={e => setNewResource({ ...newResource, type: e.target.value as ResourceType })}
                            >
                                <option value="article">Article / Text</option>
                                <option value="video">Video</option>
                                <option value="pdf">PDF Document</option>
                                <option value="quiz">Quiz</option>
                            </select>
                            
                            {newResource.type === 'video' || newResource.type === 'pdf' ? (
                                <input
                                    type="text"
                                    placeholder="URL (e.g. YouTube link)"
                                    className="w-full p-2 text-sm border border-gray-200 rounded bg-white"
                                    value={newResource.url || ''}
                                    onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                />
                            ) : (
                                <textarea
                                    placeholder="Content..."
                                    className="w-full p-2 text-sm border border-gray-200 rounded bg-white h-20"
                                    value={newResource.content || ''}
                                    onChange={e => setNewResource({ ...newResource, content: e.target.value })}
                                />
                            )}

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleAddResource}
                                    disabled={!newResource.title}
                                    className="flex-1 bg-indigo-600 text-white py-1.5 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {node.resources.length === 0 && !isAdding && (
                            <p className="text-sm text-gray-400 italic text-center py-4">No resources added yet.</p>
                        )}
                        {node.resources.map(resource => (
                            <div key={resource.id} className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm hover:border-indigo-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                        {getIcon(resource.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                                        <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeNodeResource(editingNodeId, resource.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
