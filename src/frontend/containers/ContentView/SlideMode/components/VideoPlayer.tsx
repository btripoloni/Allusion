import React from 'react';
import { ClientFile } from 'src/frontend/entities/File';
import ZoomPan, { SlideTransform } from '../ZoomPan';
import { createDimension } from '../utils';
import { UpscaleMode } from 'src/frontend/stores/UiStore';

interface VideoPlayerProps {
  file: ClientFile;
  width: number;
  height: number;
  transitionStart?: SlideTransform;
  transitionEnd?: SlideTransform;
  onClose: () => void;
  upscaleMode: UpscaleMode;
}
export function VideoPlayer({
  file,
  width,
  height,
  transitionStart,
  transitionEnd,
  onClose,
  upscaleMode,
}: VideoPlayerProps) {
  const dimension = createDimension(width, height);
  const minScale = Math.min(0.1, Math.min(width / dimension[0], height / dimension[1]));
  return (
    <ZoomPan
      position="center"
      initialScale="auto"
      doubleTapBehavior="zoomOrReset"
      imageDimension={dimension}
      containerDimension={createDimension(width, height)}
      minScale={minScale}
      maxScale={5}
      transitionStart={transitionStart}
      transitionEnd={transitionEnd}
      onClose={onClose}
      upscaleMode={upscaleMode}
    >
      {(props) => (
        <video
          {...props}
          src={file.absolutePath}
          width={width}
          height={height}
          autoPlay
          loop
        ></video>
      )}
    </ZoomPan>
  );
}
