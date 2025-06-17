// useCameraControls.ts
import { useState, useEffect } from 'react';

export const useCameraControls = () => {
  const [zoomDelta, setZoomDelta] = useState(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomDelta(e.deltaY > 0 ? -1 : 1);

      // Сброс значения после обработки
      setTimeout(() => setZoomDelta(0), 100);
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  return zoomDelta;
};

// Затем используйте zoomDelta для управления камерой
