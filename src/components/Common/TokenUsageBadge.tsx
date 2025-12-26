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
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-help group"
            >
                <div className="p-1 bg-yellow-50 rounded-full group-hover:bg-yellow-100 transition-colors">
                    <Coins className="w-3.5 h-3.5 text-yellow-600" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Usage</span>
                    <span className="text-xs font-bold text-gray-700">
                        ${stats.totalCost.toFixed(4)}
                    </span>
                </div>
                <div className="h-4 w-px bg-gray-200 mx-1" />
                <span className="text-xs font-medium text-gray-500">
                    {totalTokens.toLocaleString()}
                </span>
                <Info className="w-3 h-3 text-gray-300 group-hover:text-blue-400 transition-colors" />
            </div>

            {/* Detailed Popover */}
            {showDetails && (
                <div className="absolute top-full right-0 pt-2 z-50">
                    <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-bold opacity-90 uppercase tracking-widest">Token Economics</h3>
                                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                            </div>
                            <div className="text-3xl font-black tracking-tight">
                                ${stats.totalCost.toFixed(4)}
                            </div>
                            <p className="text-[10px] opacity-70 mt-1 font-medium">ESTIMATED ACCRUED COST</p>
                        </div>

                        {/* Breakdown */}
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                                        <ArrowDownLeft className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Input</span>
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">{stats.inputTokens.toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-500 font-medium">${stats.inputCost.toFixed(4)}</div>
                                </div>
                                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Output</span>
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">{stats.outputTokens.toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-500 font-medium">${stats.outputCost.toFixed(4)}</div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Requests</h4>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {usageHistory.slice(0, 5).map((usage, i) => {
                                        const { totalCost } = calculateCost(usage);
                                        return (
                                            <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-700 truncate max-w-[120px]">
                                                        {usage.model?.split('-').slice(0, 2).join(' ') || 'GPT 4o Mini'}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400">
                                                        {new Date(usage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-bold text-gray-800">
                                                        {usage.total_tokens.toLocaleString()} tkn
                                                    </div>
                                                    <div className="text-[9px] text-green-600 font-medium">
                                                        +${totalCost.toFixed(5)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {usageHistory.length === 0 && (
                                        <div className="text-center py-4 text-gray-400 text-[10px] font-medium italic">
                                            No requests logged yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-[9px] text-gray-400 font-medium italic">Pricing based on OpenAI standard rates</span>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Live Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
