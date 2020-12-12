import express from 'express'

import config from './config'
import { errorHandler } from './utils/errors'
import withHealthCheck from './health'
import withTransformRoute from './transform'

if (!config.s3.bucket && config.s3.allowedBuckets.length === 0) {
  throw new Error('Missing S3_BUCKET or S3_ALLOWED_BUCKETS environment variable')
}

console.debug('Allowed buckets', config.s3.allowedBuckets)

const app = withTransformRoute(
  withHealthCheck(
    express(),
  ),
)

app.disable('x-powered-by')

// Error handler
app.use(errorHandler)

app.listen(
  config.http.port,
  () => console.log(`Listening on port ${config.http.port}`),
)
