import { Sharp } from 'sharp'

import { ProcessOptions } from '../../types'

export function applyBlurTransform(transformer: Sharp, opts: ProcessOptions): Sharp {
  const { settings } = opts

  if (settings.preview) {
    console.debug('Will generate preview', { objectName: opts.transformed })

    // TODO: allow configuration of default width and blur radius
    return transformer.blur(10.5) // sigma = 1 + radius / 2; radius = 20; sigma = 10.5
  }

  return transformer
}
