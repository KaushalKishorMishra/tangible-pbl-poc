import React, { useState } from 'react';
import { Save, Send, Eye, EyeOff } from 'lucide-react';

interface RubricItem {
  skillId: string;
  criteria: string;
  levels: {
    awareness: string;
    application: string;
    mastery: string;
  };
}

interface EvaluationInterfaceProps {
  learnerId: string;
  assignmentId: string;
  learnerWork: {
    content: string;
    submittedAt: Date;
    attachments?: string[];
  };
  rubric: RubricItem[];
  onSubmitEvaluation: (evaluation: EvaluationResult) => void;
  onSaveDraft: (evaluation: Partial<EvaluationResult>) => void;
}

interface EvaluationResult {
  overallScore: number;
  maxScore: number;
  skillAssessments: {
    skillId: string;
    level: 'awareness' | 'application' | 'mastery';
    score: number;
    feedback: string;
  }[];
  generalFeedback: string;
  recommendations: string[];
  status: 'draft' | 'submitted';
}

export const EvaluationInterface: React.FC<EvaluationInterfaceProps> = ({
  learnerWork,
  rubric,
  onSubmitEvaluation,
  onSaveDraft,
}) => {
  const [evaluation, setEvaluation] = useState<Partial<EvaluationResult>>({
    skillAssessments: rubric.map(item => ({
      skillId: item.skillId,
      level: 'awareness' as const,
      score: 0,
      feedback: '',
    })),
    generalFeedback: '',
    recommendations: [],
    status: 'draft',
  });

  const [showRubric, setShowRubric] = useState(true);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const updateSkillAssessment = (skillId: string, updates: Partial<EvaluationResult['skillAssessments'][0]>) => {
    setEvaluation(prev => ({
      ...prev,
      skillAssessments: prev.skillAssessments?.map(assessment =>
        assessment.skillId === skillId ? { ...assessment, ...updates } : assessment
      ),
    }));
  };

  const calculateOverallScore = () => {
    const assessments = evaluation.skillAssessments || [];
    const totalScore = assessments.reduce((sum, assessment) => sum + assessment.score, 0);
    return { score: totalScore, maxScore: assessments.length * 4 }; // Assuming 4 points per skill
  };

  const { score: overallScore, maxScore } = calculateOverallScore();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'awareness': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'application': return 'bg-green-100 text-green-800 border-green-300';
      case 'mastery': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex">
      {/* Learner Work Panel */}
      <div className="w-1/2 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Learner's Work</h3>
            <span className="text-sm text-gray-500">
              Submitted {learnerWork.submittedAt.toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Assignment Content</h4>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{learnerWork.content}</p>
            </div>
          </div>

          {learnerWork.attachments && learnerWork.attachments.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
              <div className="space-y-2">
                {learnerWork.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 font-medium">📎</span>
                    </div>
                    <span className="text-gray-700">{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Evaluation Panel */}
      <div className="w-1/2 flex flex-col">
        {/* Evaluation Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Evaluation</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRubric(!showRubric)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {showRubric ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{showRubric ? 'Hide' : 'Show'} Rubric</span>
              </button>
            </div>
          </div>

          {/* Overall Score */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Overall Score</span>
              <span className={`text-lg font-bold ${getScoreColor(overallScore, maxScore)}`}>
                {overallScore}/{maxScore}
              </span>
            </div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(overallScore / maxScore) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Evaluation Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Rubric Evaluation */}
            {showRubric && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Skill Assessment</h4>
                <div className="space-y-4">
                  {rubric.map((item, index) => {
                    const assessment = evaluation.skillAssessments?.[index];
                    const isActive = activeSkill === item.skillId;

                    return (
                      <div
                        key={item.skillId}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setActiveSkill(isActive ? null : item.skillId)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">Skill {item.skillId}</h5>
                            <p className="text-sm text-gray-600 mt-1">{item.criteria}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={assessment?.level || 'awareness'}
                              onChange={(e) => updateSkillAssessment(item.skillId, {
                                level: e.target.value as 'awareness' | 'application' | 'mastery'
                              })}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="awareness">Awareness</option>
                              <option value="application">Application</option>
                              <option value="mastery">Mastery</option>
                            </select>
                            <input
                              type="number"
                              min="0"
                              max="4"
                              value={assessment?.score || 0}
                              onChange={(e) => updateSkillAssessment(item.skillId, {
                                score: parseInt(e.target.value) || 0
                              })}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Rubric Levels */}
                        <div className="space-y-2 mb-3">
                          {Object.entries(item.levels).map(([level, description]) => (
                            <div
                              key={level}
                              className={`p-2 rounded text-sm ${
                                assessment?.level === level ? getLevelColor(level) : 'bg-gray-50'
                              }`}
                            >
                              <div className="font-medium capitalize">{level}</div>
                              <div className="text-xs mt-1">{description}</div>
                            </div>
                          ))}
                        </div>

                        {/* Skill Feedback */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Feedback for this skill
                          </label>
                          <textarea
                            value={assessment?.feedback || ''}
                            onChange={(e) => updateSkillAssessment(item.skillId, {
                              feedback: e.target.value
                            })}
                            placeholder="Provide specific feedback for this skill..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* General Feedback */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">General Feedback</h4>
              <textarea
                value={evaluation.generalFeedback || ''}
                onChange={(e) => setEvaluation(prev => ({ ...prev, generalFeedback: e.target.value }))}
                placeholder="Overall feedback for the learner..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <div className="space-y-2">
                {(evaluation.recommendations || []).map((rec, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={rec}
                      onChange={(e) => {
                        const newRecs = [...(evaluation.recommendations || [])];
                        newRecs[index] = e.target.value;
                        setEvaluation(prev => ({ ...prev, recommendations: newRecs }));
                      }}
                      placeholder="Recommendation for improvement..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        const newRecs = (evaluation.recommendations || []).filter((_, i) => i !== index);
                        setEvaluation(prev => ({ ...prev, recommendations: newRecs }));
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newRecs = [...(evaluation.recommendations || []), ''];
                    setEvaluation(prev => ({ ...prev, recommendations: newRecs }));
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <span className="mr-1">+</span>
                  Add recommendation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSaveDraft(evaluation)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Save size={16} />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => onSubmitEvaluation(evaluation as EvaluationResult)}
              disabled={!evaluation.skillAssessments?.every(a => a.score > 0)}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              <span>Submit Evaluation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};