using aqua.api.Dtos;
using aqua.api.Services;
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

    public class AllocationRequestValidator : AbstractValidator<AllocationRequest>
    {
        public AllocationRequestValidator()
        {
            RuleFor(x => x.AllocationMethod)
                .NotNull()
                .NotEmpty()
                .Must(method => method == "EQUAL" || method == "BY_SQUARE_FOOT" || method == "BY_UNITS" || method == "MANUAL")
                .WithMessage("AllocationMethod must be one of: EQUAL, BY_SQUARE_FOOT, BY_UNITS, MANUAL");

            RuleFor(x => x.ManualAmounts)
                .Must((request, amounts) => 
                {
                    if (request.AllocationMethod == "MANUAL")
                    {
                        return amounts != null && amounts.Any();
                    }
                    return true;
                })
                .WithMessage("ManualAmounts is required when AllocationMethod is MANUAL");

            RuleFor(x => x.ManualAmounts)
                .Must((request, amounts) => 
                {
                    if (request.AllocationMethod == "MANUAL" && amounts != null)
                    {
                        return amounts.Values.All(v => v >= 0);
                    }
                    return true;
                })
                .WithMessage("All manual amounts must be non-negative");
        }
    }
}