using aqua.api.Dtos;
using aqua.api.Entities;
using Riok.Mapperly.Abstractions;

namespace aqua.api.Helpers
{
    [Mapper]
    public static partial class StatementMapper
    {
        [MapPropertyFromSource(nameof(StatementDto.Period), Use = nameof(MapStmtDate))]
        public static partial StatementDto StatementToDto(Statement statement);        
        [MapPropertyFromSource(nameof(StatementFileDto.Id), Use = nameof(MapId))]
        [MapPropertyFromSource(nameof(Statement.FileName), Use = nameof(MapFileName))]
        public static partial StatementFileDto StatementToFileDto(Statement statement);        
        public static partial IEnumerable<StatementDto> StatementsToDto(IEnumerable<Statement> statements);
        public static partial IEnumerable<StatementDto> StatementFilesToDto(IEnumerable<Statement> statements);

        // set Default = false to not use it for all decimal => string conversions
        // if using AutoUserMappings = false, the UserMapping is not needed.
        // [UserMapping(Default = false)]
        private static string MapStmtDate(Statement stmt)
            => stmt != null && stmt.Attribute != null && stmt.Attribute.Contains('#') ? stmt.Attribute.Split("#")[1] : stmt?.Attribute ?? string.Empty;
        private static string MapId(Statement stmt)
            => stmt.Attribute ?? string.Empty;

          [UserMapping(Default = false)]
        private static string MapFileName(Statement stmt)
            => stmt != null && stmt.Attribute != null && stmt.Attribute.Contains('#') ? stmt.Attribute.Split("#")[^1] : stmt?.Attribute ?? string.Empty;

    }
}