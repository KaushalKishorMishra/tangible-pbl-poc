import React, { useState } from 'react';
import { X, Network, List, BookOpen, Info, Plus, Trash2, CheckCircle, Sparkles, Layout, Target, Layers } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white/80 backdrop-blur-2xl w-full max-w-6xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/40 ring-1 ring-black/5 animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="relative overflow-hidden px-10 py-8 border-b border-slate-100 bg-white/40">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-indigo-600/10 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                </div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Knowledge Unit</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{node.properties.name}</h2>
                            <div className="flex items-center gap-3 mt-3">
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest 
                                    ${node.properties.level === 'Awareness' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                      node.properties.level === 'Application' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                      node.properties.level === 'Mastery' ? 'bg-violet-50 text-violet-600 border border-violet-100' :
                                      'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    {node.properties.level}
                                </span>
                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{node.properties.category}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSelectNode}
                                className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg ${
                                    isSelected 
                                        ? 'bg-emerald-500 text-white shadow-emerald-200' 
                                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200'
                                }`}
                            >
                                {isSelected ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Selected
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Include in Flow
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={onClose}
                                className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl"></div>
                </div>

                {/* Tabs */}
                <div className="flex px-10 bg-white/20 border-b border-slate-100">
                    {[
                        { id: 'details', label: 'Overview', icon: Info },
                        { id: 'skills', label: 'Architecture', icon: Network },
                        { id: 'competencies', label: 'Outcomes', icon: Target },
                        { id: 'resources', label: 'Materials', icon: BookOpen }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2.5 px-6 py-5 text-xs font-black uppercase tracking-[0.15em] transition-all relative group ${
                                activeTab === tab.id 
                                    ? 'text-indigo-600' 
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-6 right-6 h-1 bg-indigo-600 rounded-t-full animate-in slide-in-from-bottom-1 duration-300"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-slate-50/30 relative">
                    
                    {activeTab === 'details' && (
                        <div className="h-full overflow-y-auto p-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-8">
                                    <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 p-8 shadow-xl shadow-slate-200/50">
                                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                            Unit Description
                                        </h3>
                                        <p className="text-slate-500 font-medium leading-relaxed text-lg opacity-90">
                                            This knowledge unit focuses on the core principles and practical applications of {node.properties.name}. 
                                            It is designed to move learners from {node.properties.level === 'Awareness' ? 'initial understanding' : 'foundational knowledge'} 
                                            to {node.properties.level === 'Mastery' ? 'expert-level proficiency' : 'practical implementation'}.
                                        </p>
                                    </div>

                                    <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 p-8 shadow-xl shadow-slate-200/50">
                                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-violet-600 rounded-full"></div>
                                            Key Objectives
                                        </h3>
                                        <ul className="space-y-4">
                                            {[
                                                `Master the fundamental concepts of ${node.properties.name}`,
                                                `Apply theoretical knowledge to real-world scenarios`,
                                                `Develop competency at the ${node.properties.level} level`,
                                                `Integrate this skill into the broader ${node.properties.category} framework`
                                            ].map((obj, i) => (
                                                <li key={i} className="flex items-start gap-4 group">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 group-hover:scale-150 transition-transform"></div>
                                                    <span className="text-slate-500 font-medium">{obj}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 p-8 shadow-xl shadow-slate-200/50">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Metadata</h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Source</p>
                                                    <p className="text-sm font-black text-slate-900">{node.properties.source}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                                    <Layout className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Category</p>
                                                    <p className="text-sm font-black text-slate-900">{node.properties.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-violet-50 rounded-2xl text-violet-600">
                                                    <Target className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Target Level</p>
                                                    <p className="text-sm font-black text-slate-900">{node.properties.level}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="h-full animate-in fade-in duration-500">
                            {node.skills ? (
                                <SkillMapGraph 
                                    graphData={node.skills} 
                                    selectedCategories={[]} 
                                    isEmbedded={true}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
                                        <Network className="w-10 h-10 opacity-20" />
                                    </div>
                                    <p className="text-lg font-black tracking-tight text-slate-900 mb-2">No Sub-Architecture</p>
                                    <p className="text-sm font-medium opacity-60">Specific sub-skills haven't been mapped for this unit yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'competencies' && (
                        <div className="h-full overflow-y-auto p-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {node.competencies ? (
                                <div className="space-y-10">
                                    {node.competencies.map((skillItem, index) => (
                                        <div key={index} className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white/40 overflow-hidden shadow-xl shadow-slate-200/50">
                                            <div className="bg-white/40 px-10 py-6 border-b border-slate-100">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{skillItem.skill}</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                                {skillItem.levels.map((levelData, lIndex) => (
                                                    <div key={lIndex} className="p-8 group hover:bg-white transition-colors">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 block mb-4">
                                                            {levelData.level}
                                                        </span>
                                                        <p className="text-slate-900 font-black text-sm mb-3 leading-tight">{levelData.description}</p>
                                                        <p className="text-xs text-slate-500 font-medium italic opacity-70 leading-relaxed">{levelData.rubric}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
                                        <List className="w-10 h-10 opacity-20" />
                                    </div>
                                    <p className="text-lg font-black tracking-tight text-slate-900 mb-2">No Competency Framework</p>
                                    <p className="text-sm font-medium opacity-60">Outcomes and rubrics haven't been defined for this unit.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="h-full overflow-y-auto p-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Learning Materials</h3>
                                    <p className="text-slate-500 font-medium">Curated resources to master this knowledge unit.</p>
                                </div>
                                <button
                                    onClick={() => setIsAddingResource(true)}
                                    className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all text-sm font-black shadow-lg shadow-indigo-200"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Resource
                                </button>
                            </div>

                            {isAddingResource && (
                                <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border-2 border-indigo-100 p-8 mb-10 shadow-2xl shadow-indigo-100/50 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h4 className="text-lg font-black text-slate-900 mb-6">Add New Resource</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={newResourceTitle}
                                                onChange={(e) => setNewResourceTitle(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                                                placeholder="e.g., Advanced React Patterns"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL</label>
                                            <input
                                                type="text"
                                                value={newResourceUrl}
                                                onChange={(e) => setNewResourceUrl(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                            <select
                                                value={newResourceType}
                                                onChange={(e) => setNewResourceType(e.target.value as any)}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                                            >
                                                <option value="video">Video</option>
                                                <option value="pdf">PDF</option>
                                                <option value="text">Article/Text</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-8">
                                        <button
                                            onClick={() => setIsAddingResource(false)}
                                            className="px-6 py-3 text-slate-500 font-black text-sm hover:bg-slate-100 rounded-2xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddResource}
                                            className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all text-sm font-black shadow-lg shadow-slate-200"
                                        >
                                            Save Resource
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                {node.content && node.content.length > 0 ? (
                                    node.content.map((item, index) => (
                                        <div key={index} className="group relative">
                                            <div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500">
                                                <EmbeddedContentPlayer
                                                    type={item.type}
                                                    url={item.url}
                                                    title={item.title}
                                                    description={item.description}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleDeleteResource(index)}
                                                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 shadow-lg border border-rose-100"
                                                title="Remove resource"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-4 border-dashed border-slate-100 rounded-[40px] bg-white/20">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
                                            <BookOpen className="w-10 h-10 opacity-20" />
                                        </div>
                                        <p className="text-lg font-black tracking-tight text-slate-900 mb-2">No Materials Yet</p>
                                        <p className="text-sm font-medium opacity-60 mb-8">Start building your resource library for this unit.</p>
                                        <button
                                            onClick={() => setIsAddingResource(true)}
                                            className="flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all text-sm font-black shadow-xl shadow-indigo-100/50 border border-indigo-100"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add First Resource
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

