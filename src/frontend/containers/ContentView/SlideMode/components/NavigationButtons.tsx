import React from 'react';
import { IconSet } from 'widgets';

interface NavigationButtonsProps {
  isStart: boolean;
  isEnd: boolean;
  prevImage: () => void;
  nextImage: () => void;
}

export function NavigationButtons({
  isStart,
  isEnd,
  prevImage,
  nextImage,
}: NavigationButtonsProps) {
  const none = { display: 'none' };
  const initial = { display: 'initial' };
  return (
    <>
      <button
        style={isStart ? none : initial}
        aria-label="previous image"
        className="side-button-left"
        onClick={prevImage}
      >
        {IconSet.ARROW_LEFT}
      </button>
      <button
        style={isEnd ? none : initial}
        aria-label="next image"
        className="side-button-right"
        onClick={nextImage}
      >
        {IconSet.ARROW_RIGHT}
      </button>
    </>
  );
}
