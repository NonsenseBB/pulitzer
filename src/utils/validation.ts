import type { Request } from 'express'

import type { ProcessOptions } from '../types'
import type { Config } from '../config/types'
import { ImageFormat } from '../types'

export function validateBucket(
  req: Request,
  config: Config,
  opts: ProcessOptions,
): ProcessOptions | undefined {
  if (!config.enable_avif_support && opts.settings.format === ImageFormat.AVIF) {
    req.log.debug('AVIF format is disabled')
    return
  }

  // S3 Bucket config overrides other settings
  if (config.s3.bucket) {
    opts.bucket = config.s3.bucket
    return opts
  }

  if (!config.s3.allowedBuckets.includes(opts.bucket)) {
    req.log.warn('%s is not in the list of allowed buckets', opts.bucket)
    return
  }

  return opts
}
