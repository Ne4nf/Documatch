import { useEffect, useState } from 'react';

type WindowSize = {
  height: number | undefined;
  width: number | undefined;
};

export default function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    height: undefined,
    width: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        height: document.documentElement.clientHeight,
        width: document.documentElement.clientWidth,
      });
    }

    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
}
