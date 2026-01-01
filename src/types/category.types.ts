/**
 * Category Types and Definitions
 * 
 * Defines the structure for the 4 main categories and their field requirements
 * inspired by kleinanzeigen.de
 */

// ============================================
// MAIN CATEGORIES
// ============================================

export enum MainCategoryType {
  REAL_ESTATE = 'real_estate',
  VEHICLES = 'vehicles',
  SERVICES = 'services',
  JOBS = 'jobs',
  MISC = 'misc',
}

// ============================================
// REAL ESTATE TYPES
// ============================================

export enum RealEstateOfferType {
  SALE = 'sale',
  RENT = 'rent',
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  COMMERCIAL = 'commercial',
  LAND = 'land',
  PARKING = 'parking',
}

export interface RealEstateMetadata {
  // Basic
  offerType: RealEstateOfferType;
  propertyType: PropertyType;
  
  // Location
  postalCode: string;
  district?: string;
  
  // Pricing
  price?: number; // Required if sale
  coldRent?: number; // Required if rent
  additionalCosts?: number;
  deposit?: number;
  
  // Property Details
  livingArea: number;
  rooms: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  availableFrom?: string; // ISO date string
  
  // Features
  furnished?: boolean;
  balcony?: boolean;
  elevator?: boolean;
  parkingIncluded?: boolean;
  cellar?: boolean;
  
  // Contact (stored separately in Ad entity, but validated together)
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// ============================================
// VEHICLE TYPES
// ============================================

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  VAN = 'van',
  BIKE = 'bike',
}

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

export enum DamageStatus {
  NONE = 'none',
  ACCIDENT = 'accident',
}

export interface VehicleMetadata {
  // Basic
  vehicleType: VehicleType;
  
  // Vehicle Specs
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  powerHP?: number;
  
  // Condition
  condition: 'new' | 'used';
  damageStatus: DamageStatus;
  inspectionValidUntil?: string; // ISO date string
  
  // Location
  postalCode: string;
  
  // Contact
  contactName?: string;
  contactPhone?: string;
}

// ============================================
// SERVICE TYPES
// ============================================

export enum ServiceCategory {
  HOME_SERVICES = 'home_services',
  TRANSPORT = 'transport',
  REPAIRS = 'repairs',
  IT_DESIGN = 'it_design',
  EDUCATION = 'education',
  PERSONAL_SERVICES = 'personal_services',
}

export enum PricingType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  NEGOTIABLE = 'negotiable',
}

export interface ServiceMetadata {
  // Basic
  serviceCategory: ServiceCategory;
  
  // Pricing
  pricingType: PricingType;
  price?: number;
  
  // Service Area
  serviceRadius?: number;
  
  // Trust
  experienceYears?: number;
  certificates?: string;
  
  // Contact
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// ============================================
// JOB TYPES
// ============================================

export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  MINI_JOB = 'mini-job',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
}

export enum ExperienceLevel {
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
}

export enum SalaryType {
  HOURLY = 'hourly',
  MONTHLY = 'monthly',
}

export interface JobMetadata {
  // Job Info
  jobTitle: string;
  jobDescription: string;
  jobType: JobType;
  industry: string;
  
  // Requirements
  experienceLevel?: ExperienceLevel;
  educationRequired?: string;
  languageRequired?: string;
  remotePossible?: boolean;
  
  // Salary
  salaryFrom?: number;
  salaryTo?: number;
  salaryType?: SalaryType;
  
  // Contact
  companyName: string;
  contactName: string;
  contactEmail: string;
}

// ============================================
// UNION TYPE FOR ALL METADATA
// ============================================

export type CategoryMetadata = 
  | RealEstateMetadata 
  | VehicleMetadata 
  | ServiceMetadata 
  | JobMetadata;

// ============================================
// HELPER TYPES
// ============================================

export interface CategoryDefinition {
  id: MainCategoryType;
  name: {
    fa: string;
    de: string;
  };
  icon: string;
  metadataSchema: 'real_estate' | 'vehicles' | 'services' | 'jobs' | 'misc';
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: MainCategoryType.REAL_ESTATE,
    name: { fa: 'املاک', de: 'Immobilien' },
    icon: '🏠',
    metadataSchema: 'real_estate',
  },
  {
    id: MainCategoryType.VEHICLES,
    name: { fa: 'وسایل نقلیه', de: 'Auto, Rad & Boot' },
    icon: '🚗',
    metadataSchema: 'vehicles',
  },
  {
    id: MainCategoryType.SERVICES,
    name: { fa: 'خدمات', de: 'Dienstleistungen' },
    icon: '🛠️',
    metadataSchema: 'services',
  },
  {
    id: MainCategoryType.JOBS,
    name: { fa: 'استخدام و کاریابی', de: 'Jobs' },
    icon: '💼',
    metadataSchema: 'jobs',
  },
  {
    id: MainCategoryType.MISC,
    name: { fa: 'متفرقه', de: 'Sonstiges' },
    icon: '📦',
    metadataSchema: 'misc',
  },
];

