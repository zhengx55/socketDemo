import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

// Hook
function useOrientation(): (string | undefined)[] {
  // Initialize state with undefined width/height so server and client renders match
  const [orientation, setOrientation] = useState<string | undefined>(undefined);
  // const [device, setDevice] = useState<string | undefined>(undefined);
  useEffect(() => {
    function handleResize(): void {
      // if (
      //   /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
      //     ua
      //   )
      // ) {
      //   setDevice("mobile");
      // } else {
      //   setDevice("desktop");
      // }
      if (window.screen.orientation.angle === 90) {
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
