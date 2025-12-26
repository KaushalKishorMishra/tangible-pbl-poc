import React, { useMemo, useCallback } from 'react';
import { ReactFlow, Background, Panel, useNodesState, useEdgesState, type Node, type Edge, Position, Handle } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCourseStore } from '../../store/courseStore';
import { ArrowLeft, BookOpen, Clock, FileText, Video, Save, Layout, List } from 'lucide-react';
import { NodeContentEditor } from './NodeContentEditor';
import { StudyFlowControls } from './StudyFlowControls';
import { LMSView } from './LMSView';

// Custom Node Component
import { CustomEdge } from './CustomEdge';

const CourseNodeComponent = ({ data }: { data: any }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-[300px] overflow-hidden group hover:border-indigo-300 transition-all">
            <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-3 !h-3" />
            
            <div className="p-4 border-b border-gray-100 bg-gray-50 group-hover:bg-indigo-50/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Content Unit {data.index + 1}
                    </span>
                    {data.resources.length > 0 && (
                        <div className="flex gap-1">
                            {data.resources.some((r: any) => r.type === 'video') && <Video className="w-3 h-3 text-blue-500" />}
                            {data.resources.some((r: any) => r.type === 'pdf') && <FileText className="w-3 h-3 text-red-500" />}
                        </div>
                    )}
                </div>
                <h3 className="font-bold text-gray-900 leading-tight">{data.label}</h3>
            </div>
            
            <div className="p-4 space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{data.description || "No description added."}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{data.estimatedTime || "15 min"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{data.resources.length} Resources</span>
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-3 !h-3" />
        </div>
    );
};

const nodeTypes = {
    courseNode: CourseNodeComponent,
};

const edgeTypes = {
    custom: CustomEdge,
};

interface StudyFlowProps {
    onBack?: () => void;
    hideHeader?: boolean;
}

export const StudyFlow: React.FC<StudyFlowProps> = ({ onBack, hideHeader }) => {
    const { 
        courseData,
        setIsFlowViewActive,
        openNodeEditor,
        isNodeEditorOpen,
        saveCourseToStorage,
        addCourseEdge,
        removeCourseEdge,
        setCourseData,
        viewMode,
        setViewMode
    } = useCourseStore();

    // Ensure edges exist in courseData (migration for legacy/linear data)
    React.useEffect(() => {
        if (courseData && !courseData.edges) {
            const newEdges: { id: string; source: string; target: string }[] = [];
            courseData.nodes.forEach((node, index) => {
                if (index < courseData.nodes.length - 1) {
                    const nextNode = courseData.nodes[index + 1];
                    newEdges.push({
                        id: `e-${node.id}-${nextNode.id}`,
                        source: node.id,
                        target: nextNode.id
                    });
                }
            });
            // Update store with explicit edges
            setCourseData({ ...courseData, edges: newEdges });
        }
    }, [courseData, setCourseData]);

    // Transform course data to React Flow format
    const { initialNodes, initialEdges } = useMemo(() => {
        if (!courseData) return { initialNodes: [], initialEdges: [] };

        const rfNodes: Node[] = courseData.nodes.map((node, index) => ({
            id: node.id,
            type: 'courseNode',
            position: { x: index * 400, y: 250 }, // Horizontal layout
            data: { 
                label: node.label || node.title, // Handle both label and title properties
                description: node.description,
                resources: node.resources,
                estimatedTime: node.estimatedTime,
                index: index
            },
        }));

        const rfEdges: Edge[] = (courseData.edges || []).map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: 'custom', // Use custom edge type
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: { type: 'arrowclosed', color: '#6366f1' },
        }));

        return { initialNodes: rfNodes, initialEdges: rfEdges };
    }, [courseData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Sync local state with store data
    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        openNodeEditor(node.id);
    }, [openNodeEditor]);

    const onConnect = useCallback((params: any) => {
        if (params.source && params.target) {
            addCourseEdge(params.source, params.target);
        }
    }, [addCourseEdge]);

    const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
        deletedEdges.forEach(edge => {
            removeCourseEdge(edge.id);
        });
    }, [removeCourseEdge]);

    const handleSave = () => {
        saveCourseToStorage();
        alert("Course saved successfully!");
    };

    return (
        <div className="w-full h-full bg-slate-50 relative flex">
            <div className={`flex-1 relative transition-all duration-300 ${isNodeEditorOpen && viewMode === 'graph' ? 'mr-96' : ''}`}>
                {/* Header / Back Button */}
                {!hideHeader && (
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <button
                            onClick={() => onBack ? onBack() : setIsFlowViewActive(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors text-gray-700 font-medium border border-gray-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {onBack ? 'Back to Designer' : 'Back to Graph'}
                        </button>
                        
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-white font-medium"
                        >
                            <Save className="w-4 h-4" />
                            Save Course
                        </button>

                        <div className="h-full w-px bg-gray-300 mx-2"></div>

                        {/* View Toggle */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex">
                            <button
                                onClick={() => setViewMode('graph')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                    viewMode === 'graph' 
                                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <Layout className="w-4 h-4" />
                                Graph
                            </button>
                            <button
                                onClick={() => setViewMode('lms')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                    viewMode === 'lms' 
                                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <List className="w-4 h-4" />
                                LMS View
                            </button>
                        </div>
                    </div>
                )}

                {viewMode === 'graph' ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onEdgesDelete={onEdgesDelete}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes} // Register custom edge types
                        fitView
                        proOptions={{ hideAttribution: true }}
                        minZoom={0.1}
                    >
                        <Background color="#e2e8f0" gap={20} />
                        <Panel position="bottom-right">
                            <StudyFlowControls />
                        </Panel>
                    </ReactFlow>
                ) : (
                    <div className="w-full h-full pt-20 pb-4 px-4">
                        <div className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                            <LMSView />
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel Editor - Only show in Graph mode */}
            {viewMode === 'graph' && <NodeContentEditor />}
        </div>
    );
};
