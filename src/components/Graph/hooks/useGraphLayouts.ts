import { useSigma } from "@react-sigma/core";
// import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
// import { useLayoutCircular } from "@react-sigma/layout-circular";
// import { useLayoutRandom } from "@react-sigma/layout-random";
// import { animateNodes } from "sigma/utils";
// import { applyLinearLayout } from "../utils/linearLayout";
import { applyTreeLayout } from "../utils/treeLayout";

export type LayoutType = /* 'fa2' | 'circular' | 'random' | 'linear' | */ 'tree';

export const useGraphLayouts = () => {
	const sigma = useSigma();
	/*
	const { positions: circularPositions } = useLayoutCircular();
	const { positions: randomPositions } = useLayoutRandom();
	const { assign: assignFA2 } = useLayoutForceAtlas2({
		iterations: 100,
		settings: { 
			adjustSizes: true, 
			gravity: 1, 
			scalingRatio: 2, 
			slowDown: 10 
		}
	});
	*/

	const handleLayout = (type: LayoutType) => {
		switch (type) {
			/*
			case 'fa2':
				assignFA2();
				break;
			case 'circular':
				animateNodes(sigma.getGraph(), circularPositions(), { duration: 1000 });
				break;
			case 'random':
				animateNodes(sigma.getGraph(), randomPositions(), { duration: 1000 });
				break;
			case 'linear':
				applyLinearLayout(sigma.getGraph());
				break;
			*/
			case 'tree':
				applyTreeLayout(sigma.getGraph());
				break;
		}
	};

	return { handleLayout };
};
