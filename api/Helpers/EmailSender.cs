using Amazon.S3;
using Amazon.S3.Model;
using Amazon.SimpleEmailV2;
using Amazon.SimpleEmailV2.Model;
using MimeKit;

public class EmailSenderService
{
    private readonly IAmazonSimpleEmailServiceV2 _sesClient;
    private readonly IAmazonS3 _s3Client;
    private readonly ILogger<EmailSenderService> logger;

    public EmailSenderService(IAmazonSimpleEmailServiceV2 sesClient, IAmazonS3 s3Client, ILogger<EmailSenderService> logger)
    {
        _sesClient = sesClient;
        _s3Client = s3Client;
        this.logger = logger;
    }

    public async Task SendEmailWithS3AttachmentAsync((string name, string email) sender, (string name, string email) recipient, string subject, string body, string bucketName, string keyName)
    {
        // Download the attachment from S3
        var attachmentStream = await GetS3AttachmentAsync(bucketName, keyName);

        if (attachmentStream == null)
        {
            Console.WriteLine("Attachment not found in S3.");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(sender.name, sender.email));
        message.To.Add(new MailboxAddress(sender.name, recipient.email));
        message.Subject = subject;

        // Create the body of the email
        var bodyBuilder = new BodyBuilder
        {
            TextBody = body,
            HtmlBody = $"<p>{body}</p>"
        };

        // Add the attachment from the S3 stream
        bodyBuilder.Attachments.Add(keyName, attachmentStream);

        message.Body = bodyBuilder.ToMessageBody();

        // Convert the MimeMessage to a raw email
        using var stream = new MemoryStream();

        message.WriteTo(stream);
        var rawMessage = new RawMessage
        {
            Data = stream,

        };

        var sendRequest = new SendEmailRequest
        {
            Destination = new Destination
            {
                ToAddresses = [recipient.email]
            },
            Content = new EmailContent
            {
                Raw = rawMessage
            }
        };

        try
        {
            var response = await _sesClient.SendEmailAsync(sendRequest);
            logger.LogInformation("Email sent successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email: {ErrorMessage}", ex.Message);
        }
    }

    private async Task<Stream> GetS3AttachmentAsync(string bucketName, string keyName)
    {
        try
        {
            var request = new GetObjectRequest
            {
                BucketName = bucketName,
                Key = keyName
            };

            using var response = await _s3Client.GetObjectAsync(request);
            var memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream);
            memoryStream.Position = 0; // Reset stream position for reading
            return memoryStream;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to download attachment from S3: {ex.Message}");
            return null;
        }
    }
}
