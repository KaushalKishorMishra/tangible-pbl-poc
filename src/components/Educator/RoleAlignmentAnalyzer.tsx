import React, { useState, useMemo } from'react';
import { Briefcase, Target, AlertTriangle, CheckCircle, TrendingUp, Users } from'lucide-react';

interface JobRole {
 id: string;
 title: string;
 description: string;
 requiredSkills: {
  skillId: string;
  requiredLevel:'awareness' |'application' |'mastery' |'influence';
  importance:'required' |'preferred' |'nice-to-have';
 }[];
 industry: string;
 experienceLevel:'entry' |'mid' |'senior' |'expert';
}

interface CourseCoverage {
 courseId: string;
 courseTitle: string;
 skills: {
  skillId: string;
  targetLevel:'awareness' |'application' |'mastery' |'influence';
 }[];
}

interface GapAnalysis {
 skillId: string;
 skillName: string;
 requiredLevel:'awareness' |'application' |'mastery' |'influence';
 courseLevel:'awareness' |'application' |'mastery' |'influence' | null;
 gap:'covered' |'partial' |'missing';
 importance:'required' |'preferred' |'nice-to-have';
 learnersBelowTarget: number;
 totalLearners: number;
}

interface RoleAlignmentAnalyzerProps {
 jobRoles: JobRole[];
 courseCoverage: CourseCoverage[];
 learnerData?: {
  courseId: string;
  learners: {
   id: string;
   skills: {
    skillId: string;
    level:'awareness' |'application' |'mastery' |'influence' | null;
   }[];
  }[];
 }[];
 onRoleSelect?: (roleId: string) => void;
 onGapAction?: (skillId: string, action:'add-to-course' |'adjust-target' |'create-module') => void;
}

