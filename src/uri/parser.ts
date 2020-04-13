import { URL } from 'url'

import config from '../config'
import {
  FitEnum,
  FitEnumFromString,
  ImageFormat,
  ImageFormatFromString,
  ProcessOptions,
  ProcessSettings,
} from '../types'

const MAX_WIDTH_REGEX = /mw-(\d+)/i
const FORMAT_REGEX = /ff-(png|webp|jpeg|jpg)/i
const SIZE_REGEX = /(\d+)x(\d+)/i
const FIT_REGEX = /(cover|contain|fill|inside|outside)/i
const PREVIEW_PARAM = 'preview'

const URI_PARSE_REGEX = new RegExp(
  `(.*)/${config.http.path_separator.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}/(.*)/_/(.*)`,
)

export function parseURI(uri): ProcessOptions | undefined {
  const pathname = (new URL(uri, 'http://0.0.0.0')).pathname

  const objectName = pathname.replace(/^\//, '') // remove leading slash

  const parts = pathname.match(URI_PARSE_REGEX)

  const result: ProcessOptions = {
    transformed: pathname.replace(/^\//, ''), // remove leading slash
    original: objectName,
    settings: {
      format: ImageFormat.ORIGINAL,
      fit: FitEnum.COVER,
      preview: false,
    },
  }

  if (!parts) {
    return result
  }

  const original = `${parts[1]}/${parts[3]}`.replace(/^\//, '') // remove leading slash
  const settingsStr = parts[2].split('/').filter(item => !!item)

  let hasSettings = false
  const settings: ProcessSettings = settingsStr.reduce(
    (memo, entry) => {
      let res: ProcessSettings = memo

      if (entry.match(MAX_WIDTH_REGEX)) {
        const maxWidth = parseInt(
          entry.match(MAX_WIDTH_REGEX)[1],
        )

        if (maxWidth) {
          hasSettings = true
          res = { ...res, maxWidth }
        }
      }

      if (entry.match(FORMAT_REGEX)) {
        const format = ImageFormatFromString(
          entry.match(FORMAT_REGEX)[1],
        )

        if (format) {
          hasSettings = true
          res = { ...res, format }
        }
      }

      if (entry.match(SIZE_REGEX)) {
        const parts = entry.match(SIZE_REGEX)

        if (parts) {
          const width = parseInt(parts[1], 10)
          const height = parseInt(parts[2], 10)

          if (width && height) {
            hasSettings = true
            res = { ...res, width, height }
          }
        }
      }

      if (entry.match(FIT_REGEX)) {
        const fit = FitEnumFromString(entry.match(FIT_REGEX)[1])

        if (fit) {
          hasSettings = true
          res = { ...res, fit }
        }
      }

      if (entry.trim().toLowerCase() === PREVIEW_PARAM) {
        hasSettings = true
        res = { ...res, preview: true }
      }

      return res
    },
    result.settings,
  )

  // TODO: error out instead of fallback?
  if (!hasSettings) {
    // Missing or unknown options, fallback
    return result
  }

  return {
    ...result,
    original,
    settings,
  }
}
