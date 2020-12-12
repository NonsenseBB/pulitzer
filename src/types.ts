import { BucketItemStat } from 'minio'
import { Stream } from 'stream'

export enum ImageFormat {
  PNG = 'PNG',
  WEBP = 'WEBP',
  JPEG = 'JPEG',
  ORIGINAL = 'ORIGINAL',
}

export function ImageFormatFromString(str?: string): (ImageFormat | undefined) {
  if (!str || str.trim() === '') {
    return ImageFormat.ORIGINAL
  }

  switch (str.trim().toUpperCase()) {
    case 'PNG':
      return ImageFormat.PNG
    case 'WEBP':
      return ImageFormat.WEBP
    case 'JPG':
    case 'JPEG':
      return ImageFormat.JPEG
  }

  return undefined
}

export enum FitEnum {
  COVER = 'cover',
  CONTAIN = 'contain',
  FILL = 'fill',
  INSIDE = 'inside',
  OUTSIDE = 'outside',
}

export function FitEnumFromString(str?: string): (FitEnum | undefined) {
  switch (str.trim().toLowerCase()) {
    case 'cover':
      return FitEnum.COVER
    case 'contain':
      return FitEnum.CONTAIN
    case 'fill':
      return FitEnum.FILL
    case 'inside':
      return FitEnum.INSIDE
    case 'outside':
      return FitEnum.OUTSIDE
  }
}

export type ProcessSettings = {
  format: ImageFormat;
  maxWidth?: number;
  width?: number;
  height?: number;
  fit: FitEnum;
  preview: boolean;
}

export type ProcessOptions = {
  bucket: string;
  transformed?: string;
  original: string;
  settings: ProcessSettings;
}

export type ProcessResult = {
  data: BucketItemStat;
  contentType?: string;
  size?: number;
  etag?: string;
  transformed?: boolean;
  stream: Stream;
}
