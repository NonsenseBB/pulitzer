import sharp, { Sharp } from 'sharp'

import { ImageFormat, ProcessOptions } from '../../types'

import { applyBlurTransform } from './blur'
import { applyResizeTransform } from './resize'
import { applyFormatTransform } from './format'

export function buildTransformer(opts: ProcessOptions): Sharp {
  let transformer = sharp()

  transformer = applyBlurTransform(transformer, opts)
  transformer = applyResizeTransform(transformer, opts)
  transformer = applyFormatTransform(transformer, opts)

  return transformer
}

export function needsTransform(opts: ProcessOptions): boolean {
  const { settings } = opts
  const isResized = settings.maxWidth !== undefined || settings.width !== undefined

  return isResized || settings.format !== ImageFormat.ORIGINAL || settings.preview
}
