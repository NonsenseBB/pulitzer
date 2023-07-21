import type { ProcessOptions, ProcessSettings } from '../../types'
import { ImageFormat } from '../../types'

export function buildOptions(opts: Partial<ProcessOptions>, settings?: Partial<ProcessSettings>): ProcessOptions {
  return {
    bucket: '',
    original: '',
    transformed: '',
    ...opts,
    settings: buildSettings(settings),
  }
}

export function buildSettings(settings?: Partial<ProcessSettings>): ProcessSettings {
  return {
    preview: false,
    format: ImageFormat.ORIGINAL,
    fit: 'cover',
    ...settings,
  }
}
