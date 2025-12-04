import { useCamera, useSigma } from "@react-sigma/core";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import { useLayoutRandom } from "@react-sigma/layout-random";
import { animateNodes } from "sigma/utils";
import { useState, useEffect, useRef } from "react";

export const GraphControls = () => {
    const sigma = useSigma();
    const { zoomIn, zoomOut, reset } = useCamera();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLayoutOpen, setIsLayoutOpen] = useState(false);
    const layoutRef = useRef<HTMLDivElement>(null);

    const { positions: circularPositions } = useLayoutCircular();
    const { positions: randomPositions } = useLayoutRandom();
    const { assign: assignFA2 } = useLayoutForceAtlas2();

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (layoutRef.current && !layoutRef.current.contains(event.target as Node)) {
                setIsLayoutOpen(false);
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("mousedown", handleClickOutside);
        
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleLayout = (type: 'fa2' | 'circular' | 'random') => {
        setIsLayoutOpen(false);
        switch (type) {
            case 'fa2':
                assignFA2();
                break;
            case 'circular':
                animateNodes(sigma.getGraph(), circularPositions(), { duration: 1000 });
                break;
            case 'random':
                animateNodes(sigma.getGraph(), randomPositions(), { duration: 1000 });
                break;
        }
    };

    return (
        <div className="flex flex-row gap-2 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/30 transition-all hover:shadow-2xl relative">
            <button
                onClick={() => zoomIn()}
                className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Zoom In"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
            <button
                onClick={() => zoomOut()}
                className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Zoom Out"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            </button>
            <button
                onClick={() => reset()}
                className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Reset View"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
            
            <div className="h-full w-[1px] bg-gray-200 my-1"></div>

            {/* Layout Dropdown */}
            <div className="relative" ref={layoutRef}>
                <button
                    onClick={() => setIsLayoutOpen(!isLayoutOpen)}
                    className={`p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ${isLayoutOpen ? 'bg-indigo-50 text-indigo-600' : ''}`}
                    title="Layouts"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </button>

                {isLayoutOpen && (
                    <div className="absolute bottom-full right-0 mr-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-fadeIn">
                        <button
                            onClick={() => handleLayout('fa2')}
                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 text-left flex items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-[#0d99ff]"></div>
                            Force Atlas 2
                        </button>
                        <button
                            onClick={() => handleLayout('circular')}
                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 text-left flex items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Circular
                        </button>
                        <button
                            onClick={() => handleLayout('random')}
                            className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 text-left flex items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            Random
                        </button>
                    </div>
                )}
            </div>


            <button
                onClick={toggleFullScreen}
                className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Toggle Fullscreen"
            >
                {isFullscreen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                )}
            </button>
        </div>
    );
};
