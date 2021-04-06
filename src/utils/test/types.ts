/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any */
import type { ProcessOptions, ProcessSettings } from '../../types'
import { FitEnum, ImageFormat } from '../../types'

export function buildOptions(opts: any, settings?: any): ProcessOptions {
  return {
    ...opts,
    settings: buildSettings(settings),
  }
}

export function buildSettings(settings: any): ProcessSettings {
  return {
    preview: false,
    format: ImageFormat.ORIGINAL,
    fit: FitEnum.COVER,
    ...settings,
  }
}
