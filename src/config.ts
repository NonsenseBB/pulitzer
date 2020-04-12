/* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/camelcase */
require('dotenv').config()

const { ConnectionString } = require('connection-string')

const DEFAULT_HTTP_PORT = 8080
const DEFAULT_S3_ENDPOINT = 's3.amazonaws.com'
const DEFAULT_HTTP_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const DEFAULT_PATH_SEPARATOR = '__processed'

const connection = new ConnectionString(process.env.S3_ENDPOINT || DEFAULT_S3_ENDPOINT)

const pathSeparator = (process.env.HTTP_PATH_SEPARATOR || DEFAULT_PATH_SEPARATOR)
  .replace(/\/$/g, ' ') // remove trailing slash

export default {
  store_images: Boolean(process.env.STORE_IMAGES || 'true'),
  s3: {
    endPoint: connection.hostname,
    port: connection.port as number | undefined,
    useSSL: connection.schema === 'https',
    bucket: process.env.S3_BUCKET as string | undefined,
    region: process.env.S3_REGION as string | undefined,
    accessKey: process.env.S3_ACCESS_KEY as string,
    secretKey: process.env.S3_SECRET_KEY as string,
  },
  http: {
    port: (process.env.HTTP_PORT || DEFAULT_HTTP_PORT) as number,
    max_age: (process.env.HTTP_MAX_AGE || DEFAULT_HTTP_MAX_AGE) as number,
    path_separator: pathSeparator as string,
  },
}
