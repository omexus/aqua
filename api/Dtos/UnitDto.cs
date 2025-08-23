using System;

namespace aqua.api.Dtos;

// <summary>
public class UnitDto
{
    public required string Id { get; set; }
    public required string Unit { get; set; }
    public required string UserId { get; set; }
    public required string Name { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
}
