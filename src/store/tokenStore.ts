import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TokenUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    model?: string;
    timestamp: number;
}

interface TokenState {
    totalTokens: number;
    usageHistory: TokenUsage[];
    
    logUsage: (usage: Omit<TokenUsage, 'timestamp'>) => void;
    resetUsage: () => void;
}

export const useTokenStore = create<TokenState>()(
    persist(
        (set) => ({
            totalTokens: 0,
            usageHistory: [],

            logUsage: (usage) => set((state) => {
                const newEntry = { ...usage, timestamp: Date.now() };
                return {
                    totalTokens: state.totalTokens + usage.total_tokens,
                    usageHistory: [newEntry, ...state.usageHistory]
                };
            }),

            resetUsage: () => set({ totalTokens: 0, usageHistory: [] }),
        }),
        {
            name: 'token-storage',
        }
    )
);
