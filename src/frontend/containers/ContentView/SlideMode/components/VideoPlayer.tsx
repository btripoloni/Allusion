import React from 'react';
import { ClientFile } from 'src/frontend/entities/File';

interface VideoPlayerProps {
  file: ClientFile;
  width: number;
  height: number;
}
export function VideoPlayer({ file, width, height }: VideoPlayerProps) {
  return (
    <video src={file.absolutePath} width={width} height={height} autoPlay loop controls></video>
  );
}
