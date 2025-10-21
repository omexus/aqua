# Manager Authentication & Authorization System Design

## Current System Analysis

### Existing Authentication:
- **Google OAuth**: Users authenticate via Google
- **JWT Tokens**: JWT-based authentication with Cognito
- **Mock System**: Development mock authentication
- **User-Condo Association**: Basic user-condo relationship via `USERCONDO#{googleUserId}#{condoId}`

### Missing Components:
- **Manager Role Validation**: No manager role checking
- **Manager-Condo Relationship**: No proper manager-condo association
- **Condo Selection**: No condo switching mechanism
- **Authorization Middleware**: No role-based access control

## Proposed Solution: Manager Authentication & Authorization

### 1. Enhanced Manager Entity

```csharp
[DynamoDBTable("Statements")]
public class Manager : IDynamoEntity
{
    [DynamoDBHashKey]
    public Guid Id { get; set; } = Guid.Empty;
    [DynamoDBRangeKey]
    public required string Attribute { get; set; }
    
    // Manager details
    public required string GoogleUserId { get; set; }
    public required string Email { get; set; }
    public required string Name { get; set; }
    public string? Picture { get; set; }
    public string Role { get; set; } = "MANAGER";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // Manager preferences
    public string? DefaultCondoId { get; set; }
    public string? TimeZone { get; set; }
    public string? Language { get; set; }
}
```

### 2. Manager-Condo Relationship Entity

```csharp
[DynamoDBTable("Statements")]
public class ManagerCondo : IDynamoEntity
{
    [DynamoDBHashKey]
    public Guid Id { get; set; } = Guid.Empty;
    [DynamoDBRangeKey]
    public required string Attribute { get; set; }
    
    // Relationship details
    public required string ManagerId { get; set; }
    public required string CondoId { get; set; }
    public string Role { get; set; } = "MANAGER"; // MANAGER, ADMIN, VIEWER
    public bool IsActive { get; set; } = true;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public string? AssignedBy { get; set; }
    
    // Condo details for quick access
    public string? CondoName { get; set; }
    public string? CondoPrefix { get; set; }
}
```

### 3. Enhanced Authentication Flow

#### Step 1: Google OAuth Authentication
```csharp
[HttpPost("auth/google")]
public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
{
    // 1. Validate Google OAuth token
    var googleUser = await ValidateGoogleToken(request.IdToken);
    if (googleUser == null) return Unauthorized();
    
    // 2. Check if user is a manager
    var manager = await GetManagerByGoogleId(googleUser.Id);
    if (manager == null)
    {
        return BadRequest(new { 
            success = false, 
            error = "User is not a manager",
            requiresManagerRole = true 
        });
    }
    
    // 3. Get manager's condos
    var condos = await GetManagerCondos(manager.Id);
    if (!condos.Any())
    {
        return BadRequest(new { 
            success = false, 
            error = "No condos assigned to manager",
            requiresCondoAssignment = true 
        });
    }
    
    // 4. Generate JWT with manager info
    var jwtToken = GenerateManagerJwt(manager, condos);
    
    return Ok(new {
        success = true,
        token = jwtToken,
        manager = new {
            id = manager.Id,
            email = manager.Email,
            name = manager.Name,
            picture = manager.Picture,
            role = manager.Role
        },
        condos = condos.Select(c => new {
            id = c.CondoId,
            name = c.CondoName,
            prefix = c.CondoPrefix,
            isDefault = c.CondoId == manager.DefaultCondoId
        })
    });
}
```

#### Step 2: Manager Role Validation
```csharp
private async Task<Manager?> GetManagerByGoogleId(string googleUserId)
{
    var query = _context.QueryAsync<Manager>(new QueryOperationConfig
    {
        KeyExpression = new Expression
        {
            ExpressionStatement = "Attribute = :attr",
            ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
            {
                {":attr", $"MANAGER#{googleUserId}"}
            }
        }
    });
    
    var managers = await query.GetRemainingAsync();
    return managers.FirstOrDefault();
}
```

