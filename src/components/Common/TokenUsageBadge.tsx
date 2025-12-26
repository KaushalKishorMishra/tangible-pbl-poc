import React, { useState } from 'react';
import { Coins, Info, ArrowUpRight, ArrowDownLeft, Clock, Zap } from 'lucide-react';
import { useTokenStore } from '../../store/tokenStore';
import type { TokenUsage } from '../../store/tokenStore';

// OpenAI Pricing (per 1M tokens)
const PRICING = {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'default': { input: 0.15, output: 0.60 } // Fallback to mini pricing
};

const calculateCost = (usage: TokenUsage) => {
    const model = (usage.model || 'gpt-4o-mini') as keyof typeof PRICING;
    const rates = PRICING[model] || PRICING.default;
    const inputCost = (usage.prompt_tokens / 1_000_000) * rates.input;
    const outputCost = (usage.completion_tokens / 1_000_000) * rates.output;
    return {
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost
    };
};

export const TokenUsageBadge: React.FC = () => {
    const { totalTokens, usageHistory } = useTokenStore();
    const [showDetails, setShowDetails] = useState(false);

    // Calculate aggregate stats
    const stats = usageHistory.reduce((acc, usage) => {
        const { inputCost, outputCost, totalCost } = calculateCost(usage);
        acc.inputTokens += usage.prompt_tokens;
        acc.outputTokens += usage.completion_tokens;
        acc.totalCost += totalCost;
        acc.inputCost += inputCost;
        acc.outputCost += outputCost;
        return acc;
    }, { inputTokens: 0, outputTokens: 0, totalCost: 0, inputCost: 0, outputCost: 0 });

    return (
        <div 
            className="relative"
            onMouseEnter={() => setShowDetails(true)}
            onMouseLeave={() => setShowDetails(false)}
        >
            <div 
                className="flex items-center gap-3 px-4 py-2 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all cursor-help group"
            >
                <div className="p-1.5 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors shadow-sm">
                    <Coins className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex flex-col leading-tight">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">AI Credits</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                            ${stats.totalCost.toFixed(3)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                            {totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens}
                        </span>
                    </div>
                </div>
                <Info className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors ml-1" />
            </div>

            {/* Detailed Popover */}
            {showDetails && (
                <div className="absolute top-full right-0 pt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-80 bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/40 overflow-hidden ring-1 ring-black/5">
                        {/* Header */}
                        <div className="bg-linear-to-br from-indigo-600 to-violet-700 p-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-[10px] font-black opacity-70 uppercase tracking-[0.3em]">AI Synthesis Cost</h3>
                                    <Zap className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                                </div>
                                <div className="text-4xl font-black tracking-tighter mb-1">
                                    ${stats.totalCost.toFixed(4)}
                                </div>
                                <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Total Accrued Usage</p>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* Breakdown */}
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-white transition-colors">
                                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                        <ArrowDownLeft className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Input</span>
                                    </div>
                                    <div className="text-lg font-black text-slate-900 leading-none mb-1">{stats.inputTokens.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400 font-bold">${stats.inputCost.toFixed(4)}</div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-white transition-colors">
                                    <div className="flex items-center gap-2 text-violet-600 mb-2">
                                        <ArrowUpRight className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Output</span>
                                    </div>
                                    <div className="text-lg font-black text-slate-900 leading-none mb-1">{stats.outputTokens.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400 font-bold">${stats.outputCost.toFixed(4)}</div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Requests</h4>
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {usageHistory.slice(0, 5).map((usage, i) => {
                                        const { totalCost } = calculateCost(usage);
                                        return (
                                            <div key={i} className="flex items-center justify-between p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm group/row">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-700 truncate max-w-[120px] uppercase tracking-wider">
                                                        {usage.model?.split('-').slice(0, 2).join(' ') || 'GPT 4o Mini'}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-bold">
                                                        {new Date(usage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black text-slate-900">
                                                        {usage.total_tokens.toLocaleString()}
                                                    </div>
                                                    <div className="text-[9px] text-emerald-600 font-black">
                                                        +${totalCost.toFixed(5)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {usageHistory.length === 0 && (
                                        <div className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic opacity-50">
                                            No requests logged
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">OpenAI Standard Rates</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Live Sync</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

