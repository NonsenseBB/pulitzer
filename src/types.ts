import type { BucketItemStat } from 'minio'
import type { Stream } from 'stream'
import type { FitEnum } from 'sharp'
import sharp from 'sharp'

export enum ImageFormat {
  PNG = 'PNG',
  WEBP = 'WEBP',
  JPEG = 'JPEG',
  AVIF = 'AVIF',
  ORIGINAL = 'ORIGINAL',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isImageFormat(str: any): str is ImageFormat {
  return Object.values(ImageFormat).includes(str)
}

export function ImageFormatFromString(str?: string): ImageFormat | void {
  const s = str?.trim().toUpperCase()

  if (s === 'JPG') {
    return ImageFormat.JPEG
  }

  return isImageFormat(s)
    ? s
    : undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFitEnum(str: any): str is keyof FitEnum {
  return Object.keys(sharp.fit).includes(str)
}

export function FitEnumFromString(str?: string): (keyof FitEnum) | void {
  const s = str?.trim().toLowerCase()

  return isFitEnum(s)
    ? s
    : undefined
}

export type ProcessSettings = {
  format: ImageFormat;
  maxWidth?: number;
  width?: number;
  height?: number;
  fit: keyof FitEnum;
  preview: boolean;
}

export type ProcessOptions = {
  bucket: string;
  transformed: string;
  original: string;
  settings: ProcessSettings;
}

export type ProcessResult = {
  data: BucketItemStat;
  contentType: string;
  size?: number;
  etag?: string;
  transformed?: boolean;
  stream: Stream;
}
