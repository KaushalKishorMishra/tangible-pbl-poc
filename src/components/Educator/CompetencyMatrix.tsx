import React from "react";
import { useGraphStore } from "../../store/graphStore";
import {
	CheckCircle,
	BookOpen,
	Award,
	Zap,
	Sparkles,
	Target,
} from "lucide-react";

export const CompetencyMatrix: React.FC = () => {
	const { competencyFramework } = useGraphStore();

	if (!competencyFramework || competencyFramework.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-slate-400">
				<div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
					<Target className="w-10 h-10 opacity-20" />
				</div>
				<p className="text-lg font-black tracking-tight text-slate-900 mb-2">
					No Framework Generated
				</p>
				<p className="text-sm font-medium opacity-60">
					Complete the course design to see the competency matrix.
				</p>
			</div>
		);
	}

	const getLevelIcon = (level: string) => {
		switch (level) {
			case "Awareness":
				return <BookOpen className="w-4 h-4 text-blue-500" />;
			case "Application":
				return <CheckCircle className="w-4 h-4 text-emerald-500" />;
			case "Mastery":
				return <Award className="w-4 h-4 text-violet-500" />;
			case "Influence":
				return <Zap className="w-4 h-4 text-amber-500" />;
			default:
				return <BookOpen className="w-4 h-4" />;
		}
	};

	return (
		<div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-10 overflow-y-auto animate-in fade-in duration-500">
			<div className="max-w-6xl mx-auto">
				<div className="mb-12">
					<div className="flex items-center gap-3 mb-3">
						<div className="p-1.5 bg-indigo-600/10 rounded-lg">
							<Sparkles className="w-4 h-4 text-indigo-600" />
						</div>
						<span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">
							Evaluation Framework
						</span>
					</div>
					<h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
						Competency Matrix
					</h2>
					<p className="text-slate-500 mt-2 text-lg font-medium opacity-80">
						Skills, levels, rubrics, and proof of work for this challenge.
					</p>
				</div>

				<div className="space-y-12">
					{competencyFramework.map((skillItem, index) => (
						<div
							key={index}
							className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white/40 overflow-hidden shadow-2xl shadow-slate-200/50"
						>
							<div className="bg-white/40 px-10 py-6 border-b border-slate-100">
								<h3 className="text-xl font-black text-slate-900 tracking-tight">
									{skillItem.skill}
								</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
								{skillItem.levels.map((levelData, lIndex) => (
									<div
										key={lIndex}
										className="p-8 flex flex-col h-full hover:bg-white transition-all duration-300 group"
									>
										<div className="flex items-center gap-3 mb-6">
											<div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
												{getLevelIcon(levelData.level)}
											</div>
											<span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-600 transition-colors">
												{levelData.level}
											</span>
										</div>

										<div className="mb-8 flex-grow">
											<p className="text-slate-900 font-black text-sm mb-3 leading-tight">
												{levelData.description}
											</p>
											<p className="text-xs text-slate-500 font-medium italic opacity-70 leading-relaxed">
												{levelData.rubric}
											</p>
										</div>

										<div className="mt-auto pt-6 border-t border-slate-100">
											<span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-3">
												PROOF OF WORK
											</span>
											<div className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl inline-block border border-indigo-100/50">
												{levelData.proofOfWork}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
