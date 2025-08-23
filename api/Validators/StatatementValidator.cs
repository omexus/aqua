using aqua.api.Dtos;
using FluentValidation;

namespace aqua.api.Validators
{
    public class StatatementValidator: AbstractValidator<StatementSaveRequestDto>
    {
        public StatatementValidator()
        {
            RuleFor(x => x).NotNull().NotEmpty();
            // RuleFor(x => x.Amount).GreaterThan(0);
            RuleFor(x => x.Period).NotNull().NotEmpty()
            .Must(x => x.Length == 8).WithMessage("Period should be 8 characters long")
            .Must(x => DateOnly.TryParse($"{x[..4]}/{x.Substring(4, 2)}/{x.Substring(6,2)}", out var _)).WithMessage("Invalid Period, should be yyyyMMdd");
            RuleFor(x => x.Name).NotNull().NotEmpty();
            RuleFor(x => x.Email).NotNull().NotEmpty();

        }
    }
}