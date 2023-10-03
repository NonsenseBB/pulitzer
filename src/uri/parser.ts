import { URL } from 'url'

import config from '../config'
import type { ProcessOptions } from '../types'
import {
  FitEnumFromString,
  ImageFormat,
  ImageFormatFromString,
} from '../types'

const MAX_WIDTH_REGEX = /mw-(\d+)/i
const FORMAT_REGEX = /ff-(png|webp|jpeg|jpg|avif)/i
const SIZE_REGEX = /(\d+)x(\d+)/i
const QUALITY_REGEX = /q-(\d+)/i
const FIT_REGEX = /(cover|contain|fill|inside|outside)/i
const PREVIEW_PARAM = 'preview'

const URI_PARSE_REGEX = new RegExp(
  `(.*)/${config.http.path_separator.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}/(.*)/_/(.*)`,
)

export function parseURI(hostname: string, uri: string): ProcessOptions {
  const parsedUri = (new URL(uri, `http://${hostname}`))

  const objectName = parsedUri.pathname.replace(/^\//, '') // remove leading slash
  const parts = parsedUri.pathname.match(URI_PARSE_REGEX)

  const result: ProcessOptions = {
    bucket: parsedUri.hostname.toLowerCase(),
    transformed: decodeURIComponent(parsedUri.pathname.replace(/^\//, '')), // remove leading slash
    original: decodeURIComponent(objectName),
    settings: {
      format: ImageFormat.ORIGINAL,
      fit: 'cover',
      preview: false,
    },
  }

  if (!parts) {
    return result
  }

  const original = `${parts[1]}/${parts[3]}`.replace(/^\//, '') // remove leading slash
  const settingsStr = parts[2].split('/').filter(item => !!item)

  let hasSettings = false

  for (const entry of settingsStr) {
    const maxWidthMatch = entry.match(MAX_WIDTH_REGEX)

    if (maxWidthMatch) {
      const maxWidth = parseInt(
        maxWidthMatch[1],
        10,
      )

      if (maxWidth) {
        result.settings.maxWidth = maxWidth
      }
    }

    const formatMatch = entry.match(FORMAT_REGEX)

    if (formatMatch) {
      const format = ImageFormatFromString(formatMatch[1])

      if (format) {
        hasSettings = true
        result.settings.format = format
      }
    }

    const sizeMatch = entry.match(SIZE_REGEX)

    if (sizeMatch) {
      const width = parseInt(sizeMatch[1], 10)
      const height = parseInt(sizeMatch[2], 10)

      if (width && height) {
        hasSettings = true
        result.settings.width = width
        result.settings.height = height
      }
    }

    const qualityMatch = entry.match(QUALITY_REGEX)

    if (qualityMatch) {
      const quality = parseInt(qualityMatch[1], 10)

      // TODO: return bad request for wrong settings
      if (quality && quality > 0 && quality <= 100) {
        hasSettings = true
        result.settings.quality = quality
      }
    }

    const fitMatch = entry.match(FIT_REGEX)

    if (fitMatch) {
      const fit = FitEnumFromString(fitMatch[1])

      if (fit) {
        hasSettings = true
        result.settings.fit = fit
      }
    }

    if (entry.trim().toLowerCase() === PREVIEW_PARAM) {
      hasSettings = true
      result.settings.preview = true
    }
  }

  if (hasSettings) {
    result.original = decodeURIComponent(original)
  }

  return result
}
