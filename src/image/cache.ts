import { Readable } from 'stream'

import { getObject, putObject, statObject } from '../s3/client'
import { ProcessOptions, ProcessResult } from '../types'
import config from '../config'

export async function getCachedVersion(opts: ProcessOptions, ctx: ProcessResult): Promise<ProcessResult> {
  try {
    const data = await statObject(opts.transformed)
    const stream = await getObject(opts.transformed)

    console.debug(
      'Cached version of the transformed file found, serving directly from storage',
      { objectName: opts.transformed },
    )

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

export function storeCachedVersion(objectName: string, stream: Readable, contentType: string): void {
  if (!config.store_images) {
    return
  }

  console.debug('Will store file to object storage', { objectName, contentType })

  putObject(objectName, stream, { 'content-type': contentType })
    .then(() => console.debug('File stored to object storage', { objectName, contentType }))
    .catch(err => console.warn(`Unable to save file ${objectName}`, err))
}
