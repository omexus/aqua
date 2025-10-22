using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using aqua.api.Entities;

namespace aqua.api
{
    public class DataSeeder
    {
        private readonly IDynamoDBContext _context;

        public DataSeeder(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task SeedDataAsync()
        {
            Console.WriteLine("🌱 Starting data seeding...");

            // Seed multiple condos (tenants)
            await SeedCondosAsync();

            // Seed managers
            await SeedManagersAsync();

            // Seed manager-condo relationships
            await SeedManagerCondosAsync();

            // Seed users for each condo
            await SeedUsersAsync();

            // Seed units for each condo
            await SeedUnitsAsync();

            // Seed periods for each condo
            await SeedPeriodsAsync();

            Console.WriteLine("✅ Data seeding completed!");
        }

        private async Task SeedCondosAsync()
        {
            var condos = new List<Condo>
            {
                new Condo
                {
                    Id = Guid.Parse("a2f02fa1-bbe4-46f8-90be-4aa43162400c"), // Aqua Condominium
                    Attribute = "CONDO",
                    Name = "Aqua Condominium",
                    Prefix = "AQUA"
                },
                new Condo
                {
                    Id = Guid.Parse("b3f13fa2-cce5-47f9-91cf-5bb54273511d"), // Marina Towers
                    Attribute = "CONDO",
                    Name = "Marina Towers",
                    Prefix = "MARINA"
                },
                new Condo
                {
                    Id = Guid.Parse("c4f24fa3-ddf6-48fa-92df-6cc65384622e"), // Sunset Heights
                    Attribute = "CONDO",
                    Name = "Sunset Heights",
                    Prefix = "SUNSET"
                }
            };

            foreach (var condo in condos)
            {
                await _context.SaveAsync(condo);
                Console.WriteLine($"🏢 Seeded Condo: {condo.Name} (ID: {condo.Id})");
            }
        }

        private async Task SeedManagersAsync()
        {
            var managerId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // Fixed manager ID
            var managers = new List<Manager>
            {
                new Manager
                {
                    Id = managerId,
                    Attribute = "MANAGER",
                    GoogleUserId = "mock-google-id-123",
                    Email = "hl.morales@gmail.com",
                    Name = "Hugo Morales",
                    Picture = "https://via.placeholder.com/150",
                    Role = "MANAGER",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    IsEmailVerified = true,
                    EmailVerifiedAt = DateTime.UtcNow
                }
            };

            foreach (var manager in managers)
            {
                await _context.SaveAsync(manager);
                Console.WriteLine($"👨‍💼 Seeded Manager: {manager.Name} ({manager.Email})");
            }
        }

        private async Task SeedManagerCondosAsync()
        {
            // Get the manager ID (we'll use a fixed ID for consistency)
            var managerId = Guid.Parse("11111111-1111-1111-1111-111111111111"); // Fixed manager ID
            
            // Get all condo IDs
            var aquaCondoId = Guid.Parse("a2f02fa1-bbe4-46f8-90be-4aa43162400c");
            var marinaCondoId = Guid.Parse("b3f13fa2-cce5-47f9-91cf-5bb54273511d");
            var sunsetCondoId = Guid.Parse("c4f24fa3-ddf6-48fa-92df-6cc65384622e");

            var managerCondos = new List<ManagerCondo>
            {
                new ManagerCondo
                {
                    Id = managerId,
                    Attribute = $"MANAGERCONDO#{aquaCondoId}",
                    ManagerId = managerId.ToString(),
                    CondoId = aquaCondoId.ToString(),
                    Role = "MANAGER",
                    IsActive = true,
                    AssignedAt = DateTime.UtcNow,
                    CondoName = "Aqua Condominium",
                    CondoPrefix = "AQUA",
                    CanManageUnits = true,
                    CanManageStatements = true,
                    CanManagePeriods = true,
                    CanViewReports = true
                },
                new ManagerCondo
                {
                    Id = managerId,
                    Attribute = $"MANAGERCONDO#{marinaCondoId}",
                    ManagerId = managerId.ToString(),
                    CondoId = marinaCondoId.ToString(),
                    Role = "MANAGER",
                    IsActive = true,
                    AssignedAt = DateTime.UtcNow,
                    CondoName = "Marina Towers",
                    CondoPrefix = "MARINA",
                    CanManageUnits = true,
                    CanManageStatements = true,
                    CanManagePeriods = true,
                    CanViewReports = true
                },
                new ManagerCondo
                {
                    Id = managerId,
                    Attribute = $"MANAGERCONDO#{sunsetCondoId}",
                    ManagerId = managerId.ToString(),
                    CondoId = sunsetCondoId.ToString(),
                    Role = "MANAGER",
                    IsActive = true,
                    AssignedAt = DateTime.UtcNow,
                    CondoName = "Sunset Heights",
                    CondoPrefix = "SUNSET",
                    CanManageUnits = true,
                    CanManageStatements = true,
                    CanManagePeriods = true,
                    CanViewReports = true
                }
            };

            foreach (var managerCondo in managerCondos)
            {
                await _context.SaveAsync(managerCondo);
                Console.WriteLine($"🔗 Seeded Manager-Condo: {managerCondo.CondoName} (Manager: {managerCondo.ManagerId})");
            }
        }

        private async Task SeedUsersAsync()
        {
            // Users for Aqua Condominium
            var aquaUsers = new List<User>
            {
                new User
                {
                    Id = Guid.NewGuid(),
                    Attribute = "USER",
                    UserId = "john.doe@aqua.com",
                    Name = "John Doe",
                    Email = "john.doe@aqua.com",
                    Unit = "101",
                    Role = "Owner"
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Attribute = "USER",
                    UserId = "jane.smith@aqua.com",
                    Name = "Jane Smith",
                    Email = "jane.smith@aqua.com",
                    Unit = "102",
                    Role = "Tenant"
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Attribute = "USER",
                    UserId = "bob.johnson@aqua.com",
                    Name = "Bob Johnson",
                    Email = "bob.johnson@aqua.com",
                    Unit = "201",
                    Role = "Owner"
                }
            };

            // Users for Marina Towers
            var marinaUsers = new List<User>
            {
                new User
                {
                    Id = Guid.NewGuid(),
                    Attribute = "USER",
                    UserId = "alice.brown@marina.com",
                    Name = "Alice Brown",
                    Email = "alice.brown@marina.com",
                    Unit = "A1",
                    Role = "Owner"
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Attribute = "USER",
                    UserId = "charlie.wilson@marina.com",
                    Name = "Charlie Wilson",
                    Email = "charlie.wilson@marina.com",
                    Unit = "A2",
                    Role = "Tenant"
                }
            };

            // Users for Sunset Heights
            var sunsetUsers = new List<User>
            {
                new User
                {
                    Id = Guid.NewGuid(),
                    Attribute = "USER",
                    UserId = "diana.garcia@sunset.com",
                    Name = "Diana Garcia",
                    Email = "diana.garcia@sunset.com",
                    Unit = "S1",
                    Role = "Owner"
                }
            };

            var allUsers = new List<User>();
            allUsers.AddRange(aquaUsers);
            allUsers.AddRange(marinaUsers);
            allUsers.AddRange(sunsetUsers);

            foreach (var user in allUsers)
            {
                await _context.SaveAsync(user);
                Console.WriteLine($"👤 Seeded User: {user.Name} ({user.Email}) - Unit: {user.Unit}");
            }
        }

        private async Task SeedUnitsAsync()
        {
            var aquaCondoId = Guid.Parse("a2f02fa1-bbe4-46f8-90be-4aa43162400c");
            var marinaCondoId = Guid.Parse("b3f13fa2-cce5-47f9-91cf-5bb54273511d");
            var sunsetCondoId = Guid.Parse("c4f24fa3-ddf6-48fa-92df-6cc65384622e");

            // Units for Aqua Condominium
            var aquaUnits = new List<DwellUnit>
            {
                new DwellUnit
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"UNIT#{aquaCondoId}",
                    UserId = "john.doe@aqua.com",
                    Prefix = "AQUA",
                    Name = "John Doe",
                    Email = "john.doe@aqua.com",
                    Unit = "101",
                    Role = "Owner"
                },
                new DwellUnit
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"UNIT#{aquaCondoId}",
                    UserId = "jane.smith@aqua.com",
                    Prefix = "AQUA",
                    Name = "Jane Smith",
                    Email = "jane.smith@aqua.com",
                    Unit = "102",
                    Role = "Tenant"
                },
                new DwellUnit
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"UNIT#{aquaCondoId}",
                    UserId = "bob.johnson@aqua.com",
                    Prefix = "AQUA",
                    Name = "Bob Johnson",
                    Email = "bob.johnson@aqua.com",
                    Unit = "201",
                    Role = "Owner"
                }
            };

