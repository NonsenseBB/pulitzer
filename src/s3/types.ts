import { Readable as ReadableStream } from 'stream'
import { BucketItemStat, ItemBucketMetadata } from 'minio'

import { HealthStatus } from '../health/types'

export interface IS3Client {
  statObject(objectName: string): Promise<BucketItemStat>
  getObject(objectName: string): Promise<ReadableStream>
  putObject(objectName: string, stream: ReadableStream, metaData?: ItemBucketMetadata): Promise<string>

  getHealthStatus(): HealthStatus
}
