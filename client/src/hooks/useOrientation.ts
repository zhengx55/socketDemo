import { useEffect, useState } from "react";

// Hook
function useOrientation(): (string | undefined)[] {
  // Initialize state with undefined width/height so server and client renders match
  const [orientation, setOrientation] = useState<string | undefined>(undefined);
  useEffect(() => {
    function handleResize(): void {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      if (window.innerWidth > window.innerHeight) {
        setOrientation("landscape");
      } else {
        setOrientation("portrait");
      }
    }
    handleResize();
    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty array ensures that effect is only run on mount
  return [orientation];
}

export default useOrientation;
