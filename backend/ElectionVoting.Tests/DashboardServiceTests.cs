using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using ElectionVoting.Application.Services;
using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;
using ElectionVoting.Application.DTOs;

namespace ElectionVoting.Tests;

/// <summary>
/// DashboardService Tests - Dashboard statistics aggregation
/// Constructor: DashboardService(IOrganizationRepository, IVoterAttendanceRepository, IVoteCountRepository, IPollingStationRepository, IEmployeeRepository)
/// 
/// Public Methods:
/// - GetOrganizationDashboardAsync(int organizationId) -> Task<DashboardDto>
/// - GetSystemDashboardAsync() -> Task<DashboardDto>
/// </summary>
public class DashboardServiceTests
{
    private readonly Mock<IOrganizationRepository> _mockOrgRepo;
    private readonly Mock<IVoterAttendanceRepository> _mockAttendanceRepo;
    private readonly Mock<IVoteCountRepository> _mockVoteCountRepo;
    private readonly Mock<IPollingStationRepository> _mockStationRepo;
    private readonly Mock<IEmployeeRepository> _mockEmployeeRepo;
    private readonly DashboardService _dashboardService;

    public DashboardServiceTests()
    {
        _mockOrgRepo = new();
        _mockAttendanceRepo = new();
        _mockVoteCountRepo = new();
        _mockStationRepo = new();
        _mockEmployeeRepo = new();

        _dashboardService = new DashboardService(
            _mockOrgRepo.Object,
            _mockAttendanceRepo.Object,
            _mockVoteCountRepo.Object,
            _mockStationRepo.Object,
            _mockEmployeeRepo.Object
        );
    }

    [Fact]
    public async Task GetOrganizationDashboardAsync_WithValidOrgId_ReturnsDashboardData()
    {
        // Arrange
        int orgId = 1;
        var org = new Organization { OrganizationId = orgId, OrganizationName = "Test Org" };
        var employees = new List<Employee>
        {
            new() { EmployeeId = 1, OrganizationId = orgId, FirstName = "John", LastName = "Doe", IsActive = true },
            new() { EmployeeId = 2, OrganizationId = orgId, FirstName = "Jane", LastName = "Smith", IsActive = true },
            new() { EmployeeId = 3, OrganizationId = orgId, FirstName = "Bob", LastName = "Inactive", IsActive = false }
        };
        var attendance = new List<VoterAttendance>
        {
            new() { AttendanceId = 1, EmployeeId = 1, PollingStationId = 1, VoterCount = 150 },
            new() { AttendanceId = 2, EmployeeId = 2, PollingStationId = 1, VoterCount = 200 }
        };
        var votes = new List<VoteCount>
        {
            new() { VoteCountId = 1, EmployeeId = 1, PollingStationId = 1, CandidateName = "Candidate A", Votes = 100 },
            new() { VoteCountId = 2, EmployeeId = 2, PollingStationId = 1, CandidateName = "Candidate B", Votes = 150 }
        };
        var stations = new List<PollingStation>
        {
            new() { PollingStationId = 1, OrganizationId = orgId, StationName = "Station 1", Capacity = 500 }
        };

        _mockOrgRepo.Setup(r => r.GetByIdAsync(orgId))
            .ReturnsAsync(org);
        _mockEmployeeRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(employees);
        _mockAttendanceRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(attendance);
        _mockVoteCountRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(votes);
        _mockStationRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(stations);

        // Act
        var result = await _dashboardService.GetOrganizationDashboardAsync(orgId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.TotalEmployees);
        Assert.Equal(2, result.ActiveEmployees);
    }

    [Fact]
    public async Task GetOrganizationDashboardAsync_WithEmptyData_ReturnsZeroMetrics()
    {
        // Arrange
        int orgId = 1;
        var org = new Organization { OrganizationId = orgId, OrganizationName = "Empty Org" };

        _mockOrgRepo.Setup(r => r.GetByIdAsync(orgId))
            .ReturnsAsync(org);
        _mockEmployeeRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(new List<Employee>());
        _mockAttendanceRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(new List<VoterAttendance>());
        _mockVoteCountRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(new List<VoteCount>());
        _mockStationRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(new List<PollingStation>());

        // Act
        var result = await _dashboardService.GetOrganizationDashboardAsync(orgId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.TotalEmployees);
        Assert.Equal(0, result.ActiveEmployees);
        Assert.Equal(0, result.TotalVotersLogged);
    }

