using ElectionVoting.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElectionVoting.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<PollingStation> PollingStations => Set<PollingStation>();
    public DbSet<VoterAttendance> VoterAttendances => Set<VoterAttendance>();
    public DbSet<VoteCount> VoteCounts => Set<VoteCount>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Role
        modelBuilder.Entity<Role>(e =>
        {
            e.HasKey(r => r.RoleId);
            e.HasIndex(r => r.RoleName).IsUnique();
            e.Property(r => r.RoleName).HasMaxLength(50).IsRequired();
            e.Property(r => r.Description).HasMaxLength(200);
        });

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.UserId);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
            e.Property(u => u.LastName).HasMaxLength(100).IsRequired();
            e.HasOne(u => u.Role).WithMany(r => r.Users).HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.Restrict);
        });

        // RefreshToken
        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasKey(rt => rt.RefreshTokenId);
            e.HasIndex(rt => rt.Token).IsUnique();
            e.Property(rt => rt.Token).IsRequired();
            e.HasOne(rt => rt.User).WithMany(u => u.RefreshTokens).HasForeignKey(rt => rt.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // Organization
        modelBuilder.Entity<Organization>(e =>
        {
            e.HasKey(o => o.OrganizationId);
            e.HasIndex(o => o.OrganizationName).IsUnique();
            e.Property(o => o.OrganizationName).HasMaxLength(200).IsRequired();
            e.Property(o => o.PartyName).HasMaxLength(200).IsRequired();
            e.Property(o => o.ContactEmail).HasMaxLength(256);
            e.Property(o => o.Address).HasMaxLength(500);
            e.HasOne(o => o.CreatedByUser).WithMany(u => u.Organizations).HasForeignKey(o => o.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // Employee
        modelBuilder.Entity<Employee>(e =>
        {
            e.HasKey(emp => emp.EmployeeId);
            e.HasIndex(emp => new { emp.Email, emp.OrganizationId }).IsUnique();
            e.Property(emp => emp.Email).HasMaxLength(256).IsRequired();
            e.Property(emp => emp.FirstName).HasMaxLength(100).IsRequired();
            e.Property(emp => emp.LastName).HasMaxLength(100).IsRequired();
            e.Property(emp => emp.PhoneNumber).HasMaxLength(20);
            e.HasOne(emp => emp.User).WithMany().HasForeignKey(emp => emp.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(emp => emp.Organization).WithMany(o => o.Employees).HasForeignKey(emp => emp.OrganizationId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(emp => emp.SupervisedByUser).WithMany().HasForeignKey(emp => emp.SupervisedByUserId).OnDelete(DeleteBehavior.Restrict);
        });

        // PollingStation
        modelBuilder.Entity<PollingStation>(e =>
        {
            e.HasKey(ps => ps.PollingStationId);
            e.Property(ps => ps.StationName).HasMaxLength(200).IsRequired();
            e.Property(ps => ps.Location).HasMaxLength(300);
            e.Property(ps => ps.Address).HasMaxLength(500);
            e.HasOne(ps => ps.Organization).WithMany(o => o.PollingStations).HasForeignKey(ps => ps.OrganizationId).OnDelete(DeleteBehavior.Cascade);
        });

        // VoterAttendance
        modelBuilder.Entity<VoterAttendance>(e =>
        {
            e.HasKey(va => va.AttendanceId);
            e.HasIndex(va => new { va.EmployeeId, va.PollingStationId, va.RecordedAt });
            e.Property(va => va.Notes).HasMaxLength(500);
            e.HasOne(va => va.Employee).WithMany(emp => emp.VoterAttendances).HasForeignKey(va => va.EmployeeId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(va => va.PollingStation).WithMany(ps => ps.VoterAttendances).HasForeignKey(va => va.PollingStationId).OnDelete(DeleteBehavior.Restrict);
        });

        // VoteCount
        modelBuilder.Entity<VoteCount>(e =>
        {
            e.HasKey(vc => vc.VoteCountId);
            e.HasIndex(vc => new { vc.EmployeeId, vc.PollingStationId, vc.RecordedAt });
            e.Property(vc => vc.CandidateName).HasMaxLength(200).IsRequired();
            e.HasOne(vc => vc.Employee).WithMany(emp => emp.VoteCounts).HasForeignKey(vc => vc.EmployeeId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(vc => vc.PollingStation).WithMany(ps => ps.VoteCounts).HasForeignKey(vc => vc.PollingStationId).OnDelete(DeleteBehavior.Restrict);
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.HasKey(al => al.AuditId);
            e.HasIndex(al => new { al.EntityType, al.EntityId, al.Timestamp });
            e.Property(al => al.EntityType).HasMaxLength(100).IsRequired();
            e.Property(al => al.Action).HasMaxLength(20).IsRequired();
            e.HasOne(al => al.User).WithMany(u => u.AuditLogs).HasForeignKey(al => al.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(al => al.Organization).WithMany(o => o.AuditLogs).HasForeignKey(al => al.OrganizationId).OnDelete(DeleteBehavior.SetNull);
        });

        // Seed roles
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = Role.Names.SystemOwner, Description = "Full system access" },
            new Role { RoleId = 2, RoleName = Role.Names.Manager, Description = "Organization-level access" },
            new Role { RoleId = 3, RoleName = Role.Names.Employee, Description = "Personal data access" }
        );
    }
}
