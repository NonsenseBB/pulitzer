import { Readable } from 'stream'

import { getClient } from '../s3'
import { ProcessOptions, ProcessResult } from '../types'
import config from '../config'

export async function getCachedVersion(opts: ProcessOptions, ctx: ProcessResult): Promise<ProcessResult> {
  try {
    const s3 = getClient(opts.bucket)

    const data = await s3.statObject(opts.transformed)
    const stream = await s3.getObject(opts.transformed)

    console.debug('Cached version of the transformed file found, serving directly from storage', {
      bucket: opts.bucket,
      objectName: opts.transformed,
    })

    return {
      ...ctx,
      size: data.size,
      contentType: data.metaData['content-type'] || '',
      stream,
    }
  } catch (e) {
    if (e.code !== 'NotFound') {
      throw e
    }
  }
}

export function storeCachedVersion(
  opts: ProcessOptions,
  stream: Readable,
  contentType: string,
): void {
  if (!config.store_images) {
    return
  }

  const objectName = opts.transformed

  console.debug('Will store file to object storage', {
    bucket: opts.bucket,
    objectName: opts.transformed,
    contentType,
  })

  getClient(opts.bucket)
    .putObject(objectName, stream, { 'content-type': contentType })
    .then(() => console.debug('File stored to object storage', {
      bucket: opts.bucket,
      objectName: opts.transformed,
      contentType,
    }))
    .catch(err => console.warn(`Unable to save file`, {
      bucket: opts.bucket,
      objectName: opts.transformed,
      contentType,
      err,
    }))
}
