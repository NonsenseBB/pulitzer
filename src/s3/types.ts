import type { Readable as ReadableStream } from 'stream'
import type { BucketItemStat, ItemBucketMetadata } from 'minio'

import type { HealthStatus } from '../health/types'

export interface IS3Client {
  statObject(objectName: string): Promise<BucketItemStat>
  getObject(objectName: string): Promise<ReadableStream>
  putObject(objectName: string, stream: ReadableStream, metaData?: ItemBucketMetadata): Promise<string>

  getHealthStatus(): HealthStatus
}