export const RoleAlignmentAnalyzer: React.FC<RoleAlignmentAnalyzerProps> = ({
 jobRoles,
 courseCoverage,
 learnerData = [],
 onRoleSelect,
 onGapAction,
}) => {
 const [selectedRole, setSelectedRole] = useState<string | null>(null);
 const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
 const [viewMode, setViewMode] = useState<'overview' |'detailed'>('overview');

 // Mock skill names - in real app, this would come from skill ontology
 const skillNames: Record<string, string> = useMemo(() => ({
 '0':'JavaScript',
 '1':'Syntax',
 '2':'Variables',
 '3':'Functions',
 '4':'Async Programming',
 '5':'Promises',
 '8':'Node.js',
 '14':'npm',
 '24':'HTTP module',
 '25':'Express.js',
 }), []);

 const selectedRoleData = jobRoles.find(role => role.id === selectedRole);
 const selectedCourseData = courseCoverage.find(course => course.courseId === selectedCourse);

 // Analyze gaps for selected role and course
 const gapAnalysis = useMemo(() => {
  if (!selectedRoleData || !selectedCourseData) return [];

  const courseSkillMap = new Map(
   selectedCourseData.skills.map(skill => [skill.skillId, skill.targetLevel])
  );

  const learnerSkillData = learnerData.find(data => data.courseId === selectedCourseData.courseId);

  return selectedRoleData.requiredSkills.map(requiredSkill => {
   const courseLevel = courseSkillMap.get(requiredSkill.skillId) || null;
   const skillName = skillNames[requiredSkill.skillId] || `Skill ${requiredSkill.skillId}`;

   // Calculate gap
   let gap:'covered' |'partial' |'missing' ='missing';
   if (courseLevel) {
    const levelOrder = { awareness: 1, application: 2, mastery: 3, influence: 4 };
    const requiredOrder = levelOrder[requiredSkill.requiredLevel];
    const courseOrder = levelOrder[courseLevel];

    if (courseOrder >= requiredOrder) {
     gap ='covered';
    } else if (courseOrder >= requiredOrder - 1) {
     gap ='partial';
    } else {
     gap ='missing';
    }
   }

   // Calculate learners below target
   let learnersBelowTarget = 0;
   if (learnerSkillData) {
    learnerSkillData.learners.forEach(learner => {
     const learnerSkill = learner.skills.find(s => s.skillId === requiredSkill.skillId);
     if (!learnerSkill?.level) {
      learnersBelowTarget++;
     } else {
      const levelOrder = { awareness: 1, application: 2, mastery: 3, influence: 4 };
      const learnerOrder = levelOrder[learnerSkill.level];
      const requiredOrder = levelOrder[requiredSkill.requiredLevel];
      if (learnerOrder < requiredOrder) {
       learnersBelowTarget++;
      }
     }
    });
   }

   return {
    skillId: requiredSkill.skillId,
    skillName,
    requiredLevel: requiredSkill.requiredLevel,
    courseLevel,
    gap,
    importance: requiredSkill.importance,
    learnersBelowTarget,
    totalLearners: learnerSkillData?.learners.length || 0,
   } as GapAnalysis;
  });
 }, [selectedRoleData, selectedCourseData, learnerData, skillNames]);

 const handleRoleSelect = (roleId: string) => {
  setSelectedRole(roleId);
  onRoleSelect?.(roleId);
 };

 const getGapColor = (gap: string) => {
  switch (gap) {
   case'covered': return'text-green-600 bg-green-100';
   case'partial': return'text-yellow-600 bg-yellow-100';
   case'missing': return'text-red-600 bg-red-100';
   default: return'text-gray-600 bg-gray-100';
  }
 };

 const getImportanceColor = (importance: string) => {
  switch (importance) {
   case'required': return'text-red-600 bg-red-100';
   case'preferred': return'text-blue-600 bg-blue-100';
   case'nice-to-have': return'text-gray-600 bg-gray-100';
   default: return'text-gray-600 bg-gray-100';
  }
 };

 const gapSummary = useMemo(() => {
  if (!gapAnalysis.length) return null;

  const covered = gapAnalysis.filter(g => g.gap ==='covered').length;
  const partial = gapAnalysis.filter(g => g.gap ==='partial').length;
  const missing = gapAnalysis.filter(g => g.gap ==='missing').length;
  const total = gapAnalysis.length;

  return {
   covered,
   partial,
   missing,
   total,
   coverageRate: ((covered + partial * 0.5) / total) * 100,
  };
 }, [gapAnalysis]);

 return (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex transition-colors duration-300">
   {/* Roles and Courses Panel */}
   <div className="w-80 border-r border-gray-200 flex flex-col">
    <div className="p-4 border-b border-gray-200">
     <h3 className="text-lg font-semibold text-gray-900">Role Alignment</h3>
     <p className="text-gray-600 text-sm mt-1">
      Analyze course alignment with job roles
     </p>
    </div>

    {/* Job Roles */}
    <div className="flex-1 overflow-y-auto">
     <div className="p-4">
      <h4 className="font-medium text-gray-900 mb-3">Job Roles</h4>
      <div className="space-y-2">
       {jobRoles.map(role => (
        <div
         key={role.id}
         onClick={() => handleRoleSelect(role.id)}
         className={`p-3 rounded-lg border cursor-pointer transition-colors ${
          selectedRole === role.id
           ?'border-blue-500 bg-blue-50'
           :'border-gray-200 hover:border-gray-300 bg-white'
         }`}
        >
         <div className="flex items-start space-x-3">
          <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
           <h5 className="font-medium text-gray-900">{role.title}</h5>
           <p className="text-sm text-gray-600">{role.description}</p>
           <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs text-gray-500">{role.industry}</span>
            <span className={`px-2 py-1 text-xs rounded-full capitalize ${
             role.experienceLevel ==='entry' ?'bg-green-100 text-green-800' :
             role.experienceLevel ==='mid' ?'bg-blue-100 text-blue-800' :
             role.experienceLevel ==='senior' ?'bg-purple-100 text-purple-800' :
            'bg-red-100 text-red-800'
            }`}>
             {role.experienceLevel}
            </span>
           </div>
          </div>
         </div>
        </div>
       ))}
      </div>
     </div>

     {/* Courses */}
     <div className="p-4 border-t border-gray-200">
      <h4 className="font-medium text-gray-900 mb-3">Courses</h4>
      <div className="space-y-2">
       {courseCoverage.map(course => (
        <div
         key={course.courseId}
         onClick={() => setSelectedCourse(course.courseId)}
         className={`p-3 rounded-lg border cursor-pointer transition-colors ${
          selectedCourse === course.courseId
           ?'border-green-500 bg-green-50'
           :'border-gray-200 hover:border-gray-300 bg-white'
         }`}
        >
         <div className="flex items-start space-x-3">
          <Target className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
           <h5 className="font-medium text-gray-900">{course.courseTitle}</h5>
           <p className="text-sm text-gray-600">
            {course.skills.length} skills covered
           </p>
          </div>
         </div>
        </div>
       ))}
      </div>
     </div>
    </div>
   </div>

   {/* Analysis Panel */}
   <div className="flex-1 flex flex-col">
    {selectedRoleData && selectedCourseData ? (
     <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
       <div className="flex items-center justify-between">
        <div>
         <h2 className="text-xl font-semibold text-gray-900">
          {selectedRoleData.title} vs {selectedCourseData.courseTitle}
         </h2>
         <p className="text-gray-600 mt-1">
          Analyzing skill alignment and gaps
         </p>
        </div>
        <div className="flex space-x-2">
         <button
          onClick={() => setViewMode('overview')}
          className={`px-3 py-1 text-sm rounded ${
           viewMode ==='overview' ?'bg-blue-100 text-blue-800' :'text-gray-600 hover:bg-gray-100'
          }`}
         >
          Overview
         </button>
         <button
          onClick={() => setViewMode('detailed')}
          className={`px-3 py-1 text-sm rounded ${
           viewMode ==='detailed' ?'bg-blue-100 text-blue-800' :'text-gray-600 hover:bg-gray-100'
          }`}
         >
          Detailed
         </button>
        </div>
       </div>
      </div>

      {/* Analysis Content */}
      <div className="flex-1 overflow-y-auto p-6">
       {gapSummary && (
        <div className="mb-6">
         <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage Summary</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-4">
           <div className="text-2xl font-bold text-green-800">{gapSummary.covered}</div>
           <div className="text-sm text-green-600">Fully Covered</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
           <div className="text-2xl font-bold text-yellow-800">{gapSummary.partial}</div>
           <div className="text-sm text-yellow-600">Partially Covered</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
           <div className="text-2xl font-bold text-red-800">{gapSummary.missing}</div>
           <div className="text-sm text-red-600">Missing</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
           <div className="text-2xl font-bold text-blue-800">
            {gapSummary.coverageRate.toFixed(1)}%
           </div>
           <div className="text-sm text-blue-600">Overall Coverage</div>
          </div>
         </div>
        </div>
       )}

       <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Gap Analysis</h3>
        <div className="space-y-3">
         {gapAnalysis.map(gap => (
          <div key={gap.skillId} className="bg-gray-50 rounded-lg p-4">
           <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
             <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-medium text-gray-900">{gap.skillName}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${getGapColor(gap.gap)}`}>
               {gap.gap}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(gap.importance)}`}>
               {gap.importance}
              </span>
             </div>

             <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
               <span className="text-gray-600">Required:</span>
               <span className="font-medium text-gray-900 ml-2 capitalize">
                {gap.requiredLevel}
               </span>
              </div>
              <div>
               <span className="text-gray-600">Course Target:</span>
               <span className="font-medium text-gray-900 ml-2 capitalize">
                {gap.courseLevel ||'Not covered'}
               </span>
              </div>
             </div>

             {gap.totalLearners > 0 && (
              <div className="mt-2 flex items-center space-x-2 text-sm">
               <Users className="w-4 h-4 text-gray-400" />
               <span className="text-gray-600">
                {gap.learnersBelowTarget} of {gap.totalLearners} learners below target
               </span>
              </div>
             )}
            </div>

            <div className="flex space-x-2">
             {gap.gap !=='covered' && (
              <>
               <button
                onClick={() => onGapAction?.(gap.skillId,'add-to-course')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
               >
                Add to Course
               </button>
               <button
                onClick={() => onGapAction?.(gap.skillId,'create-module')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
               >
                Create Module
               </button>
              </>
             )}
            </div>
           </div>

           {gap.gap ==='missing' && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
             <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
               <strong>Critical Gap:</strong> This required skill is not covered in the course.
               Consider adding it to ensure learners are prepared for this role.
              </div>
             </div>
            </div>
           )}

           {gap.gap ==='partial' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
             <div className="flex items-start space-x-2">
              <TrendingUp className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
               <strong>Partial Coverage:</strong> The course covers this skill but at a lower level than required.
               Consider adjusting the target level or adding advanced content.
              </div>
             </div>
            </div>
           )}

           {gap.gap ==='covered' && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
             <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
               <strong>Well Covered:</strong> This skill is adequately covered in the course.
              </div>
             </div>
            </div>
           )}
          </div>
         ))}
        </div>
       </div>
      </div>
     </>
    ) : (
     <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
       <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
       <h3 className="text-lg font-medium text-gray-900 mb-2">Select Role and Course</h3>
       <p className="text-gray-600">
        Choose a job role and course to analyze skill alignment and identify gaps.
       </p>
      </div>
     </div>
    )}
   </div>
  </div>
 );
};