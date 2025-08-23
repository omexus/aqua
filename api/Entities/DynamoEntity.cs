using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace aqua.api.Entities
{
    public interface IDynamoEntity
    {
        Guid Id { get; set; }
        string Attribute { get; set; }
    }
}