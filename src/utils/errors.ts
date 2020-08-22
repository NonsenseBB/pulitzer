import { ErrorRequestHandler } from 'express'

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
      console.debug(err)
    } else {
      console.error(err)
    }
    return
  }

  if (err.code === 'NotFound') {
    res.sendStatus(404)
    return
  }

  console.error(err)
  res.sendStatus(500)
}
