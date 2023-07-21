import type { Request} from 'express'

import type { Config, S3Config } from '../config/types'
import type { ProcessOptions, ProcessSettings } from '../types'
import { ImageFormat } from '../types'

import { validateBucket } from './validation'

const DUMMY_S3_CONFIG: S3Config = {
  accessKey: 'xxx',
  secretKey: 'xxx',
  endPoint: 's3.amazonaws.com',
  useSSL: true,
  allowedBuckets: ['example.com'],
}

const DUMMY_CONFIG: Config = {
  circuitBreaker: { enabled: false },
  enable_avif_support: false,
  http: { port: 80, max_age: 3600, path_separator: '__processed' },
  s3: DUMMY_S3_CONFIG,
  show_transformed_header: false,
  store_images: false,
  logging: {
    level: 'debug',
  },
}

const DUMMY_SETTINGS: ProcessSettings = {
  format: ImageFormat.ORIGINAL,
  fit: 'cover',
  preview: false,
}

const DUMMY_OPTS: ProcessOptions = {
  bucket: 'example.com',
  original: 'my-file.png',
  transformed: 'my-file.png',
  settings: DUMMY_SETTINGS,
}

const DUMMY_REQUEST = {
  log: console,
} as unknown as Request

describe('validateBucket()', () => {
  it('Forces bucket from settings if a different one is set', () => {
    const result = validateBucket(
      DUMMY_REQUEST,
      {
        ...DUMMY_CONFIG,
        s3: { ...DUMMY_S3_CONFIG, bucket: 'my-bucket.example.com', allowedBuckets: [] },
      },
      { ...DUMMY_OPTS },
    )

    expect(result).toEqual({
      ...DUMMY_OPTS,
      bucket: 'my-bucket.example.com',
    } as ProcessOptions)
  })

  it('Returns empty if bucket is not in allowed list', () => {
    const result = validateBucket(
      DUMMY_REQUEST,
      { ...DUMMY_CONFIG, s3: { ...DUMMY_S3_CONFIG, allowedBuckets: ['my-bucket.example.com'] } },
      { ...DUMMY_OPTS, bucket: 'example.com' },
    )

    expect(result).toBeUndefined()
  })

  it('Returns config if bucket is in allowed list', () => {
    const result = validateBucket(
      DUMMY_REQUEST,
      { ...DUMMY_CONFIG, s3: { ...DUMMY_S3_CONFIG, allowedBuckets: ['my-bucket.example.com'] } },
      { ...DUMMY_OPTS, bucket: 'my-bucket.example.com' },
    )

    expect(result).toEqual({
      ...DUMMY_OPTS,
      bucket: 'my-bucket.example.com',
    } as ProcessOptions)
  })

  it('Returns empty if AVIF is not enabled and AVIF is requested', () => {
    const result = validateBucket(
      DUMMY_REQUEST,
      { ...DUMMY_CONFIG, enable_avif_support: false },
      { ...DUMMY_OPTS, settings: { ...DUMMY_SETTINGS, format: ImageFormat.AVIF } },
    )

    expect(result).toBeUndefined()
  })

  it('Returns config if AVIF is enabled and AVIF is requested', () => {
    const result = validateBucket(
      DUMMY_REQUEST,
      { ...DUMMY_CONFIG, enable_avif_support: true },
      { ...DUMMY_OPTS, settings: { ...DUMMY_SETTINGS, format: ImageFormat.AVIF } },
    )

    expect(result).toEqual({
      ...DUMMY_OPTS,
      settings: { ...DUMMY_SETTINGS, format: ImageFormat.AVIF },
    } as ProcessOptions)
  })
})
