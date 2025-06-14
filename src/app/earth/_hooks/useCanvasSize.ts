import { useEffect, useState } from "react";

const useCanvasSize = () => {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });

  useEffect(() => {
    const updateCanvasSize = () => {
      const size = Math.min(window.innerWidth, window.innerHeight - 56);
      setCanvasSize({ width: size, height: size });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  return canvasSize;
};

export default useCanvasSize;
