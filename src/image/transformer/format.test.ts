import { describe, it, expect } from 'vitest'

import { buildSettings } from '../../utils/test/types'
import { ImageFormat } from '../../types'

import { buildFormatOptions } from './format'

describe('image/transformer/format', () => {
  describe('buildFormatOptions', () => {
    it('Returns correct format when preview', () => {
      const result = buildFormatOptions(
        buildSettings({ preview: true }),
      )

      expect(result).toEqual({
        format: 'jpeg',
        formatOptions: { quality: 40 },
      })
    })

    Object.values(ImageFormat).forEach((format) => {
      const isOriginal = format === ImageFormat.ORIGINAL

      it(`Returns correct result when format is "${format.toString()}"`, () => {
        const result = buildFormatOptions(
          buildSettings({ format }),
        )

        expect(result).toEqual({
          format: isOriginal ? undefined : format.toString().toLowerCase(),
          formatOptions: undefined,
        })
      })

      it(`Returns correct format when preview and format is ${format.toString()}`, () => {
        const result = buildFormatOptions(
          buildSettings({ preview: true, format }),
        )

        expect(result).toEqual({
          format: isOriginal ? 'jpeg' : format.toString().toLowerCase(),
          formatOptions: isOriginal ? { quality: 40 } : undefined,
        })
      })
    })
  })
})
