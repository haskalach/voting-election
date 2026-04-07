using BCrypt.Net;
using ElectionVoting.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ElectionVoting.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        // Seed SystemOwner role (should already exist, but defensive check)
        var ownerRole = await db.Roles.FirstOrDefaultAsync(r => r.RoleName == "SystemOwner");
        if (ownerRole is null)
        {
            logger.LogWarning("SystemOwner role not found. Skipping user seed.");
            return;
        }

        // Only seed if no SystemOwner user exists
        bool ownerExists = await db.Users.AnyAsync(u => u.RoleId == ownerRole.RoleId);
        if (ownerExists)
        {
            logger.LogInformation("SystemOwner user already exists. Skipping seed.");
            return;
        }

        var seedEmail = config["Seed:OwnerEmail"] ?? "admin@election.lb";
        var seedPassword = config["Seed:OwnerPassword"] ?? "Admin@12345";

        var owner = new User
        {
            Email = seedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(seedPassword),
            FirstName = "System",
            LastName = "Owner",
            RoleId = ownerRole.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(owner);
        await db.SaveChangesAsync();

        logger.LogInformation("Seeded SystemOwner user: {Email}", seedEmail);
    }
}
