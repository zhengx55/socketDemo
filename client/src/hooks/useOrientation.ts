import { useEffect, useState } from "react";

// Hook
function useOrientation(): string | undefined {
  // Initialize state with undefined width/height so server and client renders match
  const [orientation, setOrientation] = useState<string | undefined>(undefined);
  useEffect(() => {
    function handleResize(): void {
      if (window.innerHeight < window.innerWidth) {
        setOrientation("landscape");
      } else {
        setOrientation("portials");
      }
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []); // Empty array ensures that effect is only run on mount
  return orientation;
}

export default useOrientation;
