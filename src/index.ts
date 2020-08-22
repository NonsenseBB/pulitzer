import express from 'express'

import config from './config'
import { parseURI } from './uri/parser'
import { getObject, statObject } from './s3/client'
import { process } from './image'
import { asAsyncRoute, withMethodFilter } from './utils/routes'
import { errorHandler, throwNotFoundError } from './utils/errors'
import withHealthCheck from './health'

const app = withHealthCheck(express())

app.disable('x-powered-by')

// uri format: <object_path>/__processed/ff-<png|webp|jpeg>/mw-<max_width>/<w>x<h>/_/<filename>
app.use(
  withMethodFilter(
    asAsyncRoute(
      async (req, res) => {
        const opts = parseURI(req.url)

        if (!opts) {
          throwNotFoundError()
        }

        const originalData = await statObject(opts.original)
        const dataStream = await getObject(opts.original)

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

// Error handler
app.use(errorHandler)

app.listen(
  config.http.port,
  () => console.log(`Listening on port ${config.http.port}`),
)
