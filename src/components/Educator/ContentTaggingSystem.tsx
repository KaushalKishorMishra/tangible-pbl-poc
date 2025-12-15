import React, { useState } from'react';
import { Tag, Plus, X, AlertCircle, Search } from'lucide-react';

interface Skill {
 id: string;
 name: string;
 level: string;
 category: string;
 description?: string;
 isDraft?: boolean;
}

interface Module {
 id: string;
 title: string;
 skills: string[];
 assignments: Array<{
  id: string;
  title: string;
  type:'quiz' |'project' |'simulation';
  skills: string[];
  description?: string;
 }>;
 simulations: Array<{
  id: string;
  title: string;
  scenario: string;
  skills: string[];
  description?: string;
 }>;
}

interface ContentTaggingSystemProps {
 modules: Module[];
 availableSkills: Skill[];
 onSkillsUpdated: (moduleId: string, skills: string[]) => void;
 onNewSkillRequested: (skillData: Partial<Skill>) => void;
}

export const ContentTaggingSystem: React.FC<ContentTaggingSystemProps> = ({
 modules,
 availableSkills,
 onSkillsUpdated,
 onNewSkillRequested,
}) => {
 const [selectedModule, setSelectedModule] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [showNewSkillForm, setShowNewSkillForm] = useState(false);
 const [newSkill, setNewSkill] = useState({
  name:'',
  category:'',
  level:'Awareness',
  description:'',
 });

 const selectedModuleData = modules.find(m => m.id === selectedModule);

 const filteredSkills = availableSkills.filter(skill =>
  skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  skill.category.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const handleAddSkill = (skillId: string) => {
  if (selectedModuleData && !selectedModuleData.skills.includes(skillId)) {
   const updatedSkills = [...selectedModuleData.skills, skillId];
   onSkillsUpdated(selectedModuleData.id, updatedSkills);
  }
 };

 const handleRemoveSkill = (skillId: string) => {
  if (selectedModuleData) {
   const updatedSkills = selectedModuleData.skills.filter(s => s !== skillId);
   onSkillsUpdated(selectedModuleData.id, updatedSkills);
  }
 };

 const handleCreateNewSkill = () => {
  if (newSkill.name.trim() && newSkill.category.trim()) {
   onNewSkillRequested({
    name: newSkill.name,
    category: newSkill.category,
    level: newSkill.level,
    description: newSkill.description,
   });
   setNewSkill({ name:'', category:'', level:'Awareness', description:'' });
   setShowNewSkillForm(false);
  }
 };

 const getUntaggedContent = () => {
  const untaggedAssignments = modules.flatMap(module =>
   module.assignments.filter(assignment =>
    !assignment.skills || assignment.skills.length === 0
   ).map(assignment => ({ ...assignment, moduleId: module.id, moduleTitle: module.title }))
  );

  const untaggedSimulations = modules.flatMap(module =>
   module.simulations.filter(simulation =>
    !simulation.skills || simulation.skills.length === 0
   ).map(simulation => ({ ...simulation, moduleId: module.id, moduleTitle: module.title }))
  );

  return { assignments: untaggedAssignments, simulations: untaggedSimulations };
 };

 const untaggedContent = getUntaggedContent();

 return (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex transition-colors duration-300">
   {/* Modules List */}
   <div className="w-80 border-r border-gray-200 flex flex-col">
    <div className="p-4 border-b border-gray-200">
     <h3 className="text-lg font-semibold text-gray-900">Content Tagging</h3>
     <p className="text-gray-600 text-sm mt-1">
      Tag modules, assignments, and simulations with relevant skills.
     </p>
    </div>

    <div className="flex-1 overflow-y-auto">
     <div className="p-4 space-y-3">
      {modules.map(module => {
       const skillCount = module.skills.length;
       const totalContent = module.assignments.length + module.simulations.length;
       const taggedContent = module.assignments.filter(a => a.skills?.length > 0).length +
                  module.simulations.filter(s => s.skills?.length > 0).length;

       return (
        <div
         key={module.id}
         onClick={() => setSelectedModule(module.id)}
         className={`p-3 rounded-lg border cursor-pointer transition-colors ${
          selectedModule === module.id
           ?'border-blue-500 bg-blue-50'
           :'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
         }`}
        >
         <div className="flex items-start justify-between">
          <div className="flex-1">
           <h4 className="font-medium text-gray-900">{module.title}</h4>
           <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center">
             <Tag size={12} className="mr-1" />
             {skillCount} skills
            </span>
            <span>
             {taggedContent}/{totalContent} items tagged
            </span>
           </div>
           {taggedContent < totalContent && (
            <div className="flex items-center mt-1 text-xs text-orange-600">
             <AlertCircle size={12} className="mr-1" />
             {totalContent - taggedContent} items need tagging
            </div>
           )}
          </div>
         </div>
        </div>
       );
      })}
     </div>
    </div>
   </div>

   {/* Tagging Interface */}
   <div className="flex-1 flex flex-col bg-white">
    {selectedModuleData ? (
     <>
      {/* Module Header */}
      <div className="p-6 border-b border-gray-200">
       <h2 className="text-xl font-semibold text-gray-900">{selectedModuleData.title}</h2>
       <p className="text-gray-600 mt-1">Tag content with relevant skills</p>
      </div>

      <div className="flex-1 overflow-y-auto">
       <div className="p-6 space-y-8">
        {/* Module Skills */}
        <div>
         <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Module Skills</h3>
          <button
           onClick={() => setShowNewSkillForm(true)}
           className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center"
          >
           <Plus size={14} className="mr-1" />
           New Skill
          </button>
         </div>

         <div className="flex flex-wrap gap-2 mb-4">
          {selectedModuleData.skills.map(skillId => {
           const skill = availableSkills.find(s => s.id === skillId);
           return skill ? (
            <span
             key={skillId}
             className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
             {skill.name}
             <button
              onClick={() => handleRemoveSkill(skillId)}
              className="ml-2 text-blue-600 hover:text-blue-800"
             >
              <X size={12} />
             </button>
            </span>
           ) : null;
          })}
         </div>

         {/* Add Skills */}
         <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
           <Search className="w-4 h-4 text-gray-400" />
           <input
            type="text"
            placeholder="Search skills to add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
           />
          </div>

          <div className="max-h-40 overflow-y-auto">
           <div className="space-y-2">
            {filteredSkills
             .filter(skill => !selectedModuleData.skills.includes(skill.id))
             .slice(0, 10)
             .map(skill => (
              <div
               key={skill.id}
               onClick={() => handleAddSkill(skill.id)}
               className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer"
              >
               <div>
                <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                <span className="text-xs text-gray-500 ml-2">{skill.category}</span>
                {skill.isDraft && (
                 <span className="text-xs text-orange-600 ml-2">(Draft)</span>
                )}
               </div>
               <Plus className="w-4 h-4 text-gray-400" />
              </div>
             ))}
           </div>
          </div>
         </div>
        </div>

        {/* Assignments */}
        <div>
         <h3 className="text-lg font-medium text-gray-900 mb-4">Assignments</h3>
         <div className="space-y-3">
          {selectedModuleData.assignments.map(assignment => (
           <div key={assignment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
             <div>
              <h4 className="font-medium text-gray-900">{assignment.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
             </div>
             {(!assignment.skills || assignment.skills.length === 0) && (
              <div className="flex items-center text-orange-600 text-sm">
               <AlertCircle size={14} className="mr-1" />
               Needs tagging
              </div>
             )}
            </div>

            <div className="flex flex-wrap gap-2">
             {assignment.skills?.map((skillId: string) => {
              const skill = availableSkills.find(s => s.id === skillId);
              return skill ? (
               <span
                key={skillId}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
               >
                {skill.name}
               </span>
              ) : null;
             })}
             <button className="text-blue-600 hover:text-blue-800 text-sm">
              + Add skills
             </button>
            </div>
           </div>
          ))}

          {selectedModuleData.assignments.length === 0 && (
           <p className="text-gray-500 text-sm">No assignments in this module</p>
          )}
         </div>
        </div>

        {/* Simulations */}
        <div>
         <h3 className="text-lg font-medium text-gray-900 mb-4">Simulations</h3>
         <div className="space-y-3">
          {selectedModuleData.simulations.map(simulation => (
           <div key={simulation.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
             <div>
              <h4 className="font-medium text-gray-900">{simulation.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{simulation.description}</p>
             </div>
             {(!simulation.skills || simulation.skills.length === 0) && (
              <div className="flex items-center text-orange-600 text-sm">
               <AlertCircle size={14} className="mr-1" />
               Needs tagging
              </div>
             )}
            </div>

            <div className="flex flex-wrap gap-2">
             {simulation.skills?.map((skillId: string) => {
              const skill = availableSkills.find(s => s.id === skillId);
              return skill ? (
               <span
                key={skillId}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
               >
                {skill.name}
               </span>
              ) : null;
             })}
             <button className="text-blue-600 hover:text-blue-800 text-sm">
              + Add skills
             </button>
            </div>
           </div>
          ))}

          {selectedModuleData.simulations.length === 0 && (
           <p className="text-gray-500 text-sm">No simulations in this module</p>
          )}
         </div>
        </div>
       </div>
      </div>
     </>
    ) : (
     <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
       <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
       <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Module</h3>
       <p className="text-gray-600">
        Choose a module to tag its content with relevant skills.
       </p>

       {/* Summary of untagged content */}
       {(untaggedContent.assignments.length > 0 || untaggedContent.simulations.length > 0) && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
         <div className="flex items-center text-orange-800 mb-2">
          <AlertCircle size={16} className="mr-2" />
          <span className="font-medium">Content Needs Tagging</span>
         </div>
         <div className="text-sm text-orange-700">
          {untaggedContent.assignments.length > 0 && (
           <div>{untaggedContent.assignments.length} assignments</div>
          )}
          {untaggedContent.simulations.length > 0 && (
           <div>{untaggedContent.simulations.length} simulations</div>
          )}
         </div>
        </div>
       )}
      </div>
     </div>
    )}
   </div>

   {/* New Skill Form Modal */}
   {showNewSkillForm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <div className="p-6">
       <h3 className="text-lg font-semibold text-gray-900 mb-4">Request New Skill</h3>

       <div className="space-y-4">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
          Skill Name *
         </label>
         <input
          type="text"
          value={newSkill.name}
          onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         />
        </div>

        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
          Category *
         </label>
         <input
          type="text"
          value={newSkill.category}
          onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         />
        </div>

        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
          Proficiency Level
         </label>
         <select
          value={newSkill.level}
          onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         >
          <option value="Awareness">Awareness - Basic knowledge</option>
          <option value="Application">Application - Practical use</option>
          <option value="Mastery">Mastery - Expert level</option>
         </select>
        </div>

        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
         </label>
         <textarea
          value={newSkill.description}
          onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
         />
        </div>
       </div>

       <div className="flex items-center justify-end space-x-3 mt-6">
        <button
         onClick={() => setShowNewSkillForm(false)}
         className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
         Cancel
        </button>
        <button
         onClick={handleCreateNewSkill}
         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
         Submit Request
        </button>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
};