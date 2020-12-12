import { S3Config } from '../config'
import { ProcessOptions } from '../types'

import { validateBucket } from './validation'

const DUMMY_CONFIG: S3Config = {
  accessKey: 'xxx',
  secretKey: 'xxx',
  endPoint: 's3.amazonaws.com',
  useSSL: true,
  allowedBuckets: [],
}

const DUMMY_OPTS: ProcessOptions = {
  bucket: 'example.com',
  original: 'my-file.png',
  settings: null,
}

describe('validateBucket()', () => {
  it('Forces bucket from settings if a different one is set', () => {
    const result = validateBucket(
      { ...DUMMY_CONFIG, bucket: 'my-bucket.example.com' },
      { ...DUMMY_OPTS },
    )

    expect(result).toEqual({
      ...DUMMY_OPTS,
      bucket: 'my-bucket.example.com',
    } as ProcessOptions)
  })

  it('Returns empty if bucket is not in allowed list', () => {
    const result = validateBucket(
      { ...DUMMY_CONFIG, allowedBuckets: ['my-bucket.example.com'] },
      { ...DUMMY_OPTS, bucket: 'example.com' },
    )

    expect(result).toBeUndefined()
  })

  it('Returns config if bucket is in allowed list', () => {
    const result = validateBucket(
      { ...DUMMY_CONFIG, allowedBuckets: ['my-bucket.example.com'] },
      { ...DUMMY_OPTS, bucket: 'my-bucket.example.com' },
    )

    expect(result).toEqual({
      ...DUMMY_OPTS,
      bucket: 'my-bucket.example.com',
    } as ProcessOptions)
  })
})
