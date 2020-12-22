import { ImageFormat, ProcessOptions } from '../types'
import { Config } from '../config/types'

export function validateBucket(config: Config, opts: ProcessOptions): ProcessOptions | undefined {
  if (!opts) {
    return
  }

  if (!config.enable_avif_support && opts.settings.format === ImageFormat.AVIF) {
    console.warn('AVIF format is disabled')
    return
  }

  // S3 Bucket config overrides other settings
  if (config.s3.bucket) {
    opts.bucket = config.s3.bucket
    return opts
  }

  if (!config.s3.allowedBuckets.includes(opts.bucket)) {
    console.warn('%s is not in the list of allowed buckets', opts.bucket)
    return
  }

  return opts
}
