import type { Readable as ReadableStream } from 'stream'
import type { BucketItemStat, Client, ItemBucketMetadata, UploadedObjectInfo } from 'minio'
import CircuitBreaker from 'opossum'

import { HealthStatus } from '../health/types'
import logger from '../logger'

enum METHOD {
  statObject,
  getObject,
  putObject,
}

export default class S3Client {
  readonly #client: Client
  readonly #breaker: CircuitBreaker
  readonly #bucketName: string

  constructor(client: Client, bucketName: string, circuitBreakerOpts?: CircuitBreaker.Options) {
    this.#bucketName = bucketName
    this.#client = client

    // FIXME: types for dispatch function
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.#breaker = new CircuitBreaker(this.#dispatch, {
      ...circuitBreakerOpts,
      errorFilter: (e): boolean => {
        return e.code ? e.code === 'NotFound' || e.code === 'Forbidden' : false
      },
    })

    this.#breaker.on(
      'close',
      () => logger.info({ bucket: this.#bucketName }, 'Circuit breaker closed'),
    )

    this.#breaker.on(
      'halfOpen',
      () => logger.error({ bucket: this.#bucketName }, 'Circuit breaker half open, next request will re-evaluate status'),
    )

    this.#breaker.on(
      'open',
      () => logger.error({ bucket: this.#bucketName }, 'Circuit breaker opened'),
    )
  }

  #statObject = (objectName: string): Promise<BucketItemStat> => {
    return this.#client.statObject(this.#bucketName, objectName)
  }

  #getObject = (objectName: string): Promise<ReadableStream> => {
    return this.#client.getObject(this.#bucketName, objectName)
  }

  #putObject = (objectName: string, stream: ReadableStream, metaData?: ItemBucketMetadata): Promise<UploadedObjectInfo> => {
    return this.#client.putObject(this.#bucketName, objectName, stream, metaData)
  }

  #dispatch = (method: METHOD, objectName: string, stream?: ReadableStream, metaData?: ItemBucketMetadata): unknown => {
    switch (method) {
      case METHOD.statObject:
        return this.#statObject(objectName)
      case METHOD.getObject:
        return this.#getObject(objectName)
      case METHOD.putObject:
        if (!stream) {
          throw new Error('Missing input stream in putObject call')
        }
        return this.#putObject(objectName, stream, metaData)
    }

    throw new Error('Unknown method')
  }

  dispatch = (...params: unknown[]): unknown => {
    return this.#breaker.fire(...params)
  }

  getHealthStatus(): HealthStatus {
    if (this.#breaker.halfOpen) {
      return HealthStatus.DEGRADED
    }

    if (this.#breaker.opened) {
      return HealthStatus.UNHEALTHY
    }

    return HealthStatus.OK
  }

  statObject(objectName: string): Promise<BucketItemStat> {
    return this.dispatch(METHOD.statObject, objectName) as Promise<BucketItemStat>
  }

  getObject(objectName: string): Promise<ReadableStream> {
    return this.dispatch(METHOD.getObject, objectName) as Promise<ReadableStream>
  }

  putObject(objectName: string, stream: ReadableStream, metaData?: ItemBucketMetadata): Promise<UploadedObjectInfo> {
    return this.dispatch(METHOD.putObject, objectName, stream, metaData) as Promise<UploadedObjectInfo>
  }
}
