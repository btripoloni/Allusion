import fse from 'fs-extra';
import { generateVideoThumbnailViaUrl } from '@rajesh896/video-thumbnails-generator';
import { ClientFile } from '../entities/File';

export async function generateVideoThumbnail(file: ClientFile, thumbnailPath: string) {
  const thumb = await generateVideoThumbnailViaUrl(file.absolutePath, 1);
  //then(async (thumbs: string) => {});
  const parsedThumb = thumb.replace(/^.+,/, '');
  await fse.outputFile(thumbnailPath, Buffer.from(parsedThumb, 'base64'));
}
