import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';

interface TimePickerProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value = '00:00:00', onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial value
    const parseTime = (val: string) => {
        const parts = val.split(':');
        return {
            h: parseInt(parts[0] || '0', 10),
            m: parseInt(parts[1] || '0', 10),
            s: parseInt(parts[2] || '0', 10)
        };
    };

    const [time, setTime] = useState(parseTime(value));

    useEffect(() => {
        setTime(parseTime(value));
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateTime = (type: 'h' | 'm' | 's', val: number) => {
        let newTime = { ...time };
        if (type === 'h') newTime.h = Math.max(0, Math.min(23, val));
        if (type === 'm') newTime.m = Math.max(0, Math.min(59, val));
        if (type === 's') newTime.s = Math.max(0, Math.min(59, val));
        
        setTime(newTime);
        const format = (n: number) => n.toString().padStart(2, '0');
        onChange(`${format(newTime.h)}:${format(newTime.m)}:${format(newTime.s)}`);
    };

    const increment = (type: 'h' | 'm' | 's') => {
        const max = type === 'h' ? 23 : 59;
        const current = time[type];
        updateTime(type, current >= max ? 0 : current + 1);
    };

    const decrement = (type: 'h' | 'm' | 's') => {
        const max = type === 'h' ? 23 : 59;
        const current = time[type];
        updateTime(type, current <= 0 ? max : current - 1);
    };

    const formatDisplay = (n: number) => n.toString().padStart(2, '0');

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">{label}</label>}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 pl-10 text-sm bg-gray-50 border border-gray-100 rounded-xl cursor-pointer flex items-center transition-all duration-200 ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500 bg-white' : 'hover:bg-gray-100'}`}
            >
                <div className="absolute left-3 text-gray-400">
                    <Clock className="w-4 h-4" />
                </div>
                <span className="text-gray-900 font-medium font-mono">
                    {formatDisplay(time.h)} : {formatDisplay(time.m)} : {formatDisplay(time.s)}
                </span>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center gap-2">
                        {/* Hours */}
                        <div className="flex flex-col items-center gap-1">
                            <button onClick={() => increment('h')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-colors">
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <input 
                                type="number" 
                                value={formatDisplay(time.h)}
                                onChange={(e) => updateTime('h', parseInt(e.target.value) || 0)}
                                className="w-12 text-center font-mono text-lg font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                            />
                            <span className="text-[10px] text-gray-400 font-medium uppercase">Hrs</span>
                            <button onClick={() => decrement('h')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-colors">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        <span className="text-gray-300 text-xl font-light mb-4">:</span>

                        {/* Minutes */}
                        <div className="flex flex-col items-center gap-1">
                            <button onClick={() => increment('m')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-colors">
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <input 
                                type="number" 
                                value={formatDisplay(time.m)}
                                onChange={(e) => updateTime('m', parseInt(e.target.value) || 0)}
                                className="w-12 text-center font-mono text-lg font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                            />
                            <span className="text-[10px] text-gray-400 font-medium uppercase">Min</span>
                            <button onClick={() => decrement('m')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-colors">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        <span className="text-gray-300 text-xl font-light mb-4">:</span>

                        {/* Seconds */}
                        <div className="flex flex-col items-center gap-1">
                            <button onClick={() => increment('s')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-colors">
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <input 
                                type="number" 
                                value={formatDisplay(time.s)}
                                onChange={(e) => updateTime('s', parseInt(e.target.value) || 0)}
                                className="w-12 text-center font-mono text-lg font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                            />
                            <span className="text-[10px] text-gray-400 font-medium uppercase">Sec</span>
                            <button onClick={() => decrement('s')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-colors">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
