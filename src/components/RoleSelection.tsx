import React from"react";
import { GraduationCap, Users, Shield, ArrowRight, CheckCircle2 } from"lucide-react";
import { useGraphStore } from"../store/graphStore";
import type { UserRole } from"../store/graphStore";

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
		className={`group relative cursor-pointer rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
			isSelected
				?"border-blue-500 bg-white/10 shadow-blue-500/20 ring-2 ring-blue-500/50"
				:"border-gray-200 bg-white hover:border-blue-300"
		}`}
	>
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between mb-6">
				<div
					className={`p-4 rounded-2xl transition-colors duration-300 ${
						isSelected 
              ?"bg-blue-500 text-white" 
              :"bg-blue-50 text-blue-600 group-hover:bg-blue-100"
					}`}
				>
					{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className:"w-8 h-8" })}
				</div>
        {isSelected && (
          <div className="absolute top-6 right-6">
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
          </div>
        )}
			</div>
			
			<h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
			<p className="text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>
			
      <div className="mt-auto">
        <div className="h-px w-full bg-gray-100 mb-6" />
				<ul className="space-y-3">
					{features.map((feature, index) => (
						<li key={index} className="text-sm text-gray-600 flex items-start">
							<div className="mt-1.5 mr-3 min-w-1.5 h-1.5 rounded-full bg-blue-400" />
							<span className="leading-tight">{feature}</span>
						</li>
					))}
				</ul>
        
        <div className={`mt-8 flex items-center text-sm font-semibold transition-all duration-300 ${
          isSelected ?"text-blue-600 translate-x-2" :"text-gray-400 group-hover:text-blue-500"
        }`}>
          Select Role <ArrowRight className="ml-2 w-4 h-4" />
        </div>
      </div>
		</div>
	</div>
);

export const RoleSelection: React.FC = () => {
	const { setUserRole } = useGraphStore();

	const handleRoleSelect = (role: UserRole) => {
		if (role) {
			setUserRole(role);
		}
	};

	const roles = [
		{
			role:"educator" as UserRole,
			title:"Educator",
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
			role:"learner" as UserRole,
			title:"Learner",
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
			role:"admin" as UserRole,
			title:"Administrator",
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
		<div className="min-h-screen w-full bg-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-teal-400/20 blur-3xl animate-pulse delay-2000" />
      </div>

			<div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex flex-col justify-center">
				<div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold tracking-wide uppercase">
            Welcome to Tangible PBL
          </div>
					<h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
						Choose Your <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Journey</span>
					</h1>
					<p className="text-xl text-gray-600 leading-relaxed">
						Select your role to access tailored tools and features designed to enhance your project-based learning experience.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
					{roles.map((role) => (
						<RoleCard
							key={role.role}
							{...role}
							isSelected={false} // Removed selection state for direct action
							onSelect={() => handleRoleSelect(role.role)}
						/>
					))}
				</div>
        
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Tangible PBL. All rights reserved.
          </p>
        </div>
			</div>
		</div>
	);
};
