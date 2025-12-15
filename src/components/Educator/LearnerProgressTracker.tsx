import React, { useState, useEffect } from'react';
import { TrendingUp, Target, Award, CheckCircle, AlertCircle } from'lucide-react';
import { useSigma } from'@react-sigma/core';
import { useGraphStore } from'../../store/graphStore';

interface SkillProgress {
 skillId: string;
 currentLevel:'awareness' |'application' |'mastery' | null;
 confidence: number; // 0-1
 assessments: Assessment[];
 lastUpdated: Date;
}

interface Assessment {
 id: string;
 type:'quiz' |'project' |'simulation' |'peer-review';
 score: number;
 maxScore: number;
 skillLevel:'awareness' |'application' |'mastery';
 date: Date;
 feedback?: string;
}

interface LearnerProgressTrackerProps {
 learnerId: string;
 courseId?: string;
 onSkillUpdate?: (skillId: string, newLevel: string) => void;
}

export const LearnerProgressTracker: React.FC<LearnerProgressTrackerProps> = ({
 learnerId,
 courseId,
}) => {
 const sigma = useSigma();
 const { setSelectedNodeIds } = useGraphStore();
 const [skillProgress, setSkillProgress] = useState<Map<string, SkillProgress>>(new Map());
 const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
 const [viewMode, setViewMode] = useState<'overview' |'detailed'>('overview');

// Mock data - in real app, this would come from API
 useEffect(() => {
  // Mock data for demonstration
  const mockProgressMap = new Map<string, SkillProgress>();
  const mockSkills = [
   { id:'JavaScript Basics', level:'mastery' as const, confidence: 0.85 },
   { id:'React Components', level:'application' as const, confidence: 0.60 },
   { id:'State Management', level:'application' as const, confidence: 0.40 },
   { id:'API Integration', level:'awareness' as const, confidence: 0.25 },
   { id:'Testing', level:'awareness' as const, confidence: 0.15 },
  ];

  mockSkills.forEach(skill => {
   mockProgressMap.set(skill.id, {
    skillId: skill.id,
    currentLevel: skill.level,
    confidence: skill.confidence,
    assessments: [],
    lastUpdated: new Date(),
   });
  });

  // Use setTimeout to avoid synchronous setState in effect
  const timer = setTimeout(() => {
   setSkillProgress(mockProgressMap);
  }, 0);

  return () => clearTimeout(timer);
 }, [learnerId, courseId]);

 // Update node colors based on progress
 useEffect(() => {
  if (sigma && skillProgress.size > 0) {
   const graph = sigma.getGraph();

   skillProgress.forEach((progress, skillId) => {
    if (graph.hasNode(skillId)) {
     let color ='#e5e7eb'; // Default gray
     let size = 10;

     if (progress.currentLevel) {
      size = 15;
      switch (progress.currentLevel) {
       case'awareness':
        color ='#3b82f6'; // Blue
        break;
       case'application':
        color ='#10b981'; // Green
        break;
       case'mastery':
        color ='#8b5cf6'; // Purple
        break;
      }
     }

     graph.setNodeAttribute(skillId,'color', color);
     graph.setNodeAttribute(skillId,'size', size);
    }
   });
  }
 }, [sigma, skillProgress]);

 const getSkillStats = () => {
  const totalSkills = skillProgress.size;
  const assessedSkills = Array.from(skillProgress.values()).filter(p => p.currentLevel).length;
  const masterySkills = Array.from(skillProgress.values()).filter(p => p.currentLevel ==='mastery').length;
  const avgConfidence = Array.from(skillProgress.values())
   .filter(p => p.currentLevel)
   .reduce((sum, p) => sum + p.confidence, 0) /
   Array.from(skillProgress.values()).filter(p => p.currentLevel).length;

  return {
   totalSkills,
   assessedSkills,
   masterySkills,
   avgConfidence: avgConfidence || 0,
   completionRate: totalSkills > 0 ? (assessedSkills / totalSkills) * 100 : 0,
  };
 };

 const stats = getSkillStats();
 const selectedSkillProgress = selectedSkill ? skillProgress.get(selectedSkill) : null;

 const getLevelColor = (level: string | null) => {
  switch (level) {
   case'awareness': return'bg-blue-100 text-blue-800';
   case'application': return'bg-green-100 text-green-800';
   case'mastery': return'bg-purple-100 text-purple-800';
   default: return'bg-gray-100 text-gray-600';
  }
 };

 const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return'text-green-600';
  if (confidence >= 0.6) return'text-yellow-600';
  return'text-red-600';
 };

 return (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex transition-colors duration-300">
   {/* Progress Overview */}
   <div className="w-80 border-r border-gray-200 flex flex-col">
    <div className="p-4 border-b border-gray-200">
     <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Skill Progress</h3>
      <div className="flex space-x-2">
       <button
        onClick={() => setViewMode('overview')}
        className={`px-3 py-1 text-sm rounded ${
         viewMode ==='overview'
          ?'bg-blue-100 text-blue-800'
          :'text-gray-600 hover:bg-gray-100'
        }`}
       >
        Overview
       </button>
       <button
        onClick={() => setViewMode('detailed')}
        className={`px-3 py-1 text-sm rounded ${
         viewMode ==='detailed'
          ?'bg-blue-100 text-blue-800'
          :'text-gray-600 hover:bg-gray-100'
        }`}
       >
        Detailed
       </button>
      </div>
     </div>

     {/* Stats Cards */}
     <div className="space-y-3">
      <div className="bg-blue-50 rounded-lg p-3">
       <div className="flex items-center justify-between">
        <div>
         <p className="text-sm font-medium text-blue-900">Skills Assessed</p>
         <p className="text-lg font-bold text-blue-800">
          {stats.assessedSkills}/{stats.totalSkills}
         </p>
        </div>
        <Target className="w-8 h-8 text-blue-600" />
       </div>
       <div className="mt-2">
        <div className="w-full bg-blue-200 rounded-full h-2">
         <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${stats.completionRate}%` }}
         />
        </div>
        <p className="text-xs text-blue-700 mt-1">
         {stats.completionRate.toFixed(1)}% complete
        </p>
       </div>
      </div>

      <div className="bg-green-50 rounded-lg p-3">
       <div className="flex items-center justify-between">
        <div>
         <p className="text-sm font-medium text-green-900">Mastery Achieved</p>
         <p className="text-lg font-bold text-green-800">{stats.masterySkills}</p>
        </div>
        <Award className="w-8 h-8 text-green-600" />
       </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-3">
       <div className="flex items-center justify-between">
        <div>
         <p className="text-sm font-medium text-purple-900">Avg Confidence</p>
         <p className="text-lg font-bold text-purple-800">
          {(stats.avgConfidence * 100).toFixed(0)}%
         </p>
        </div>
        <TrendingUp className={`w-8 h-8 ${
         stats.avgConfidence >= 0.8 ?'text-green-600' :
         stats.avgConfidence >= 0.6 ?'text-yellow-600' :'text-red-600'
        }`} />
       </div>
      </div>
     </div>
    </div>

    {/* Skills List */}
    <div className="flex-1 overflow-y-auto">
     <div className="p-4">
      <h4 className="font-medium text-gray-900 mb-3">Skills Overview</h4>
      <div className="space-y-2">
       {Array.from(skillProgress.entries()).map(([skillId, progress]) => (
        <div
         key={skillId}
         onClick={() => {
          setSelectedSkill(skillId);
          setSelectedNodeIds([skillId]);
         }}
         className={`p-3 rounded-lg border cursor-pointer transition-colors ${
          selectedSkill === skillId
           ?'border-blue-500 bg-blue-50'
           :'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
         }`}
        >
         <div className="flex items-center justify-between">
          <div className="flex-1">
           <p className="text-sm font-medium text-gray-900">
            Skill {skillId}
           </p>
           <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(progress.currentLevel)}`}>
             {progress.currentLevel ||'Not assessed'}
            </span>
            {progress.currentLevel && (
             <span className={`text-xs ${getConfidenceColor(progress.confidence)}`}>
              {(progress.confidence * 100).toFixed(0)}%
             </span>
            )}
           </div>
          </div>
          <div className="text-right">
           <p className="text-xs text-gray-500">
            {progress.assessments.length} assessments
           </p>
           {progress.lastUpdated && (
            <p className="text-xs text-gray-400">
             {progress.lastUpdated.toLocaleDateString()}
            </p>
           )}
          </div>
         </div>
        </div>
       ))}
      </div>
     </div>
    </div>
   </div>

   {/* Skill Details */}
   <div className="flex-1 flex flex-col bg-white">
    {selectedSkillProgress ? (
     <>
      {/* Skill Header */}
      <div className="p-6 border-b border-gray-200">
       <div className="flex items-center justify-between">
        <div>
         <h2 className="text-xl font-semibold text-gray-900">Skill {selectedSkill}</h2>
         <div className="flex items-center space-x-4 mt-2">
          <span className={`px-3 py-1 rounded-full text-sm ${getLevelColor(selectedSkillProgress.currentLevel)}`}>
           Current Level: {selectedSkillProgress.currentLevel ||'Not assessed'}
          </span>
          {selectedSkillProgress.currentLevel && (
           <span className={`text-sm ${getConfidenceColor(selectedSkillProgress.confidence)}`}>
            Confidence: {(selectedSkillProgress.confidence * 100).toFixed(0)}%
           </span>
          )}
         </div>
        </div>
        <div className="text-right text-sm text-gray-500">
         <p>Last updated</p>
         <p>{selectedSkillProgress.lastUpdated.toLocaleDateString()}</p>
        </div>
       </div>
      </div>

      {/* Assessment History */}
      <div className="flex-1 overflow-y-auto p-6">
       <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment History</h3>

       {selectedSkillProgress.assessments.length === 0 ? (
        <div className="text-center py-8">
         <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
         <h4 className="text-gray-900 font-medium mb-2">No assessments yet</h4>
         <p className="text-gray-600 text-sm">
          This skill hasn't been assessed. Complete assignments or quizzes to track progress.
         </p>
        </div>
       ) : (
        <div className="space-y-4">
         {selectedSkillProgress.assessments
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .map(assessment => (
           <div key={assessment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
             <div>
              <div className="flex items-center space-x-2">
               <span className={`px-2 py-1 text-xs rounded-full ${
                assessment.type ==='quiz' ?'bg-blue-100 text-blue-800' :
                assessment.type ==='project' ?'bg-green-100 text-green-800' :
                assessment.type ==='simulation' ?'bg-purple-100 text-purple-800' :
               'bg-orange-100 text-orange-800'
               }`}>
                {assessment.type}
               </span>
               <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(assessment.skillLevel)}`}>
                {assessment.skillLevel}
               </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
               Score: {assessment.score}/{assessment.maxScore}
               ({((assessment.score / assessment.maxScore) * 100).toFixed(1)}%)
              </p>
             </div>
             <div className="text-right text-sm text-gray-500">
              <p>{assessment.date.toLocaleDateString()}</p>
              <p>{assessment.date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</p>
             </div>
            </div>

            {assessment.feedback && (
             <div className="bg-white rounded p-3 border border-gray-200">
              <p className="text-sm text-gray-700">{assessment.feedback}</p>
             </div>
            )}

            <div className="mt-3 flex items-center space-x-2">
             <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
               className="bg-blue-600 h-2 rounded-full"
               style={{ width: `${(assessment.score / assessment.maxScore) * 100}%` }}
              />
             </div>
             <span className="text-xs text-gray-500">
              {assessment.score}/{assessment.maxScore}
             </span>
            </div>
           </div>
          ))}
        </div>
       )}

       {/* Progress Visualization */}
       {selectedSkillProgress.currentLevel && (
        <div className="mt-8">
         <h4 className="font-medium text-gray-900 mb-4">Progress Towards Mastery</h4>
         <div className="space-y-3">
          {(['awareness','application','mastery'] as const).map(level => {
           const isAchieved = selectedSkillProgress!.currentLevel === level ||
            (level ==='awareness' && ['application','mastery'].includes(selectedSkillProgress!.currentLevel!)) ||
            (level ==='application' && selectedSkillProgress!.currentLevel ==='mastery');

           return (
            <div key={level} className="flex items-center space-x-3">
             <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              isAchieved ?'bg-green-500' :'bg-gray-300'
             }`}>
              {isAchieved && <CheckCircle className="w-3 h-3 text-white" />}
             </div>
             <span className={`text-sm font-medium capitalize ${
              isAchieved ?'text-green-700' :'text-gray-500'
             }`}>
              {level} Level
             </span>
             {selectedSkillProgress!.currentLevel === level && (
              <span className="text-xs text-gray-500">
               Current ({(selectedSkillProgress!.confidence * 100).toFixed(0)}% confidence)
              </span>
             )}
            </div>
           );
          })}
         </div>
        </div>
       )}
      </div>
     </>
    ) : (
     <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
       <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
       <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Skill</h3>
       <p className="text-gray-600">
        Choose a skill from the list to view detailed progress and assessment history.
       </p>
      </div>
     </div>
    )}
   </div>
  </div>
 );
};