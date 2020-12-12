import { BucketItemStat } from 'minio'
import { Stream } from 'stream'

import { ImageFormat, ProcessOptions, ProcessResult } from '../types'

import { getCachedVersion, storeCachedVersion } from './cache'
import { buildTransformer, needsTransform } from './transformer'

// TODO: add a circuit breaker to image processing as well
export async function process(opts: ProcessOptions, data: BucketItemStat, stream: Stream): Promise<ProcessResult> {
  const ctx: ProcessResult = {
    data,
    contentType: data.metaData['content-type'] || '',
    size: data.size,
    etag: data.etag,
    stream,
  }

  if (!isSupportedImageType(ctx)) {
    console.debug(
      'requested file is not a supported image type, do nothing',
      {
        bucket: opts.bucket,
        objectName: opts.transformed,
        contentType: ctx.contentType,
      },
    )

    return ctx
  }

  if (!needsTransform(opts)) {
    console.debug(
      'no transformations required, do nothing',
      {
        bucket: opts.bucket,
        objectName: opts.transformed,
        contentType: ctx.contentType,
      },
    )

    return ctx
  }

  const cached = await getCachedVersion(opts, ctx)
  if (cached) {
    return cached
  }

  const transformer = buildTransformer(opts)
  const contentType = buildResponseContentType(ctx, opts)

  const transformedStream = stream.pipe(transformer)

  storeCachedVersion(opts, transformedStream, contentType)

  let size: number = undefined
  transformer.on('info', info => size = info.size)

  return {
    ...ctx,
    contentType,
    size,
    transformed: true,
    etag: undefined,
    stream: transformedStream,
  }
}

function isSupportedImageType(ctx: ProcessResult) {
  // TODO: support GIF when Sharp is updated to add support
  return ctx.contentType.startsWith('image/') && ctx.contentType !== 'image/gif'
}

function buildResponseContentType(ctx: ProcessResult, opts: ProcessOptions): string {
  const { settings } = opts

  if (settings.format !== ImageFormat.ORIGINAL) {
    const format = settings.format.toString().toLowerCase()
    return `image/${format}`
  }

  if (settings.preview) {
    return `image/jpg`
  }

  return ctx.contentType
}

