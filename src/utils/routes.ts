import type { RequestHandler } from 'express'

export function withMethodFilter(
  route: RequestHandler,
  allowedMethods: string[],
): RequestHandler {
  return (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
      // method not allowed
      res.statusCode = 405
      res.setHeader('Allow', 'GET, HEAD')
      res.setHeader('Content-Length', '0')
      res.end()
      return
    }

    return route(req, res, next)
  }
}

export function asAsyncRoute(route: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise
      .resolve(route(req, res, next))
      // eslint-disable-next-line promise/no-callback-in-promise
      .catch(next)
  }
}
