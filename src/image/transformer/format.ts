import type { FormatEnum, JpegOptions, Sharp } from 'sharp'
import type { Request } from 'express'

import type { ProcessOptions, ProcessSettings } from '../../types'
import { ImageFormat } from '../../types'

export function applyFormatTransform(
  req: Request,
  transformer: Sharp,
  opts: ProcessOptions,
): Sharp {
  const { settings } = opts

  const { format, formatOptions } = buildFormatOptions(settings)

  if (format) {
    req.log.debug('Will convert image format', {
      bucket: opts.bucket,
      objectName: opts.transformed,
      format: settings.format,
    })

    return transformer.toFormat(
      format,
      formatOptions,
    )
  }

  return transformer
}

type FormatOptionsResult = {
  format?: keyof FormatEnum
  formatOptions?: JpegOptions
}

export function buildFormatOptions(settings: ProcessSettings): FormatOptionsResult {
  let format: ImageFormat | undefined = undefined
  let formatOptions: JpegOptions | undefined = undefined

  if (settings.format !== ImageFormat.ORIGINAL) {
    format = settings.format
  }

  if (settings.format === ImageFormat.ORIGINAL && settings.preview) {
    format = ImageFormat.JPEG
    formatOptions = { quality: 40 }
  }

  if (settings.quality) {
    // TODO: support quality when format is `ORIGINAL`
    formatOptions = { quality: settings.quality }
  }

  return {
    format: <keyof FormatEnum>format?.toString().toLowerCase(),
    formatOptions,
  }
}
