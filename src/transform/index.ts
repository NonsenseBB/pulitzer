import { Express } from 'express'

import { asAsyncRoute, withMethodFilter } from '../utils/routes'
import { validateBucket } from '../utils/validation'
import { parseURI } from '../uri/parser'
import { throwNotFoundError } from '../utils/errors'
import { getClient } from '../s3'
import { process } from '../image'
import config from '../config'

export default function withTransformRoute(app: Express): Express {
  // uri format: <object_path>/__processed/ff-<png|webp|jpeg>/mw-<max_width>/<w>x<h>/_/<filename>
  app.use(
    withMethodFilter(
      asAsyncRoute(
        async (req, res) => {
          const opts = validateBucket(
            config.s3,
            parseURI(req.hostname, req.url),
          )

          if (!opts) {
            throwNotFoundError()
          }

          const s3 = getClient(opts.bucket)

          const originalData = await s3.statObject(opts.original)
          const dataStream = await s3.getObject(opts.original)

          const ctx = await process(opts, originalData, dataStream)

          const {
            data,
            transformed,
            stream,
            contentType,
            etag,
            size,
          } = ctx

          if (config.show_transformed_header) {
            res.setHeader('X-Pulitzer-Transformed', transformed ? 'TRUE' : 'FALSE')
          }

          if (etag) {
            res.setHeader('ETag', etag)
          }

          if (size) {
            res.setHeader('Content-Length', size.toString())
          }

          if (contentType) {
            res.setHeader('Content-Type', contentType)
          }

          res.setHeader('Cache-Control', `public, max-age=${config.http.max_age}`)
          res.setHeader('Last-Modified', data.lastModified.toISOString())

          Object.entries(data.metaData)
            .filter(item => item[0] !== 'content-type')
            .forEach((entry) => {
              res.setHeader(entry[0], entry[1])
            })

          stream.pipe(res)
        },
      ),
      ['GET', 'HEAD'],
    ),
  )

  return app
}
