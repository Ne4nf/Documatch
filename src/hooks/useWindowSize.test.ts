import { fireEvent, renderHook } from '@testing-library/react';

import useWindowSize from './useWindowSize';

function setWindowSize({ height, width }: { height: number; width: number }) {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: width,
    writable: true,
  });

  Object.defineProperty(document.documentElement, 'clientHeight', {
    configurable: true,
    value: height,
    writable: true,
  });
}

describe('useWindowSize', () => {
  it('returns the values for width and height after setting on the window object', () => {
    setWindowSize({ height: 500, width: 1000 });

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(1000);
    expect(result.current.height).toBe(500);
  });

  it('returns the values for width and height after setting and resetting on the window object', () => {
    setWindowSize({ height: 500, width: 1000 });

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(1000);
    expect(result.current.height).toBe(500);

    setWindowSize({ height: 567, width: 1234 });
    fireEvent(window, new Event('resize'));

    expect(result.current.width).toBe(1234);
    expect(result.current.height).toBe(567);
  });

  it('returns the values for width and height after setting but not resetting on the window object when unmounted', () => {
    setWindowSize({ height: 500, width: 1000 });

    const { result, unmount } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(1000);
    expect(result.current.height).toBe(500);

    unmount();

    setWindowSize({ height: 567, width: 1234 });
    fireEvent(window, new Event('resize'));

    expect(result.current.width).toBe(1000);
    expect(result.current.height).toBe(500);
  });
});
