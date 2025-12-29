import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../../entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';

/**
 * Cities Service
 * 
 * Handles city-related operations:
 * - List all cities
 * - Get city by ID
 * - Create city (admin only)
 */
@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private citiesRepository: Repository<City>,
  ) {}

  /**
   * Find all cities
   */
  async findAll(): Promise<City[]> {
    return this.citiesRepository.find({
      where: { deletedAt: null },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Find city by ID
   */
  async findOne(id: string): Promise<City> {
    const city = await this.citiesRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  /**
   * Create a new city
   */
  async create(createCityDto: CreateCityDto): Promise<City> {
    const city = this.citiesRepository.create(createCityDto);
    return this.citiesRepository.save(city);
  }
}

