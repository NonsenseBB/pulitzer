import { JpegOptions, Sharp } from 'sharp'

import { ImageFormat, ProcessOptions, ProcessSettings } from '../../types'

export function applyFormatTransform(transformer: Sharp, opts: ProcessOptions): Sharp {
  const { settings } = opts

  const { format, formatOptions } = buildFormatOptions(settings)

  if (format) {
    console.debug(
      'Will convert image format',
      { objectName: opts.transformed, format: settings.format },
    )

    return transformer.toFormat(
      format.toString().toLowerCase(),
      formatOptions,
    )
  }

  return transformer
}

type FormatOptionsResult = {
  format: string
  formatOptions?: JpegOptions
}

export function buildFormatOptions(settings: ProcessSettings): FormatOptionsResult {
  let format: ImageFormat = undefined
  let formatOptions: JpegOptions = undefined

  if (settings.format !== ImageFormat.ORIGINAL) {
    format = settings.format
  }

  if (settings.format === ImageFormat.ORIGINAL && settings.preview) {
    format = ImageFormat.JPEG
    formatOptions = { quality: 40 }
  }

  return { format, formatOptions }
}
