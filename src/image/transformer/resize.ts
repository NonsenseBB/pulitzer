import sharp, { ResizeOptions, Sharp } from 'sharp'

import { ProcessOptions, ProcessSettings } from '../../types'

export function applyResizeTransform(transformer: Sharp, opts: ProcessOptions): Sharp {
  const { settings } = opts
  const resizeOptions = buildResizeOptions(settings)

  if (resizeOptions) {
    console.debug('Will resize', { objectName: opts.transformed, options: resizeOptions })
    return transformer.resize(resizeOptions)
  }

  return transformer
}

const DEFAULT_PREVIEW_SIZE = 42

export function buildResizeOptions(settings: ProcessSettings): ResizeOptions | undefined {
  let resizeOptions: ResizeOptions = undefined

  if (settings.width) {
    resizeOptions = {
      ...resizeOptions,
      withoutEnlargement: true,
      width: settings.width,
      height: settings.height,
      fit: sharp.fit[settings.fit.toString().toLowerCase()],
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

    resizeOptions = {
      ...resizeOptions,
      fit: sharp.fit.inside,
      kernel: sharp.kernel.nearest,
      withoutEnlargement: true,
      width,
      height,
    }
  }

  if (settings.maxWidth) {
    let height

    if (resizeOptions && (resizeOptions.width && resizeOptions.height)) {
      height = Math.floor(settings.maxWidth * resizeOptions.height / resizeOptions.width)
    }

    resizeOptions = {
      ...resizeOptions,
      withoutEnlargement: true,
      width: settings.maxWidth,
      height,
    }
  }

  return resizeOptions
}
