using System;

namespace aqua.api.Dtos;


public class PeriodWithStatemendDto{

    public required PeriodDto Period { get; set; }
    public required List<StatementFileDto> Statements { get; set; }
}

// <summary>
public class StatementFileDto
{
    public required string Id { get; set; }
    public string? FileName { get; set; } = string.Empty;
    public string? Prefix { get; set; }
    public string? Unit { get; set; }
    public string? Name { get; set; }
    public string? Role { get; set; }
    public string? Email { get; set; }
    public double? Amount { get; set; }
}
