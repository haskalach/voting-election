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
/// OrganizationService Tests - Organization CRUD operations
/// Constructor: OrganizationService(IOrganizationRepository, IUserRepository, IEmployeeRepository, IRoleRepository)
///
/// Public Methods:
/// - GetAllAsync() -> Task<IEnumerable<OrganizationSummaryDto>>
/// - GetByIdAsync(int id) -> Task<OrganizationDto>
/// - CreateAsync(CreateOrganizationDto dto, int createdByUserId) -> Task<OrganizationDto>
/// - UpdateAsync(int id, UpdateOrganizationDto dto) -> Task<OrganizationDto>
/// - DeleteAsync(int id) -> Task
/// </summary>
public class OrganizationServiceTests
{
    private readonly Mock<IOrganizationRepository> _mockOrgRepo;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<IEmployeeRepository> _mockEmployeeRepo;
    private readonly Mock<IRoleRepository> _mockRoleRepo;
    private readonly OrganizationService _orgService;

    public OrganizationServiceTests()
    {
        _mockOrgRepo = new();
        _mockUserRepo = new();
        _mockEmployeeRepo = new();
        _mockRoleRepo = new();

        _orgService = new OrganizationService(
            _mockOrgRepo.Object,
            _mockUserRepo.Object,
            _mockEmployeeRepo.Object,
            _mockRoleRepo.Object
        );
    }

    [Fact]
    public async Task GetAllAsync_WithOrganizations_ReturnsSummaryList()
    {
        // Arrange
        var organizations = new List<Organization>
        {
            new() { OrganizationId = 1, OrganizationName = "Party A", PartyName = "PA", IsActive = true, Employees = new List<Employee> { new(), new() } },
            new() { OrganizationId = 2, OrganizationName = "Party B", PartyName = "PB", IsActive = false, Employees = new List<Employee>() }
        };

        _mockOrgRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(organizations);

        // Act
        var result = (await _orgService.GetAllAsync()).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal("Party A", result[0].OrganizationName);
        Assert.Equal(2, result[0].EmployeeCount);
        Assert.True(result[0].IsActive);
        Assert.Equal(0, result[1].EmployeeCount);
        Assert.False(result[1].IsActive);
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsOrganizationDto()
    {
        // Arrange
        int orgId = 1;
        var org = new Organization
        {
            OrganizationId = orgId,
            OrganizationName = "Test Org",
            PartyName = "Test Party",
            ContactEmail = "contact@test.com",
            Address = "123 Test St",
            IsActive = true,
            Employees = new List<Employee>()
        };

        _mockOrgRepo.Setup(r => r.GetWithEmployeesAsync(orgId)).ReturnsAsync(org);

        // Act
        var result = await _orgService.GetByIdAsync(orgId);

        // Assert
        Assert.Equal(orgId, result.OrganizationId);
        Assert.Equal("Test Org", result.OrganizationName);
        Assert.Equal("Test Party", result.PartyName);
        Assert.Equal("contact@test.com", result.ContactEmail);
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockOrgRepo.Setup(r => r.GetWithEmployeesAsync(It.IsAny<int>()))
            .ReturnsAsync((Organization?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _orgService.GetByIdAsync(999));
    }

    [Fact]
    public async Task CreateAsync_WithValidData_CreatesOrganizationAndAdminUser()
    {
        // Arrange
        var dto = new CreateOrganizationDto(
            "New Party",
            "NP",
            "admin@newparty.com",
            "100 Main St",
            "admin@newparty.com",
            "SecurePass123!"
        );

        var managerRole = new Role { RoleId = 2, RoleName = Role.Names.Manager };

        _mockOrgRepo.Setup(r => r.NameExistsAsync(dto.OrganizationName)).ReturnsAsync(false);
        _mockUserRepo.Setup(r => r.EmailExistsAsync(dto.AdminEmail)).ReturnsAsync(false);
        _mockRoleRepo.Setup(r => r.GetByNameAsync(Role.Names.Manager)).ReturnsAsync(managerRole);
        _mockUserRepo.Setup(r => r.AddAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);
        _mockUserRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);
        _mockOrgRepo.Setup(r => r.AddAsync(It.IsAny<Organization>())).ReturnsAsync((Organization o) => o);
        _mockOrgRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);
        _mockEmployeeRepo.Setup(r => r.AddAsync(It.IsAny<Employee>())).ReturnsAsync((Employee e) => e);
        _mockEmployeeRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);

