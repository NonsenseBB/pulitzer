import type { ErrorRequestHandler } from 'express'

export interface NetworkError extends Error {
  code?: string
}

export function throwNotFoundError(msg = 'NotFound'): void {
  const err = new Error(msg) as NetworkError
  err.code = 'NotFound'
  throw err
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    if (err.code === 'NotFound') {
      req.log.debug({ err }, 'ErrorHandler: Not Found')
    } else {
      req.log.error({ err }, 'ErrorHandler: Error')
    }
    return
  }

  if (err.code === 'NotFound') {
    req.log.debug({ err }, 'ErrorHandler: NotFound')
    res.sendStatus(404)
    return
  }

  req.log.error({ err }, 'ErrorHandler: Error')
  res.sendStatus(500)
}
