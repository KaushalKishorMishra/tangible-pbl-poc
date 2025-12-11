import React from "react";
import { GraduationCap, Users, Shield } from "lucide-react";
import { useGraphStore } from "../store/graphStore";
import type { UserRole } from "../store/graphStore";

interface RoleCardProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	features: string[];
	isSelected: boolean;
	onSelect: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
	title,
	description,
	icon,
	features,
	isSelected,
	onSelect,
}) => (
	<div
		onClick={onSelect}
		className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
			isSelected
				? "border-blue-500 bg-blue-50 shadow-md"
				: "border-gray-200 hover:border-gray-300 hover:shadow-sm"
		}`}
	>
		<div className="flex items-start space-x-4">
			<div
				className={`p-3 rounded-lg ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}
			>
				{icon}
			</div>
			<div className="flex-1">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
				<p className="text-gray-600 mb-4">{description}</p>
				<ul className="space-y-1">
					{features.map((feature, index) => (
						<li key={index} className="text-sm text-gray-600 flex items-center">
							<div
								className={`w-1.5 h-1.5 rounded-full mr-2 ${
									isSelected ? "bg-blue-500" : "bg-gray-400"
								}`}
							/>
							{feature}
						</li>
					))}
				</ul>
			</div>
		</div>
	</div>
);

export const RoleSelection: React.FC = () => {
	const { user, setUserRole } = useGraphStore();

	const handleRoleSelect = (role: UserRole) => {
		if (role) {
			setUserRole(role);
		}
	};

	const roles = [
		{
			role: "educator" as UserRole,
			title: "Educator",
			description:
				"Design and deliver skill-mapped courses with project-based learning",
			icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
			features: [
				"Create skill-aligned learning outcomes",
				"Design PBL simulations and modules",
				"Track learner progress on skill maps",
				"Analyze cohort performance and gaps",
			],
		},
		{
			role: "learner" as UserRole,
			title: "Learner",
			description:
				"Develop skills through interactive courses and real-world projects",
			icon: <Users className="w-6 h-6 text-green-600" />,
			features: [
				"Explore personalized skill development paths",
				"Complete project-based assignments",
				"Track your progress on skill maps",
				"Receive AI-powered feedback and guidance",
			],
		},
		{
			role: "admin" as UserRole,
			title: "Administrator",
			description:
				"Manage the platform, oversee courses, and maintain the skill ontology",
			icon: <Shield className="w-6 h-6 text-purple-600" />,
			features: [
				"Manage users and permissions",
				"Oversee course catalog and quality",
				"Maintain and update skill ontology",
				"Access platform analytics and insights",
			],
		},
	];

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="max-w-4xl w-full">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Welcome to Tangible PBL
					</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Choose your role to get started with skill-mapped, project-based
						learning. Each role provides tailored tools and experiences for your
						journey.
					</p>
				</div>

				<div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
					{roles.map((role) => (
						<RoleCard
							key={role.role}
							title={role.title}
							description={role.description}
							icon={role.icon}
							features={role.features}
							isSelected={user.role === role.role}
							onSelect={() => handleRoleSelect(role.role)}
						/>
					))}
				</div>

				<div className="text-center mt-8">
					<p className="text-sm text-gray-500">
						Don't worry, you can change your role later in your profile
						settings.
					</p>
				</div>
			</div>
		</div>
	);
};
