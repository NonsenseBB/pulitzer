import type { Sharp } from 'sharp'
import type { Request } from 'express'

import type { ProcessOptions } from '../../types'

export function applyBlurTransform(
  req: Request,
  transformer: Sharp,
  opts: ProcessOptions,
): Sharp {
  const { settings } = opts

  if (settings.preview) {
    req.log.debug(
      {
        bucket: opts.bucket,
        objectName: opts.transformed,
      },
      'Will generate preview',
    )

    // TODO: allow configuration of default width and blur radius
    return transformer.blur(10.5) // sigma = 1 + radius / 2; radius = 20; sigma = 10.5
  }

  return transformer
}