#### Step 3: Condo Assignment Check
```csharp
private async Task<List<ManagerCondo>> GetManagerCondos(Guid managerId)
{
    var query = _context.QueryAsync<ManagerCondo>(new QueryOperationConfig
    {
        KeyExpression = new Expression
        {
            ExpressionStatement = "Id = :managerId AND begins_with(Attribute, :prefix)",
            ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
            {
                {":managerId", managerId},
                {":prefix", "MANAGERCONDO#"}
            }
        }
    });
    
    return await query.GetRemainingAsync();
}
```

### 4. Condo Selection & Switching

#### Get Manager's Condos
```csharp
[HttpGet("auth/condos")]
[Authorize(Roles = "MANAGER")]
public async Task<ActionResult<List<CondoDto>>> GetManagerCondos()
{
    var managerId = GetCurrentManagerId();
    var condos = await GetManagerCondos(managerId);
    
    return Ok(condos.Select(c => new CondoDto
    {
        Id = c.CondoId,
        Name = c.CondoName,
        Prefix = c.CondoPrefix,
        IsDefault = c.CondoId == GetManagerDefaultCondo(managerId)
    }));
}
```

#### Switch Active Condo
```csharp
[HttpPost("auth/switch-condo")]
[Authorize(Roles = "MANAGER")]
public async Task<ActionResult> SwitchCondo([FromBody] SwitchCondoRequest request)
{
    var managerId = GetCurrentManagerId();
    
    // Verify manager has access to this condo
    var hasAccess = await VerifyManagerCondoAccess(managerId, request.CondoId);
    if (!hasAccess)
    {
        return Forbid("Manager does not have access to this condo");
    }
    
    // Update manager's default condo
    await UpdateManagerDefaultCondo(managerId, request.CondoId);
    
    // Generate new JWT with updated condo context
    var newToken = GenerateManagerJwtWithCondo(managerId, request.CondoId);
    
    return Ok(new {
        success = true,
        token = newToken,
        activeCondo = request.CondoId
    });
}
```

### 5. Authorization Middleware

```csharp
public class ManagerAuthorizationMiddleware
{
    private readonly RequestDelegate _next;
    
    public async Task InvokeAsync(HttpContext context)
    {
        // Skip auth for public endpoints
        if (IsPublicEndpoint(context.Request.Path))
        {
            await _next(context);
            return;
        }
        
        // Extract JWT token
        var token = ExtractToken(context.Request);
        if (token == null)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Unauthorized");
            return;
        }
        
        // Validate token and extract manager info
        var managerInfo = ValidateManagerToken(token);
        if (managerInfo == null)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Invalid token");
            return;
        }
        
        // Check manager role
        if (managerInfo.Role != "MANAGER")
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsync("Manager role required");
            return;
        }
        
        // Add manager context to request
        context.Items["ManagerId"] = managerInfo.ManagerId;
        context.Items["ActiveCondoId"] = managerInfo.ActiveCondoId;
        
        await _next(context);
    }
}
```

### 6. Frontend Integration

