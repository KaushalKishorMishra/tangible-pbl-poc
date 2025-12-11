import { type FC, type ReactNode } from "react";

type Position =
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right"
	| "top-center"
	| "bottom-center"
	| "left-center"
	| "right-center";

const positionClasses: Record<Position, string> = {
	"top-left": "top-4 left-4",
	"top-right": "top-4 right-4",
	"bottom-left": "bottom-4 left-4",
	"bottom-right": "bottom-4 right-4",
	"top-center": "top-4 left-1/2 -translate-x-1/2",
	"bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
	"left-center": "left-4 top-1/2 -translate-y-1/2",
	"right-center": "right-4 top-1/2 -translate-y-1/2",
};

const ControlsPosition: FC<{ children?: ReactNode; position: Position }> = ({
	children,
	position,
}) => {
	return (
		<div
			className={`absolute ${positionClasses[position]} flex flex-col gap-4 pointer-events-auto`}
		>
			{children}
		</div>
	);
};

export default ControlsPosition;
