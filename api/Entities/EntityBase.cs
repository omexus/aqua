using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;

namespace aqua.api.Entities
{
    [DynamoDBTable("Statements")]
    public abstract class EntityBase : IDynamoEntity
    {
        [DynamoDBHashKey] //Partition key
        public Guid Id { get; set; } = Guid.Empty;
        [DynamoDBRangeKey]
        public string Attribute { get; set; } = string.Empty;
        public string ToId(int pos = -1)
        {
            if (pos == -1)
            {
                return Attribute;
            }
            var parts = Attribute.Split("#");
            return parts.Length > pos ? parts[pos] : "ID-ERROR";
        }
    }
}