    [Fact]
    public async Task GetSystemDashboardAsync_WithMultipleOrganizations_ReturnsAggregatedData()
    {
        // Arrange
        var orgs = new List<Organization>
        {
            new() { OrganizationId = 1, OrganizationName = "Org 1" },
            new() { OrganizationId = 2, OrganizationName = "Org 2" }
        };

        var employees1 = new List<Employee>
        {
            new() { EmployeeId = 1, OrganizationId = 1, FirstName = "John", LastName = "Doe", IsActive = true },
            new() { EmployeeId = 3, OrganizationId = 1, FirstName = "Bob", LastName = "Inactive", IsActive = false }
        };
        var employees2 = new List<Employee>
        {
            new() { EmployeeId = 2, OrganizationId = 2, FirstName = "Jane", LastName = "Smith", IsActive = true }
        };

        var attendance1 = new List<VoterAttendance>
        {
            new() { AttendanceId = 1, EmployeeId = 1, PollingStationId = 1, VoterCount = 150 },
            new() { AttendanceId = 3, EmployeeId = 3, PollingStationId = 1, VoterCount = 100 }
        };
        var attendance2 = new List<VoterAttendance>
        {
            new() { AttendanceId = 2, EmployeeId = 2, PollingStationId = 2, VoterCount = 200 }
        };

        var votes1 = new List<VoteCount>
        {
            new() { VoteCountId = 1, EmployeeId = 1, PollingStationId = 1, CandidateName = "Candidate A", Votes = 250 }
        };
        var votes2 = new List<VoteCount>
        {
            new() { VoteCountId = 2, EmployeeId = 2, PollingStationId = 2, CandidateName = "Candidate B", Votes = 300 }
        };

        var stations1 = new List<PollingStation>
        {
            new() { PollingStationId = 1, OrganizationId = 1, StationName = "Station 1", Capacity = 500 }
        };
        var stations2 = new List<PollingStation>
        {
            new() { PollingStationId = 2, OrganizationId = 2, StationName = "Station 2", Capacity = 600 }
        };

        _mockOrgRepo.Setup(r => r.GetAllAsync())
            .ReturnsAsync(orgs);
        _mockEmployeeRepo.Setup(r => r.GetByOrganizationAsync(1))
            .ReturnsAsync(employees1);
        _mockEmployeeRepo.Setup(r => r.GetByOrganizationAsync(2))
            .ReturnsAsync(employees2);
        _mockAttendanceRepo.Setup(r => r.GetByOrganizationAsync(1))
            .ReturnsAsync(attendance1);
        _mockAttendanceRepo.Setup(r => r.GetByOrganizationAsync(2))
            .ReturnsAsync(attendance2);
        _mockVoteCountRepo.Setup(r => r.GetByOrganizationAsync(1))
            .ReturnsAsync(votes1);
        _mockVoteCountRepo.Setup(r => r.GetByOrganizationAsync(2))
            .ReturnsAsync(votes2);
        _mockStationRepo.Setup(r => r.GetByOrganizationAsync(1))
            .ReturnsAsync(stations1);
        _mockStationRepo.Setup(r => r.GetByOrganizationAsync(2))
            .ReturnsAsync(stations2);

        // Act
        var result = await _dashboardService.GetSystemDashboardAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.TotalEmployees); // 2 from org1 + 1 from org2
        Assert.Equal(2, result.ActiveEmployees); // 1 from org1 + 1 from org2
        Assert.Equal(450, result.TotalVotersLogged); // 150+100 from org1 + 200 from org2
        Assert.Equal(550, result.TotalVotesCounted); // 250 + 300
    }

    [Fact]
    public async Task GetOrganizationDashboardAsync_CalculatesActiveEmployeeCount()
    {
        // Arrange
        int orgId = 1;
        var org = new Organization { OrganizationId = orgId, OrganizationName = "Test Org" };
        var employees = new List<Employee>
        {
            new() { EmployeeId = 1, OrganizationId = orgId, FirstName = "Active1", LastName = "User", IsActive = true },
            new() { EmployeeId = 2, OrganizationId = orgId, FirstName = "Active2", LastName = "User", IsActive = true },
            new() { EmployeeId = 3, OrganizationId = orgId, FirstName = "Inactive", LastName = "User", IsActive = false },
            new() { EmployeeId = 4, OrganizationId = orgId, FirstName = "Inactive2", LastName = "User", IsActive = false }
        };

        _mockOrgRepo.Setup(r => r.GetByIdAsync(orgId))
            .ReturnsAsync(org);
        _mockEmployeeRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(employees);
        _mockAttendanceRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(new List<VoterAttendance>());
        _mockVoteCountRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(new List<VoteCount>());
        _mockStationRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(new List<PollingStation>());

        // Act
        var result = await _dashboardService.GetOrganizationDashboardAsync(orgId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4, result.TotalEmployees);
        Assert.Equal(2, result.ActiveEmployees);
    }

    [Fact]
    public async Task GetOrganizationDashboardAsync_AggregatesVoterAndVoteCount()
    {
        // Arrange
        int orgId = 1;
        var org = new Organization { OrganizationId = orgId, OrganizationName = "Test Org" };
        var employees = new List<Employee>
        {
            new() { EmployeeId = 1, OrganizationId = orgId, FirstName = "John", LastName = "Doe", IsActive = true }
        };
        var attendance = new List<VoterAttendance>
        {
            new() { AttendanceId = 1, EmployeeId = 1, PollingStationId = 1, VoterCount = 100 },
            new() { AttendanceId = 2, EmployeeId = 1, PollingStationId = 1, VoterCount = 200 },
            new() { AttendanceId = 3, EmployeeId = 1, PollingStationId = 1, VoterCount = 150 }
        };
        var votes = new List<VoteCount>
        {
            new() { VoteCountId = 1, EmployeeId = 1, PollingStationId = 1, CandidateName = "A", Votes = 50 },
            new() { VoteCountId = 2, EmployeeId = 1, PollingStationId = 1, CandidateName = "B", Votes = 100 },
            new() { VoteCountId = 3, EmployeeId = 1, PollingStationId = 1, CandidateName = "C", Votes = 75 }
        };

        _mockOrgRepo.Setup(r => r.GetByIdAsync(orgId))
            .ReturnsAsync(org);
        _mockEmployeeRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(employees);
        _mockAttendanceRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(attendance);
        _mockVoteCountRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(votes);
        _mockStationRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(new List<PollingStation>());

        // Act
        var result = await _dashboardService.GetOrganizationDashboardAsync(orgId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(450, result.TotalVotersLogged); // 100 + 200 + 150
        Assert.Equal(225, result.TotalVotesCounted); // 50 + 100 + 75
    }
}
