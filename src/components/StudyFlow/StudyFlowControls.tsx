import { useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { Maximize, Minimize, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

export const StudyFlowControls = () => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
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

    return (
        <div className="flex flex-row gap-2 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/30 transition-all hover:shadow-2xl">
            <button
                onClick={() => zoomIn()}
                className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Zoom In"
            >
                <ZoomIn className="w-5 h-5" />
            </button>
            <button
                onClick={() => zoomOut()}
                className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Zoom Out"
            >
                <ZoomOut className="w-5 h-5" />
            </button>
            <button
                onClick={() => fitView()}
                className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Fit View"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
            
            <div className="h-full w-px bg-gray-200 my-1"></div>

            <button
                onClick={toggleFullScreen}
                className="p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Toggle Fullscreen"
            >
                {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                ) : (
                    <Maximize className="w-5 h-5" />
                )}
            </button>
        </div>
    );
};
