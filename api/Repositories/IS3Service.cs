using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using aqua.api.Entities;

namespace aqua.api.Repositories;

/// <summary>
/// S3 Service
/// </summary>
public interface IS3Service
{
    Task<string> GetPresignedUrlAsync(Guid id, string prefix, string fileName);
    Task DeleteFileAsync(string bucketName, string keyName);
    Task DeleteAllFilesAsync(string bucketName, string keyName);
}