import type { BucketItemStat } from 'minio'
import type { Stream } from 'stream'
import type { Request } from 'express'

import type { ProcessOptions, ProcessResult } from '../types'
import { ImageFormat } from '../types'

import { getCachedVersion, storeCachedVersion } from './cache'
import { buildTransformer, needsTransform } from './transformer'

// TODO: add a circuit breaker to image processing as well
export async function process(
  req: Request,
  opts: ProcessOptions,
  data: BucketItemStat,
  stream: Stream,
): Promise<ProcessResult> {
  const ctx: ProcessResult = {
    data,
    contentType: data.metaData['content-type'] || '',
    size: data.size,
    etag: data.etag,
    stream,
  }

  if (!isSupportedImageType(ctx)) {
    req.log.debug(
      {
        bucket: opts.bucket,
        objectName: opts.transformed,
        contentType: ctx.contentType,
      },
      'requested file is not a supported image type, do nothing',
    )

    return ctx
  }

  if (!needsTransform(opts)) {
    req.log.debug(
      {
        bucket: opts.bucket,
        objectName: opts.transformed,
        contentType: ctx.contentType,
      },
      'no transformations required, do nothing',
    )

    return ctx
  }

  const cached = await getCachedVersion(req, opts, ctx)
  if (cached) {
    return cached
  }

  const transformer = buildTransformer(req, opts)
  const contentType = buildResponseContentType(ctx, opts)

  const transformedStream = stream.pipe(transformer)

  storeCachedVersion(req, opts, transformedStream, contentType)

  let size: number | undefined = undefined
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

