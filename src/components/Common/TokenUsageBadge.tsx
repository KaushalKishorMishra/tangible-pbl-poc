import React from 'react';
import { Coins } from 'lucide-react';
import { useTokenStore } from '../../store/tokenStore';

export const TokenUsageBadge: React.FC = () => {
    const { totalTokens } = useTokenStore();

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200 shadow-sm">
            <Coins className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-gray-700">
                {totalTokens.toLocaleString()} Tokens
            </span>
        </div>
    );
};
