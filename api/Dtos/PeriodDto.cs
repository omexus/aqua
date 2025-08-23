using System;

namespace aqua.api.Dtos;

// <summary>
public class PeriodDto
{
    public required string Id { get; set; }
    public string? From { get; set; }
    public string? To { get; set; }
    public string? Prefix { get; set; }
    public int Generated { get; set; }
    // public string? FileId { get; set; }
    public double? Amount { get; set; }
}
