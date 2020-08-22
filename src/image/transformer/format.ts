import { JpegOptions, Sharp } from 'sharp'

import { ImageFormat, ProcessOptions } from '../../types'

export function applyFormatTransform(transformer: Sharp, opts: ProcessOptions): Sharp {
  const { settings } = opts

  let format: ImageFormat = undefined
  let formatOptions: JpegOptions = undefined

  if (settings.format !== ImageFormat.ORIGINAL) {
    format = settings.format
  }

  if (settings.format === ImageFormat.ORIGINAL && settings.preview) {
    format = ImageFormat.JPEG
    formatOptions = { quality: 40 }
  }

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
