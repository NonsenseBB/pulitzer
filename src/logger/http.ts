import type { Express } from 'express'
import { ulid } from 'ulid'
import pinoHttp from 'pino-http'
import URL from 'fast-url-parser'

import { HEALTH_ENDPOINT } from '../health'

import logger from './index'

export function withLogger(app: Express): Express {
  app.use(
    pinoHttp({
      logger,
      genReqId: () => ulid(),
      autoLogging: {
        ignore: (req) => HEALTH_ENDPOINT === URL.parse(req.url).pathname
      }
    })
  )

  return app
}
