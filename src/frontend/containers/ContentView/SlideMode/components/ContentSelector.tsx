import React from 'react';
import { ZoomableImage } from './ZoombableImage';
import { ClientFile } from 'src/frontend/entities/File';
import { SlideTransform } from '../ZoomPan';
import UiStore from 'src/frontend/stores/UiStore';
import { EXTENSIONS_TYPE } from 'src/api/file';
import { VideoPlayer } from './VideoPlayer';
import { ImageFallback } from './ImageFallback';
import { observer } from 'mobx-react-lite';

interface ContentSelectorProps {
  file: ClientFile;
  thumbnail: string;
  width: number;
  height: number;
  transitionStart: SlideTransform | undefined;
  uiStore: UiStore;
}

const mediaTypes: Record<EXTENSIONS_TYPE, string> = {
  gif: 'image',
  png: 'image',
  apng: 'image',
  jpg: 'image',
  jpeg: 'image',
  jfif: 'image',
  webp: 'image',
  bmp: 'image',
  ico: 'image',
  svg: 'image',
  tif: 'image',
  tiff: 'image',
  psd: 'image',
  kra: 'image',
  exr: 'image',
  mp4: 'video',
  webm: 'video',
};

export const ContentSelector = observer(
  ({ file, thumbnail, width, height, transitionStart, uiStore }: ContentSelectorProps) => {
    const transitionEnd = uiStore.isSlideMode ? undefined : transitionStart;
    switch (mediaTypes[file.extension]) {
      case 'image':
        return (
          <ZoomableImage
            file={file}
            thumbnailSrc={thumbnail}
            width={width}
            height={height}
            transitionStart={transitionStart}
            transitionEnd={transitionEnd}
            onClose={uiStore.disableSlideMode}
            upscaleMode={uiStore.upscaleMode}
          />
        );
      case 'video':
        return (
          <VideoPlayer
            file={file}
            width={width}
            height={height}
            transitionStart={transitionStart}
            transitionEnd={transitionEnd}
            onClose={uiStore.disableSlideMode}
            upscaleMode={uiStore.upscaleMode}
          />
        );
      default:
        return <ImageFallback error={true} absolutePath={file.absolutePath} />;
    }
  },
);
