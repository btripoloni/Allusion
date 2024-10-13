import { ClientFile } from 'src/frontend/entities/File';
import ZoomPan, { SlideTransform } from '../ZoomPan';
import { UpscaleMode } from 'src/frontend/stores/UiStore';
import React from 'react';
import { encodeFilePath } from 'common/fs';
import { createDimension, Vec2 } from '../utils';
import { ImageFallback } from './ImageFallback';
import { usePromise } from 'src/frontend/hooks/usePromise';
import { useStore } from 'src/frontend/contexts/StoreContext';

interface ZoomableImageProps {
  file: ClientFile;
  thumbnailSrc: string;
  width: number;
  height: number;
  transitionStart?: SlideTransform;
  transitionEnd?: SlideTransform;
  onClose: () => void;
  upscaleMode: UpscaleMode;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  file,
  thumbnailSrc,
  width,
  height,
  transitionStart,
  transitionEnd,
  onClose,
  upscaleMode,
}: ZoomableImageProps) => {
  const { imageLoader } = useStore();
  const { absolutePath, width: imgWidth, height: imgHeight } = file;
  // Image src can be set asynchronously: keep track of it in a state
  // Needed for image formats not natively supported by the browser (e.g. tiff): will be converted to another format
  const source = usePromise(file, thumbnailSrc, async (file, thumbnailPath) => {
    const src = await imageLoader.getImageSrc(file);
    return src ?? thumbnailPath;
  });

  const image = usePromise(
    source,
    absolutePath,
    thumbnailSrc,
    imgWidth,
    imgHeight,
    async (source, absolutePath, thumbnailSrc, imgWidth, imgHeight) => {
      if (source.tag === 'ready') {
        if ('ok' in source.value) {
          const src = source.value.ok;
          const dimension = await new Promise<{ src: string; dimension: Vec2 }>(
            (resolve, reject) => {
              const img = new Image();
              img.onload = function (this: any) {
                // TODO: would be better to resolve once transition is complete: for large resolution images, the transition freezes for ~.4s bc of a re-paint task when the image changes
                resolve({
                  src,
                  dimension: createDimension(this.naturalWidth, this.naturalHeight),
                });
              };
              img.onerror = reject;
              img.src = encodeFilePath(src);
            },
          );
          return dimension;
        } else {
          throw source.value.err;
        }
      } else {
        return {
          src: thumbnailSrc || absolutePath,
          dimension: createDimension(imgWidth, imgHeight),
        };
      }
    },
  );

  if (image.tag === 'ready' && 'err' in image.value) {
    return <ImageFallback error={image.value.err} absolutePath={absolutePath} />;
  } else {
    const { src, dimension } =
      image.tag === 'ready' && 'ok' in image.value
        ? image.value.ok
        : {
            src: thumbnailSrc || absolutePath,
            dimension: createDimension(imgWidth, imgHeight),
          };
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
          <img
            {...props}
            src={encodeFilePath(src)}
            width={dimension[0]}
            height={dimension[1]}
            alt=""
          />
        )}
      </ZoomPan>
    );
  }
};
