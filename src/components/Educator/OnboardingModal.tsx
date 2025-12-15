import React from'react';
import { X, ChevronLeft, ChevronRight, Play, CheckCircle } from'lucide-react';
import { useGraphStore } from'../../store/graphStore';

interface OnboardingModalProps {
 isOpen: boolean;
 onClose: () => void;
}

const onboardingSteps = [
 {
  title:"Welcome to the Skill Map",
  content:"This interactive skill map helps you design courses aligned with a global skill ontology. Each node represents a skill with different proficiency levels.",
  highlight: null,
 },
 {
  title:"Understanding Skill Levels",
  content:"Skills are categorized by proficiency levels: Awareness (basic knowledge), Application (practical use), Mastery (expert level), and Influence (thought leadership).",
  highlight:"skill-levels",
 },
 {
  title:"Exploring Relationships",
  content:"Skills are connected through relationships like prerequisites, specializations, and alternatives. Click on nodes to see their connections.",
  highlight:"relationships",
 },
 {
  title:"Filtering & Navigation",
  content:"Use the left panel to filter skills by category, level, or search terms. The minimap helps you navigate large skill graphs.",
  highlight:"filters",
 },
 {
  title:"Course Design Workflow",
  content:"As an educator, you'll use this map to select learning outcomes, design modules, and track learner progress throughout your course.",
  highlight:"course-design",
 },
 {
  title:"Ready to Begin",
  content:"You're now ready to start designing skill-mapped courses! Let's create your first course using the skill map.",
  highlight: null,
 },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
 const { user, setOnboardingStep, completeOnboarding, skipOnboarding } = useGraphStore();
 const currentStep = user.currentOnboardingStep;
 const isLastStep = currentStep === onboardingSteps.length - 1;

 if (!isOpen) return null;

 const handleNext = () => {
  if (isLastStep) {
   completeOnboarding();
   onClose();
  } else {
   setOnboardingStep(currentStep + 1);
  }
 };

 const handlePrevious = () => {
  if (currentStep > 0) {
   setOnboardingStep(currentStep - 1);
  }
 };

 const handleSkip = () => {
  skipOnboarding();
  onClose();
 };

 const step = onboardingSteps[currentStep];

 return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
   <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden transition-colors duration-300">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
     <div className="flex items-center space-x-4">
      <div className="flex space-x-2">
       {onboardingSteps.map((_, index) => (
        <div
         key={index}
         className={`w-2 h-2 rounded-full ${
          index <= currentStep ?'bg-blue-500' :'bg-gray-300'
         }`}
        />
       ))}
      </div>
      <span className="text-sm text-gray-500">
       Step {currentStep + 1} of {onboardingSteps.length}
      </span>
     </div>
     <button
      onClick={handleSkip}
      className="text-gray-400 hover:text-gray-600 transition-colors"
     >
      <X size={20} />
     </button>
    </div>

    {/* Content */}
    <div className="p-8">
     <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
       {step.title}
      </h2>
      <p className="text-gray-600 text-lg leading-relaxed">
       {step.content}
      </p>
     </div>

     {/* Interactive Demo Area */}
     <div className="bg-gray-50 rounded-lg p-6 mb-8 min-h-[200px] flex items-center justify-center">
      {step.highlight ==='skill-levels' && (
       <div className="text-center">
        <div className="flex justify-center space-x-4 mb-4">
         <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
           <span className="text-green-600 font-semibold">A</span>
          </div>
          <span className="text-sm text-gray-600">Awareness</span>
         </div>
         <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
           <span className="text-blue-600 font-semibold">Ap</span>
          </div>
          <span className="text-sm text-gray-600">Application</span>
         </div>
         <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
           <span className="text-purple-600 font-semibold">M</span>
          </div>
          <span className="text-sm text-gray-600">Mastery</span>
         </div>
        </div>
        <p className="text-sm text-gray-500">Different proficiency levels</p>
       </div>
      )}

      {step.highlight ==='relationships' && (
       <div className="text-center">
        <div className="flex items-center justify-center space-x-8">
         <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
           <span className="text-white font-semibold">JS</span>
          </div>
          <span className="text-sm text-gray-600">JavaScript</span>
         </div>
         <div className="flex flex-col items-center">
          <div className="text-xs text-gray-500 mb-1">PREREQUISITE</div>
          <div className="w-8 h-0.5 bg-gray-400"></div>
          <div className="text-xs text-gray-500 mt-1">SPECIALIZES</div>
         </div>
         <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
           <span className="text-white font-semibold">ASYNC</span>
          </div>
          <span className="text-sm text-gray-600">Async Programming</span>
         </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Skills are interconnected</p>
       </div>
      )}

      {step.highlight ==='filters' && (
       <div className="text-center">
        <div className="bg-white rounded-lg shadow-sm p-4 inline-block">
         <div className="text-sm font-medium text-gray-900 mb-2">Filter Controls</div>
         <div className="space-y-2 text-left">
          <div className="flex items-center space-x-2">
           <input type="checkbox" className="rounded" />
           <span className="text-sm text-gray-700">JavaScript</span>
          </div>
          <div className="flex items-center space-x-2">
           <input type="checkbox" className="rounded" />
           <span className="text-sm text-gray-700">Application Level</span>
          </div>
          <div className="flex items-center space-x-2">
           <input type="checkbox" className="rounded" />
           <span className="text-sm text-gray-700">Backend Category</span>
          </div>
         </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Use filters to find relevant skills</p>
       </div>
      )}

      {step.highlight ==='course-design' && (
       <div className="text-center">
        <div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
         <Play size={32} className="mx-auto mb-2" />
         <div className="font-semibold mb-1">Course Design</div>
         <div className="text-sm opacity-90">Select → Design → Track → Improve</div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Your workflow as an educator</p>
       </div>
      )}

      {!step.highlight && (
       <div className="text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <p className="text-gray-600">You're all set to start creating amazing courses!</p>
       </div>
      )}
     </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
     <button
      onClick={handleSkip}
      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
     >
      Skip Tour
     </button>

     <div className="flex items-center space-x-4">
      <button
       onClick={handlePrevious}
       disabled={currentStep === 0}
       className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
       <ChevronLeft size={16} />
       <span>Previous</span>
      </button>

      <button
       onClick={handleNext}
       className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
       <span>{isLastStep ?'Get Started' :'Next'}</span>
       {!isLastStep && <ChevronRight size={16} />}
      </button>
     </div>
    </div>
   </div>
  </div>
 );
};