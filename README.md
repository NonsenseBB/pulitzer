# pulitzer
Image resizing and format converting proxy

![CI](https://github.com/d3x7r0/pulitzer/workflows/CI/badge.svg?branch=master)

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

### Supported transforms

- `mw-<width>` - max width of `<width>` pixels
- `<width>x<height>` - resizes the image to a given `<width>` and `<height>`. If max width is enabled works as a ratio instead
- `ff-<format>` - converts the result to one of JPEG, PNG or WEBP
- `preview` - will blur and scale the image to provide a placeholder image (42x42px jpeg by default)
- `<fit>` - Allows the control of the "fit" of the image when resizing.
           Allowed values are `cover|contain|fill|inside|outside`. [For more info check Sharp's documentation](https://sharp.pixelplumbing.com/api-resize)

### Environment Variables

- `S3_ENDPOINT` - the endpoint to an S3 compatible object storage system. Defaults to `http://s3.amazonaws.com`
- `S3_BUCKET` - the bucket to use (required).
- `S3_REGION` - the region to use in Amazon S3.
- `S3_ACCESS_KEY` - The access key to use to access the object storage system (required).
- `S3_SECRET_KEY` - The secret key to use to access the object storage system (required).

- `HTTP_MAX_AGE` - The max age to use in the cache headers. Defaults to `31536000`
- `HTTP_PORT` - The http port to use. Defaults to `8080`
- `HTTP_PATH_SEPARATOR` - The separator string to use in the beginning of the settings bit of the url. Defaults to `__processed`

- `STORE_IMAGES` - Flag to toggle storing of transformed images to the object storage system. Defaults to `true`
