import React from "react";
import {
	BookOpen,
	Users,
	BarChart3,
	Plus,
	Target,
	TrendingUp,
	Sparkles,
	ArrowRight,
	Clock,
	Calendar,
	ChevronRight,
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
	gradient?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
	title,
	description,
	icon,
	action,
	onClick,
	stats,
	gradient = "from-indigo-600 to-violet-700",
}) => (
	<div className="group relative bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
		<div className="relative z-10">
			<div className="flex items-start justify-between mb-6">
				<div
					className={`p-4 bg-linear-to-br ${gradient} rounded-2xl text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-500`}
				>
					{icon}
				</div>
				{stats && (
					<span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
						{stats}
					</span>
				)}
			</div>
			<h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
				{title}
			</h3>
			<p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed opacity-80">
				{description}
			</p>
			<button
				onClick={onClick}
				className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl hover:bg-indigo-600 transition-all duration-300 text-sm font-black flex items-center justify-center gap-2 group/btn shadow-lg shadow-slate-200"
			>
				{action}
				<ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
			</button>
		</div>
		<div
			className={`absolute -bottom-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-10 bg-linear-to-br ${gradient} group-hover:scale-150 transition-transform duration-700`}
		></div>
	</div>
);

interface QuickStatProps {
	label: string;
	value: string;
	change?: string;
	icon: React.ReactNode;
	color: string;
}

const QuickStat: React.FC<QuickStatProps> = ({
	label,
	value,
	change,
	icon,
	color,
}) => (
	<div className="bg-white/70 backdrop-blur-xl rounded-[28px] p-6 border border-white/40 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 group">
		<div className="flex items-center justify-between">
			<div>
				<p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
					{label}
				</p>
				<p className="text-3xl font-black text-slate-900 tracking-tight">
					{value}
				</p>
				{change && (
					<p className="text-xs text-emerald-600 font-bold flex items-center mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg">
						<TrendingUp size={12} className="mr-1" />
						{change}
					</p>
				)}
			</div>
			<div
				className={`p-4 rounded-2xl ${color} text-white shadow-lg transition-transform group-hover:rotate-12 duration-300`}
			>
				{icon}
			</div>
		</div>
	</div>
);

