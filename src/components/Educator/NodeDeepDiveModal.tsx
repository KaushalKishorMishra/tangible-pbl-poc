import React, { useState } from 'react';
import { X, Network, List, BookOpen, Info, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useGraphStore } from '../../store/graphStore';
import { SkillMapGraph } from './SkillMapGraph';
import { EmbeddedContentPlayer } from '../Common/EmbeddedContentPlayer';

interface NodeDeepDiveModalProps {
    nodeId: string;
    onClose: () => void;
}

export const NodeDeepDiveModal: React.FC<NodeDeepDiveModalProps> = ({ nodeId, onClose }) => {
    const { aiGeneratedGraphData, updateNodeData, selectedNodeIds, toggleNodeSelection } = useGraphStore();
    const [activeTab, setActiveTab] = useState<'details' | 'skills' | 'competencies' | 'resources'>('details');
    const [newResourceUrl, setNewResourceUrl] = useState('');
    const [newResourceTitle, setNewResourceTitle] = useState('');
    const [newResourceType, setNewResourceType] = useState<'video' | 'pdf' | 'text'>('text');
    const [isAddingResource, setIsAddingResource] = useState(false);

    // Find the node data
    const node = aiGeneratedGraphData?.nodes.find(n => n.id === nodeId);

    if (!node) return null;

    const isSelected = selectedNodeIds.includes(nodeId);

    const handleAddResource = () => {
        if (!newResourceUrl || !newResourceTitle) return;

        const newResource = {
            type: newResourceType,
            url: newResourceUrl,
            title: newResourceTitle,
            description: 'User added resource'
        };

        const updatedContent = [...(node.content || []), newResource];
        updateNodeData(nodeId, { content: updatedContent });

        setNewResourceUrl('');
        setNewResourceTitle('');
        setIsAddingResource(false);
    };

    const handleDeleteResource = (index: number) => {
        const updatedContent = node.content?.filter((_, i) => i !== index);
        updateNodeData(nodeId, { content: updatedContent });
    };

    const handleSelectNode = () => {
        toggleNodeSelection(nodeId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{node.properties.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium 
                                ${node.properties.level === 'Awareness' ? 'bg-blue-100 text-blue-700' :
                                  node.properties.level === 'Application' ? 'bg-green-100 text-green-700' :
                                  node.properties.level === 'Mastery' ? 'bg-purple-100 text-purple-700' :
                                  'bg-orange-100 text-orange-700'}`}>
                                {node.properties.level}
                            </span>
                            <span className="text-sm text-gray-500">• {node.properties.category}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSelectNode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                isSelected 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                            {isSelected ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Selected
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Select Node
                                </>
                            )}
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'details' 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Info className="w-4 h-4" />
                        Details
                    </button>
                    <button
                        onClick={() => setActiveTab('skills')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'skills' 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Network className="w-4 h-4" />
                        Sub-Skills
                    </button>
                    <button
                        onClick={() => setActiveTab('competencies')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'competencies' 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        Competencies
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'resources' 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        Resources
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-gray-50 relative">
                    
                    {activeTab === 'details' && (
                        <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Source</label>
                                        <p className="text-gray-900">{node.properties.source}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                                        <p className="text-gray-900">{node.properties.category}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Level</label>
                                        <p className="text-gray-900">{node.properties.level}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        node.skills ? (
                            <SkillMapGraph 
                                graphData={node.skills} 
                                selectedCategories={[]} 
                                isEmbedded={true}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <Network className="w-12 h-12 mb-4 opacity-20" />
                                <p>No specific sub-skill graph generated for this unit yet.</p>
                            </div>
                        )
                    )}

                    {activeTab === 'competencies' && (
                        <div className="h-full overflow-y-auto p-6">
                            {node.competencies ? (
                                <div className="space-y-8">
                                    {node.competencies.map((skillItem, index) => (
                                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                                <h3 className="text-lg font-bold text-gray-800">{skillItem.skill}</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                                {skillItem.levels.map((levelData, lIndex) => (
                                                    <div key={lIndex} className="p-6">
                                                        <span className="font-semibold text-xs uppercase tracking-wider text-gray-500 block mb-2">
                                                            {levelData.level}
                                                        </span>
                                                        <p className="text-gray-900 font-medium mb-2">{levelData.description}</p>
                                                        <p className="text-xs text-gray-500 italic">{levelData.rubric}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <List className="w-12 h-12 mb-4 opacity-20" />
                                    <p>No competency framework defined for this unit.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Learning Materials</h3>
                                <button
                                    onClick={() => setIsAddingResource(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Resource
                                </button>
                            </div>

                            {isAddingResource && (
                                <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4 mb-6 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Resource</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={newResourceTitle}
                                                onChange={(e) => setNewResourceTitle(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                placeholder="e.g., Introduction to React"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
                                            <input
                                                type="text"
                                                value={newResourceUrl}
                                                onChange={(e) => setNewResourceUrl(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                            <select
                                                value={newResourceType}
                                                onChange={(e) => setNewResourceType(e.target.value as any)}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                            >
                                                <option value="video">Video</option>
                                                <option value="pdf">PDF</option>
                                                <option value="text">Article/Text</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button
                                                onClick={() => setIsAddingResource(false)}
                                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddResource}
                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Add Resource
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {node.content && node.content.length > 0 ? (
                                    node.content.map((item, index) => (
                                        <div key={index} className="group relative">
                                            <EmbeddedContentPlayer
                                                type={item.type}
                                                url={item.url}
                                                title={item.title}
                                                description={item.description}
                                            />
                                            <button
                                                onClick={() => handleDeleteResource(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                                title="Remove resource"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                                        <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                                        <p>No learning content available for this unit.</p>
                                        <button
                                            onClick={() => setIsAddingResource(true)}
                                            className="mt-2 text-blue-600 hover:underline text-sm"
                                        >
                                            Add your first resource
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
