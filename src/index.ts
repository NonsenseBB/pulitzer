import type { Express } from 'express'
import express from 'express'

import config from './config'
import logger from './logger'
import { errorHandler } from './utils/errors'
import withHealthCheck from './health'
import withTransformRoute from './transform'
import { withLogger } from './logger/http'

if (!config.s3.bucket && config.s3.allowedBuckets.length === 0) {
  throw new Error('Missing S3_BUCKET or S3_ALLOWED_BUCKETS environment variable')
}

logger.debug({ buckets: config.s3.allowedBuckets }, 'Allowed buckets')

let app: Express

app = express()
app = withLogger(app)
app = withHealthCheck(app)
app = withTransformRoute(app)

app.disable('x-powered-by')

// Error handler
app.use(errorHandler)

app.listen(
  config.http.port,
  () => logger.info(`Listening on port ${config.http.port}`),
)
