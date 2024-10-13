import { observer } from 'mobx-react-lite';
import React from 'react';
import { Split } from 'widgets';
import { useStore } from '../../../contexts/StoreContext';
import Inspector from '../../Inspector';
import { ContentRect } from '../utils';
import { SlideView } from './components/SideView';

const SlideMode = observer(({ contentRect }: { contentRect: ContentRect }) => {
  const { uiStore } = useStore();
  const isInspectorOpen = uiStore.isInspectorOpen;
  const inspectorWidth = uiStore.inspectorWidth;
  const contentWidth = contentRect.width - (isInspectorOpen ? inspectorWidth : 0);
  const contentHeight = contentRect.height;

  return (
    <Split
      id="slide-mode"
      className={uiStore.isSlideMode ? 'fade-in' : 'fade-out'}
      primary={<Inspector />}
      secondary={<SlideView width={contentWidth} height={contentHeight} />}
      axis="vertical"
      align="right"
      splitPoint={inspectorWidth}
      isExpanded={isInspectorOpen}
      onMove={uiStore.moveInspectorSplitter}
    />
  );
});

export default SlideMode;
