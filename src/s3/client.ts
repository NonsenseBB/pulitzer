import { Stream } from 'stream'
import { BucketItemStat, Client, ItemBucketMetadata } from 'minio'

import config from '../config'

const client = new Client(config.s3)

export function statObject(objectName): Promise<BucketItemStat> {
  return client.statObject(config.s3.bucket, objectName)
}

export function getObject(objectName): Promise<Stream> {
  return client.getObject(config.s3.bucket, objectName)
}

export function putObject(objectName: string, stream: Stream, metaData?: ItemBucketMetadata): Promise<string> {
  return client.putObject(config.s3.bucket, objectName, stream, metaData)
}
