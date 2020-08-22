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

function buildResizeOptions(settings: ProcessSettings): ResizeOptions | undefined {
  let resizeOptions: ResizeOptions = undefined

  if (settings.preview) {
    resizeOptions = {
      ...resizeOptions,
      fit: sharp.fit.inside,
      kernel: sharp.kernel.nearest,
      withoutEnlargement: true,
      width: 42,
      height: 42,
    }
  }

  if (settings.maxWidth) {
    resizeOptions = {
      ...resizeOptions,
      withoutEnlargement: true,
      width: settings.maxWidth,
    }
  }

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

  if (settings.maxWidth && settings.width) {
    resizeOptions = {
      ...resizeOptions,
      width: settings.maxWidth,
      height: Math.floor(settings.maxWidth * settings.height / settings.width),
    }
  }

  return resizeOptions
}
