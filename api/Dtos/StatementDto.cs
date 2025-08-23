using System;

namespace aqua.api.Dtos;

// <summary>
public class StatementDto
{
    public required string Id { get; set; }
    public string? Period { get; set; }
    public string Type { get; set; } = string.Empty;
    public double Amount { get; set; } = 0.0;
    public string From { get; set; }
    public string To { get; set;}
    public string Prefix { get; set; }
    public int Generated { get; set; }
    public string FileName { get; set; }
}
