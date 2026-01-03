import { Injectable, BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRealEstateAdDto } from '../dto/create-ad-real-estate.dto';
import { CreateVehicleAdDto } from '../dto/create-ad-vehicle.dto';
import { CreateServiceAdDto } from '../dto/create-ad-service.dto';
import { CreateJobAdDto } from '../dto/create-ad-job.dto';
import { MainCategoryType } from '../../../types/category.types';
import { CreateAdDto } from '../dto/create-ad.dto';

/**
 * Service for validating category-specific ad fields
 */
@Injectable()
export class CategoryValidatorService {
  /**
   * Validate category-specific fields based on category type
   */
  async validateCategoryFields(createAdDto: CreateAdDto, categoryType: MainCategoryType): Promise<Record<string, any>> {
    let metadata: Record<string, any> = {};
    let validatedDto: any;

    switch (categoryType) {
      case MainCategoryType.REAL_ESTATE:
        validatedDto = await this.validateRealEstate(createAdDto);
        metadata = this.extractRealEstateMetadata(validatedDto);
        break;

      case MainCategoryType.VEHICLES:
        validatedDto = await this.validateVehicle(createAdDto);
        metadata = this.extractVehicleMetadata(validatedDto);
        break;

      case MainCategoryType.SERVICES:
        validatedDto = await this.validateService(createAdDto);
        metadata = this.extractServiceMetadata(validatedDto);
        break;

      case MainCategoryType.JOBS:
        validatedDto = await this.validateJob(createAdDto);
        metadata = this.extractJobMetadata(validatedDto);
        break;

      case MainCategoryType.MISC:
        // Misc category only needs title and description, no additional validation needed
        metadata = {};
        break;

      default:
        throw new BadRequestException(`Invalid category type: ${categoryType}`);
    }

    return metadata;
  }

  /**
   * Validate Real Estate ad fields
   */
  private async validateRealEstate(dto: CreateAdDto): Promise<CreateRealEstateAdDto> {
    const realEstateDto = plainToClass(CreateRealEstateAdDto, {
      title: dto.title,
      description: dto.description,
      cityId: dto.cityId,
      offerType: dto.offerType,
      propertyType: dto.propertyType,
      postalCode: dto.postalCode,
      district: dto.district,
      price: dto.price,
      coldRent: dto.coldRent,
      additionalCosts: dto.additionalCosts,
      deposit: dto.deposit,
      livingArea: dto.livingArea,
      rooms: dto.rooms,
      floor: dto.floor,
      totalFloors: dto.totalFloors,
      yearBuilt: dto.yearBuilt,
      availableFrom: dto.availableFrom,
      furnished: dto.furnished,
      balcony: dto.balcony,
      elevator: dto.elevator,
      parkingIncluded: dto.parkingIncluded,
      cellar: dto.cellar,
    });

    const errors = await validate(realEstateDto);
    if (errors.length > 0) {
      const errorMessages = errors.map((e) => Object.values(e.constraints || {})).flat();
      throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
    }

    // Additional business logic validation
    if (realEstateDto.offerType === 'sale' && !realEstateDto.price) {
      throw new BadRequestException('Price is required for sale properties');
    }
    if (realEstateDto.offerType === 'rent' && !realEstateDto.coldRent) {
      throw new BadRequestException('Cold rent is required for rental properties');
    }

    return realEstateDto;
  }

  /**
   * Validate Vehicle ad fields
   */
  private async validateVehicle(dto: CreateAdDto): Promise<CreateVehicleAdDto> {
    const vehicleDto = plainToClass(CreateVehicleAdDto, {
      title: dto.title,
      description: dto.description,
      cityId: dto.cityId,
      price: dto.price,
      vehicleType: dto.vehicleType,
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      mileage: dto.mileage,
      fuelType: dto.fuelType,
      transmission: dto.transmission,
      powerHP: dto.powerHP,
      engineSize: dto.engineSize,
      doors: dto.doors,
      seats: dto.seats,
      loadCapacity: dto.loadCapacity,
      condition: dto.condition,
      damageStatus: dto.damageStatus,
      inspectionValidUntil: dto.inspectionValidUntil,
      postalCode: dto.postalCode,
    });

    const errors = await validate(vehicleDto);
    if (errors.length > 0) {
      const errorMessages = errors.map((e) => Object.values(e.constraints || {})).flat();
      throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
    }

    return vehicleDto;
  }

