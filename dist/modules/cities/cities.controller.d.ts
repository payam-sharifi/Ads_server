import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
export declare class CitiesController {
    private readonly citiesService;
    constructor(citiesService: CitiesService);
    findAll(): Promise<import("../../entities/city.entity").City[]>;
    findOne(id: string): Promise<import("../../entities/city.entity").City>;
    create(createCityDto: CreateCityDto): Promise<import("../../entities/city.entity").City>;
}