        // Act
        var result = await _orgService.CreateAsync(dto, createdByUserId: 1);

        // Assert
        Assert.Equal("New Party", result.OrganizationName);
        _mockUserRepo.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        _mockOrgRepo.Verify(r => r.AddAsync(It.IsAny<Organization>()), Times.Once);
        _mockEmployeeRepo.Verify(r => r.AddAsync(It.IsAny<Employee>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithExistingOrgName_ThrowsInvalidOperationException()
    {
        // Arrange
        var dto = new CreateOrganizationDto(
            "Existing Party", "EP", "admin@ep.com", "1 St", "admin@ep.com", "Pass123!"
        );

        _mockOrgRepo.Setup(r => r.NameExistsAsync(dto.OrganizationName)).ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _orgService.CreateAsync(dto, 1));
    }

    [Fact]
    public async Task CreateAsync_WithExistingAdminEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        var dto = new CreateOrganizationDto(
            "New Party", "NP", "taken@email.com", "1 St", "taken@email.com", "Pass123!"
        );

        _mockOrgRepo.Setup(r => r.NameExistsAsync(dto.OrganizationName)).ReturnsAsync(false);
        _mockUserRepo.Setup(r => r.EmailExistsAsync(dto.AdminEmail)).ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _orgService.CreateAsync(dto, 1));
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_ReturnsUpdatedOrganization()
    {
        // Arrange
        int orgId = 1;
        var org = new Organization
        {
            OrganizationId = orgId,
            OrganizationName = "Old Name",
            PartyName = "Old Party",
            ContactEmail = "old@email.com",
            Address = "Old Address",
            Employees = new List<Employee>()
        };

        var updateDto = new UpdateOrganizationDto(
            "Updated Name", "Updated Party", "new@email.com", "New Address"
        );

        _mockOrgRepo.Setup(r => r.GetByIdAsync(orgId)).ReturnsAsync(org);
        _mockOrgRepo.Setup(r => r.UpdateAsync(It.IsAny<Organization>())).Returns(Task.CompletedTask);
        _mockOrgRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);

        // Act
        var result = await _orgService.UpdateAsync(orgId, updateDto);

        // Assert
        Assert.Equal("Updated Name", result.OrganizationName);
        Assert.Equal("Updated Party", result.PartyName);
        Assert.Equal("new@email.com", result.ContactEmail);
        _mockOrgRepo.Verify(r => r.UpdateAsync(It.IsAny<Organization>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithInvalidId_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockOrgRepo.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((Organization?)null);

        var dto = new UpdateOrganizationDto("Name", "Party", "email@test.com", "Addr");

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _orgService.UpdateAsync(999, dto));
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_DeletesOrgAndEmployees()
    {
        // Arrange
        int orgId = 1;
        var employee1 = new Employee { EmployeeId = 10 };
        var employee2 = new Employee { EmployeeId = 11 };
        var org = new Organization
        {
            OrganizationId = orgId,
            OrganizationName = "To Delete",
            Employees = new List<Employee> { employee1, employee2 }
        };

        _mockOrgRepo.Setup(r => r.GetWithEmployeesAsync(orgId)).ReturnsAsync(org);
        _mockEmployeeRepo.Setup(r => r.DeleteAsync(It.IsAny<Employee>())).Returns(Task.CompletedTask);
        _mockOrgRepo.Setup(r => r.DeleteAsync(It.IsAny<Organization>())).Returns(Task.CompletedTask);
        _mockOrgRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);

        // Act
        await _orgService.DeleteAsync(orgId);

        // Assert
        _mockEmployeeRepo.Verify(r => r.DeleteAsync(It.IsAny<Employee>()), Times.Exactly(2));
        _mockOrgRepo.Verify(r => r.DeleteAsync(org), Times.Once);
        _mockOrgRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WithInvalidId_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockOrgRepo.Setup(r => r.GetWithEmployeesAsync(It.IsAny<int>()))
            .ReturnsAsync((Organization?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _orgService.DeleteAsync(999));
    }
}
