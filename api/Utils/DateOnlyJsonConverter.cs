using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace aqua.api.Utils;

public sealed class DateOnlyJsonConverter : JsonConverter<DateOnly?>
{
    private const string Format = "yyyy-MM-dd";

    public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        try
        {
            return DateOnly.Parse(reader.GetString(), CultureInfo.InvariantCulture);
        }
        catch (Exception e)
        {
            return null;
        }
    }

    public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
    {
        try
        {
            writer.WriteStringValue(value?.ToString().ToString(CultureInfo.InvariantCulture));            
        }catch(Exception e)
        {
            writer.WriteStringValue(string.Empty);
        }

    }
}