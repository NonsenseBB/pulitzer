import { Express } from 'express'

import { HealthStatus } from './types'
import client from '../s3/client'

export default function withHealthCheck(app: Express): Express {
  // TODO: improve health check endpoint

  app.get('/__health', (req, res) => {
    const status = client.getHealthStatus()

    res
      .status(status === HealthStatus.UNHEALTHY ? 500 : 200)
      .send(status.toString())
  })

  return app
}
