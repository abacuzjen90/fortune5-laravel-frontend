import { useState, useEffect } from "react";

const useScreenSize = (width = 768) => {
  const [matches, setMatches] = useState(window.innerWidth >= width);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${width}px)`);
    
    const handleResize = () => setMatches(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, [width]);

  return matches;
};

export default useScreenSize;
