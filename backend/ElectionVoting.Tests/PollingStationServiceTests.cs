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
/// PollingStationService Tests - Polling station management
/// Constructor: PollingStationService(IPollingStationRepository)
/// 
/// Public Methods:
/// - GetByOrganizationAsync(int organizationId) -> Task<IEnumerable<PollingStationDto>>
/// - GetByIdAsync(int id) -> Task<PollingStationDto>
/// - CreateAsync(int organizationId, CreatePollingStationDto dto) -> Task<PollingStationDto>
/// - UpdateAsync(int id, UpdatePollingStationDto dto) -> Task<PollingStationDto>
/// - DeleteAsync(int id) -> Task
/// </summary>
public class PollingStationServiceTests
{
    private readonly Mock<IPollingStationRepository> _mockStationRepo;
    private readonly PollingStationService _stationService;

    public PollingStationServiceTests()
    {
        _mockStationRepo = new();
        _stationService = new PollingStationService(_mockStationRepo.Object);
    }

    [Fact]
    public async Task GetByOrganizationAsync_WithValidOrgId_ReturnsStationList()
    {
        // Arrange
        int orgId = 1;
        var stations = new List<PollingStation>
        {
            new() { PollingStationId = 1, OrganizationId = orgId, StationName = "Station 1", Location = "Downtown", Address = "123 Main St", Capacity = 500 },
            new() { PollingStationId = 2, OrganizationId = orgId, StationName = "Station 2", Location = "Uptown", Address = "456 Oak Ave", Capacity = 300 },
            new() { PollingStationId = 3, OrganizationId = orgId, StationName = "Station 3", Location = "Suburb", Address = "789 Elm Dr", Capacity = 250 }
        };

        _mockStationRepo.Setup(r => r.GetByOrganizationAsync(orgId))
            .ReturnsAsync(stations);

        // Act
        var result = await _stationService.GetByOrganizationAsync(orgId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsStationDto()
    {
        // Arrange
        int stationId = 1;
        var station = new PollingStation
        {
            PollingStationId = stationId,
            OrganizationId = 1,
            StationName = "Central Station",
            Location = "City Center",
            Address = "100 Central Blvd",
            Capacity = 1000
        };

        _mockStationRepo.Setup(r => r.GetByIdAsync(stationId))
            .ReturnsAsync(station);

        // Act
        var result = await _stationService.GetByIdAsync(stationId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Central Station", result.StationName);
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ThrowsKeyNotFoundException()
    {
        // Arrange
        int invalidStationId = 999;
#pragma warning disable CS8600
        _mockStationRepo.Setup(r => r.GetByIdAsync(invalidStationId))
            .ReturnsAsync((PollingStation)null);
#pragma warning restore CS8600

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _stationService.GetByIdAsync(invalidStationId));

        _mockStationRepo.Verify(r => r.GetByIdAsync(invalidStationId), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ReturnsNewStation()
    {
        // Arrange
        int orgId = 1;
        var createDto = new CreatePollingStationDto("New Station", "New Area", "999 New St", 800);
        var newStation = new PollingStation
        {
            PollingStationId = 4,
            OrganizationId = orgId,
            StationName = "New Station",
            Location = "New Area",
            Address = "999 New St",
            Capacity = 800
        };

        _mockStationRepo.Setup(r => r.AddAsync(It.IsAny<PollingStation>()))
            .ReturnsAsync(newStation);
        _mockStationRepo.Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _stationService.CreateAsync(orgId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("New Station", result.StationName);
        _mockStationRepo.Verify(r => r.AddAsync(It.IsAny<PollingStation>()), Times.Once);
        _mockStationRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithDifferentCapacity_PersistsCorrectly()
    {
        // Arrange
        int orgId = 1;
        var createDto = new CreatePollingStationDto("Station X", "Area X", "Address X", 1200);
        var newStation = new PollingStation
        {
            PollingStationId = 5,
            OrganizationId = orgId,
            StationName = "Station X",
            Location = "Area X",
            Address = "Address X",
            Capacity = 1200
        };

        _mockStationRepo.Setup(r => r.AddAsync(It.IsAny<PollingStation>()))
            .ReturnsAsync(newStation);
        _mockStationRepo.Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _stationService.CreateAsync(orgId, createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1200, result.Capacity);
        _mockStationRepo.Verify(r => r.AddAsync(It.IsAny<PollingStation>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_ReturnsUpdatedStation()
    {
        // Arrange
        int stationId = 1;
        var updateDto = new UpdatePollingStationDto("Updated Name", "Updated Location", "Updated Address", 600);
        var existingStation = new PollingStation
        {
            PollingStationId = stationId,
            OrganizationId = 1,
            StationName = "Old Name",
            Location = "Old Location",
            Address = "Old Address",
            Capacity = 500
        };

        _mockStationRepo.Setup(r => r.GetByIdAsync(stationId))
            .ReturnsAsync(existingStation);
        _mockStationRepo.Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        var result = await _stationService.UpdateAsync(stationId, updateDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.StationName);
        _mockStationRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithInvalidId_ThrowsKeyNotFoundException()
    {
        // Arrange
        int invalidStationId = 999;
        var updateDto = new UpdatePollingStationDto("Name", "Location", "Address", 500);

#pragma warning disable CS8600
        _mockStationRepo.Setup(r => r.GetByIdAsync(invalidStationId))
            .ReturnsAsync((PollingStation)null);
#pragma warning restore CS8600

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _stationService.UpdateAsync(invalidStationId, updateDto));

        _mockStationRepo.Verify(r => r.GetByIdAsync(invalidStationId), Times.Once);
        _mockStationRepo.Verify(r => r.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_CallsRepository()
    {
        // Arrange
        int stationId = 1;
        var station = new PollingStation
        {
            PollingStationId = stationId,
            OrganizationId = 1,
            StationName = "Station to Delete",
            Location = "Location",
            Address = "Address",
            Capacity = 500
        };

        _mockStationRepo.Setup(r => r.GetByIdAsync(stationId))
            .ReturnsAsync(station);
        _mockStationRepo.Setup(r => r.DeleteAsync(It.IsAny<PollingStation>()))
            .Returns(Task.CompletedTask);
        _mockStationRepo.Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(1);

        // Act
        await _stationService.DeleteAsync(stationId);

        // Assert
        _mockStationRepo.Verify(r => r.DeleteAsync(It.IsAny<PollingStation>()), Times.Once);
        _mockStationRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WithInvalidId_ThrowsKeyNotFoundException()
    {
        // Arrange
        int invalidStationId = 999;
#pragma warning disable CS8600
        _mockStationRepo.Setup(r => r.GetByIdAsync(invalidStationId))
            .ReturnsAsync((PollingStation)null);
#pragma warning restore CS8600

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _stationService.DeleteAsync(invalidStationId));

        _mockStationRepo.Verify(r => r.GetByIdAsync(invalidStationId), Times.Once);
        _mockStationRepo.Verify(r => r.DeleteAsync(It.IsAny<PollingStation>()), Times.Never);
        _mockStationRepo.Verify(r => r.SaveChangesAsync(), Times.Never);
    }
}
