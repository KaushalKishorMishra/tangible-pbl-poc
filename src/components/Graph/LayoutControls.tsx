import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import { useLayoutRandom } from "@react-sigma/layout-random";
import { useSigma } from "@react-sigma/core";
import { animateNodes } from "sigma/utils";

export const LayoutControls = () => {
    const sigma = useSigma();
    const { positions: circularPositions } = useLayoutCircular();
    const { positions: randomPositions } = useLayoutRandom();
    const { assign: assignFA2 } = useLayoutForceAtlas2();

    const handleCircular = () => {
        animateNodes(sigma.getGraph(), circularPositions(), { duration: 1000 });
    };

    const handleRandom = () => {
        animateNodes(sigma.getGraph(), randomPositions(), { duration: 1000 });
    };

    const handleForceAtlas2 = () => {
        assignFA2();
    };

    return (
        <div className="flex flex-col gap-2 p-2 bg-white rounded shadow-md border border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase px-1">Layouts</span>
            <button
                onClick={handleForceAtlas2}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors text-left"
            >
                Force Atlas 2
            </button>
            <button
                onClick={handleCircular}
                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors text-left"
            >
                Circular
            </button>
            <button
                onClick={handleRandom}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors text-left"
            >
                Random
            </button>
        </div>
    );
};
