import type { ResizeOptions, Sharp } from 'sharp'
import sharp from 'sharp'
import type { Request } from 'express'

import type { ProcessOptions, ProcessSettings } from '../../types'

export function applyResizeTransform(
  req: Request,
  transformer: Sharp,
  opts: ProcessOptions,
): Sharp {
  const { settings } = opts
  const resizeOptions = buildResizeOptions(settings)

  if (resizeOptions) {
    req.log.debug('Will resize', {
      bucket: opts.bucket,
      objectName: opts.transformed,
      options: resizeOptions,
    })
    return transformer.resize(resizeOptions)
  }

  return transformer
}

const DEFAULT_PREVIEW_SIZE = 42

export function buildResizeOptions(settings: ProcessSettings): ResizeOptions | undefined {
  let resizeOptions: Partial<ResizeOptions> | undefined = undefined

  if (settings.width) {
    resizeOptions = {
      withoutEnlargement: true,
      width: settings.width,
      height: settings.height,
      fit: sharp.fit[settings.fit],
      position: sharp.strategy.attention, // TODO: allow control of this setting
    }
  }

  if (settings.preview) {
    let width = DEFAULT_PREVIEW_SIZE
    let height = DEFAULT_PREVIEW_SIZE

    if (resizeOptions && resizeOptions.width && resizeOptions.width > width) {
      width = resizeOptions.width
    }

    if (resizeOptions && (resizeOptions.width && resizeOptions.height)) {
      height = Math.floor(width * resizeOptions.height / resizeOptions.width)
    }

    if (resizeOptions && (resizeOptions.width && !resizeOptions.height)) {
      height = width
    }

    if (!resizeOptions) {
      resizeOptions = {}
    }

    resizeOptions.fit = sharp.fit.inside
    resizeOptions.kernel = sharp.kernel.nearest
    resizeOptions.withoutEnlargement = true
    resizeOptions.width = width
    resizeOptions.height = height
  }

  if (settings.maxWidth) {
    let height

    if (resizeOptions && (resizeOptions.width && resizeOptions.height)) {
      height = Math.floor(settings.maxWidth * resizeOptions.height / resizeOptions.width)
    }

    if (!resizeOptions) {
      resizeOptions = {}
    }

    resizeOptions.withoutEnlargement = true
    resizeOptions.width = settings.maxWidth
    resizeOptions.height = height
  }

  return resizeOptions
}
