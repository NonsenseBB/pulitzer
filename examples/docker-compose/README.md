# Pulitzer Docker Example

This is a simple sample project that shows off the intended deployment for Pulitzer.

### How to use

To see this example in action do:
```bash
$ docker-compose up
```

Then, open your browser and try some of the sample files:
 - http://localhost:8080/__processed/ff-webp/mw-768/16x9/_/image1.jpg
 - http://localhost:8080/__processed/ff-png/mw-768/preview/_/image2.jpg

If can also access minio to add other pictures using:
 - http://localhost:9000

and using the access key/secret combo:
 - username: my_access_key
 - password: my_secret_key

### How it works
There are 3 pieces of the puzzle here:

1. [Minio](https://github.com/minio/minio) is used as an S3 compatible object storage backend.
   You could just as easily have used Amazon S3 or any of the many compatible providers. Minio is used for simplicity.

2. [Nginx](https://nginx.org/en/) is used as a web server to completely bypass Pulitzer in the cases where the processed version is already in storage. This is done by mounting the same storage in both the nginx and minio containers (minio does not support static file serving like S3 does)

3. Pulitzer itself gets requests reverse proxied from nginx when the processed files are missing on the object storage bucket, processes them, stores them and returns them.
