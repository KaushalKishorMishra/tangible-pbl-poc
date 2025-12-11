import React, { useState } from "react";
import {
	Globe,
	Lock,
	Users,
	CheckCircle,
	AlertTriangle,
	Eye,
} from "lucide-react";

interface CourseData {
	title: string;
	description: string;
	duration: string;
	level: string;
	learningOutcomes: Array<{
		skillId: string;
		targetLevel: string;
		rationale?: string;
	}>;
	modules: Array<{
		id: string;
		title: string;
		description: string;
		duration: string;
		skills: string[];
		assignments: Array<{ id: string; title: string }>;
		simulations: Array<{ id: string; title: string }>;
	}>;
}

interface PublishingWorkflowProps {
	courseData: CourseData;
	onPublish: (settings: PublishingSettings) => void;
	onCancel: () => void;
}

interface PublishingSettings {
	visibility: "public" | "private" | "cohort";
	allowEnrollments: boolean;
	requireApproval: boolean;
	tags: string[];
	prerequisites: string[];
}

export const PublishingWorkflow: React.FC<PublishingWorkflowProps> = ({
	courseData,
	onPublish,
	onCancel,
}) => {
	const [settings, setSettings] = useState<PublishingSettings>({
		visibility: "private",
		allowEnrollments: false,
		requireApproval: false,
		tags: [],
		prerequisites: [],
	});

	const [newTag, setNewTag] = useState("");
	const [newPrerequisite, setNewPrerequisite] = useState("");
	const [showPreview, setShowPreview] = useState(false);

	// Validation checks
	const validationChecks = [
		{
			label: "Course title provided",
			status: courseData.title.trim().length > 0,
		},
		{
			label: "Course description provided",
			status: courseData.description.trim().length > 0,
		},
		{
			label: "Learning outcomes defined",
			status: courseData.learningOutcomes.length > 0,
		},
		{
			label: "Modules created",
			status: courseData.modules.length > 0,
		},
		{
			label: "All modules have skills tagged",
			status: courseData.modules.every((module) => module.skills.length > 0),
		},
	];

	const isValidForPublishing = validationChecks.every((check) => check.status);
	const completionPercentage = Math.round(
		(validationChecks.filter((check) => check.status).length /
			validationChecks.length) *
			100,
	);

	const handleAddTag = () => {
		if (newTag.trim() && !settings.tags.includes(newTag.trim())) {
			setSettings((prev) => ({
				...prev,
				tags: [...prev.tags, newTag.trim()],
			}));
			setNewTag("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setSettings((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleAddPrerequisite = () => {
		if (
			newPrerequisite.trim() &&
			!settings.prerequisites.includes(newPrerequisite.trim())
		) {
			setSettings((prev) => ({
				...prev,
				prerequisites: [...prev.prerequisites, newPrerequisite.trim()],
			}));
			setNewPrerequisite("");
		}
	};

	const handleRemovePrerequisite = (prereqToRemove: string) => {
		setSettings((prev) => ({
			...prev,
			prerequisites: prev.prerequisites.filter(
				(prereq) => prereq !== prereqToRemove,
			),
		}));
	};

	const handlePublish = () => {
		if (isValidForPublishing) {
			onPublish(settings);
		}
	};

	if (showPreview) {
		return (
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
				<div className="p-6 border-b border-gray-200 flex items-center justify-between">
					<h2 className="text-xl font-semibold text-gray-900">
						Course Preview
					</h2>
					<button
						onClick={() => setShowPreview(false)}
						className="text-gray-600 hover:text-gray-800"
					>
						← Back to Settings
					</button>
				</div>

				<div className="p-6 overflow-y-auto">
					<div className="max-w-4xl mx-auto">
						{/* Course Header */}
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 mb-4">
								{courseData.title}
							</h1>
							<p className="text-gray-600 text-lg leading-relaxed">
								{courseData.description}
							</p>

							<div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
								<span className="flex items-center">
									<Users size={16} className="mr-1" />
									{courseData.level.charAt(0).toUpperCase() +
										courseData.level.slice(1)}{" "}
									Level
								</span>
								<span>{courseData.duration || "Duration not specified"}</span>
								<span>{courseData.modules.length} modules</span>
								<span>
									{courseData.learningOutcomes.length} learning outcomes
								</span>
							</div>
						</div>

						{/* Learning Outcomes */}
						<div className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">
								What You'll Learn
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{courseData.learningOutcomes.map((outcome, index) => (
									<div key={index} className="flex items-start space-x-3">
										<CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
										<div>
											<span className="text-gray-900">{outcome.skillId}</span>
											<span className="text-gray-600 text-sm ml-2">
												(Target: {outcome.targetLevel})
											</span>
											{outcome.rationale && (
												<p className="text-gray-600 text-sm mt-1">
													{outcome.rationale}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Modules */}
						<div className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">
								Course Modules
							</h2>
							<div className="space-y-4">
								{courseData.modules.map((module, index) => (
									<div key={module.id} className="bg-gray-50 rounded-lg p-6">
										<div className="flex items-start justify-between mb-4">
											<div>
												<h3 className="text-xl font-semibold text-gray-900">
													Module {index + 1}: {module.title}
												</h3>
												<p className="text-gray-600 mt-1">
													{module.description}
												</p>
											</div>
											<span className="text-sm text-gray-500">
												{module.duration}
											</span>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
											<div>
												<span className="font-medium text-gray-900">
													Skills:
												</span>
												<span className="text-gray-600 ml-2">
													{module.skills.length}
												</span>
											</div>
											<div>
												<span className="font-medium text-gray-900">
													Assignments:
												</span>
												<span className="text-gray-600 ml-2">
													{module.assignments.length}
												</span>
											</div>
											<div>
												<span className="font-medium text-gray-900">
													Simulations:
												</span>
												<span className="text-gray-600 ml-2">
													{module.simulations.length}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Publishing Settings */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-blue-900 mb-4">
								Publishing Settings
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium text-blue-900">Visibility:</span>
									<span className="text-blue-800 ml-2 capitalize">
										{settings.visibility}
									</span>
								</div>
								<div>
									<span className="font-medium text-blue-900">
										Enrollments:
									</span>
									<span className="text-blue-800 ml-2">
										{settings.allowEnrollments ? "Open" : "Closed"}
									</span>
								</div>
								<div>
									<span className="font-medium text-blue-900">
										Approval Required:
									</span>
									<span className="text-blue-800 ml-2">
										{settings.requireApproval ? "Yes" : "No"}
									</span>
								</div>
								<div>
									<span className="font-medium text-blue-900">Tags:</span>
									<span className="text-blue-800 ml-2">
										{settings.tags.join(", ") || "None"}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-y-auto">
			<div className="p-6 border-b border-gray-200">
				<h2 className="text-xl font-semibold text-gray-900">Publish Course</h2>
				<p className="text-gray-600 mt-1">
					Review your course and configure publishing settings.
				</p>
			</div>

			<div className="p-6 space-y-8">
				{/* Validation Status */}
				<div className="bg-gray-50 rounded-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium text-gray-900">
							Course Readiness
						</h3>
						<span className="text-sm font-medium text-gray-600">
							{completionPercentage}% Complete
						</span>
					</div>

					<div className="w-full bg-gray-200 rounded-full h-2 mb-4">
						<div
							className="bg-blue-600 h-2 rounded-full transition-all duration-300"
							style={{ width: `${completionPercentage}%` }}
						/>
					</div>

					<div className="space-y-2">
						{validationChecks.map((check, index) => (
							<div key={index} className="flex items-center space-x-3">
								{check.status ? (
									<CheckCircle className="w-5 h-5 text-green-500" />
								) : (
									<AlertTriangle className="w-5 h-5 text-orange-500" />
								)}
								<span
									className={`text-sm ${check.status ? "text-green-700" : "text-orange-700"}`}
								>
									{check.label}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Publishing Settings */}
				<div className="space-y-6">
					<h3 className="text-lg font-medium text-gray-900">
						Publishing Settings
					</h3>

					{/* Visibility */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-3">
							Course Visibility
						</label>
						<div className="space-y-2">
							<label className="flex items-center">
								<input
									type="radio"
									value="private"
									checked={settings.visibility === "private"}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											visibility: e.target.value as
												| "private"
												| "public"
												| "cohort",
										}))
									}
									className="text-blue-600 focus:ring-blue-500"
								/>
								<div className="ml-3">
									<div className="flex items-center">
										<Lock className="w-4 h-4 text-gray-400 mr-2" />
										<span className="text-sm font-medium text-gray-900">
											Private
										</span>
									</div>
									<p className="text-sm text-gray-600">
										Only you can see this course
									</p>
								</div>
							</label>

							<label className="flex items-center">
								<input
									type="radio"
									value="cohort"
									checked={settings.visibility === "cohort"}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											visibility: e.target.value as
												| "private"
												| "public"
												| "cohort",
										}))
									}
									className="text-blue-600 focus:ring-blue-500"
								/>
								<div className="ml-3">
									<div className="flex items-center">
										<Users className="w-4 h-4 text-gray-400 mr-2" />
										<span className="text-sm font-medium text-gray-900">
											Cohort Only
										</span>
									</div>
									<p className="text-sm text-gray-600">
										Visible to your organization/cohort
									</p>
								</div>
							</label>

							<label className="flex items-center">
								<input
									type="radio"
									value="public"
									checked={settings.visibility === "public"}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											visibility: e.target.value as
												| "private"
												| "public"
												| "cohort",
										}))
									}
									className="text-blue-600 focus:ring-blue-500"
								/>
								<div className="ml-3">
									<div className="flex items-center">
										<Globe className="w-4 h-4 text-gray-400 mr-2" />
										<span className="text-sm font-medium text-gray-900">
											Public
										</span>
									</div>
									<p className="text-sm text-gray-600">
										Visible to all educators and learners
									</p>
								</div>
							</label>
						</div>
					</div>

					{/* Enrollment Settings */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={settings.allowEnrollments}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											allowEnrollments: e.target.checked,
										}))
									}
									className="text-blue-600 focus:ring-blue-500 rounded"
								/>
								<span className="ml-2 text-sm font-medium text-gray-900">
									Allow Self-Enrollment
								</span>
							</label>
							<p className="text-sm text-gray-600 mt-1">
								Learners can enroll themselves without approval
							</p>
						</div>

						<div>
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={settings.requireApproval}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											requireApproval: e.target.checked,
										}))
									}
									className="text-blue-600 focus:ring-blue-500 rounded"
								/>
								<span className="ml-2 text-sm font-medium text-gray-900">
									Require Approval
								</span>
							</label>
							<p className="text-sm text-gray-600 mt-1">
								Manual approval needed for enrollments
							</p>
						</div>
					</div>

					{/* Tags */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Course Tags
						</label>
						<div className="flex flex-wrap gap-2 mb-3">
							{settings.tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
								>
									{tag}
									<button
										onClick={() => handleRemoveTag(tag)}
										className="ml-1 text-blue-600 hover:text-blue-800"
									>
										×
									</button>
								</span>
							))}
						</div>
						<div className="flex space-x-2">
							<input
								type="text"
								value={newTag}
								onChange={(e) => setNewTag(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
								placeholder="Add a tag..."
								className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<button
								onClick={handleAddTag}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Add
							</button>
						</div>
					</div>

					{/* Prerequisites */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Prerequisites (Optional)
						</label>
						<div className="flex flex-wrap gap-2 mb-3">
							{settings.prerequisites.map((prereq) => (
								<span
									key={prereq}
									className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-800"
								>
									{prereq}
									<button
										onClick={() => handleRemovePrerequisite(prereq)}
										className="ml-1 text-green-600 hover:text-green-800"
									>
										×
									</button>
								</span>
							))}
						</div>
						<div className="flex space-x-2">
							<input
								type="text"
								value={newPrerequisite}
								onChange={(e) => setNewPrerequisite(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && handleAddPrerequisite()}
								placeholder="e.g., Basic JavaScript knowledge..."
								className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<button
								onClick={handleAddPrerequisite}
								className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
							>
								Add
							</button>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center justify-between pt-6 border-t border-gray-200">
					<button
						onClick={() => setShowPreview(true)}
						className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
					>
						<Eye size={16} />
						<span>Preview Course</span>
					</button>

					<div className="flex items-center space-x-4">
						<button
							onClick={onCancel}
							className="px-4 py-2 text-gray-600 hover:text-gray-800"
						>
							Cancel
						</button>
						<button
							onClick={handlePublish}
							disabled={!isValidForPublishing}
							className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Publish Course
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
