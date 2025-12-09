# Backend Configuration Notes

## 1. Authentication Fix

### Problem
The backend redirects to `/Account/Login` when unauthorized instead of returning 401 JSON response.

### Solution
Replace the JWT Bearer configuration in `Program.cs` with this:

```csharp
// Authentication & Authorization
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSection = builder.Configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };

        // **ADD THIS**: Prevent redirect to login page for API endpoints
        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                // Skip default behavior (redirect)
                context.HandleResponse();
                
                // Return 401 JSON response instead
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                
                var result = System.Text.Json.JsonSerializer.Serialize(new 
                { 
                    status = 401,
                    message = "Unauthorized. Please provide a valid token." 
                });
                
                return context.Response.WriteAsync(result);
            }
        };
    });
```

## Why This Fixes It
- Without `OnChallenge`, ASP.NET Identity redirects to `/Account/Login` (for web apps)
- With `OnChallenge`, it returns a proper 401 JSON response (for APIs)
- Frontend can then handle the 401 properly (refresh token, redirect to login, etc.)

## After Making This Change
1. Restart your backend
2. Try logging in from the frontend

---

## 2. Availability Check Endpoint Response Format

The `/api/Availability` endpoint returns a response in this format:

```json
{
  "emailAvailable": true,
  "usernameAvailable": true,
  "phoneAvailable": true
}
```

### Example Requests:
- **GET** `/api/Availability?email=test@example.com` → Returns `{ "emailAvailable": false }` if email exists
- **GET** `/api/Availability?username=johndoe` → Returns `{ "usernameAvailable": false }` if username exists
- **GET** `/api/Availability?phone=01012345678` → Returns `{ "phoneAvailable": false }` if phone exists
- **GET** `/api/Availability?email=test@example.com&username=johndoe&phone=01012345678` → Returns all three fields

The frontend async validators use this response format to show real-time availability feedback during registration.
3. Then access the profile page
