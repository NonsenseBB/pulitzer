import type { Readable } from 'stream'
import type { Request } from 'express'

import { getClient } from '../s3'
import type { ProcessOptions, ProcessResult } from '../types'
import config from '../config'

export async function getCachedVersion(
  req: Request,
  opts: ProcessOptions,
  ctx: ProcessResult,
): Promise<ProcessResult> {
  try {
    const s3 = getClient(opts.bucket)

    const data = await s3.statObject(opts.transformed)
    const stream = await s3.getObject(opts.transformed)

    req.log.debug(
      {
        bucket: opts.bucket,
        objectName: opts.transformed,
      },
      'Cached version of the transformed file found, serving directly from storage',
    )

    return {
      ...ctx,
      size: data.size,
      contentType: data.metaData['content-type'] || '',
      stream,
    }
  } catch (err) {
    req.log.debug({ err }, 'Unable to fetch cached version, assuming it doesn\'t exist')
  }
}

export function storeCachedVersion(
  req: Request,
  opts: ProcessOptions,
  stream: Readable,
  contentType: string,
): void {
  if (!config.store_images) {
    return
  }

  const objectName = opts.transformed

  req.log.debug(
    {
      bucket: opts.bucket,
      objectName: opts.transformed,
      contentType,
    },
    'Will store file to object storage',
  )

  getClient(opts.bucket)
    .putObject(objectName, stream, { 'content-type': contentType })
    .then(() => req.log.debug(
      {
        bucket: opts.bucket,
        objectName: opts.transformed,
        contentType,
      },
      'File stored to object storage'),
    )
    .catch(err => req.log.warn(
      {
        bucket: opts.bucket,
        objectName: opts.transformed,
        contentType,
        err,
      },
      `Unable to save file`,
    ))
}
