import React from 'react';
import SysPath from 'path';
import { Button } from 'widgets';
import { shell } from 'electron';
import { encodeFilePath } from 'common/fs';
import { CONTAINER_DEFAULT_STYLE } from '../../SlideMode/ZoomPan';

interface ImageFallbackProps {
  error: any;
  absolutePath: string;
}

export function ImageFallback({ error, absolutePath }: ImageFallbackProps) {
  return (
    <div style={CONTAINER_DEFAULT_STYLE} className="image-fallback">
      <div style={{ maxHeight: 360, maxWidth: 360 }} className="image-error" />
      <br />
      <span>Could not load {error ? '' : 'full '}image </span>
      <pre
        title={absolutePath}
        style={{ maxWidth: '40ch', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {SysPath.basename(absolutePath)}
      </pre>
      <Button
        onClick={() =>
          shell
            .openExternal(encodeFilePath(absolutePath))
            .catch((e) => console.error(e, absolutePath))
        }
        text="Open in external application"
      />
    </div>
  );
}
