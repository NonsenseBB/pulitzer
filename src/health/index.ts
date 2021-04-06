import type { Express } from 'express'

import { getHealthStatus } from '../s3'

import { HealthStatus } from './types'

export const HEALTH_ENDPOINT = '/__health'

export default function withHealthCheck(app: Express): Express {
  // TODO: improve health check endpoint

  app.get(HEALTH_ENDPOINT, (req, res) => {
    const result = getHealthStatus()

    const details = Array.from(result.details.entries())
      .reduce((memo, [bucketName, status]) => ({
        ...memo,
        [bucketName]: status,
      }), {})

    res
      .status(result.status === HealthStatus.UNHEALTHY ? 500 : 200)
      .send({
        status: result.status,
        details: {
          buckets: details,
        },
      })
  })

  return app
}
