import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, BookOpen, Target, Users, Settings } from 'lucide-react';
import { SkillMapDesigner } from './SkillMapDesigner';
import { ModuleDesigner } from './ModuleDesigner';

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
  assignments: Array<{
    id: string;
    title: string;
    type: 'quiz' | 'project' | 'exercise' | 'discussion';
    description: string;
    skills: string[];
    rubric: Array<{
      skillId: string;
      criteria: string;
      levels: {
        awareness: string;
        application: string;
        mastery: string;
      };
    }>;
  }>;
  simulations: Array<{
    id: string;
    title: string;
    type: 'real-world' | 'case-study' | 'interactive' | 'game-based';
    description: string;
    skills: string[];
    duration: string;
  }>;
}

interface CourseData {
  title: string;
  description: string;
  duration: string;
  level: string;
  learningOutcomes: LearningOutcome[];
  modules: Module[];
}

interface CourseCreationWizardProps {
  onComplete: (courseData: CourseData) => void;
  onCancel: () => void;
}

const steps = [
  { id: 'basics', title: 'Course Basics', icon: BookOpen },
  { id: 'outcomes', title: 'Learning Outcomes', icon: Target },
  { id: 'modules', title: 'Module Design', icon: Users },
  { id: 'structure', title: 'Course Structure', icon: Settings },
];

export const CourseCreationWizard: React.FC<CourseCreationWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    duration: '',
    level: 'beginner',
    learningOutcomes: [],
    modules: [],
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onComplete(courseData);
  };

  const updateCourseData = (updates: Partial<CourseData>) => {
    setCourseData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return courseData.title.trim() && courseData.description.trim();
      case 1: // Outcomes
        return courseData.learningOutcomes.length > 0;
      case 2: // Modules
        return courseData.modules.length > 0;
      case 3: // Structure
        return true; // Review step
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Course Basics
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => updateCourseData({ title: e.target.value })}
                placeholder="e.g., Introduction to Web Development"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description *
              </label>
              <textarea
                value={courseData.description}
                onChange={(e) => updateCourseData({ description: e.target.value })}
                placeholder="Describe what students will learn and achieve..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={courseData.duration}
                  onChange={(e) => updateCourseData({ duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select duration</option>
                  <option value="1-week">1 Week</option>
                  <option value="2-weeks">2 Weeks</option>
                  <option value="1-month">1 Month</option>
                  <option value="2-months">2 Months</option>
                  <option value="3-months">3 Months</option>
                  <option value="6-months">6 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={courseData.level}
                  onChange={(e) => updateCourseData({ level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1: // Learning Outcomes
        return (
          <div className="h-full">
            <SkillMapDesigner
              onOutcomesSelected={(outcomes) => updateCourseData({ learningOutcomes: outcomes })}
              initialOutcomes={courseData.learningOutcomes}
            />
          </div>
        );

      case 2: // Module Design
        return (
          <div className="h-full">
            <ModuleDesigner
              learningOutcomes={courseData.learningOutcomes}
              onModulesCreated={(modules) => updateCourseData({ modules })}
              initialModules={courseData.modules}
            />
          </div>
        );

      case 3: // Settings & Publish
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Course Structure</h3>
              <p className="text-gray-600">
                Review your course modules and overall structure.
                PBL simulations and detailed assignments can be configured here.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Course Overview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-800 font-medium">Learning Outcomes:</span>
                  <span className="text-blue-600 ml-2">{courseData.learningOutcomes.length}</span>
                </div>
                <div>
                  <span className="text-blue-800 font-medium">Modules:</span>
                  <span className="text-blue-600 ml-2">{courseData.modules.length}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Modules</h4>
              {courseData.modules.map((module) => (
                <div key={module.id} className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900">{module.title}</h5>
                  <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{module.duration}</span>
                    <span>{module.skills.length} skills</span>
                    <span>{module.assignments.length} assignments</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Create New Course</h1>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.id} className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-sm font-medium ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} style={{ width: '40px' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleFinish}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check size={16} />
                <span>Publish Course</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};