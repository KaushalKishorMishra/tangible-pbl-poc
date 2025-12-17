import React from"react";
import {
	BookOpen,
	Users,
	BarChart3,
	Plus,
	Target,
	TrendingUp,
} from"lucide-react";
import { useUserStore } from"../../store/userStore";
import { useNavigate } from"react-router-dom";

interface DashboardCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	action: string;
	onClick: () => void;
	stats?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
	title,
	description,
	icon,
	action,
	onClick,
	stats,
}) => (
	<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
		<div className="flex items-start justify-between mb-4">
			<div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
			{stats && (
				<span className="text-sm font-medium text-gray-500">{stats}</span>
			)}
		</div>
		<h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
		<p className="text-gray-600 text-sm mb-4">{description}</p>
		<button
			onClick={onClick}
			className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
		>
			{action}
		</button>
	</div>
);

interface QuickStatProps {
	label: string;
	value: string;
	change?: string;
	icon: React.ReactNode;
}

const QuickStat: React.FC<QuickStatProps> = ({
	label,
	value,
	change,
	icon,
}) => (
	<div className="bg-white rounded-lg p-4 border border-gray-200 transition-colors duration-300">
		<div className="flex items-center justify-between">
			<div>
				<p className="text-sm font-medium text-gray-600">{label}</p>
				<p className="text-2xl font-bold text-gray-900">{value}</p>
				{change && (
					<p className="text-sm text-green-600 flex items-center">
						<TrendingUp size={14} className="mr-1" />
						{change}
					</p>
				)}
			</div>
			<div className="text-blue-600">{icon}</div>
		</div>
	</div>
);

// interface LearningOutcome {
// 	skillId: string;
// 	targetLevel: string;
// 	rationale?: string;
// }

// interface CourseData {
// 	title: string;
// 	description: string;
// 	duration: string;
// 	level: string;
// 	learningOutcomes: LearningOutcome[];
// }

export const EducatorDashboard: React.FC = () => {
	const { user } = useUserStore();
	const navigate = useNavigate();

	// Mock data - in a real app, this would come from an API
	const stats = {
		activeCourses: 3,
		totalLearners: 127,
		avgProgress: 68,
		recentActivity: 12,
	};

	const handleCreateCourse = () => {
		navigate("/educator/create-course");
	};

	const handleViewCourses = () => {
		// TODO: Navigate to course management page
		console.log("View courses");
	};

	const handleViewAnalytics = () => {
		navigate("/educator/cohorts");
	};

	if (user.role !=="educator") {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 transition-colors duration-300">
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-200 transition-colors duration-300">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="py-6">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Welcome back, Educator!
								</h1>
								<p className="text-gray-600 mt-1">
									Design impactful courses with skill-mapped learning outcomes
								</p>
							</div>
							<div className="flex items-center space-x-4">
								<button
									onClick={handleCreateCourse}
									className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
								>
									<Plus size={16} />
									<span>Create Course</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<QuickStat
						label="Active Courses"
						value={stats.activeCourses.toString()}
						change="+2 this month"
						icon={<BookOpen size={24} />}
					/>
					<QuickStat
						label="Total Learners"
						value={stats.totalLearners.toString()}
						change="+15 this week"
						icon={<Users size={24} />}
					/>
					<QuickStat
						label="Avg. Progress"
						value={`${stats.avgProgress}%`}
						change="+5% this month"
						icon={<Target size={24} />}
					/>
					<QuickStat
						label="Recent Activity"
						value={stats.recentActivity.toString()}
						change="Last 24h"
						icon={<BarChart3 size={24} />}
					/>
				</div>

				{/* Main Actions */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<DashboardCard
						title="Create New Course"
						description="Design a skill-mapped course with project-based learning modules and integrated assessments."
						icon={<BookOpen className="w-6 h-6 text-blue-600" />}
						action="Start Creating"
						onClick={handleCreateCourse}
					/>

					<DashboardCard
						title="Manage Courses"
						description="View and edit your existing courses, track learner progress, and update content."
						icon={<Target className="w-6 h-6 text-green-600" />}
						action="View Courses"
						onClick={handleViewCourses}
						stats={`${stats.activeCourses} active`}
					/>

					<DashboardCard
						title="Learner Analytics"
						description="Monitor cohort performance, identify skill gaps, and get insights for curriculum improvement."
						icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
						action="View Analytics"
						onClick={handleViewAnalytics}
						stats={`${stats.totalLearners} learners`}
					/>
				</div>

				{/* Recent Activity */}
				<div className="mt-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Recent Activity
					</h2>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-colors duration-300">
						<div className="p-6">
							<div className="space-y-4">
								<div className="flex items-center space-x-4">
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm text-gray-900">
											<span className="font-medium">Sarah Johnson</span>{""}
											completed the JavaScript Fundamentals module
										</p>
										<p className="text-xs text-gray-500">2 hours ago</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm text-gray-900">
											New enrollment in{""}
											<span className="font-medium">
												Full-Stack Development Course
											</span>
										</p>
										<p className="text-xs text-gray-500">4 hours ago</p>
									</div>
								</div>
								<div className="flex items-center space-x-4">
									<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
									<div className="flex-1">
										<p className="text-sm text-gray-900">
											<span className="font-medium">Mike Chen</span> requested
											feedback on their React project
										</p>
										<p className="text-xs text-gray-500">6 hours ago</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
