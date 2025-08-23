namespace aqua.api.Dtos;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string CondoId { get; set; } = string.Empty;
    public string CondoName { get; set; } = string.Empty;
    public string CondoPrefix { get; set; } = string.Empty;
}

public class UserProvisionRequest
{
    public string GoogleUserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CondoId { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UserProvisionResponse
{
    public bool Success { get; set; }
    public UserDto? User { get; set; }
    public string? Error { get; set; }
}
