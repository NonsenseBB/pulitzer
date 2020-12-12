import { ProcessOptions } from '../types'
import { S3Config } from '../config'

export function validateBucket(config: S3Config, opts: ProcessOptions): ProcessOptions | undefined {
  if (!opts) {
    return
  }

  // S3 Bucket config overrides other settings
  if (config.bucket) {
    opts.bucket = config.bucket
    return opts
  }

  if (!config.allowedBuckets.includes(opts.bucket)) {
    console.warn('%s is not in the list of allowed buckets', opts.bucket)
    return
  }

  return opts
}
