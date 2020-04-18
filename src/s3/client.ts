import { Stream } from 'stream'
import { BucketItemStat, Client, ItemBucketMetadata } from 'minio'
import CircuitBreaker from 'opossum'

import { HealthStatus } from '../health/types'
import config from '../config'

export enum METHOD {
  statObject,
  getObject,
  putObject,
}

class S3Client {
  readonly #client: Client
  readonly #breaker: CircuitBreaker
  readonly #bucketName: string

  constructor(client: Client, bucketName: string, circuitBreakerOpts?: CircuitBreaker.Options) {
    this.#bucketName = bucketName
    this.#client = client

    // FIXME: types for dispatch function
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this.#breaker = new CircuitBreaker(this.#dispatch, {
      ...circuitBreakerOpts,
      errorFilter: (e): boolean => {
        return e.code ? e.code === 'NotFound' || e.code === 'Forbidden' : false
      },
    })

    this.#breaker.on('close', () => console.info('Circuit breaker closed'))
    this.#breaker.on('halfOpen', () => console.error('Circuit breaker half open, next request will re-evaluate status'))
    this.#breaker.on('open', () => console.error('Circuit breaker opened'))
  }

  #statObject = (objectName): Promise<BucketItemStat> => {
    return this.#client.statObject(this.#bucketName, objectName)
  }

  #getObject = (objectName): Promise<Stream> => {
    return this.#client.getObject(this.#bucketName, objectName)
  }

  #putObject = (objectName: string, stream: Stream, metaData?: ItemBucketMetadata): Promise<string> => {
    return this.#client.putObject(this.#bucketName, objectName, stream, metaData)
  }

  // FIXME: types for dispatch function
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  #dispatch = (method: METHOD, objectName: string, stream?: Stream, metaData?: ItemBucketMetadata) => {
    switch (method) {
      case METHOD.statObject:
        return this.#statObject(objectName)
      case METHOD.getObject:
        return this.#getObject(objectName)
      case METHOD.putObject:
        return this.#putObject(objectName, stream, metaData)
    }
  }

  // FIXME: types for dispatch function
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  dispatch = (...params) => {
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
}

// TODO: circuit breaker opts
const client = new S3Client(new Client(config.s3), config.s3.bucket, config.circuitBreaker)

export function statObject(objectName): Promise<BucketItemStat> {
  return client.dispatch(METHOD.statObject, objectName) as Promise<BucketItemStat>
}

export function getObject(objectName): Promise<Stream> {
  return client.dispatch(METHOD.getObject, objectName) as Promise<Stream>
}

export function putObject(objectName: string, stream: Stream, metaData?: ItemBucketMetadata): Promise<string> {
  return client.dispatch(METHOD.putObject, objectName, stream, metaData) as Promise<string>
}

export default client
