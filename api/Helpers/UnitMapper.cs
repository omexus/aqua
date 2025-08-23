using aqua.api.Dtos;
using aqua.api.Entities;
using Riok.Mapperly.Abstractions;

namespace aqua.api.Helpers
{
    [Mapper]
    public static partial class UnitMapper
    {
        // [MapPropertyFromSource(nameof(UnitDto.Period), Use = nameof(MapStmtDate))]
        public static partial UnitDto UnitToDto(DwellUnit Unit);        
        // [MapPropertyFromSource(nameof(UnitFileDto.Id), Use = nameof(MapId))]
        // [MapPropertyFromSource(nameof(Unit.FileName), Use = nameof(MapFileName))]
        // public static partial UnitFileDto UnitToFileDto(DwellUnit Unit);        
        public static partial IEnumerable<UnitDto> UnitsToDto(IEnumerable<DwellUnit> Units);
        // public static partial IEnumerable<UnitDto> UnitFilesToDto(IEnumerable<DwellUnit> Units);

        // set Default = false to not use it for all decimal => string conversions
        // if using AutoUserMappings = false, the UserMapping is not needed.
        // [UserMapping(Default = false)]
        // private static string MapStmtDate(DwellUnit stmt)
            // => stmt != null && stmt.Attribute != null && stmt.Attribute.Contains('#') ? stmt.Attribute.Split("#")[1] : stmt?.Attribute ?? string.Empty;
        // private static string MapId(DwellUnit stmt)
        //     => stmt.Attribute ?? string.Empty;

        //   [UserMapping(Default = false)]
        // private static string MapFileName(DwellUnit stmt)
        //     => stmt != null && stmt.Attribute != null && stmt.Attribute.Contains('#') ? stmt.Attribute.Split("#")[^1] : stmt?.Attribute ?? string.Empty;

    }
}