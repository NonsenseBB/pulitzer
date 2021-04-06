import type { Express } from 'express'
import { ulid } from 'ulid'
import pinoHttp from 'pino-http'

import { HEALTH_ENDPOINT } from '../health'

import logger from './index'

export function withLogger(app: Express): Express {
  app.use(pinoHttp({
    logger,
    genReqId: () => ulid(),
    autoLogging: {
      ignorePaths: [
        HEALTH_ENDPOINT
      ]
    }
  }))

  return app
}
