import { FitEnum, ImageFormat, ProcessOptions } from '../types'

import { parseURI } from './parser'

describe('parseURI()', () => {
  it('parses a hostname to be lowercase', () => {
    const result = parseURI('EXAMPLE.com', '/uploads/2020/02/picture.jpg')

    expect(result).toEqual({
      bucket: 'example.com',
      transformed: 'uploads/2020/02/picture.jpg',
      original: 'uploads/2020/02/picture.jpg',
      settings: {
        format: ImageFormat.ORIGINAL,
        fit: FitEnum.COVER,
        preview: false,
      },
    } as ProcessOptions)
  })

  it('parses a URI without settings correctly', () => {
    const result = parseURI('example.com', '/uploads/2020/02/picture.jpg')

    expect(result).toEqual({
      bucket: 'example.com',
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
    const result = parseURI('example.com', '/__processed/mw-670/ff-webp/contain/4x3/_/uploads/2020/02/picture.jpg')

    expect(result).toEqual({
      bucket: 'example.com',
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
    const result = parseURI('example.com', '/uploads/2020/02/__processed/preview/ff-webp/fill/1024x768/_/picture.jpg')

    expect(result).toEqual({
      bucket: 'example.com',
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

  it('parses URIs with WebP format correctly', () => {
    const result = parseURI('example.com', '/uploads/2020/02/__processed/preview/ff-webp/fill/1024x768/_/picture.jpg')

    expect(result).toEqual({
      bucket: 'example.com',
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

  it('parses URIs with JPG format correctly', () => {
    const result = parseURI('example.com', '/uploads/2020/02/__processed/preview/ff-jpg/fill/1024x768/_/picture.jpg')

    expect(result).toEqual({
      bucket: 'example.com',
      transformed: 'uploads/2020/02/__processed/preview/ff-jpg/fill/1024x768/_/picture.jpg',
      original: 'uploads/2020/02/picture.jpg',
      settings: {
        format: ImageFormat.JPEG,
        fit: FitEnum.FILL,
        width: 1024,
        height: 768,
        preview: true,
      },
    } as ProcessOptions)
  })

  it('parses URIs with JPEG format correctly', () => {
    const result = parseURI('example.com', '/uploads/2020/02/__processed/preview/ff-jpeg/fill/1024x768/_/picture.jpeg')

    expect(result).toEqual({
      bucket: 'example.com',
      transformed: 'uploads/2020/02/__processed/preview/ff-jpeg/fill/1024x768/_/picture.jpeg',
      original: 'uploads/2020/02/picture.jpeg',
      settings: {
        format: ImageFormat.JPEG,
        fit: FitEnum.FILL,
        width: 1024,
        height: 768,
        preview: true,
      },
    } as ProcessOptions)
  })

  it('parses URIs with PNG format correctly', () => {
    const result = parseURI('example.com', '/uploads/2020/02/__processed/preview/ff-png/fill/1024x768/_/picture.png')

    expect(result).toEqual({
      bucket: 'example.com',
      transformed: 'uploads/2020/02/__processed/preview/ff-png/fill/1024x768/_/picture.png',
      original: 'uploads/2020/02/picture.png',
      settings: {
        format: ImageFormat.PNG,
        fit: FitEnum.FILL,
        width: 1024,
        height: 768,
        preview: true,
      },
    } as ProcessOptions)
  })

  it('parses URIs with AVIF format correctly', () => {
    const result = parseURI('example.com', '/uploads/2020/02/__processed/preview/ff-avif/fill/1024x768/_/picture.avif')

    expect(result).toEqual({
      bucket: 'example.com',
      transformed: 'uploads/2020/02/__processed/preview/ff-avif/fill/1024x768/_/picture.avif',
      original: 'uploads/2020/02/picture.avif',
      settings: {
        format: ImageFormat.AVIF,
        fit: FitEnum.FILL,
        width: 1024,
        height: 768,
        preview: true,
      },
    } as ProcessOptions)
  })

  it('ignores unknown setting', () => {
    const result = parseURI('example.com', '/uploads/2020/02/__processed/foo/ff-webp/fill/1024x768/_/picture.jpg')

    expect(result).toEqual({
      bucket: 'example.com',
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
    const result = parseURI('example.com', '/uploads/2020/02/__processed//ff-webp/fill/1024x768/_/picture.jpg')

    expect(result).toEqual({
      bucket: 'example.com',
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
    const result = parseURI('example.com', '/uploads/2020/02/__processed/foo/bar/_/picture.jpg')

    expect(result).toEqual({
      bucket: 'example.com',
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
