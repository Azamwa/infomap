import { useCallback, useEffect, useState } from "react";
import { geoOrthographic, geoPath, json, geoContains } from "d3";
import { feature } from "topojson-client";

// 지구 렌더링 훅
interface UseEarthRenderer {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasSize: { width: number; height: number };
}

const useEarthRenderer = ({ canvasRef, canvasSize }: UseEarthRenderer) => {
  const [rotation, setRotation] = useState<[number, number]>([0, -15]); // [경도, 위도]
  const [scale, setScale] = useState(canvasSize.width / 2.2);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const [countries, setCountries] = useState<any[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<any | null>(null);

  const draw = useCallback(
    (context: CanvasRenderingContext2D, countries: any[], projection: any, hoveredCountry: any) => {
      if (!countries.length) {
        return;
      }

      context.clearRect(0, 0, canvasSize.width, canvasSize.height);

      // 바다 색칠
      const [cx, cy] = projection.translate();
      const radius = projection.scale();

      const oceanGradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
      oceanGradient.addColorStop(0, "#19447e");
      oceanGradient.addColorStop(0.6, "#153867");
      oceanGradient.addColorStop(1, "#102b50");

      context.beginPath();
      context.arc(cx, cy, radius, 0, 2 * Math.PI);
      context.fillStyle = oceanGradient;
      context.fill();

      // 육지 색칠
      const landGradient = context.createLinearGradient(0, cy - radius, 0, cy + radius);
      landGradient.addColorStop(0, "#249534");
      landGradient.addColorStop(0.3, "#0f6c1c");
      landGradient.addColorStop(0.7, "#075211");
      landGradient.addColorStop(1, "#04370b");

      const path = geoPath(projection, context);

      for (let country of countries) {
        context.beginPath();
        path(country);
        context.fillStyle = landGradient;
        context.fill();

        // 윤곽선
        context.strokeStyle = "#555555";
        context.lineWidth = 0.5;
        context.stroke();
      }

      if (hoveredCountry) {
        context.beginPath();
        path(hoveredCountry);
        context.fillStyle = "#f0751f ";
        context.fill();
        context.strokeStyle = "#777777";
        context.lineWidth = 0.8;
        context.stroke();
      }
    },
    [canvasSize, countries, hoveredCountry],
  );

  const getCountryAtPoint = useCallback(
    (mouseX: number, mouseY: number, projection: any, context: CanvasRenderingContext2D) => {
      if (!countries.length) {
        return null;
      }

      const tolerance = 3;

      for (let dx = -tolerance; dx <= tolerance; dx++) {
        for (let dy = -tolerance; dy <= tolerance; dy++) {
          const checkX = mouseX + dx;
          const checkY = mouseY + dy;

          if (
            checkX < 0 ||
            checkY < 0 ||
            checkX >= canvasSize.width ||
            checkY >= canvasSize.height
          ) {
            continue;
          }

          const coords = projection.invert([checkX, checkY]);
          if (!coords) {
            continue;
          }

          const distance = projection([coords[0], coords[1]]);
          if (!distance) {
            continue;
          }

          for (const country of countries) {
            if (geoContains(country, coords)) {
              return country;
            }
          }
        }
      }

      return null;
    },
    [countries, canvasSize],
  );
  useEffect(() => {
    json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(
      (worldData: any) => {
        const landFeature: any = feature(worldData, worldData.objects.countries);

        const countryFeatures = landFeature.features;
        setCountries(countryFeatures);
      },
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || canvasSize.width === 0) {
      return;
    }

    const projection = geoOrthographic()
      .scale(scale)
      .translate([canvasSize.width / 2, canvasSize.height / 2])
      .clipAngle(90);

    // 회전 업데이트
    projection.rotate(rotation);

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      canvas!.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        const rect = canvas!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const country = getCountryAtPoint(mouseX, mouseY, projection, context);
        setHoveredCountry(country);

        canvas!.style.cursor = country ? "pointer" : "grab";
        return;
      }

      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      // 회전 감도 조정
      const sensitivity = 0.2;
      const newRotation: [number, number] = [
        rotation[0] + deltaX * sensitivity, // 경도 (좌우)
        Math.max(-90, Math.min(90, rotation[1] - deltaY * sensitivity)), // 위도 (상하, 제한)
      ];

      setRotation(newRotation);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      canvas!.style.cursor = "grab";
    };

    // 줌 기능
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newScale = Math.max(
        50,
        Math.min(canvasSize.width * 2, scale + (e.deltaY > 0 ? -60 : 60)),
      );
      setScale(newScale);
    };

    // 이벤트 리스너 등록
    if (canvas) {
      canvas.style.cursor = "grab";
      canvas.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [canvasSize, rotation, scale, isDragging, lastMousePos, getCountryAtPoint]);

  // 회전 업데이트 시 다시 그리기
  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!countries.length || !context || canvasSize.width === 0) {
      return;
    }

    const projection = geoOrthographic()
      .scale(scale)
      .translate([canvasSize.width / 2, canvasSize.height / 2])
      .clipAngle(90)
      .rotate(rotation);

    draw(context, countries, projection, hoveredCountry);
  }, [rotation, canvasSize, scale, countries, hoveredCountry, draw]);
};

export default useEarthRenderer;
