'use client';

import {
  Fullscreen,
  KeyboardArrowDown,
  KeyboardArrowUp,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@mui/icons-material';
import { Box, Button, Stack, styled, Typography } from '@mui/material';
import type Konva from 'konva';
import type { SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Layer, Stage } from 'react-konva';

import type { GroupedThumbnail } from './DocumentViewer';
import { DOCUMENT_BACKGROUND_COLOR } from './DocumentViewer';

const CANVAS_MARGIN_BOTTOM = 20;

interface DocumentPageViewProps {
  currentGroupId: string;
  thumbs: GroupedThumbnail[];
}

export default function DocumentPageView({
  currentGroupId,
  thumbs,
}: DocumentPageViewProps) {
  const viewThumb: GroupedThumbnail | undefined = thumbs.find(
    thumb => thumb.groupId === currentGroupId,
  );

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [controlsPosition, setControlsPosition] = useState({
    left: '50%',
  });
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleZoom = useCallback(
    (newScale: number) => {
      if (!stageRef.current || !containerRef.current || images.length === 0) {
        return;
      }

      const stage = stageRef.current;
      const container = containerRef.current;

      const viewportWidth = container.clientWidth;
      const viewportHeight = container.clientHeight;

      // Calculate viewport centers
      const viewportCenterX = viewportWidth / 2 - position.x;
      const viewportCenterY = viewportHeight / 2 - position.y;

      const scaleFactor = newScale / scale;

      const newX = viewportWidth / 2 - viewportCenterX * scaleFactor;
      const newY = viewportHeight / 2 - viewportCenterY * scaleFactor;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
      stage.position({ x: newX, y: newY });
    },
    [images, scale, position],
  );

  const updateCurrentImageIndex = useCallback(
    (y: number) => {
      if (!containerRef.current) {
        return;
      }

      const viewportTop = -y;
      const viewportBottom = viewportTop + containerRef.current.clientHeight;
      const viewportCenter = (viewportTop + viewportBottom) / 2;

      let accumulatedHeight = 0;
      let newIndex = 0;

      for (let i = 0; i < images.length; i += 1) {
        const pageTop = accumulatedHeight;
        accumulatedHeight += (images[i]?.height ?? 0) * scale;
        const pageBottom = accumulatedHeight;

        if (viewportCenter >= pageTop && viewportCenter < pageBottom) {
          newIndex = i;
          break;
        }
      }

      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    },
    [images, scale, currentImageIndex],
  );

  const handleZoomIn = () => {
    handleZoom(scale * 1.2);
  };

  const handleZoomOut = () => {
    handleZoom(scale / 1.2);
  };

  const handleWheel = useCallback(
    (e: { evt: WheelEvent }) => {
      e.evt.preventDefault();

      if (!containerRef.current) {
        return;
      }

      const totalHeight = images.reduce((sum, img) => sum + img.height * scale, 0);
      const containerHeight = containerRef.current.clientHeight;

      const minY = containerHeight - totalHeight - CANVAS_MARGIN_BOTTOM;
      const maxY = 0;

      const newY = position.y - e.evt.deltaY;

      const clampedY = Math.min(maxY, Math.max(minY, newY));

      setPosition(prev => ({ ...prev, y: clampedY }));
      updateCurrentImageIndex(clampedY);
    },
    [images, position.y, scale, updateCurrentImageIndex],
  );

  const handleFitToWidth = useCallback(() => {
    if (!images.length || !containerRef.current || !stageRef.current) {
      return;
    }

    const stageWidth = containerRef.current.clientWidth;
    const stageHeight = containerRef.current.clientHeight;
    const maxImageWidth = Math.max(...images.map(img => img.width));

    const newScale = stageWidth / maxImageWidth;
    setScale(newScale);

    const totalScaledHeight = images.reduce((sum, img) => sum + img.height * newScale, 0);
    const y = totalScaledHeight < stageHeight ? (stageHeight - totalScaledHeight) / 2 : 0;

    setPosition({ x: 0, y });
    stageRef.current.position({ x: 0, y });
    setCurrentImageIndex(0);
  }, [images]);

  const scrollToImage = useCallback(
    (index: number) => {
      if (!stageRef.current || images.length === 0 || !containerRef.current) {
        return;
      }

      const targetY = images
        .slice(0, index)
        .reduce((sum, img) => sum + img.height * scale, 0);

      const stageHeight = containerRef.current?.clientHeight;
      const imageHeight = images[index]?.height ? images[index].height * scale : 0;

      const centerY = -targetY + (stageHeight - imageHeight) / 2;

      setPosition(prev => ({ ...prev, y: centerY }));
      setCurrentImageIndex(index);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, scale, position.x],
  );

  const handlePreviousImage = useCallback(() => {
    if (currentImageIndex > 0) {
      scrollToImage(currentImageIndex - 1);
    }
  }, [currentImageIndex, scrollToImage]);

  const handleNextImage = useCallback(() => {
    if (currentImageIndex < images.length - 1) {
      scrollToImage(currentImageIndex + 1);
    }
  }, [currentImageIndex, images.length, scrollToImage]);

  const showToolbar = useCallback(() => {
    setToolbarVisible(true);

    if (toolbarTimerRef.current) {
      clearTimeout(toolbarTimerRef.current);
    }

    toolbarTimerRef.current = setTimeout(() => {
      setToolbarVisible(false);
    }, 7000);
  }, []);

  const handleContainerClick = useCallback(() => {
    showToolbar();
  }, [showToolbar]);

  const handleDragMove = () => {
    if (stageRef.current) {
      const newPos = stageRef.current.position();
      setPosition({ x: newPos.x, y: newPos.y });
      updateCurrentImageIndex(newPos.y);
    }
  };

  useEffect(() => {
    if (images) {
      handleFitToWidth();
    }
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setControlsPosition({
        left: `${containerRect.width / 2}px`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  useEffect(() => {
    if (viewThumb) {
      showToolbar();
      setCurrentImageIndex(0);

      const loadedImages: SetStateAction<HTMLImageElement[]> = [];
      let loadedCount = 0;

      viewThumb.imageUrls.forEach((url, index) => {
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
          loadedImages[index] = img;
          loadedCount += 1;

          if (loadedCount === viewThumb.imageUrls.length) {
            setImages(loadedImages);
            handleFitToWidth();
          }
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewThumb?.imageUrls]);

  useEffect(() => {
    showToolbar();

    return () => {
      if (toolbarTimerRef.current) {
        clearTimeout(toolbarTimerRef.current);
      }
    };
  }, [showToolbar]);

  const Controls = styled(Box)<{ visible: string }>(({ visible }) => ({
    background: 'white',
    border: `1px solid ${DOCUMENT_BACKGROUND_COLOR}`,
    boxShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    gap: '10px',
    left: controlsPosition.left,
    opacity: visible === 'true' ? 1 : 0,
    padding: '10px',
    pointer: visible === 'true' ? 'auto' : 'none',
    position: 'absolute',
    top: '4%',
    transform: 'translateX(-50%)',
    transition: 'opacity 0.3s ease-in-out',
  }));

  if (!viewThumb) {
    return <div>Page not found</div>;
  }

  return (
    <Box
      onClick={handleContainerClick}
      ref={containerRef}
      style={{ height: '100vh', width: '100%' }}
    >
      <Stage
        draggable
        height={containerRef.current?.clientHeight}
        onDragMove={handleDragMove}
        onWheel={handleWheel}
        ref={stageRef}
        width={containerRef.current?.clientWidth}
        x={position.x}
        y={position.y}
      >
        <Layer>
          {images.map((image, index) => {
            const y = images
              .slice(0, index)
              .reduce((sum, img) => sum + img.height * scale, 0);

            return (
              <Image
                image={image}
                key={image.src}
                scaleX={scale}
                scaleY={scale}
                x={0}
                y={y}
              />
            );
          })}
        </Layer>
      </Stage>
      <Controls visible={`${toolbarVisible}`}>
        <Stack alignItems="center" direction="row" spacing={1}>
          <Button disabled={currentImageIndex === 0} onClick={handlePreviousImage}>
            <KeyboardArrowUp />
          </Button>
          <div style={{ border: '1px solid #E8E8E8', padding: '4px' }}>
            <Typography whiteSpace="nowrap">
              {currentImageIndex + 1} / {images.length}
            </Typography>
          </div>
          <Button
            disabled={currentImageIndex === images.length - 1}
            onClick={handleNextImage}
          >
            <KeyboardArrowDown />
          </Button>
        </Stack>
        <Button onClick={handleZoomIn}>
          <ZoomInOutlined />
        </Button>
        <Button onClick={handleZoomOut}>
          <ZoomOutOutlined />
        </Button>
        <Button onClick={handleFitToWidth}>
          <Fullscreen />
        </Button>
      </Controls>
    </Box>
  );
}
