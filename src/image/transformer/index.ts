import type { Request } from 'express'
import type { Sharp } from 'sharp'
import sharp from 'sharp'

import type { ProcessOptions } from '../../types'
import { ImageFormat } from '../../types'

import { applyBlurTransform } from './blur'
import { applyResizeTransform } from './resize'
import { applyFormatTransform } from './format'


export function buildTransformer(
  req: Request,
  opts: ProcessOptions
): Sharp {
  let transformer = sharp()

  transformer = applyBlurTransform(req, transformer, opts)
  transformer = applyResizeTransform(req, transformer, opts)
  transformer = applyFormatTransform(req, transformer, opts)

  return transformer
}

export function needsTransform(opts: ProcessOptions): boolean {
  const { settings } = opts
  const isResized = settings.maxWidth !== undefined || settings.width !== undefined

  return isResized || settings.format !== ImageFormat.ORIGINAL || settings.preview
}
