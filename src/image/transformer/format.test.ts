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
        format: 'JPEG',
        formatOptions: { quality: 40 },
      })
    })

    Object.keys(ImageFormat).forEach(format => {
      const isOriginal = format === ImageFormat.ORIGINAL

      it(`Returns correct result when format is "${format.toString()}"`, () => {
        const result = buildFormatOptions(
          buildSettings({ format }),
        )

        expect(result).toEqual({
          format: isOriginal ? undefined : format.toString(),
          formatOptions: undefined,
        })
      })

      it(`Returns correct format when preview and format is ${format.toString()}`, () => {
        const result = buildFormatOptions(
          buildSettings({ preview: true, format }),
        )

        expect(result).toEqual({
          format: isOriginal ? 'JPEG' : format.toString(),
          formatOptions: isOriginal ? { quality: 40 } : undefined,
        })
      })
    })
  })
})
