import { Client } from 'minio'

import { HealthStatus } from '../health/types'
import config from '../config'

import S3Client from './client'

const CLIENTS = new Map<string, S3Client>()

export function getClient(bucketName: string): S3Client {
  if (!bucketName) {
    throw new Error('Missing S3 bucket configuration')
  }

  let client = CLIENTS.get(bucketName)

  if (client) {
    return client
  }

  // TODO: circuit breaker opts
  client = new S3Client(new Client(config.s3), bucketName, config.circuitBreaker)

  CLIENTS.set(bucketName, client)

  return client
}

export function getHealthStatus(): { status: HealthStatus, details: Map<string, HealthStatus> } {
  const counts = {
    [HealthStatus.OK]: 0,
    [HealthStatus.DEGRADED]: 0,
    [HealthStatus.UNHEALTHY]: 0,
  }

  const details = new Map<string, HealthStatus>()

  for (const [bucketName, client] of CLIENTS.entries()) {
    const status = client.getHealthStatus()

    counts[status]++
    details.set(bucketName, status)
  }

  let status = HealthStatus.DEGRADED

  if (counts[HealthStatus.UNHEALTHY] === CLIENTS.size) {
    status = HealthStatus.UNHEALTHY
  }

  if (counts[HealthStatus.OK] === CLIENTS.size) {
    status = HealthStatus.OK
  }

  return {
    status,
    details,
  }
}
