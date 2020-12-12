import { Express } from 'express'

import { getHealthStatus } from '../s3'

import { HealthStatus } from './types'

export default function withHealthCheck(app: Express): Express {
  // TODO: improve health check endpoint

  app.get('/__health', (req, res) => {
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
