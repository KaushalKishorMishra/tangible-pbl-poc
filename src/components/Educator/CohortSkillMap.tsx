import React, { useState, useEffect, useMemo } from 'react';
import { Users, AlertTriangle, Target, BarChart3, Filter } from 'lucide-react';
import { useSigma } from '@react-sigma/core';
import { useGraphStore } from '../../store/graphStore';

interface CohortData {
  cohortId: string;
  cohortName: string;
  learners: LearnerData[];
  courseId?: string;
}

interface LearnerData {
  id: string;
  name: string;
  skills: {
    skillId: string;
    level: 'awareness' | 'application' | 'mastery' | null;
    confidence: number;
    lastAssessed: Date;
  }[];
}

interface SkillAggregate {
  skillId: string;
  name: string;
  totalLearners: number;
  assessedLearners: number;
  levelDistribution: {
    awareness: number;
    application: number;
    mastery: number;
    notAssessed: number;
  };
  avgConfidence: number;
  gapScore: number; // 0-1, higher means bigger gap
}

interface CohortSkillMapProps {
  cohortData: CohortData;
  targetLevels?: { [skillId: string]: 'awareness' | 'application' | 'mastery' };
  onSkillFocus?: (skillId: string) => void;
}

export const CohortSkillMap: React.FC<CohortSkillMapProps> = ({
  cohortData,
  targetLevels = {},
  onSkillFocus,
}) => {
  const sigma = useSigma();
  const { setSelectedNodeIds } = useGraphStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'gap' | 'assessed' | 'confidence'>('gap');

  // Aggregate skill data across cohort
  const skillAggregates = useMemo(() => {
    const aggregates = new Map<string, SkillAggregate>();

    cohortData.learners.forEach(learner => {
      learner.skills.forEach(skill => {
        if (!aggregates.has(skill.skillId)) {
          aggregates.set(skill.skillId, {
            skillId: skill.skillId,
            name: `Skill ${skill.skillId}`, // In real app, get from skill ontology
            totalLearners: cohortData.learners.length,
            assessedLearners: 0,
            levelDistribution: {
              awareness: 0,
              application: 0,
              mastery: 0,
              notAssessed: 0,
            },
            avgConfidence: 0,
            gapScore: 0,
          });
        }

        const aggregate = aggregates.get(skill.skillId)!;

        if (skill.level) {
          aggregate.assessedLearners++;
          aggregate.levelDistribution[skill.level]++;
          aggregate.avgConfidence += skill.confidence;
        } else {
          aggregate.levelDistribution.notAssessed++;
        }
      });
    });

    // Calculate averages and gap scores
    aggregates.forEach(aggregate => {
      if (aggregate.assessedLearners > 0) {
        aggregate.avgConfidence /= aggregate.assessedLearners;
      }

      // Calculate gap score based on target level
      const targetLevel = targetLevels[aggregate.skillId];
      if (targetLevel) {
        const targetIndex = { awareness: 1, application: 2, mastery: 3 }[targetLevel];
        const currentAvgIndex =
          (aggregate.levelDistribution.awareness * 1 +
           aggregate.levelDistribution.application * 2 +
           aggregate.levelDistribution.mastery * 3) / aggregate.assessedLearners;

        aggregate.gapScore = Math.max(0, (targetIndex - currentAvgIndex) / 3);
      }
    });

    return Array.from(aggregates.values());
  }, [cohortData, targetLevels]);

  // Update node colors based on cohort performance
  useEffect(() => {
    if (sigma && skillAggregates.length > 0) {
      const graph = sigma.getGraph();

      skillAggregates.forEach(aggregate => {
        if (graph.hasNode(aggregate.skillId)) {
          let color = '#e5e7eb'; // Default gray
          let size = 10;

          if (aggregate.assessedLearners > 0) {
            size = Math.max(15, Math.min(25, 15 + (aggregate.assessedLearners / cohortData.learners.length) * 10));

            // Color based on gap score
            if (aggregate.gapScore > 0.5) {
              color = '#ef4444'; // Red for high gap
            } else if (aggregate.gapScore > 0.2) {
              color = '#f59e0b'; // Yellow for medium gap
            } else {
              color = '#10b981'; // Green for low gap
            }
          }

          graph.setNodeAttribute(aggregate.skillId, 'color', color);
          graph.setNodeAttribute(aggregate.skillId, 'size', size);
        }
      });
    }
  }, [sigma, skillAggregates, cohortData.learners.length]);

  // Filter and sort skills
  const filteredSkills = skillAggregates
    .filter(skill => {
      if (filterLevel === 'all') return true;
      if (filterLevel === 'gaps') return skill.gapScore > 0.3;
      if (filterLevel === 'assessed') return skill.assessedLearners > 0;
      if (filterLevel === 'unassessed') return skill.assessedLearners === 0;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'gap':
          return b.gapScore - a.gapScore;
        case 'assessed':
          return b.assessedLearners - a.assessedLearners;
        case 'confidence':
          return b.avgConfidence - a.avgConfidence;
        default:
          return 0;
      }
    });

  const handleSkillSelect = (skillId: string) => {
    setSelectedSkill(skillId);
    setSelectedNodeIds([skillId]);
    onSkillFocus?.(skillId);
  };

  const getGapColor = (gapScore: number) => {
    if (gapScore > 0.5) return 'text-red-600 bg-red-100';
    if (gapScore > 0.2) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const cohortStats = {
    totalLearners: cohortData.learners.length,
    avgSkillsAssessed: skillAggregates.reduce((sum, skill) => sum + skill.assessedLearners, 0) / skillAggregates.length,
    skillsWithGaps: skillAggregates.filter(skill => skill.gapScore > 0.3).length,
    overallCompletion: (skillAggregates.reduce((sum, skill) => sum + skill.assessedLearners, 0) / (skillAggregates.length * cohortData.learners.length)) * 100,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex">
      {/* Cohort Overview Panel */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{cohortData.cohortName}</h3>
              <p className="text-gray-600 text-sm">{cohortData.learners.length} learners</p>
            </div>
          </div>

          {/* Cohort Stats */}
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Overall Completion</p>
                  <p className="text-lg font-bold text-blue-800">
                    {cohortStats.overallCompletion.toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900">Skills with Gaps</p>
                  <p className="text-lg font-bold text-red-800">{cohortStats.skillsWithGaps}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Avg Skills Assessed</p>
                  <p className="text-lg font-bold text-green-800">
                    {cohortStats.avgSkillsAssessed.toFixed(1)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>

          <div className="space-y-2">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Skills</option>
              <option value="gaps">Skills with Gaps</option>
              <option value="assessed">Assessed Skills</option>
              <option value="unassessed">Unassessed Skills</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'gap' | 'assessed' | 'confidence')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="gap">Sort by Gap Score</option>
              <option value="assessed">Sort by Assessment Rate</option>
              <option value="confidence">Sort by Confidence</option>
            </select>
          </div>
        </div>

        {/* Skills List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Skills ({filteredSkills.length})
            </h4>
            <div className="space-y-2">
              {filteredSkills.map(skill => (
                <div
                  key={skill.skillId}
                  onClick={() => handleSkillSelect(skill.skillId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSkill === skill.skillId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {skill.assessedLearners}/{skill.totalLearners} assessed
                        </span>
                        {skill.gapScore > 0 && (
                          <span className={`px-2 py-1 text-xs rounded-full ${getGapColor(skill.gapScore)}`}>
                            Gap: {(skill.gapScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      {skill.assessedLearners > 0 && (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs ${getConfidenceColor(skill.avgConfidence)}`}>
                            {(skill.avgConfidence * 100).toFixed(0)}% avg confidence
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Details Panel */}
      <div className="flex-1 flex flex-col">
        {selectedSkill ? (
          <>
            {/* Skill Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {skillAggregates.find(s => s.skillId === selectedSkill)?.name}
                  </h2>
                  <p className="text-gray-600 mt-1">Cohort performance analysis</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Target Level</div>
                  <div className="font-medium text-gray-900 capitalize">
                    {targetLevels[selectedSkill] || 'Not set'}
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Analytics */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const skill = skillAggregates.find(s => s.skillId === selectedSkill);
                if (!skill) return null;

                return (
                  <div className="space-y-6">
                    {/* Level Distribution */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Level Distribution</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900">Awareness</span>
                            <span className="text-lg font-bold text-blue-800">
                              {skill.levelDistribution.awareness}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(skill.levelDistribution.awareness / skill.totalLearners) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-900">Application</span>
                            <span className="text-lg font-bold text-green-800">
                              {skill.levelDistribution.application}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(skill.levelDistribution.application / skill.totalLearners) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-purple-900">Mastery</span>
                            <span className="text-lg font-bold text-purple-800">
                              {skill.levelDistribution.mastery}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(skill.levelDistribution.mastery / skill.totalLearners) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Not Assessed</span>
                            <span className="text-lg font-bold text-gray-800">
                              {skill.levelDistribution.notAssessed}
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-600 h-2 rounded-full"
                              style={{ width: `${(skill.levelDistribution.notAssessed / skill.totalLearners) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gap Analysis */}
                    {skill.gapScore > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Gap Analysis</h3>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-orange-900">Performance Gap Detected</h4>
                              <p className="text-orange-800 text-sm mt-1">
                                The cohort is {(skill.gapScore * 100).toFixed(0)}% below the target level for this skill.
                                Consider additional training or curriculum adjustments.
                              </p>
                              <div className="mt-3">
                                <div className="text-sm text-orange-800">
                                  <strong>Recommendations:</strong>
                                </div>
                                <ul className="text-sm text-orange-700 mt-1 space-y-1">
                                  <li>• Schedule additional practice sessions</li>
                                  <li>• Provide targeted learning resources</li>
                                  <li>• Consider peer mentoring programs</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Individual Learner Breakdown */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Learner Breakdown</h3>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="max-h-60 overflow-y-auto">
                          {cohortData.learners.map(learner => {
                            const learnerSkill = learner.skills.find(s => s.skillId === selectedSkill);
                            return (
                              <div key={learner.id} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
                                <span className="text-sm font-medium text-gray-900">{learner.name}</span>
                                <div className="flex items-center space-x-2">
                                  {learnerSkill?.level ? (
                                    <>
                                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                                        learnerSkill.level === 'awareness' ? 'bg-blue-100 text-blue-800' :
                                        learnerSkill.level === 'application' ? 'bg-green-100 text-green-800' :
                                        'bg-purple-100 text-purple-800'
                                      }`}>
                                        {learnerSkill.level}
                                      </span>
                                      <span className={`text-xs ${getConfidenceColor(learnerSkill.confidence)}`}>
                                        {(learnerSkill.confidence * 100).toFixed(0)}%
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs text-gray-500">Not assessed</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Skill</h3>
              <p className="text-gray-600">
                Choose a skill from the list to view detailed cohort performance analytics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};