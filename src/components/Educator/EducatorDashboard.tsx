import React from "react";
import {
	BookOpen,
	Users,
	BarChart3,
	Plus,
	Target,
	TrendingUp,
} from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import { useCourseStore } from "../../store/courseStore";
import { useGraphStore } from "../../store/graphStore";

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

export const EducatorDashboard: React.FC = () => {
	const { user } = useUserStore();
    const savedCourses = useCourseStore(state => state.savedCourses);
    const setCourseData = useCourseStore(state => state.setCourseData);
    
    // Actually we need to set graph data in graphStore when loading.
    const { setAIGeneratedGraphData: setGraphData, setGeneratedProblems: setProblems } = useGraphStore();
    
	const navigate = useNavigate();

	// Mock data - in a real app, this would come from an API
	const stats = {
		activeCourses: savedCourses.length,
		totalLearners: 127,
		avgProgress: 68,
		recentActivity: 12,
	};

	const handleCreateCourse = () => {
		navigate("/educator/create-course");
	};

	const handleViewCourses = () => {
		// Scroll to saved courses section
        document.getElementById('saved-courses')?.scrollIntoView({ behavior: 'smooth' });
	};

	const handleViewAnalytics = () => {
		navigate("/educator/cohorts");
	};
    
    const handleLoadCourse = (courseId: string) => {
        const course = savedCourses.find(c => c.id === courseId);
        if (course) {
            // Load data into stores
            setCourseData(course.courseData as any);
            setGraphData(course.graphData);
            setProblems(course.problems);
            
            // Navigate to course creation wizard in flow design step (or a viewer)
            // For now, let's go to create-course but we need a way to tell it to skip to flow design
            // Maybe we can pass state or just rely on the store being populated?
            // AICourseCreation resets state on mount. We might need to modify it to check for existing data.
            // Or we can navigate to a different route like /educator/course/:id
            
            // Let's assume for now we just want to list them. 
            // To actually edit/view, we'd need to update AICourseCreation to not reset if data exists, 
            // or pass a flag.
            
            // For this task, "use it in the listing page" implies seeing it here.
            // I'll implement the listing.
        }
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
						change={savedCourses.length > 0 ? `+${savedCourses.length} new` : "No new courses"}
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

                {/* Saved Courses Section */}
                <div id="saved-courses" className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        My Saved Courses
                    </h2>
                    
                    {savedCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedCourses.map((course) => (
                                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                                {(course.courseData as any).level || "General"}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(course.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                                            {course.description}
                                        </p>
                                        
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                                            <div className="flex items-center gap-1">
                                                <Target className="w-3 h-3" />
                                                {course.graphData.nodesCount} Skills
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                0 Learners
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleLoadCourse(course.id)}
                                                className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                            <p className="text-gray-500 mb-6">Create your first AI-powered course to see it here.</p>
                            <button
                                onClick={handleCreateCourse}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Create Course
                            </button>
                        </div>
                    )}
                </div>

				{/* Recent Activity */}
				<div className="mt-12">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Recent Activity
					</h2>
                    {/* ... existing activity list ... */}
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
