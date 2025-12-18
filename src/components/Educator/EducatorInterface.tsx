
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { EducatorDashboard } from "./EducatorDashboard";
import { AICourseCreation } from "./AICourseCreation";
import { CohortSkillMap } from "./CohortSkillMap";
import { EvaluationInterface } from "./EvaluationInterface";
import { RoleAlignmentAnalyzer } from "./RoleAlignmentAnalyzer";
import { LearnerProgressTracker } from "./LearnerProgressTracker";
import { useUserStore } from '../../store/userStore'; // Changed from useGraphStore

export const EducatorInterface: React.FC = () => {
	const { user } = useUserStore(); // Changed from useGraphStore

	// Show onboarding if not completed (this can be handled in EducatorDashboard)
	if (user.role !== "educator") {
		return <Navigate to="/" replace />;
	}

	return (
		<Routes>
			{/* Default route - Dashboard */}
			<Route index element={<EducatorDashboard />} />

			{/* Course Creation - AI-driven flow */}
			<Route path="create-course" element={<AICourseCreation />} />

			{/* Cohort Monitoring */}
			<Route
				path="cohorts/:cohortId?"
				element={
					<CohortSkillMap
						cohortData={{
							cohortId: "cohort-1",
							cohortName: "AI Bootcamp - Nov 2025",
							learners: [
								{
									id: "learner-1",
									name: "John Doe",
									skills: [
										{
											skillId: "0",
											level: "application",
											confidence: 0.85,
											lastAssessed: new Date(),
										},
										{
											skillId: "4",
											level: "awareness",
											confidence: 0.65,
											lastAssessed: new Date(),
										},
									],
								},
							],
						}}
					/>
				}
			/>

			{/* Learner Progress Tracking */}
			<Route
				path="learners/:learnerId/progress"
				element={<LearnerProgressTracker learnerId="learner-1" />}
			/>

			{/* Evaluation Interface */}
			<Route
				path="evaluate/:assignmentId?"
				element={
					<EvaluationInterface
						learnerId="learner-1"
						assignmentId="assignment-1"
						learnerWork={{
							content:
								"Here is my submission for the async programming assignment...",
							submittedAt: new Date(),
							attachments: ["project.zip", "report.pdf"],
						}}
						rubric={[
							{
								skillId: "5",
								criteria: "Understanding and implementation of Promises",
								levels: {
									awareness: "Can identify and describe what Promises are",
									application: "Can create and use Promises in code",
									mastery:
										"Can design complex async flows with Promises and handle all edge cases",
								},
							},
							{
								skillId: "6",
								criteria: "Usage of async/await syntax",
								levels: {
									awareness: "Understands async/await concept",
									application: "Can write async/await code correctly",
									mastery:
										"Expertly uses async/await with error handling and optimization",
								},
							},
						]}
						onSubmitEvaluation={(evaluation) => {
							console.log("Evaluation submitted:", evaluation);
						}}
						onSaveDraft={(evaluation) => {
							console.log("Draft saved:", evaluation);
						}}
					/>
				}
			/>

			{/* Role Alignment & Gap Analysis */}
			<Route
				path="role-alignment"
				element={
					<RoleAlignmentAnalyzer
						jobRoles={[
							{
								id: "role-1",
								title: "Backend Developer",
								description: "Node.js backend development role",
								requiredSkills: [
									{
										skillId: "8",
										requiredLevel: "application",
										importance: "required",
									},
									{
										skillId: "4",
										requiredLevel: "mastery",
										importance: "required",
									},
									{
										skillId: "5",
										requiredLevel: "application",
										importance: "preferred",
									},
								],
								industry: "Technology",
								experienceLevel: "mid",
							},
						]}
						courseCoverage={[
							{
								courseId: "course-1",
								courseTitle: "Node.js Fundamentals",
								skills: [
									{ skillId: "8", targetLevel: "application" },
									{ skillId: "4", targetLevel: "application" },
								],
							},
						]}
					/>
				}
			/>

			{/* Catch all - redirect to dashboard */}
			<Route path="*" element={<Navigate to="/educator" replace />} />
		</Routes>
	);
};
