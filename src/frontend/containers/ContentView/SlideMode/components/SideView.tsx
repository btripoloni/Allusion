import React, { useEffect, useMemo } from 'react';
import { encodeFilePath } from 'common/fs';
import { autorun, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useStore } from 'src/frontend/contexts/StoreContext';
import { useAction, useComputed } from 'src/frontend/hooks/mobx';
import { CommandDispatcher } from '../../Commands';
import { SlideTransform } from '../ZoomPan';
import { createTransform } from '../utils';
import { NavigationButtons } from './NavigationButtons';
import { ContentSelector } from './ContentSelector';

interface SlideViewProps {
  width: number;
  height: number;
}

export const SlideView = observer(({ width, height }: SlideViewProps) => {
  const { uiStore, fileStore, imageLoader } = useStore();
  const file = uiStore.firstFileInView;
  const eventManager = useMemo(() => (file ? new CommandDispatcher(file) : undefined), [file]);
  const isFirst = useComputed(() => uiStore.firstItem === 0);
  const isLast = useComputed(() => uiStore.firstItem === fileStore.fileList.length - 1);

  // Go to the first selected image on load
  useEffect(() => {
    return reaction(
      () => uiStore.firstSelectedFile?.id,
      (id, _, reaction) => {
        if (id !== undefined) {
          const index = fileStore.getIndex(id);
          uiStore.setFirstItem(index);

          // Also, select only this file: makes more sense for the TagEditor overlay: shows tags on selected images
          if (index !== undefined) {
            uiStore.selectFile(fileStore.fileList[index], true);
          }

          reaction.dispose();
        }
      },
      { fireImmediately: true },
    );
  }, [fileStore, uiStore]);

  // Go back to previous view when pressing the back button (mouse button 5)
  useEffect(() => {
    // Push a dummy state, so that a pop-state event can be activated
    // TODO: would be nice to also open SlideMode again when pressing forward button: actually store the open image in the window.location?
    history.pushState(null, document.title, location.href);
    const popStateHandler = uiStore.disableSlideMode;
    window.addEventListener('popstate', popStateHandler);
    return () => window.removeEventListener('popstate', popStateHandler);
  }, [uiStore]);

  const decrImgIndex = useAction(() => {
    const index = Math.max(0, uiStore.firstItem - 1);
    uiStore.setFirstItem(index);

    // Select only this file: TagEditor overlay shows tags on selected images
    uiStore.selectFile(fileStore.fileList[index], true);
  });
  const incrImgIndex = useAction(() => {
    const index = Math.min(uiStore.firstItem + 1, fileStore.fileList.length - 1);
    uiStore.setFirstItem();
    uiStore.selectFile(fileStore.fileList[index], true);
  });

  // Detect left/right arrow keys to scroll between images. Top/down is already handled in the layout that's open in the background
  useEffect(() => {
    const handleUserKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        decrImgIndex();
        event.stopPropagation();
      } else if (event.key === 'ArrowRight') {
        incrImgIndex();
        event.stopPropagation();
      } else if (event.key === 'Escape' || event.key === 'Backspace') {
        if (event.target instanceof HTMLInputElement) {
          return;
        }
        uiStore.disableSlideMode();
        event.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [decrImgIndex, incrImgIndex, uiStore]);

  // Preload next and previous image for better UX
  useEffect(() => {
    let isEffectRunning = true;
    const dispose = autorun(() => {
      if (!isLast.get() && uiStore.firstItem + 1 < fileStore.fileList.length) {
        const nextImg = new Image();
        const nextFile = fileStore.fileList[uiStore.firstItem + 1];
        imageLoader
          .getImageSrc(nextFile)
          .then((src) => isEffectRunning && src && (nextImg.src = encodeFilePath(src)));
      }
      if (!isFirst.get() && fileStore.fileList.length > 0) {
        const prevImg = new Image();
        const prevFile = fileStore.fileList[uiStore.firstItem - 1];
        imageLoader
          .getImageSrc(prevFile)
          .then((src) => isEffectRunning && src && (prevImg.src = encodeFilePath(src)));
      }
    });
    return () => {
      isEffectRunning = false;
      dispose();
    };
  }, [fileStore, isFirst, isLast, uiStore, imageLoader]);

  const transitionStart: SlideTransform | undefined = useMemo(() => {
    if (!file) {
      return undefined;
    }
    const thumbEl = document.querySelector(`[data-file-id="${file.id}"]`);
    const container = document.querySelector('#gallery-content');
    if (thumbEl && container) {
      const thumbElRect = thumbEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return createTransform(
        thumbElRect.top - containerRect.top,
        thumbElRect.left - containerRect.left,
        thumbElRect.height / file.height,
      );
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id]);

  return (
    <div
      id="zoomable-image"
      style={{ width, height }}
      onContextMenu={eventManager?.showSlideContextMenu}
      onDrop={eventManager?.drop}
      tabIndex={-1}
    >
      {file && (
        <ContentSelector
          file={file}
          thumbnail={file.thumbnailPath}
          width={width}
          height={height}
          transitionStart={transitionStart}
          uiStore={uiStore}
        />
      )}
      <NavigationButtons
        isStart={isFirst.get()}
        isEnd={isLast.get()}
        prevImage={decrImgIndex}
        nextImage={incrImgIndex}
      />
    </div>
  );
});
