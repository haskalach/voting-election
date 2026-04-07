using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ElectionVoting.Api.Controllers;
using ElectionVoting.Application.Interfaces;
using ElectionVoting.Application.DTOs;
using ElectionVoting.Domain.Entities;
using ElectionVoting.Domain.Interfaces;

namespace ElectionVoting.Tests;

/// <summary>
/// Controller Unit Tests - HTTP action method behavior
///
/// Tests cover:
/// - Return types (Ok, Created, NotFound, BadRequest, Unauthorized, NoContent)
/// - Service delegation
/// - Error handling mapping to HTTP status codes
/// - Claims-based identity extraction
/// </summary>

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _mockAuthService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockAuthService = new();
        _controller = new AuthController(_mockAuthService.Object);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk()
    {
        // Arrange
        var request = new LoginRequestDto("user@test.com", "Password1!");
        var responseDto = new LoginResponseDto(
            "access-token", "refresh-token", 3600,
            new UserDto(1, "user@test.com", "John", "Doe", "Employee", 1));

        _mockAuthService.Setup(s => s.LoginAsync(request)).ReturnsAsync(responseDto);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<LoginResponseDto>(okResult.Value);
        Assert.Equal("access-token", value.AccessToken);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequestDto("bad@test.com", "wrong");
        _mockAuthService.Setup(s => s.LoginAsync(request))
            .ThrowsAsync(new UnauthorizedAccessException("Invalid credentials"));

        // Act
        var result = await _controller.Login(request);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsCreated()
    {
        // Arrange
        var request = new RegisterRequestDto("new@test.com", "Pass123!", "Jane", "Doe", 3);
        var userDto = new UserDto(5, "new@test.com", "Jane", "Doe", "Employee", null);

        _mockAuthService.Setup(s => s.RegisterAsync(request)).ReturnsAsync(userDto);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(userDto, createdResult.Value);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequestDto("dup@test.com", "Pass123!", "A", "B", 3);
        _mockAuthService.Setup(s => s.RegisterAsync(request))
            .ThrowsAsync(new InvalidOperationException("Email already exists"));

        // Act
        var result = await _controller.Register(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Refresh_WithValidToken_ReturnsOk()
    {
        // Arrange
        var request = new RefreshTokenRequestDto("valid-refresh-token");
        var response = new RefreshTokenResponseDto("new-access-token");

        _mockAuthService.Setup(s => s.RefreshTokenAsync(request.RefreshToken))
            .ReturnsAsync(response);

        // Act
        var result = await _controller.Refresh(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<RefreshTokenResponseDto>(okResult.Value);
        Assert.Equal("new-access-token", value.AccessToken);
    }

    [Fact]
    public async Task Refresh_WithExpiredToken_ReturnsUnauthorized()
    {
        // Arrange
        var request = new RefreshTokenRequestDto("expired-token");
        _mockAuthService.Setup(s => s.RefreshTokenAsync(request.RefreshToken))
            .ThrowsAsync(new UnauthorizedAccessException("Token expired"));

        // Act
        var result = await _controller.Refresh(request);

        // Assert
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Logout_WithValidUserClaim_ReturnsNoContent()
    {
        // Arrange
        var claims = new List<Claim> { new("userId", "1") };
        _controller.ControllerContext = CreateControllerContext(claims);
        _mockAuthService.Setup(s => s.LogoutAsync(1)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Logout();

        // Assert
        Assert.IsType<NoContentResult>(result);
        _mockAuthService.Verify(s => s.LogoutAsync(1), Times.Once);
    }

    [Fact]
    public async Task Logout_WithMissingUserClaim_ReturnsUnauthorized()
    {
        // Arrange - no userId claim
        _controller.ControllerContext = CreateControllerContext(new List<Claim>());

        // Act
        var result = await _controller.Logout();

        // Assert
        Assert.IsType<UnauthorizedResult>(result);
    }

    private static ControllerContext CreateControllerContext(IList<Claim> claims)
    {
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var user = new ClaimsPrincipal(identity);
        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }
}

public class OrganizationsControllerTests
{
    private readonly Mock<IOrganizationService> _mockOrgService;
    private readonly OrganizationsController _controller;

    public OrganizationsControllerTests()
    {
        _mockOrgService = new();
        _controller = new OrganizationsController(_mockOrgService.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkWithOrganizationList()
    {
        // Arrange
        var orgs = new List<OrganizationSummaryDto>
        {
            new(1, "Party A", "PA", true, 5),
            new(2, "Party B", "PB", true, 10)
        };
        _mockOrgService.Setup(s => s.GetAllAsync()).ReturnsAsync(orgs);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsAssignableFrom<IEnumerable<OrganizationSummaryDto>>(okResult.Value);
        Assert.Equal(2, ((List<OrganizationSummaryDto>)value).Count);
    }

    [Fact]
    public async Task GetById_WithValidId_ReturnsOk()
    {
        // Arrange
        var org = new OrganizationDto(1, "Party A", "PA", "a@a.com", "1 St", true, DateTime.UtcNow, 5);
        _mockOrgService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(org);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<OrganizationDto>(okResult.Value);
        Assert.Equal(1, value.OrganizationId);
        Assert.Equal("Party A", value.OrganizationName);
    }

    [Fact]
    public async Task GetById_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockOrgService.Setup(s => s.GetByIdAsync(999))
            .ThrowsAsync(new KeyNotFoundException());

        // Act
        var result = await _controller.GetById(999);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_WithValidData_ReturnsCreated()
    {
        // Arrange
        var dto = new CreateOrganizationDto("New Party", "NP", "c@c.com", "2 St", "admin@np.com", "Pass123!");
        var org = new OrganizationDto(3, "New Party", "NP", "c@c.com", "2 St", true, DateTime.UtcNow, 0);

        var claims = new List<Claim> { new("userId", "1") };
        _controller.ControllerContext = CreateControllerContext(claims);
        _mockOrgService.Setup(s => s.CreateAsync(dto, 1)).ReturnsAsync(org);

        // Act
        var result = await _controller.Create(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var value = Assert.IsType<OrganizationDto>(createdResult.Value);
        Assert.Equal("New Party", value.OrganizationName);
    }

    [Fact]
    public async Task Create_WithMissingClaim_ReturnsUnauthorized()
    {
        // Arrange
        var dto = new CreateOrganizationDto("P", "P", "e@e.com", "St", "a@a.com", "Pass1!");
        _controller.ControllerContext = CreateControllerContext(new List<Claim>());

        // Act
        var result = await _controller.Create(dto);

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task Create_WithDuplicateName_ReturnsBadRequest()
    {
        // Arrange
        var dto = new CreateOrganizationDto("Dup", "D", "d@d.com", "St", "ad@d.com", "Pass1!");
        var claims = new List<Claim> { new("userId", "1") };
        _controller.ControllerContext = CreateControllerContext(claims);
        _mockOrgService.Setup(s => s.CreateAsync(dto, 1))
            .ThrowsAsync(new InvalidOperationException("Name taken"));

        // Act
        var result = await _controller.Create(dto);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Update_WithValidData_ReturnsOk()
    {
        // Arrange
        var dto = new UpdateOrganizationDto("Updated", "UP", "u@u.com", "New St");
        var updated = new OrganizationDto(1, "Updated", "UP", "u@u.com", "New St", true, DateTime.UtcNow, 5);
        _mockOrgService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(updated);

        // Act
        var result = await _controller.Update(1, dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<OrganizationDto>(okResult.Value);
        Assert.Equal("Updated", value.OrganizationName);
    }

    [Fact]
    public async Task Update_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var dto = new UpdateOrganizationDto("X", "X", "x@x.com", "X St");
        _mockOrgService.Setup(s => s.UpdateAsync(999, dto))
            .ThrowsAsync(new KeyNotFoundException());

        // Act
        var result = await _controller.Update(999, dto);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Delete_WithValidId_ReturnsNoContent()
    {
        // Arrange
        _mockOrgService.Setup(s => s.DeleteAsync(1)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Delete(1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockOrgService.Setup(s => s.DeleteAsync(999))
            .ThrowsAsync(new KeyNotFoundException());

        // Act
        var result = await _controller.Delete(999);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    private static ControllerContext CreateControllerContext(IList<Claim> claims)
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }
}

public class EmployeesControllerTests
{
    private readonly Mock<IEmployeeService> _mockEmpService;
    private readonly EmployeesController _controller;

    public EmployeesControllerTests()
    {
        _mockEmpService = new();
        _controller = new EmployeesController(_mockEmpService.Object);
    }

    [Fact]
    public async Task GetByOrganization_ReturnsOkWithList()
    {
        // Arrange
        var employees = new List<EmployeeSummaryDto>
        {
            new(1, "John", "Doe", "john@test.com", true),
            new(2, "Jane", "Smith", "jane@test.com", true)
        };
        _mockEmpService.Setup(s => s.GetByOrganizationAsync(1)).ReturnsAsync(employees);

        // Act
        var result = await _controller.GetByOrganization(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.IsAssignableFrom<IEnumerable<EmployeeSummaryDto>>(okResult.Value);
    }

    [Fact]
    public async Task GetById_WithValidId_ReturnsOkWithEmployee()
    {
        // Arrange
        var empDto = new EmployeeDto(1, 1, "Test Org", "John", "Doe", "john@test.com", "555-0001", null, true, DateTime.UtcNow, null);
        _mockEmpService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(empDto);

        // Act
        var result = await _controller.GetById(1, 1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<EmployeeDto>(okResult.Value);
        Assert.Equal(1, value.EmployeeId);
    }

    [Fact]
    public async Task GetById_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockEmpService.Setup(s => s.GetByIdAsync(999)).ThrowsAsync(new KeyNotFoundException());

        // Act
        var result = await _controller.GetById(1, 999);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_WithValidData_ReturnsCreated()
    {
        // Arrange
        var dto = new CreateEmployeeDto("New", "Emp", "new@test.com", "Pass1!", "555-0001", null);
        var empDto = new EmployeeDto(3, 1, "Test Org", "New", "Emp", "new@test.com", "555-0001", null, true, DateTime.UtcNow, null);

        var claims = new List<Claim> { new("userId", "1") };
        _controller.ControllerContext = CreateControllerContext(claims);
        _mockEmpService.Setup(s => s.CreateAsync(1, dto, 1)).ReturnsAsync(empDto);

        // Act
        var result = await _controller.Create(1, dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(empDto, createdResult.Value);
    }

    [Fact]
    public async Task Create_WithMissingClaim_ReturnsUnauthorized()
    {
        // Arrange
        var dto = new CreateEmployeeDto("A", "B", "ab@test.com", "Pass1!", "555-0001", null);
        _controller.ControllerContext = CreateControllerContext(new List<Claim>());

        // Act
        var result = await _controller.Create(1, dto);

        // Assert
        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task Delete_WithValidId_ReturnsNoContent()
    {
        // Arrange
        _mockEmpService.Setup(s => s.DeleteAsync(1)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Delete(1, 1);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        _mockEmpService.Setup(s => s.DeleteAsync(999)).ThrowsAsync(new KeyNotFoundException());

        // Act
        var result = await _controller.Delete(1, 999);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    private static ControllerContext CreateControllerContext(IList<Claim> claims)
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }
}

public class DashboardControllerTests
{
    private readonly Mock<IDashboardService> _mockDashService;
    private readonly DashboardController _controller;

    public DashboardControllerTests()
    {
        _mockDashService = new();
        _controller = new DashboardController(_mockDashService.Object);
    }

    [Fact]
    public async Task GetOrganizationDashboard_WithValidOrgId_ReturnsOk()
    {
        // Arrange
        var dashboard = new DashboardDto(
            TotalEmployees: 10,
            ActiveEmployees: 8,
            TotalVotersLogged: 1200,
            TotalVotesCounted: 1150,
            TotalPollingStations: 5,
            StationSummaries: new List<StationSummaryDto>(),
            CandidateTallies: new List<CandidateTallyDto>()
        );
        _mockDashService.Setup(s => s.GetOrganizationDashboardAsync(1)).ReturnsAsync(dashboard);

        // Act
        var result = await _controller.GetOrganizationDashboard(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<DashboardDto>(okResult.Value);
        Assert.Equal(10, value.TotalEmployees);
    }

    [Fact]
    public async Task GetSystemDashboard_ReturnsOk()
    {
        // Arrange
        var dashboard = new DashboardDto(
            TotalEmployees: 50,
            ActiveEmployees: 45,
            TotalVotersLogged: 5000,
            TotalVotesCounted: 4800,
            TotalPollingStations: 20,
            StationSummaries: new List<StationSummaryDto>(),
            CandidateTallies: new List<CandidateTallyDto>()
        );
        _mockDashService.Setup(s => s.GetSystemDashboardAsync()).ReturnsAsync(dashboard);

        // Act
        var result = await _controller.GetSystemDashboard();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var value = Assert.IsType<DashboardDto>(okResult.Value);
        Assert.Equal(50, value.TotalEmployees);
    }
}

public class DataControllerTests
{
    private readonly Mock<IDataService> _mockDataService;
    private readonly DataController _controller;

    public DataControllerTests()
    {
        _mockDataService = new();
        _controller = new DataController(_mockDataService.Object);
    }

    private static ControllerContext CreateContext(string? employeeId)
    {
        var claims = new List<Claim>();
        if (employeeId != null) claims.Add(new Claim("employeeId", employeeId));
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        return new ControllerContext { HttpContext = new DefaultHttpContext { User = principal } };
    }

    [Fact]
    public async Task LogAttendance_WithValidClaim_ReturnsCreated()
    {
        _controller.ControllerContext = CreateContext("5");
        var dto = new LogVoterAttendanceDto(1, 100, "ok");
        var attendance = new VoterAttendanceDto(1, 5, "Emp Name", 1, "S1", 100, "ok", false, DateTime.UtcNow);
        _mockDataService.Setup(s => s.LogAttendanceAsync(5, dto)).ReturnsAsync(attendance);

        var result = await _controller.LogAttendance(dto);

        Assert.IsType<CreatedAtActionResult>(result.Result);
    }

    [Fact]
    public async Task LogAttendance_WithMissingClaim_ReturnsUnauthorized()
    {
        _controller.ControllerContext = CreateContext(null);
        var dto = new LogVoterAttendanceDto(1, 100, "ok");

        var result = await _controller.LogAttendance(dto);

        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task LogAttendance_WhenKeyNotFound_ReturnsNotFound()
    {
        _controller.ControllerContext = CreateContext("5");
        var dto = new LogVoterAttendanceDto(1, 100, "ok");
        _mockDataService.Setup(s => s.LogAttendanceAsync(It.IsAny<int>(), It.IsAny<LogVoterAttendanceDto>()))
            .ThrowsAsync(new KeyNotFoundException("Not Found"));

        var result = await _controller.LogAttendance(dto);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task LogVoteCount_WithValidClaim_ReturnsCreated()
    {
        _controller.ControllerContext = CreateContext("5");
        var dto = new LogVoteCountDto(1, "Alice", 50);
        var voteCount = new VoteCountDto(1, 5, "Emp", 1, "S1", "Alice", 50, false, DateTime.UtcNow);
        _mockDataService.Setup(s => s.LogVoteCountAsync(5, dto)).ReturnsAsync(voteCount);

        var result = await _controller.LogVoteCount(dto);

        Assert.IsType<CreatedAtActionResult>(result.Result);
    }

    [Fact]
    public async Task LogVoteCount_WithMissingClaim_ReturnsUnauthorized()
    {
        _controller.ControllerContext = CreateContext(null);
        var dto = new LogVoteCountDto(1, "Alice", 50);

        var result = await _controller.LogVoteCount(dto);

        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task GetMyAttendance_WithValidClaim_ReturnsOk()
    {
        _controller.ControllerContext = CreateContext("5");
        var list = new List<VoterAttendanceDto>
        {
            new(1, 5, "Emp", 1, "S1", 100, "ok", false, DateTime.UtcNow)
        };
        _mockDataService.Setup(s => s.GetAttendanceByEmployeeAsync(5)).ReturnsAsync(list);

        var result = await _controller.GetMyAttendance();

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetMyAttendance_WithMissingClaim_ReturnsUnauthorized()
    {
        _controller.ControllerContext = CreateContext(null);

        var result = await _controller.GetMyAttendance();

        Assert.IsType<UnauthorizedResult>(result.Result);
    }

    [Fact]
    public async Task GetMyVotes_WithValidClaim_ReturnsOk()
    {
        _controller.ControllerContext = CreateContext("5");
        var list = new List<VoteCountDto>
        {
            new(1, 5, "Emp", 1, "S1", "Alice", 50, false, DateTime.UtcNow)
        };
        _mockDataService.Setup(s => s.GetVoteCountsByEmployeeAsync(5)).ReturnsAsync(list);

        var result = await _controller.GetMyVotes();

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetMyVotes_WithMissingClaim_ReturnsUnauthorized()
    {
        _controller.ControllerContext = CreateContext(null);

        var result = await _controller.GetMyVotes();

        Assert.IsType<UnauthorizedResult>(result.Result);
    }
}

public class PollingStationsControllerTests
{
    private readonly Mock<IPollingStationService> _mockService;
    private readonly PollingStationsController _controller;

    public PollingStationsControllerTests()
    {
        _mockService = new();
        _controller = new PollingStationsController(_mockService.Object);
    }

    [Fact]
    public async Task GetByOrganization_ReturnsOk()
    {
        var stations = new List<PollingStationDto>
        {
            new(1, 1, "Station A", "Loc A", "Addr A", 100, DateTime.UtcNow)
        };
        _mockService.Setup(s => s.GetByOrganizationAsync(1)).ReturnsAsync(stations);

        var result = await _controller.GetByOrganization(1);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetById_WithValidId_ReturnsOk()
    {
        var station = new PollingStationDto(1, 1, "Station A", "Loc", "Addr", 100, DateTime.UtcNow);
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(station);

        var result = await _controller.GetById(1, 1);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetById_WithInvalidId_ReturnsNotFound()
    {
        _mockService.Setup(s => s.GetByIdAsync(99)).ThrowsAsync(new KeyNotFoundException());

        var result = await _controller.GetById(1, 99);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_WithValidData_ReturnsCreated()
    {
        var dto = new CreatePollingStationDto("New Station", "Loc", "Addr", 100);
        var station = new PollingStationDto(1, 1, "New Station", "Loc", "Addr", 100, DateTime.UtcNow);
        _mockService.Setup(s => s.CreateAsync(1, dto)).ReturnsAsync(station);

        var result = await _controller.Create(1, dto);

        Assert.IsType<CreatedAtActionResult>(result.Result);
    }

    [Fact]
    public async Task Update_WithValidData_ReturnsOk()
    {
        var dto = new UpdatePollingStationDto("Updated", "Loc", "Addr", 200);
        var station = new PollingStationDto(1, 1, "Updated", "Loc", "Addr", 200, DateTime.UtcNow);
        _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(station);

        var result = await _controller.Update(1, 1, dto);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Update_WithInvalidId_ReturnsNotFound()
    {
        var dto = new UpdatePollingStationDto("Updated", "Loc", "Addr", 200);
        _mockService.Setup(s => s.UpdateAsync(99, It.IsAny<UpdatePollingStationDto>()))
            .ThrowsAsync(new KeyNotFoundException());

        var result = await _controller.Update(1, 99, dto);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Delete_WithValidId_ReturnsNoContent()
    {
        _mockService.Setup(s => s.DeleteAsync(1)).Returns(Task.CompletedTask);

        var result = await _controller.Delete(1, 1);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_WithInvalidId_ReturnsNotFound()
    {
        _mockService.Setup(s => s.DeleteAsync(99)).ThrowsAsync(new KeyNotFoundException());

        var result = await _controller.Delete(1, 99);

        Assert.IsType<NotFoundResult>(result);
    }
}

public class AuditLogsControllerTests
{
    private readonly Mock<IAuditLogRepository> _mockRepo;
    private readonly AuditLogsController _controller;

    public AuditLogsControllerTests()
    {
        _mockRepo = new();
        _controller = new AuditLogsController(_mockRepo.Object);
    }

    private static AuditLog MakeAuditLog(int id, int orgId = 1) => new()
    {
        AuditId = id,
        UserId = 1,
        OrganizationId = orgId,
        EntityType = "Employee",
        EntityId = 1,
        Action = "Create",
        Timestamp = DateTime.UtcNow,
        User = new User { UserId = 1, Email = "a@test.com", FirstName = "Admin", LastName = "User", PasswordHash = "h", RoleId = 1 },
        Organization = new Organization { OrganizationId = orgId, OrganizationName = "Org", PartyName = "Party", CreatedByUserId = 1 }
    };

    [Fact]
    public async Task GetByOrganization_ReturnsOk()
    {
        var logs = new List<AuditLog> { MakeAuditLog(1) };
        _mockRepo.Setup(r => r.GetByOrganizationAsync(1)).ReturnsAsync(logs);

        var result = await _controller.GetByOrganization(1);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetRecent_ReturnsOk()
    {
        var logs = new List<AuditLog> { MakeAuditLog(1), MakeAuditLog(2) };
        _mockRepo.Setup(r => r.GetRecentAsync(It.IsAny<int>())).ReturnsAsync(logs);

        var result = await _controller.GetRecent(50);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetByUser_ReturnsOk()
    {
        var logs = new List<AuditLog> { MakeAuditLog(1) };
        _mockRepo.Setup(r => r.GetByUserAsync(1)).ReturnsAsync(logs);

        var result = await _controller.GetByUser(1);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetByEntity_ReturnsOk()
    {
        var logs = new List<AuditLog> { MakeAuditLog(1) };
        _mockRepo.Setup(r => r.GetByEntityAsync("Employee", 1)).ReturnsAsync(logs);

        var result = await _controller.GetByEntity("Employee", 1);

        Assert.IsType<OkObjectResult>(result.Result);
    }
}

public class EmployeesControllerUpdateTests
{
    private readonly Mock<IEmployeeService> _mockService;
    private readonly EmployeesController _controller;

    public EmployeesControllerUpdateTests()
    {
        _mockService = new();
        _controller = new EmployeesController(_mockService.Object);
    }

    [Fact]
    public async Task Update_WithValidId_ReturnsOk()
    {
        var dto = new UpdateEmployeeDto("Jane", "Doe", "j@test.com", "555", DateTime.Parse("1990-01-01"), true);
        var emp = new EmployeeDto(1, 1, "Org", "Jane", "Doe", "j@test.com", "555", DateTime.Parse("1990-01-01"), true, DateTime.UtcNow, null);
        _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(emp);

        var result = await _controller.Update(1, 1, dto);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Update_WithInvalidId_ReturnsNotFound()
    {
        var dto = new UpdateEmployeeDto("Jane", "Doe", "j@test.com", "555", DateTime.Parse("1990-01-01"), true);
        _mockService.Setup(s => s.UpdateAsync(99, It.IsAny<UpdateEmployeeDto>()))
            .ThrowsAsync(new KeyNotFoundException());

        var result = await _controller.Update(1, 99, dto);

        Assert.IsType<NotFoundResult>(result.Result);
    }
}

public class DataControllerAdditionalTests
{
    private readonly Mock<IDataService> _mockDataService;
    private readonly DataController _controller;

    public DataControllerAdditionalTests()
    {
        _mockDataService = new();
        _controller = new DataController(_mockDataService.Object);
    }

    private static ControllerContext CreateContext(string? employeeId)
    {
        var claims = new List<Claim>();
        if (employeeId != null) claims.Add(new Claim("employeeId", employeeId));
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        return new ControllerContext { HttpContext = new DefaultHttpContext { User = principal } };
    }

    [Fact]
    public async Task LogVoteCount_WhenKeyNotFound_ReturnsNotFound()
    {
        _controller.ControllerContext = CreateContext("5");
        var dto = new LogVoteCountDto(1, "Alice", 50);
        _mockDataService.Setup(s => s.LogVoteCountAsync(It.IsAny<int>(), It.IsAny<LogVoteCountDto>()))
            .ThrowsAsync(new KeyNotFoundException("Not found"));

        var result = await _controller.LogVoteCount(dto);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task LogVoteCount_WhenInvalidOperation_ReturnsBadRequest()
    {
        _controller.ControllerContext = CreateContext("5");
        var dto = new LogVoteCountDto(1, "Alice", 50);
        _mockDataService.Setup(s => s.LogVoteCountAsync(It.IsAny<int>(), It.IsAny<LogVoteCountDto>()))
            .ThrowsAsync(new InvalidOperationException("Already logged"));

        var result = await _controller.LogVoteCount(dto);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task LogAttendance_WhenInvalidOperation_ReturnsBadRequest()
    {
        _controller.ControllerContext = CreateContext("5");
        var dto = new LogVoterAttendanceDto(1, 100, "ok");
        _mockDataService.Setup(s => s.LogAttendanceAsync(It.IsAny<int>(), It.IsAny<LogVoterAttendanceDto>()))
            .ThrowsAsync(new InvalidOperationException("Already logged today"));

        var result = await _controller.LogAttendance(dto);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }
}

public class PollingStationsControllerAdditionalTests
{
    private readonly Mock<IPollingStationService> _mockService;
    private readonly PollingStationsController _controller;

    public PollingStationsControllerAdditionalTests()
    {
        _mockService = new();
        _controller = new PollingStationsController(_mockService.Object);
    }

    [Fact]
    public async Task Create_WhenKeyNotFound_ReturnsNotFound()
    {
        var dto = new CreatePollingStationDto("Station", "Loc", "Addr", 100);
        _mockService.Setup(s => s.CreateAsync(It.IsAny<int>(), It.IsAny<CreatePollingStationDto>()))
            .ThrowsAsync(new KeyNotFoundException("Organization not found"));

        var result = await _controller.Create(1, dto);

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }
}
