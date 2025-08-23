using aqua.api.Dtos;
using aqua.api.Entities;
using Riok.Mapperly.Abstractions;

namespace aqua.api.Helpers
{
    [Mapper]
    public static partial class CondoMapper
    {
        public static partial CondoDto CondoToDto(Condo Unit);        
        public static partial IEnumerable<CondoDto> CondosToDto(IEnumerable<Condo> Units);
    }
}