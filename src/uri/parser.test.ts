import { parseURI } from './parser'
import { FitEnum, ImageFormat, ProcessOptions } from '../types'

describe('parseURI()', () => {
  it('parses a URI without settings correctly', () => {
    const result = parseURI('/uploads/2020/02/picture.jpg')

    expect(result).toEqual({
      transformed: 'uploads/2020/02/picture.jpg',
      original: 'uploads/2020/02/picture.jpg',
      settings: {
        format: ImageFormat.ORIGINAL,
        fit: FitEnum.COVER,
        preview: false,
      },
    } as ProcessOptions)
  })

  it('parses URIs with settings at the start correctly', () => {
    const result = parseURI('/__processed/mw-670/ff-webp/contain/4x3/_/uploads/2020/02/picture.jpg')

    expect(result).toEqual({
      transformed: '__processed/mw-670/ff-webp/contain/4x3/_/uploads/2020/02/picture.jpg',
      original: 'uploads/2020/02/picture.jpg',
      settings: {
        format: ImageFormat.WEBP,
        fit: FitEnum.CONTAIN,
        maxWidth: 670,
        width: 4,
        height: 3,
        preview: false,
      },
    } as ProcessOptions)
  })

  it('parses URIs with settings in the middle correctly', () => {
    const result = parseURI('/uploads/2020/02/__processed/preview/ff-webp/fill/1024x768/_/picture.jpg')

    expect(result).toEqual({
      transformed: 'uploads/2020/02/__processed/preview/ff-webp/fill/1024x768/_/picture.jpg',
      original: 'uploads/2020/02/picture.jpg',
      settings: {
        format: ImageFormat.WEBP,
        fit: FitEnum.FILL,
        width: 1024,
        height: 768,
        preview: true,
      },
    } as ProcessOptions)
  })

  it('ignores unknown setting', () => {
    const result = parseURI('/uploads/2020/02/__processed/foo/ff-webp/fill/1024x768/_/picture.jpg')

    expect(result).toEqual({
      transformed: 'uploads/2020/02/__processed/foo/ff-webp/fill/1024x768/_/picture.jpg',
      original: 'uploads/2020/02/picture.jpg',
      settings: {
        format: ImageFormat.WEBP,
        fit: FitEnum.FILL,
        width: 1024,
        height: 768,
        preview: false,
      },
    } as ProcessOptions)
  })

  it('ignores double slashes in settings', () => {
    const result = parseURI('/uploads/2020/02/__processed//ff-webp/fill/1024x768/_/picture.jpg')

    expect(result).toEqual({
      transformed: 'uploads/2020/02/__processed//ff-webp/fill/1024x768/_/picture.jpg',
      original: 'uploads/2020/02/picture.jpg',
      settings: {
        format: ImageFormat.WEBP,
        fit: FitEnum.FILL,
        width: 1024,
        height: 768,
        preview: false,
      },
    } as ProcessOptions)
  })

  it('falls back to full path when no setting is valid', () => {
    const result = parseURI('/uploads/2020/02/__processed/foo/bar/_/picture.jpg')

    expect(result).toEqual({
      transformed: 'uploads/2020/02/__processed/foo/bar/_/picture.jpg',
      original: 'uploads/2020/02/__processed/foo/bar/_/picture.jpg',
      settings: {
        format: ImageFormat.ORIGINAL,
        fit: FitEnum.COVER,
        preview: false,
      },
    } as ProcessOptions)
  })
})
