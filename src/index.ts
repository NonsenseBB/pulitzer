import express from 'express'

import config from './config'
import { parseURI } from './uri/parser'
import { getObject, statObject } from './s3/client'
import { process } from './image'
import withHealthCheck from './health'

const app = withHealthCheck(express())

app.disable('x-powered-by')

// uri format: <object_path>/__processed/ff-<png|webp|jpeg>/mw-<max_width>/<w>x<h>/_/<filename>
app.use((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // method not allowed
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.setHeader('Content-Length', '0')
    res.end()
    return
  }

  const opts = parseURI(req.url)

  if (!opts) {
    res.sendStatus(404)
    return
  }

  statObject(opts.original)
    .then(data => Promise.all([
      data,
      getObject(opts.original)],
    ))
    .then(([data, dataStream]) => process(opts, data, dataStream))
    .then(ctx => {
      const { data, stream, contentType, etag, size } = ctx

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

      return
    })
    .catch(err => {
      if (res.headersSent) {
        if (err.code === 'NotFound') {
          console.debug(err)
        } else {
          console.error(err)
        }
        return
      }

      if (err.code === 'NotFound') {
        res.sendStatus(404)
        return
      }

      console.error(err)
      res.sendStatus(500)
    })
})

app.listen(
  config.http.port,
  () => console.log(`Listening on port ${config.http.port}`),
)
