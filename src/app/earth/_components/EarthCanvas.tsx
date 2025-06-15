"use client";
import React, { useRef } from "react";

import useCanvasSize from "../_hooks/useCanvasSize";
import useEarthRenderer from "../_hooks/useEarthRender";

const EarthCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasSize = useCanvasSize();

  useEarthRenderer({ canvasRef, canvasSize });

  return (
    <div
      className="h-full flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url(https://info-world-map.s3.ap-northeast-2.amazonaws.com/universe.webp)",
      }}
    >
      <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} />
    </div>
  );
};

export default EarthCanvas;
