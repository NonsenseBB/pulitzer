import type { Express } from 'express'
import pinoHttp from 'pino-http'
import { randomUUID } from 'node:crypto'

import { HEALTH_ENDPOINT } from '../health'

import logger from './index'

export function withLogger(app: Express): Express {
  app.use(
    pinoHttp({
      logger,
      genReqId: () => randomUUID(),
      autoLogging: {
        ignore: (req) => {
          try {
            return HEALTH_ENDPOINT === new URL(req.url).pathname
          } catch (e) {
            return false
          }
        },
      },
    }),
  )

  return app
}
