import { BucketItemStat } from 'minio'
import { Stream } from 'stream'
import sharp, { ResizeOptions } from 'sharp'

import { ImageFormat, ProcessOptions, ProcessResult, ProcessSettings } from './types'
import { getObject, putObject, statObject } from './s3/client'
import config from './config'

function buildResizeOptions(settings: ProcessSettings): ResizeOptions | undefined {
  let resizeOptions: ResizeOptions = undefined

  if (settings.maxWidth) {
    resizeOptions = {
      ...resizeOptions,
      withoutEnlargement: true,
      width: settings.maxWidth,
    }
  }

  if (settings.width) {
    resizeOptions = {
      ...resizeOptions,
      withoutEnlargement: true,
      width: settings.width,
      height: settings.height,
      fit: sharp.fit[settings.fit.toString().toLowerCase()],
      position: sharp.strategy.attention, // TODO: allow control of this setting
    }
  }

  if (settings.maxWidth && settings.width) {
    resizeOptions = {
      ...resizeOptions,
      width: settings.maxWidth,
      height: Math.floor(settings.maxWidth * settings.height / settings.width),
    }
  }

  return resizeOptions
}

function storeTransformed(objectName, stream, contentType: string): void {
  console.debug('Will store file to object storage', { objectName, contentType })

  putObject(objectName, stream, { 'content-type': contentType })
    .then(() => console.debug('File stored to object storage', { objectName, contentType }))
    .catch(err => console.warn(`Unable to save file ${objectName}`, err))
}

// TODO: add a circuit breaker to image processing as well
export async function process(opts: ProcessOptions, data: BucketItemStat, stream: Stream): Promise<ProcessResult> {
  const ctx: ProcessResult = {
    data,
    contentType: data.metaData['content-type'] || '',
    size: data.size,
    etag: data.etag,
    stream,
  }

  // TODO: support GIF when Sharp is updated to add support
  const isSupportedImageType = ctx.contentType.startsWith('image/') && ctx.contentType !== 'image/gif'

  if (!isSupportedImageType) {
    console.debug(
      'requested file is not a supported image type, do nothing',
      { objectName: opts.transformed, contentType: ctx.contentType },
    )

    return ctx
  }

  const { settings } = opts
  const resizeOptions = buildResizeOptions(settings)

  if (!resizeOptions && settings.format === ImageFormat.ORIGINAL && !settings.preview) {
    console.debug(
      'no transformations required, do nothing',
      { objectName: opts.transformed, contentType: ctx.contentType },
    )

    return ctx
  }

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
  let transformer = sharp()

  if (settings.preview) {
    console.debug('Will generate preview', { objectName: opts.transformed })

    // TODO: allow configuration of default width and blur radius
    const o = resizeOptions || {
      width: 42,
      height: 42,
      withoutEnlargement: true,
    }

    transformer = transformer
      .blur(10.5) // sigma = 1 + radius / 2; radius = 20; sigma = 10.5
      .resize({
        fit: sharp.fit.inside,
        kernel: sharp.kernel.nearest,
        ...o,
      })
  } else if (resizeOptions) {
    console.debug('Will resize', { objectName: opts.transformed })
    transformer = transformer.resize(resizeOptions)
  }

  let contentType = ctx.contentType
  if (settings.format !== ImageFormat.ORIGINAL) {
    console.debug(
      'Will convert image format',
      { objectName: opts.transformed, format: settings.format },
    )

    const format = settings.format.toString().toLowerCase()
    contentType = `image/${format}`
    transformer = transformer.toFormat(format)
  } else if (settings.preview) {
    contentType = `image/jpg`
    transformer = transformer.jpeg({ quality: 40 })
  }

  const transformedStream = stream.pipe(transformer)

  if (config.store_images) {
    storeTransformed(opts.transformed, transformedStream, contentType)
  }

  let size: number = undefined
  transformer.on('info', info => size = info.size)

  return {
    ...ctx,
    contentType,
    size,
    etag: undefined,
    stream: transformedStream,
  }
}
