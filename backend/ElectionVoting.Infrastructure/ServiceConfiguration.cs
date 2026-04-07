using ElectionVoting.Application.Interfaces;
using ElectionVoting.Application.Services;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Infrastructure.Data;
using ElectionVoting.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ElectionVoting.Infrastructure;

public static class ServiceConfiguration
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IOrganizationRepository, OrganizationRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IVoterAttendanceRepository, VoterAttendanceRepository>();
        services.AddScoped<IVoteCountRepository, VoteCountRepository>();
        services.AddScoped<IPollingStationRepository, PollingStationRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        // Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IOrganizationService, OrganizationService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IDataService, DataService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IPollingStationService, PollingStationService>();

        return services;
    }
}