            // Units for Marina Towers
            var marinaUnits = new List<DwellUnit>
            {
                new DwellUnit
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"UNIT#{marinaCondoId}",
                    UserId = "alice.brown@marina.com",
                    Prefix = "MARINA",
                    Name = "Alice Brown",
                    Email = "alice.brown@marina.com",
                    Unit = "A1",
                    Role = "Owner"
                },
                new DwellUnit
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"UNIT#{marinaCondoId}",
                    UserId = "charlie.wilson@marina.com",
                    Prefix = "MARINA",
                    Name = "Charlie Wilson",
                    Email = "charlie.wilson@marina.com",
                    Unit = "A2",
                    Role = "Tenant"
                }
            };

            // Units for Sunset Heights
            var sunsetUnits = new List<DwellUnit>
            {
                new DwellUnit
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"UNIT#{sunsetCondoId}",
                    UserId = "diana.garcia@sunset.com",
                    Prefix = "SUNSET",
                    Name = "Diana Garcia",
                    Email = "diana.garcia@sunset.com",
                    Unit = "S1",
                    Role = "Owner"
                }
            };

            var allUnits = new List<DwellUnit>();
            allUnits.AddRange(aquaUnits);
            allUnits.AddRange(marinaUnits);
            allUnits.AddRange(sunsetUnits);

            foreach (var unit in allUnits)
            {
                await _context.SaveAsync(unit);
                Console.WriteLine($"🏠 Seeded Unit: {unit.Unit} - {unit.Name} ({unit.Prefix})");
            }
        }

        private async Task SeedPeriodsAsync()
        {
            var aquaCondoId = Guid.Parse("a2f02fa1-bbe4-46f8-90be-4aa43162400c");
            var marinaCondoId = Guid.Parse("b3f13fa2-cce5-47f9-91cf-5bb54273511d");
            var sunsetCondoId = Guid.Parse("c4f24fa3-ddf6-48fa-92df-6cc65384622e");

            // Periods for Aqua Condominium
            var aquaPeriods = new List<Period>
            {
                new Period
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"PERIOD#{aquaCondoId}",
                    From = "2024-01-01",
                    To = "2024-01-31",
                    Prefix = "AQUA",
                    Generated = 0,
                    Amount = 1500.00
                },
                new Period
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"PERIOD#{aquaCondoId}",
                    From = "2024-02-01",
                    To = "2024-02-29",
                    Prefix = "AQUA",
                    Generated = 0,
                    Amount = 1500.00
                }
            };

            // Periods for Marina Towers
            var marinaPeriods = new List<Period>
            {
                new Period
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"PERIOD#{marinaCondoId}",
                    From = "2024-01-01",
                    To = "2024-01-31",
                    Prefix = "MARINA",
                    Generated = 0,
                    Amount = 2000.00
                }
            };

            // Periods for Sunset Heights
            var sunsetPeriods = new List<Period>
            {
                new Period
                {
                    Id = Guid.NewGuid(),
                    Attribute = $"PERIOD#{sunsetCondoId}",
                    From = "2024-01-01",
                    To = "2024-01-31",
                    Prefix = "SUNSET",
                    Generated = 0,
                    Amount = 1800.00
                }
            };

            var allPeriods = new List<Period>();
            allPeriods.AddRange(aquaPeriods);
            allPeriods.AddRange(marinaPeriods);
            allPeriods.AddRange(sunsetPeriods);

            foreach (var period in allPeriods)
            {
                await _context.SaveAsync(period);
                Console.WriteLine($"📅 Seeded Period: {period.From} to {period.To} ({period.Prefix})");
            }
        }
    }
}
