import React, { useState, useMemo } from'react';
import { Search, X, Check, Target, Plus, BookOpen } from'lucide-react';
import { useGraphStore } from'../../store/graphStore';
import { useSigma } from'@react-sigma/core';

interface Skill {
 id: string;
 name: string;
 level: string;
 category: string;
 description?: string;
}

interface LearningOutcome {
 skillId: string;
 targetLevel: string;
 rationale?: string;
}

interface SkillMapDesignerProps {
 onOutcomesSelected: (outcomes: LearningOutcome[]) => void;
 initialOutcomes?: LearningOutcome[];
}

export const SkillMapDesigner: React.FC<SkillMapDesignerProps> = ({
 onOutcomesSelected,
 initialOutcomes = [],
}) => {
 const sigma = useSigma();
 const { selectedNodeIds, setSelectedNodeIds } = useGraphStore();
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedCategory, setSelectedCategory] = useState<string>('all');
 const [selectedLevel, setSelectedLevel] = useState<string>('all');
 const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>(initialOutcomes);


 // Extract skills from the graph
 const availableSkills = useMemo(() => {
  if (!sigma) return [];

  const graph = sigma.getGraph();
  const skills: Skill[] = [];

  graph.forEachNode((nodeId: string, attributes: Record<string, unknown>) => {
   skills.push({
    id: nodeId,
    name: (attributes.label as string) || nodeId,
    level: (attributes.level as string) ||'Awareness',
    category: (attributes.category as string) ||'General',
    description: attributes.description as string | undefined,
   });
  });

  return skills;
 }, [sigma]);

 // Filter skills based on search and filters
 const filteredSkills = availableSkills.filter(skill => {
  const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             skill.category.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = selectedCategory ==='all' || skill.category === selectedCategory;
  const matchesLevel = selectedLevel ==='all' || skill.level === selectedLevel;

  return matchesSearch && matchesCategory && matchesLevel;
 });

 // Get unique categories and levels for filters
 const categories = ['all', ...Array.from(new Set(availableSkills.map(s => s.category)))];
 const levels = ['all','Awareness','Application','Mastery','Influence'];

 const handleSkillSelect = (skillId: string) => {
  const isSelected = selectedNodeIds.includes(skillId);
  if (isSelected) {
   setSelectedNodeIds(selectedNodeIds.filter(id => id !== skillId));
  } else {
   setSelectedNodeIds([...selectedNodeIds, skillId]);
  }
 };

 const handleAddToOutcomes = (skill: Skill) => {
  if (!learningOutcomes.find(outcome => outcome.skillId === skill.id)) {
   const newOutcome: LearningOutcome = {
    skillId: skill.id,
    targetLevel: skill.level,
    rationale:'',
   };
   const updatedOutcomes = [...learningOutcomes, newOutcome];
   setLearningOutcomes(updatedOutcomes);
   onOutcomesSelected(updatedOutcomes);
  }
 };

 const handleRemoveOutcome = (skillId: string) => {
  const updatedOutcomes = learningOutcomes.filter(outcome => outcome.skillId !== skillId);
  setLearningOutcomes(updatedOutcomes);
  onOutcomesSelected(updatedOutcomes);
 };

 const handleLevelChange = (skillId: string, level: string) => {
  const updatedOutcomes = learningOutcomes.map(outcome =>
   outcome.skillId === skillId ? { ...outcome, targetLevel: level } : outcome
  );
  setLearningOutcomes(updatedOutcomes);
  onOutcomesSelected(updatedOutcomes);
 };

 return (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col transition-colors duration-300">
   {/* Header */}
   <div className="p-6 border-b border-gray-200">
    <div className="flex items-center space-x-3 mb-4">
     <Target className="w-6 h-6 text-blue-600" />
     <h2 className="text-xl font-semibold text-gray-900">Skill Map Designer</h2>
    </div>
    <p className="text-gray-600 text-sm">
     Select skills from the map to define your course learning outcomes. Choose target proficiency levels for each skill.
    </p>
   </div>

   <div className="flex-1 flex">
    {/* Skills Panel */}
    <div className="w-80 border-r border-gray-200 flex flex-col">
     {/* Search and Filters */}
     <div className="p-4 border-b border-gray-200 space-y-3">
      <div className="relative">
       <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
       <input
        type="text"
        placeholder="Search skills..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
       />
      </div>

      <div className="grid grid-cols-2 gap-2">
       <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
       >
        {categories.map(category => (
         <option key={category} value={category}>
          {category ==='all' ?'All Categories' : category}
         </option>
        ))}
       </select>

       <select
        value={selectedLevel}
        onChange={(e) => setSelectedLevel(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
       >
        {levels.map(level => (
         <option key={level} value={level}>
          {level ==='all' ?'All Levels' : level}
         </option>
        ))}
       </select>
      </div>
     </div>

     {/* Skills List */}
     <div className="flex-1 overflow-y-auto">
      <div className="p-4">
       <h3 className="text-sm font-medium text-gray-900 mb-3">
        Available Skills ({filteredSkills.length})
       </h3>
       <div className="space-y-2">
        {filteredSkills.map(skill => {
         const isSelected = selectedNodeIds.includes(skill.id);
         const isInOutcomes = learningOutcomes.some(outcome => outcome.skillId === skill.id);

         return (
          <div
           key={skill.id}
           className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            isSelected
             ?'border-blue-500 bg-blue-50'
             :'border-gray-200 hover:border-gray-300 bg-white'
           }`}
           onClick={() => handleSkillSelect(skill.id)}
          >
           <div className="flex items-start justify-between">
            <div className="flex-1">
             <h4 className="text-sm font-medium text-gray-900">{skill.name}</h4>
             <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
               skill.level ==='Awareness' ?'bg-green-100 text-green-800' :
               skill.level ==='Application' ?'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
              }`}>
               {skill.level}
              </span>
              <span className="text-xs text-gray-500">{skill.category}</span>
             </div>
            </div>
            <div className="flex items-center space-x-1 ml-2">
             {isSelected && <Check className="w-4 h-4 text-blue-600" />}
             {!isInOutcomes && (
              <button
               onClick={(e) => {
                e.stopPropagation();
                handleAddToOutcomes(skill);
               }}
               className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
               title="Add to learning outcomes"
              >
               <Plus className="w-4 h-4" />
              </button>
             )}
            </div>
           </div>
          </div>
         );
        })}
       </div>
      </div>
     </div>
    </div>

    {/* Learning Outcomes Panel */}
    <div className="flex-1 flex flex-col">
     <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-2">
       <BookOpen className="w-5 h-5 text-blue-600" />
       <h3 className="text-lg font-medium text-gray-900">Learning Outcomes</h3>
       <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
        {learningOutcomes.length} selected
       </span>
      </div>
     </div>

     <div className="flex-1 overflow-y-auto p-4">
      {learningOutcomes.length === 0 ? (
       <div className="text-center py-12">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-gray-900 font-medium mb-2">No learning outcomes selected</h4>
        <p className="text-gray-600 text-sm">
         Select skills from the list and add them as learning outcomes for your course.
        </p>
       </div>
      ) : (
       <div className="space-y-4">
        {learningOutcomes.map(outcome => {
         const skill = availableSkills.find(s => s.id === outcome.skillId);
         if (!skill) return null;

         return (
          <div key={outcome.skillId} className="bg-gray-50 rounded-lg p-4">
           <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
             <h4 className="font-medium text-gray-900">{skill.name}</h4>
             <p className="text-sm text-gray-600">{skill.category}</p>
            </div>
            <button
             onClick={() => handleRemoveOutcome(outcome.skillId)}
             className="text-gray-400 hover:text-red-600 transition-colors"
            >
             <X className="w-4 h-4" />
            </button>
           </div>

           <div className="space-y-3">
            <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Level
             </label>
             <select
              value={outcome.targetLevel}
              onChange={(e) => handleLevelChange(outcome.skillId, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
             >
              <option value="Awareness">Awareness - Basic knowledge</option>
              <option value="Application">Application - Practical use</option>
              <option value="Mastery">Mastery - Expert level</option>
             </select>
            </div>

            <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
              Rationale (Optional)
             </label>
             <textarea
              placeholder="Why is this skill important for your course?"
              value={outcome.rationale}
              onChange={(e) => {
               const updatedOutcomes = learningOutcomes.map(o =>
                o.skillId === outcome.skillId ? { ...o, rationale: e.target.value } : o
               );
               setLearningOutcomes(updatedOutcomes);
               onOutcomesSelected(updatedOutcomes);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-400"
              rows={2}
             />
            </div>
           </div>
          </div>
         );
        })}
       </div>
      )}
     </div>
    </div>
   </div>
  </div>
 );
};