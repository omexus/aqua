
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace aqua.api.Repositories
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly ILogger<S3Service> logger;
        private readonly AppConfig _appSettings;

        public S3Service(IAmazonS3 s3Client, IOptions<AppConfig> appSettings, ILogger<S3Service> logger)
        {
            _s3Client = s3Client;
            this.logger = logger;
            _appSettings = appSettings.Value;
        }

        public async Task<string> GetPresignedUrlAsync(Guid id, string prefix, string fileName)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _appSettings.S3.BucketName,
                Key = $"{id}/{prefix}/{fileName}",
                Expires = DateTime.UtcNow.AddMinutes(5), // Set the expiration time for the presigned URL
                Verb = HttpVerb.PUT
            };

            string url = await _s3Client.GetPreSignedURLAsync(request);

            return url;
        }

        public async Task DeleteAllFilesAsync(string bucketName, string keyName)
        {
            try
            {
                var listObjectsRequest = new ListObjectsRequest
                {
                    BucketName = bucketName,
                    Prefix = keyName
                };

                ListObjectsResponse response = await _s3Client.ListObjectsAsync(listObjectsRequest);

                var keys = new List<KeyVersion>();
                foreach (var item in response.S3Objects)
                {
                    // Here you can provide VersionId as well.
                    keys.Add(new KeyVersion { Key = item.Key });
                }

                var multiObjectDeleteRequest = new DeleteObjectsRequest()
                {
                    BucketName = bucketName,
                    Objects = keys
                };

                var deleteObjectsResponse = await _s3Client.DeleteObjectsAsync(multiObjectDeleteRequest);

            }
            catch (AmazonS3Exception e)
            {
                logger.LogError("Error encountered on server. Message:{Message} when deleting an object", e.Message);
            }
            catch (Exception e)
            {
                logger.LogError("Unknown encountered on server. Message:{Message} when deleting an object", e.Message);
            }
        }

        public async Task DeleteFileAsync(string bucketName, string keyName)
        {
            try
            {
                var deleteObjectRequest = new DeleteObjectRequest
                {
                    BucketName = bucketName,
                    Key = keyName
                };

                var response = await _s3Client.DeleteObjectAsync(deleteObjectRequest);

                Console.WriteLine("File deleted successfully.");
            }
            catch (AmazonS3Exception e)
            {
                logger.LogError("Error encountered on server. Message:{Message} when deleting an object", e.Message);
            }
            catch (Exception e)
            {
                logger.LogError("Unknown encountered on server. Message:{Message} when deleting an object", e.Message);
            }
        }        
    }
}