  /**
   * Validate Service ad fields
   */
  private async validateService(dto: CreateAdDto): Promise<CreateServiceAdDto> {
    const serviceDto = plainToClass(CreateServiceAdDto, {
      title: dto.title,
      description: dto.description,
      cityId: dto.cityId,
      serviceCategory: dto.serviceCategory,
      pricingType: dto.pricingType,
      price: dto.price,
      serviceRadius: dto.serviceRadius,
      experienceYears: dto.experienceYears,
      certificates: dto.certificates,
    });

    const errors = await validate(serviceDto);
    if (errors.length > 0) {
      const errorMessages = errors.map((e) => Object.values(e.constraints || {})).flat();
      throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
    }

    // Business logic: price required if not negotiable
    if (serviceDto.pricingType !== 'negotiable' && !serviceDto.price) {
      throw new BadRequestException('Price is required for fixed or hourly pricing');
    }

    return serviceDto;
  }

  /**
   * Validate Job ad fields
   */
  private async validateJob(dto: CreateAdDto): Promise<CreateJobAdDto> {
    const jobDto = plainToClass(CreateJobAdDto, {
      jobTitle: dto.jobTitle || dto.title, // Fallback to title if jobTitle not provided
      jobDescription: dto.jobDescription || dto.description,
      cityId: dto.cityId,
      jobType: dto.jobType,
      industry: dto.industry,
      experienceLevel: dto.experienceLevel,
      educationRequired: dto.educationRequired,
      languageRequired: dto.languageRequired,
      remotePossible: dto.remotePossible,
      salaryFrom: dto.salaryFrom,
      salaryTo: dto.salaryTo,
      salaryType: dto.salaryType,
      companyName: dto.companyName,
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
    });

    const errors = await validate(jobDto);
    if (errors.length > 0) {
      const errorMessages = errors.map((e) => Object.values(e.constraints || {})).flat();
      throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
    }

    return jobDto;
  }

  /**
   * Extract metadata for Real Estate
   */
  private extractRealEstateMetadata(dto: CreateRealEstateAdDto): Record<string, any> {
    return {
      offerType: dto.offerType,
      propertyType: dto.propertyType,
      postalCode: dto.postalCode,
      district: dto.district,
      price: dto.price,
      coldRent: dto.coldRent,
      additionalCosts: dto.additionalCosts,
      deposit: dto.deposit,
      livingArea: dto.livingArea,
      rooms: dto.rooms,
      floor: dto.floor,
      totalFloors: dto.totalFloors,
      yearBuilt: dto.yearBuilt,
      availableFrom: dto.availableFrom,
      furnished: dto.furnished,
      balcony: dto.balcony,
      elevator: dto.elevator,
      parkingIncluded: dto.parkingIncluded,
      cellar: dto.cellar,
    };
  }

  /**
   * Extract metadata for Vehicle
   */
  private extractVehicleMetadata(dto: CreateVehicleAdDto): Record<string, any> {
    return {
      vehicleType: dto.vehicleType,
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      mileage: dto.mileage,
      fuelType: dto.fuelType,
      transmission: dto.transmission,
      powerHP: dto.powerHP,
      condition: dto.condition,
      damageStatus: dto.damageStatus,
      inspectionValidUntil: dto.inspectionValidUntil,
      postalCode: dto.postalCode,
    };
  }

  /**
   * Extract metadata for Service
   */
  private extractServiceMetadata(dto: CreateServiceAdDto): Record<string, any> {
    return {
      serviceCategory: dto.serviceCategory,
      pricingType: dto.pricingType,
      price: dto.price,
      serviceRadius: dto.serviceRadius,
      experienceYears: dto.experienceYears,
      certificates: dto.certificates,
    };
  }

  /**
   * Extract metadata for Job
   */
  private extractJobMetadata(dto: CreateJobAdDto): Record<string, any> {
    return {
      jobTitle: dto.jobTitle,
      jobDescription: dto.jobDescription,
      jobType: dto.jobType,
      industry: dto.industry,
      experienceLevel: dto.experienceLevel,
      educationRequired: dto.educationRequired,
      languageRequired: dto.languageRequired,
      remotePossible: dto.remotePossible,
      salaryFrom: dto.salaryFrom,
      salaryTo: dto.salaryTo,
      salaryType: dto.salaryType,
      companyName: dto.companyName,
    };
  }
}

