import type { LoggerOptions } from 'pino'

export type S3Config = {
  endPoint: string
  port?: number | undefined
  useSSL: boolean
  allowedBuckets: string[]
  bucket?: string | undefined
  region?: string | undefined
  accessKey: string
  secretKey: string
}

export type CircuitBreakerConfig = {
  enabled: boolean
  timeout?: number
  errorThresholdPercentage?: number
  resetTimeout?: number
}

export type HTTPConfig = {
  port: number
  max_age: number
  path_separator: string
}

export type Config = {
  store_images: boolean
  show_transformed_header: boolean
  enable_avif_support: boolean
  timeout?: number
  s3: S3Config
  circuitBreaker: CircuitBreakerConfig
  http: HTTPConfig
  logging: LoggerOptions
}