#### Authentication Context
```typescript
interface Manager {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'MANAGER';
}

interface Condo {
  id: string;
  name: string;
  prefix: string;
  isDefault: boolean;
}

interface AuthState {
  manager: Manager | null;
  condos: Condo[];
  activeCondo: Condo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

#### Condo Selection Component
```typescript
const CondoSelector = () => {
  const { manager, condos, activeCondo, switchCondo } = useAuth();
  
  if (!manager || condos.length === 0) {
    return <CondoAssignmentPrompt />;
  }
  
  return (
    <Select
      value={activeCondo?.id}
      onChange={(condoId) => switchCondo(condoId)}
      placeholder="Select Condo"
    >
      {condos.map(condo => (
        <Option key={condo.id} value={condo.id}>
          {condo.name} ({condo.prefix})
        </Option>
      ))}
    </Select>
  );
};
```

#### Condo Assignment Flow
```typescript
const CondoAssignmentPrompt = () => {
  const { manager } = useAuth();
  
  if (!manager) {
    return <LoginPrompt />;
  }
  
  return (
    <Card>
      <Title>No Condos Assigned</Title>
      <Text>You don't have any condos assigned to your account.</Text>
      <Button onClick={() => requestCondoAssignment()}>
        Request Condo Assignment
      </Button>
    </Card>
  );
};
```

### 7. Database Design for Manager System

```
┌─────────────────────────────────────────────────────────────────┐
│                    Manager Authentication Design               │
├─────────────────────────────────────────────────────────────────┤
│  Hash Key: PK (String)                                         │
│  Range Key: SK (String)                                        │
│  GSI1PK: GSI1SK (String) - Manager-based queries               │
│  GSI2PK: GSI2SK (String) - Condo-based queries                 │
├─────────────────────────────────────────────────────────────────┤
│  Entity Patterns:                                              │
│                                                                 │
│  MANAGER:                                                      │
│  PK: "MANAGER#{managerId}"                                     │
│  SK: "METADATA"                                                │
│  GoogleUserId: "google_user_id"                                │
│  Email: "manager@example.com"                                  │
│  Name: "John Doe"                                              │
│  Role: "MANAGER"                                               │
│  DefaultCondoId: "condo_id"                                    │
│                                                                 │
│  MANAGER-CONDO RELATIONSHIP:                                   │
│  PK: "MANAGER#{managerId}"                                     │
│  SK: "MANAGERCONDO#{condoId}"                                  │
│  GSI1PK: "CONDO#{condoId}"                                     │
│  GSI1SK: "MANAGER#{managerId}"                                 │
│  Role: "MANAGER"                                               │
│  IsActive: true                                                │
│  CondoName: "Aqua Condominium"                                 │
│  CondoPrefix: "AQUA"                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 8. API Endpoints

#### Authentication Endpoints
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me`` - Get current manager info
- `GET /api/auth/condos` - Get manager's condos
- `POST /api/auth/switch-condo` - Switch active condo
- `POST /api/auth/logout` - Logout

#### Manager Management Endpoints
- `GET /api/managers` - List all managers (admin only)
- `POST /api/managers` - Create manager (admin only)
- `PUT /api/managers/{id}` - Update manager
- `DELETE /api/managers/{id}` - Deactivate manager

#### Condo Assignment Endpoints
- `GET /api/managers/{id}/condos` - Get manager's condos
- `POST /api/managers/{id}/condos` - Assign condo to manager
- `DELETE /api/managers/{id}/condos/{condoId}` - Remove condo assignment

### 9. Implementation Priority

#### Phase 1: Core Authentication (V1)
- [ ] Enhanced Manager entity
- [ ] Manager-Condo relationship tracking
- [ ] Google OAuth with manager role validation
- [ ] Condo selection and switching
- [ ] Basic authorization middleware

#### Phase 2: Manager Management
- [ ] Manager CRUD operations
- [ ] Condo assignment management
- [ ] Manager dashboard
- [ ] Role-based access control

#### Phase 3: Advanced Features
- [ ] Multi-condo management
- [ ] Manager permissions per condo
- [ ] Audit logging
- [ ] Advanced security features

## Benefits of This Design

1. **Secure Authentication**: Google OAuth with manager role validation
2. **Flexible Condo Management**: Managers can work with multiple condos
3. **Easy Condo Switching**: Dropdown-based condo selection
4. **Scalable**: Supports any number of managers and condos
5. **Audit Trail**: Track manager actions and condo assignments
6. **Future-Ready**: Easy to add tenant management in V2

This design provides a complete authentication and authorization system specifically tailored for your HOA management platform! 🏢🔐
