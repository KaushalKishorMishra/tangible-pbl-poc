import React, { useState } from 'react';
import { Plus, X, Edit, Play, BookOpen, Target, Clock, Users } from 'lucide-react';

interface LearningOutcome {
  skillId: string;
  targetLevel: string;
  rationale?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  assignments: Assignment[];
  simulations: Simulation[];
}

interface Assignment {
  id: string;
  title: string;
  type: 'quiz' | 'project' | 'exercise' | 'discussion';
  description: string;
  skills: string[];
  rubric: RubricItem[];
}

interface Simulation {
  id: string;
  title: string;
  type: 'real-world' | 'case-study' | 'interactive' | 'game-based';
  description: string;
  skills: string[];
  duration: string;
}

interface RubricItem {
  skillId: string;
  criteria: string;
  levels: {
    awareness: string;
    application: string;
    mastery: string;
  };
}

interface ModuleDesignerProps {
  learningOutcomes: LearningOutcome[];
  onModulesCreated: (modules: Module[]) => void;
  initialModules?: Module[];
}

export const ModuleDesigner: React.FC<ModuleDesignerProps> = ({
  learningOutcomes,
  onModulesCreated,
  initialModules = [],
}) => {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    duration: '',
  });

  // Mock skill data - in real app, this would come from the graph
  const skillMap = {
    '0': 'JavaScript',
    '1': 'Syntax',
    '2': 'Variables',
    '3': 'Functions',
    '4': 'Async Programming',
    '5': 'Promises',
    '8': 'Node.js',
    '9': 'Modules',
    '14': 'npm',
    '24': 'HTTP module',
    '25': 'Express.js',
  };

  const handleAddModule = () => {
    if (newModule.title.trim()) {
      const module: Module = {
        id: `module-${Date.now()}`,
        title: newModule.title,
        description: newModule.description,
        duration: newModule.duration,
        skills: [],
        assignments: [],
        simulations: [],
      };

      const updatedModules = [...modules, module];
      setModules(updatedModules);
      onModulesCreated(updatedModules);
      setNewModule({ title: '', description: '', duration: '' });
      setShowAddModule(false);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    const updatedModules = modules.filter(m => m.id !== moduleId);
    setModules(updatedModules);
    onModulesCreated(updatedModules);
    if (selectedModule === moduleId) {
      setSelectedModule(null);
    }
  };

  const handleAddSkillToModule = (moduleId: string, skillId: string) => {
    const updatedModules = modules.map(module =>
      module.id === moduleId
        ? { ...module, skills: [...module.skills, skillId] }
        : module
    );
    setModules(updatedModules);
    onModulesCreated(updatedModules);
  };

  const handleRemoveSkillFromModule = (moduleId: string, skillId: string) => {
    const updatedModules = modules.map(module =>
      module.id === moduleId
        ? { ...module, skills: module.skills.filter(s => s !== skillId) }
        : module
    );
    setModules(updatedModules);
    onModulesCreated(updatedModules);
  };

  const generateRecommendedSimulations = (moduleSkills: string[]): Simulation[] => {
    // Mock simulation recommendations based on skills
    const recommendations: Simulation[] = [];

    if (moduleSkills.includes('0') || moduleSkills.includes('1')) {
      recommendations.push({
        id: 'sim-1',
        title: 'JavaScript Code Playground',
        type: 'interactive',
        description: 'Interactive coding environment to practice JavaScript syntax and basic programming concepts.',
        skills: ['0', '1', '2', '3'],
        duration: '2 hours',
      });
    }

    if (moduleSkills.includes('4') || moduleSkills.includes('5')) {
      recommendations.push({
        id: 'sim-2',
        title: 'Async Programming Workshop',
        type: 'real-world',
        description: 'Real-world scenarios involving asynchronous operations and promise handling.',
        skills: ['4', '5'],
        duration: '3 hours',
      });
    }

    if (moduleSkills.includes('8') || moduleSkills.includes('25')) {
      recommendations.push({
        id: 'sim-3',
        title: 'Backend API Builder',
        type: 'case-study',
        description: 'Build a complete REST API using Node.js and Express.js.',
        skills: ['8', '25', '24'],
        duration: '4 hours',
      });
    }

    return recommendations;
  };

  const selectedModuleData = modules.find(m => m.id === selectedModule);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex">
      {/* Modules List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
            <button
              onClick={() => setShowAddModule(true)}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add Module Form */}
          {showAddModule && (
            <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Module title"
                value={newModule.title}
                onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Module description"
                value={newModule.description}
                onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
              <input
                type="text"
                placeholder="Duration (e.g., 2 weeks)"
                value={newModule.duration}
                onChange={(e) => setNewModule(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAddModule}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddModule(false)}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {modules.map(module => (
              <div
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedModule === module.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{module.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {module.duration}
                      </span>
                      <span className="flex items-center">
                        <Target size={12} className="mr-1" />
                        {module.skills.length} skills
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModule(module.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}

            {modules.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-gray-900 font-medium mb-2">No modules yet</h4>
                <p className="text-gray-600 text-sm">
                  Create your first module to organize course content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Details */}
      <div className="flex-1 flex flex-col">
        {selectedModuleData ? (
          <>
            {/* Module Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedModuleData.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedModuleData.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>{selectedModuleData.duration}</span>
                </div>
              </div>

              {/* Skills in Module */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Skills Covered</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedModuleData.skills.map(skillId => (
                    <span
                      key={skillId}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {skillMap[skillId as keyof typeof skillMap] || skillId}
                      <button
                        onClick={() => handleRemoveSkillFromModule(selectedModuleData.id, skillId)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      // Add skill dropdown would go here
                      const availableSkills = learningOutcomes
                        .filter(outcome => !selectedModuleData.skills.includes(outcome.skillId))
                        .slice(0, 1); // Just add first available for demo

                      if (availableSkills.length > 0) {
                        handleAddSkillToModule(selectedModuleData.id, availableSkills[0].skillId);
                      }
                    }}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={12} className="mr-1" />
                    Add Skill
                  </button>
                </div>
              </div>
            </div>

            {/* Module Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Recommended Simulations */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Simulations</h3>
                  <div className="space-y-4">
                    {generateRecommendedSimulations(selectedModuleData.skills).map(simulation => (
                      <div key={simulation.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Play className="w-5 h-5 text-purple-600" />
                              <h4 className="font-medium text-gray-900">{simulation.title}</h4>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">
                                {simulation.type.replace('-', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{simulation.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock size={12} className="mr-1" />
                                {simulation.duration}
                              </span>
                              <span className="flex items-center">
                                <Target size={12} className="mr-1" />
                                {simulation.skills.length} skills
                              </span>
                            </div>
                          </div>
                          <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors">
                            Add to Module
                          </button>
                        </div>
                      </div>
                    ))}

                    {generateRecommendedSimulations(selectedModuleData.skills).length === 0 && (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-gray-900 font-medium mb-2">No recommendations yet</h4>
                        <p className="text-gray-600 text-sm">
                          Add skills to this module to see simulation recommendations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignments Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Assignments & Activities</h3>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center">
                      <Plus size={14} className="mr-1" />
                      Add Assignment
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedModuleData.assignments.map(assignment => (
                      <div key={assignment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="capitalize">{assignment.type}</span>
                              <span>{assignment.skills.length} skills assessed</span>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {selectedModuleData.assignments.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-gray-900 font-medium mb-2">No assignments yet</h4>
                        <p className="text-gray-600 text-sm">
                          Create assignments to assess learner progress on module skills.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Module</h3>
              <p className="text-gray-600">
                Choose a module from the list to view and edit its content.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};