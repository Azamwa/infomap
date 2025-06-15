import { useEffect, useState } from "react";

const useCanvasSize = () => {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });

  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight - 56 });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  return canvasSize;
};

export default useCanvasSize;
