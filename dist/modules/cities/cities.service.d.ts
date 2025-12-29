import { Repository } from 'typeorm';
import { City } from '../../entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
export declare class CitiesService {
    private citiesRepository;
    constructor(citiesRepository: Repository<City>);
    findAll(): Promise<City[]>;
    findOne(id: string): Promise<City>;
    create(createCityDto: CreateCityDto): Promise<City>;
}
