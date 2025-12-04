import { type FC, type ReactNode } from "react"

const ControlPosition: FC<{ children: ReactNode, position: "top-left" | "bottom-left" | "bottom-right" }> = ({ children, position }) => {
    return (
        <div className={`absolute ${position} flex flex-col gap-4 pointer-events-auto`}>
            {children}
        </div>
    )
}

export default ControlPosition