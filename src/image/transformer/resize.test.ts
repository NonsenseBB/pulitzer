import sharp from 'sharp'

import { buildSettings } from '../../utils/test/types'

import { buildResizeOptions } from './resize'

describe('image/transformer/resize', () => {
  describe('buildResizeOptions', () => {
    it('returns correct settings for a preview image', () => {
      const result = buildResizeOptions(
        buildSettings({ preview: true }),
      )

      expect(result).toEqual({
        width: 42,
        height: 42,
        fit: sharp.fit.inside,
        kernel: sharp.kernel.nearest,
        withoutEnlargement: true,
      })
    })

    it('returns correct settings for a max width image', () => {
      const result = buildResizeOptions(
        buildSettings({ maxWidth: 1024 }),
      )

      expect(result).toEqual({
        width: 1024,
        withoutEnlargement: true,
      })
    })

    it('returns correct settings for an image with set width', () => {
      const result = buildResizeOptions(
        buildSettings({ width: 800 }),
      )

      expect(result).toEqual({
        width: 800,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
        withoutEnlargement: true,
      })
    })

    it('returns correct settings for an image with set width and height', () => {
      const result = buildResizeOptions(
        buildSettings({ width: 800, height: 600 }),
      )

      expect(result).toEqual({
        width: 800,
        height: 600,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
        withoutEnlargement: true,
      })
    })

    it('returns correct settings for an image with max width and set width and height', () => {
      const result = buildResizeOptions(
        buildSettings({ width: 800, height: 600, maxWidth: 400 }),
      )

      expect(result).toEqual({
        width: 400,
        height: 300,
        fit: sharp.fit.cover,
        position: sharp.strategy.attention,
        withoutEnlargement: true,
      })
    })

    it('returns correct settings for a preview image with max width', () => {
      const result = buildResizeOptions(
        buildSettings({ preview: true, maxWidth: 420 }),
      )

      expect(result).toEqual({
        width: 420,
        height: 420,
        fit: sharp.fit.inside,
        kernel: sharp.kernel.nearest,
        withoutEnlargement: true,
      })
    })

    it('returns correct settings for a preview image with set width', () => {
      const result = buildResizeOptions(
        buildSettings({ preview: true, width: 420 }),
      )

      expect(result).toEqual({
        width: 420,
        height: 420,
        fit: sharp.fit.inside,
        kernel: sharp.kernel.nearest,
        position: sharp.strategy.attention,
        withoutEnlargement: true,
      })
    })

    it('returns correct settings for a preview image with set width and height', () => {
      const result = buildResizeOptions(
        buildSettings({ preview: true, width: 800, height: 600 }),
      )

      expect(result).toEqual({
        width: 800,
        height: 600,
        fit: sharp.fit.inside,
        kernel: sharp.kernel.nearest,
        position: sharp.strategy.attention,
        withoutEnlargement: true,
      })
    })

    it('returns correct settings for a preview image with set ratio', () => {
      const result = buildResizeOptions(
        buildSettings({ preview: true, width: 4, height: 3 }),
      )

      expect(result).toEqual({
        width: 42,
        height: 31,
        fit: sharp.fit.inside,
        kernel: sharp.kernel.nearest,
        position: sharp.strategy.attention,
        withoutEnlargement: true,
      })
    })

    it('returns correct settings for a preview image with set ratio and max width', () => {
      const result = buildResizeOptions(
        buildSettings({ preview: true, width: 4, height: 3, maxWidth: 420 }),
      )

      expect(result).toEqual({
        width: 420,
        height: 310,
        fit: sharp.fit.inside,
        kernel: sharp.kernel.nearest,
        position: sharp.strategy.attention,
        withoutEnlargement: true,
      })
    })
  })
})
