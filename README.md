# Pulitzer
Image resizing and format converting proxy (powered by [sharp](https://github.com/lovell/sharp))

[![Docker Hub](https://img.shields.io/docker/v/nonsensebb/pulitzer?label=Docker&logo=docker&sort=semver&style=for-the-badge)](https://hub.docker.com/r/nonsensebb/pulitzer/)

## What it does
Pulitzer proxies all requests to an S3 compatible backend and adds some magic when some magic parameters are passed in the url.

Example:
> http://my-image-host.example.com/__processed/4x3/mw-760/ff-webp/_/uploads/2020/01/picture.jpg

Will proxy to
> s3://my-configured-bucket/uploads/2020/01/picture.jpg

and apply a 4x3 crop with a max width of 760px while also converting the file format to WebP.
It will also store the converted file to S3 with the same path as the url:
> s3://my-configured-bucket/__processed/4x3/mw-760/ff-webp/_/uploads/2020/01/picture.jpg

This allows the file to be served from S3 afterwards.

### Multi-bucket mode

If Pulitzer is running in multi-bucket mode (enabled by setting the `S3_ALLOWED_BUCKETS` instead of the `S3_BUCKET` env variable) the bucket to use will be inferred from the hostname. So:
> http://my-image-host.example.com/__processed/4x3/mw-760/ff-webp/_/uploads/2020/01/picture.jpg

Will proxy to:
> s3://my-image-host.example.com/uploads/2020/01/picture.jpg

While:
> http://another-image-host.example.com/__processed/4x3/mw-760/ff-webp/_/uploads/2020/01/picture.jpg

Will proxy to:
> s3://another-image-host.example.com/uploads/2020/01/picture.jpg

### Supported transforms

- `mw-<width>` - max width of `<width>` pixels
- `<width>x<height>` - resizes the image to a given `<width>` and `<height>`. If max width is enabled works as a ratio instead
- `ff-<format>` - converts the result to one of JPEG, PNG, WEBP or (optionally) AVIF
- `preview` - will blur and scale the image to provide a placeholder image (42x42px jpeg by default)
- `<fit>` - Allows the control of the "fit" of the image when resizing. Allowed values are `cover|contain|fill|inside|outside`. [For more info check Sharp's documentation](https://sharp.pixelplumbing.com/api-resize)

### Health check

The application also exposes an `/__health` endpoint you can use to check if the service is working or not.
When too many requests to object storage fail a circuit breaker will open and requests will be refused for a configurable amount of time to avoid cascading failures.

### Example

You can check an example of how to use pulitzer at [examples/docker-compose](./examples/docker-compose)

## Configuration

You can configure the app using either a `.env` file or environment variables. The available settings are as follows:

### Logging
- `LOG_LEVEL` - the log level to run the application at. (defaults to `info`. Available values are: `'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'`)

### Object storage (S3) config
- `S3_ENDPOINT` - The endpoint to an S3 compatible object storage system. Defaults to `http://s3.amazonaws.com`
- `S3_BUCKET` - The bucket to use (optional, if set it overrides the S3_ALLOWED_BUCKETS option).
- `S3_REGION` - The region to use for Amazon S3.
- `S3_ACCESS_KEY` - The access key to use in order to access the object storage system (required).
- `S3_SECRET_KEY` - The secret key to use in order to access the object storage system (required).
- `S3_ALLOWED_BUCKETS` - list of S3 buckets allowed when in multi-bucket mode. Bucket to use will be inferred from the hostname.

### HTTP Server config
- `HTTP_MAX_AGE` - The max age to use in the cache headers. Defaults to `31536000`
- `HTTP_PORT` - The http port to use. Defaults to `8080`
- `HTTP_PATH_SEPARATOR` - The separator string to use in the beginning of the settings bit of the url. Defaults to `__processed`

### Image processing config
- `STORE_IMAGES` - Flag to toggle storing of transformed images to the object storage system. Defaults to `true`
- `SHOW_TRANSFORMED_HEADER` - Flag to enable showing a custom `X-Pulitzer-Transformed` header when image is transformed by pulitzer. Defaults to `false`
- `PROCESSING_TIMEOUT` - Establish a processing limit for transformations (in seconds). Defaults to infinity

### Health check config
- `CIRCUIT_BREAKER_ENABLED` - Enable or disable the circuit breaker. Defaults to `true`
- `CIRCUIT_BREAKER_TIMEOUT` - The time in milliseconds that action should be allowed to execute before timing out. Timeout can be disabled by setting this to false. Defaults 10000 (10 seconds)
- `CIRCUIT_BREAKER_RESET_TIMEOUT` - The time in milliseconds to wait before setting the breaker to halfOpen state, and trying the action again. Defaults to 30000 (30 seconds)
- `CIRCUIT_BREAKER_ERROR_PERCENTAGE_THRESHOLD` - The error percentage at which to open the circuit and start short-circuiting requests to fallback. Defaults to 50 (50%)

### AVIF support
- `ENABLE_AVIF_SUPPORT` - Enable AVIF support. This is currently experimental due to performance concerns.
