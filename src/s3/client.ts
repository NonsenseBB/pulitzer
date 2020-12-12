import { Readable as ReadableStream } from 'stream'
import { BucketItemStat, Client, ItemBucketMetadata } from 'minio'
import CircuitBreaker from 'opossum'

import { HealthStatus } from '../health/types'

import { IS3Client } from './types'

enum METHOD {
  statObject,
  getObject,
  putObject,
}

export default class S3Client implements IS3Client {
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
      () => console.info('Circuit breaker closed', { bucket: this.#bucketName }),
    )

    this.#breaker.on(
      'halfOpen',
      () => console.error('Circuit breaker half open, next request will re-evaluate status', { bucket: this.#bucketName }),
    )

    this.#breaker.on(
      'open',
      () => console.error('Circuit breaker opened', { bucket: this.#bucketName }),
    )
  }

  #statObject = (objectName: string): Promise<BucketItemStat> => {
    return this.#client.statObject(this.#bucketName, objectName)
  }

  #getObject = (objectName: string): Promise<ReadableStream> => {
    return this.#client.getObject(this.#bucketName, objectName)
  }

  #putObject = (objectName: string, stream: ReadableStream, metaData?: ItemBucketMetadata): Promise<string> => {
    return this.#client.putObject(this.#bucketName, objectName, stream, metaData)
  }

  #dispatch = (method: METHOD, objectName: string, stream?: ReadableStream, metaData?: ItemBucketMetadata): unknown => {
    switch (method) {
      case METHOD.statObject:
        return this.#statObject(objectName)
      case METHOD.getObject:
        return this.#getObject(objectName)
      case METHOD.putObject:
        return this.#putObject(objectName, stream, metaData)
    }
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

  putObject(objectName: string, stream: ReadableStream, metaData?: ItemBucketMetadata): Promise<string> {
    return this.dispatch(METHOD.putObject, objectName, stream, metaData) as Promise<string>
  }
}