export const EducatorDashboard: React.FC = () => {
	const { user } = useUserStore();
	const savedCourses = useCourseStore((state) => state.savedCourses);
	const {
		setAIGeneratedGraphData: setGraphData,
		setGeneratedProblems: setProblems,
	} = useGraphStore();
	const navigate = useNavigate();

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
		document
			.getElementById("saved-courses")
			?.scrollIntoView({ behavior: "smooth" });
	};

	const handleViewAnalytics = () => {
		navigate("/educator/cohorts");
	};

	const handleLoadCourse = (courseId: string) => {
		const course = savedCourses.find((c) => c.id === courseId);
		if (course) {
			// Load graph data and problems into their respective stores
			setGraphData(course.graphData);
			setProblems(course.problems);
			navigate("/educator/create-course", { state: { resume: true } });
		}
	};

	if (user.role !== "educator") {
		return null;
	}

	return (
		<div className="h-screen overflow-y-auto bg-linear-to-br from-slate-50 via-white to-indigo-50/50 font-sans text-slate-900 scroll-smooth">
			{/* Header */}
			<div className="relative overflow-hidden bg-white/30 backdrop-blur-md border-b border-white/20">
				<div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="animate-in fade-in slide-in-from-left-4 duration-700">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2.5 bg-linear-to-br from-indigo-600 to-violet-700 rounded-xl shadow-lg shadow-indigo-200">
									<Sparkles className="w-5 h-5 text-white" />
								</div>
								<span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] font-title">
									Educator Portal
								</span>
							</div>
							<h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
								Welcome back,{" "}
								<span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-700">
									Educator
								</span>
								!
							</h1>
							<p className="text-slate-500 mt-2 text-lg font-medium opacity-80">
								Your AI-powered design studio is ready. What will we build
								today?
							</p>
						</div>
						<div className="flex items-center animate-in fade-in slide-in-from-right-4 duration-700">
							<button
								onClick={handleCreateCourse}
								className="bg-linear-to-br from-indigo-600 to-violet-700 text-white px-8 py-4 rounded-[20px] hover:scale-105 transition-all duration-300 flex items-center gap-3 font-black text-sm shadow-xl shadow-indigo-200 active:scale-95"
							>
								<Plus size={20} strokeWidth={3} />
								<span>New Course</span>
							</button>
						</div>
					</div>
				</div>
				{/* Decorative Header Element */}
				<div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
			</div>

			<div className="max-w-7xl mx-auto px-8 py-12">
				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
					<QuickStat
						label="Active Courses"
						value={stats.activeCourses.toString()}
						change={
							savedCourses.length > 0 ? `+${savedCourses.length}` : undefined
						}
						icon={<BookOpen size={24} />}
						color="bg-indigo-500"
					/>
					<QuickStat
						label="Total Learners"
						value={stats.totalLearners.toString()}
						change="+15"
						icon={<Users size={24} />}
						color="bg-violet-500"
					/>
					<QuickStat
						label="Avg. Progress"
						value={`${stats.avgProgress}%`}
						change="+5%"
						icon={<Target size={24} />}
						color="bg-emerald-500"
					/>
					<QuickStat
						label="Recent Activity"
						value={stats.recentActivity.toString()}
						icon={<BarChart3 size={24} />}
						color="bg-amber-500"
					/>
				</div>

				{/* Main Actions */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
					<DashboardCard
						title="Create New Course"
						description="Design a skill-mapped course with project-based learning modules and integrated assessments."
						icon={<Plus className="w-6 h-6" />}
						action="Launch Wizard"
						onClick={handleCreateCourse}
						gradient="from-indigo-600 to-violet-700"
					/>

					<DashboardCard
						title="Manage Courses"
						description="View and edit your existing courses, track learner progress, and update content."
						icon={<BookOpen className="w-6 h-6" />}
						action="View All"
						onClick={handleViewCourses}
						stats={`${stats.activeCourses} active`}
						gradient="from-emerald-500 to-teal-600"
					/>

					<DashboardCard
						title="Learner Analytics"
						description="Monitor cohort performance, identify skill gaps, and get insights for curriculum improvement."
						icon={<BarChart3 className="w-6 h-6" />}
						action="Open Insights"
						onClick={handleViewAnalytics}
						stats={`${stats.totalLearners} learners`}
						gradient="from-amber-500 to-orange-600"
					/>
				</div>

				{/* Saved Courses Section */}
				<div
					id="saved-courses"
					className="mt-20 animate-in fade-in duration-1000 delay-300"
				>
					<div className="flex items-center justify-between mb-10">
						<div>
							<h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
								<div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
								My Saved Courses
							</h2>
							<p className="text-slate-500 font-medium mt-1 ml-6">
								Continue designing your learning architectures.
							</p>
						</div>
						<button
							onClick={handleViewCourses}
							className="text-indigo-600 font-black text-sm hover:underline flex items-center gap-1"
						>
							View All <ChevronRight size={16} />
						</button>
					</div>

					{savedCourses.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{savedCourses.map((course, idx) => (
								<div
									key={course.id}
									style={{ animationDelay: `${idx * 100}ms` }}
									className="group bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
								>
									<div className="p-8">
										<div className="flex justify-between items-start mb-6">
											<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-600/20 font-title">
												{course.courseData?.level ?? "General"}
											</div>
											<div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
												<Calendar className="w-3 h-3 mr-1.5" />
												{new Date(course.updatedAt).toLocaleDateString()}
											</div>
										</div>
										<h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-1 group-hover:text-indigo-600 transition-colors tracking-tight">
											{course.title}
										</h3>
										<p className="text-slate-500 text-sm mb-8 line-clamp-2 h-10 font-medium leading-relaxed opacity-80">
											{course.description}
										</p>

										<div className="grid grid-cols-2 gap-4 mb-8">
											<div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
												<div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
													<Target className="w-3.5 h-3.5" />
												</div>
												<div>
													<p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
														Skills
													</p>
													<p className="text-sm font-black text-slate-900">
														{course.graphData.nodesCount}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
												<div className="p-2 bg-white rounded-lg shadow-sm text-violet-600">
													<Users className="w-3.5 h-3.5" />
												</div>
												<div>
													<p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
														Learners
													</p>
													<p className="text-sm font-black text-slate-900">0</p>
												</div>
											</div>
										</div>

										<button
											onClick={() => handleLoadCourse(course.id)}
											className="w-full px-6 py-4 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group/btn"
										>
											Edit Course
											<ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
										</button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="bg-white/40 backdrop-blur-xl rounded-[40px] border-4 border-dashed border-slate-200 p-20 text-center animate-in zoom-in duration-700">
							<div className="w-24 h-24 bg-linear-to-br from-indigo-50 to-violet-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
								<BookOpen className="w-10 h-10 text-indigo-300" />
							</div>
							<h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
								No courses yet
							</h3>
							<p className="text-slate-500 mb-10 font-medium text-lg max-w-md mx-auto">
								Create your first AI-powered learning architecture to see it
								here.
							</p>
							<button
								onClick={handleCreateCourse}
								className="inline-flex items-center gap-3 px-10 py-5 bg-linear-to-br from-indigo-600 to-violet-700 text-white rounded-[24px] hover:scale-105 transition-all duration-300 font-black text-sm shadow-2xl shadow-indigo-200 active:scale-95"
							>
								<Plus className="w-5 h-5" strokeWidth={3} />
								Start Creating
							</button>
						</div>
					)}
				</div>

				{/* Recent Activity */}
				<div className="mt-24 mb-20 animate-in fade-in duration-1000 delay-500">
					<h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-4">
						<div className="w-2 h-8 bg-amber-500 rounded-full"></div>
						Recent Activity
					</h2>
					<div className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-xl shadow-slate-200/50 overflow-hidden">
						<div className="p-8">
							<div className="space-y-6">
								{[
									{
										user: "Sarah Johnson",
										action: "completed the JavaScript Fundamentals module",
										time: "2 hours ago",
										color: "bg-emerald-500",
									},
									{
										user: "New enrollment",
										action: "in Full-Stack Development Course",
										time: "4 hours ago",
										color: "bg-indigo-500",
									},
									{
										user: "Mike Chen",
										action: "requested feedback on their React project",
										time: "6 hours ago",
										color: "bg-amber-500",
									},
								].map((activity, idx) => (
									<div key={idx} className="flex items-center gap-6 group">
										<div
											className={`w-3 h-3 ${activity.color} rounded-full shadow-lg shadow-current/20 group-hover:scale-150 transition-transform duration-300`}
										></div>
										<div className="flex-1 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
											<p className="text-slate-900 font-medium">
												<span className="font-black">{activity.user}</span>{" "}
												<span className="opacity-70">{activity.action}</span>
											</p>
											<div className="flex items-center gap-2 mt-1.5">
												<Clock size={12} className="text-slate-400" />
												<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
													{activity.time}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
