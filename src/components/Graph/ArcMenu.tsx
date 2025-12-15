import { useEffect, useState } from"react";

interface ArcMenuProps {
  position: { x: number; y: number };
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onClose: () => void;
}

export const ArcMenu = ({ position, isSelected, onSelect, onView, onClose }: ArcMenuProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for animation
  };

  return (
    <>
      {/* Click outside handler (overlay) */}
      <div 
        className="absolute inset-0 pointer-events-auto z-40" 
        onClick={handleClose}
      />
      <div
        className="absolute z-50 pointer-events-none"
        style={{
          left: position.x +"px",
          top: position.y +"px",
          transform:"translate(-50%, -50%)", // Center the container on the node
        }}
      >

      {/* Menu Items Container */}
      <div className={`relative transition-all duration-300 ease-out ${isVisible ?"opacity-100 scale-100" :"opacity-0 scale-50"}`}>
        
        {/* View Button (Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="absolute pointer-events-auto group flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg hover:bg-blue-50 hover:border-blue-200 hover:scale-110 transition-all"
          style={{
            left:"50px",
            top:"50%",
            transform:"translateY(-50%)",
          }}
          title="View Details"
        >
          <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {/* Label */}
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            View
          </span>
        </button>

        {/* Select/Deselect Button (Left) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`absolute pointer-events-auto group flex items-center justify-center w-10 h-10 rounded-full bg-white border shadow-lg hover:scale-110 transition-all ${
            isSelected 
              ?"border-red-200 hover:bg-red-50 hover:border-red-300" 
              :"border-gray-200 hover:bg-green-50 hover:border-green-200"
          }`}
          style={{
            right:"50px",
            top:"50%",
            transform:"translateY(-50%)",
          }}
          title={isSelected ?"Deselect Node" :"Select Node"}
        >
          {isSelected ? (
            // X icon for Deselect
            <svg className="w-5 h-5 text-gray-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Check icon for Select
            <svg className="w-5 h-5 text-gray-600 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {/* Label */}
          <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isSelected ?"Deselect" :"Select"}
          </span>
        </button>

        {/* Decorative Arc Line (Optional) */}
        {/* <svg className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none opacity-20" viewBox="0 0 100 100">
          <path d="M 20 50 A 30 30 0 0 1 80 50" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg> */}
      </div>
    </div>
    </>
  );
};
