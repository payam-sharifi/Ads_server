import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role, RoleType } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { AdminPermission } from '../../entities/admin-permission.entity';
import { Category } from '../../entities/category.entity';
import { City } from '../../entities/city.entity';
import { Ad, AdStatus, AdCondition } from '../../entities/ad.entity';
import { Bookmark } from '../../entities/bookmark.entity';
import { Image } from '../../entities/image.entity';
import { Message } from '../../entities/message.entity';
import { Report } from '../../entities/report.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { MainCategoryType, CATEGORY_DEFINITIONS } from '../../types/category.types';

// Load environment variables from .env file
dotenv.config();

/**
 * Database Seed Script
 * 
 * Populates the database with:
 * - 3 Roles (SUPER_ADMIN, ADMIN, USER)
 * - Permissions for RBAC/PBAC
 * - 1 Super Admin user
 * - 2 Admin users with different permissions
 * - 5 Regular users
 * - 6 categories with subcategories
 * - 8 cities
 * - Sample ads in different statuses
 * - Sample messages
 * 
 * Usage: npm run seed
 */
async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'classified_ads',
    entities: [User, Role, Permission, AdminPermission, Category, City, Ad, Bookmark, Image, Message, Report, AuditLog],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Database connected. Starting seed...');

    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);
    const adminPermissionRepository = dataSource.getRepository(AdminPermission);
    const userRepository = dataSource.getRepository(User);
    const categoryRepository = dataSource.getRepository(Category);
    const cityRepository = dataSource.getRepository(City);
    const adRepository = dataSource.getRepository(Ad);
    const imageRepository = dataSource.getRepository(Image);
    const messageRepository = dataSource.getRepository(Message);
    const reportRepository = dataSource.getRepository(Report);
    const auditLogRepository = dataSource.getRepository(AuditLog);
    
    // Check if tables exist
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != 'migrations'
    `);
    
    if (tables.length === 0) {
      console.log('📋 No tables found in database!');
      console.log('⚠️  Creating database schema using synchronize (first-time setup only)...');
      console.log('⚠️  Note: For production, it is recommended to use migrations instead.');
      await dataSource.synchronize();
      console.log('✅ Database schema created successfully!');
      console.log('💡 Tip: Run "npm run migration:generate -- -n InitialMigration" to create a migration file for future deployments.');
    }
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    const truncateQueries = [
      'TRUNCATE TABLE "reports" CASCADE',
      'TRUNCATE TABLE "audit_logs" CASCADE',
      'TRUNCATE TABLE "messages" CASCADE',
      'TRUNCATE TABLE "ads" CASCADE',
      'TRUNCATE TABLE "images" CASCADE',
      'TRUNCATE TABLE "admin_permissions" CASCADE',
      'TRUNCATE TABLE "permissions" CASCADE',
      'TRUNCATE TABLE "users" CASCADE',
      'TRUNCATE TABLE "categories" CASCADE',
      'TRUNCATE TABLE "cities" CASCADE',
      'TRUNCATE TABLE "roles" CASCADE',
    ];
    
    for (const query of truncateQueries) {
      try {
        await dataSource.query(query);
      } catch (error) {
        // Ignore errors if table doesn't exist
        if (error.code !== '42P01') {
          throw error;
        }
      }
    }
    

    // Create Roles
    console.log('👥 Creating roles...');
    const superAdminRole = roleRepository.create({
      name: RoleType.SUPER_ADMIN,
      description: 'Super Administrator with full system access',
    });
    const adminRole = roleRepository.create({
      name: RoleType.ADMIN,
      description: 'Administrator with configurable permissions',
    });
    const userRole = roleRepository.create({
      name: RoleType.USER,
      description: 'Regular user',
    });
    await roleRepository.save([superAdminRole, adminRole, userRole]);

    // Create Permissions
    console.log('🔐 Creating permissions...');
    const permissions = [
      { resource: 'ads', action: 'approve', description: 'Approve ads' },
      { resource: 'ads', action: 'reject', description: 'Reject ads' },
      { resource: 'ads', action: 'edit', description: 'Edit any ad' },
      { resource: 'ads', action: 'delete', description: 'Delete any ad' },
      { resource: 'ads', action: 'manage', description: 'Manage ads (suspend, unsuspend, edit, delete)' },
      { resource: 'users', action: 'view', description: 'View all users' },
      { resource: 'users', action: 'block', description: 'Block users' },
      { resource: 'users', action: 'suspend', description: 'Suspend users' },
      { resource: 'messages', action: 'view', description: 'View all messages' },
      { resource: 'categories', action: 'manage', description: 'Manage categories' },
      { resource: 'admins', action: 'manage', description: 'Manage admin users' },
      { resource: 'reports', action: 'view', description: 'View reports' },
      { resource: 'reports', action: 'manage', description: 'Manage reports' },
    ];

    const savedPermissions: Permission[] = [];
    for (const perm of permissions) {
      const permission = permissionRepository.create({
        name: `${perm.resource}.${perm.action}`,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      });
      savedPermissions.push(await permissionRepository.save(permission));
    }

    // Create Super Admin
    console.log('👑 Creating Super Admin...');
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = userRepository.create({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      phone: '+49 123 456789',
      password: superAdminPassword,
      roleId: superAdminRole.id,
      isBlocked: false,
      isSuspended: false,
    });
    await userRepository.save(superAdmin);

    // Create Admin Users
    console.log('👨‍💼 Creating Admin users...');
    const admin1Password = await bcrypt.hash('admin123', 10);
    const admin1 = userRepository.create({
      name: 'Admin User 1',
      email: 'admin1@example.com',
      phone: '+49 123 456790',
      password: admin1Password,
      roleId: adminRole.id,
      isBlocked: false,
      isSuspended: false,
    });
    await userRepository.save(admin1);

    // Assign permissions to admin1 (ads approval, user management)
    await adminPermissionRepository.save([
      adminPermissionRepository.create({
        adminId: admin1.id,
        permissionId: savedPermissions.find((p) => p.name === 'ads.approve')!.id,
      }),
      adminPermissionRepository.create({
        adminId: admin1.id,
        permissionId: savedPermissions.find((p) => p.name === 'ads.reject')!.id,
      }),
      adminPermissionRepository.create({
        adminId: admin1.id,
        permissionId: savedPermissions.find((p) => p.name === 'users.view')!.id,
      }),
      adminPermissionRepository.create({
        adminId: admin1.id,
        permissionId: savedPermissions.find((p) => p.name === 'users.block')!.id,
      }),
    ]);

    const admin2Password = await bcrypt.hash('admin123', 10);
    const admin2 = userRepository.create({
      name: 'Admin User 2',
      email: 'admin2@example.com',
      phone: '+49 123 456791',
      password: admin2Password,
      roleId: adminRole.id,
      isBlocked: false,
      isSuspended: false,
    });
    await userRepository.save(admin2);

    // Assign permissions to admin2 (messages, reports)
    await adminPermissionRepository.save([
      adminPermissionRepository.create({
        adminId: admin2.id,
        permissionId: savedPermissions.find((p) => p.name === 'messages.view')!.id,
      }),
      adminPermissionRepository.create({
        adminId: admin2.id,
        permissionId: savedPermissions.find((p) => p.name === 'reports.view')!.id,
      }),
      adminPermissionRepository.create({
        adminId: admin2.id,
        permissionId: savedPermissions.find((p) => p.name === 'reports.manage')!.id,
      }),
    ]);

    // Create Regular Users (30 users)
    console.log('👤 Creating regular users...');
    const userPassword = await bcrypt.hash('user123', 10);
    const users = [];
    const userNames = [
      'علی احمدی', 'محمد رضایی', 'حسن کریمی', 'رضا محمدی', 'امیر حسینی',
      'سعید نوری', 'مهدی صادقی', 'حسین علیزاده', 'فرهاد رحیمی', 'کامران نجفی',
      'John Smith', 'Maria Garcia', 'David Brown', 'Sarah Johnson', 'Michael Wilson',
      'Emma Martinez', 'James Anderson', 'Olivia Taylor', 'William Thomas', 'Sophia Jackson',
      'Ahmed Al-Mahmoud', 'Fatima Hassan', 'Omar Ibrahim', 'Layla Abdullah', 'Yusuf Ali',
      'Mehmet Yılmaz', 'Ayşe Demir', 'Can Öztürk', 'Elif Şahin', 'Burak Kaya'
    ];
    for (let i = 0; i < 30; i++) {
      const user = userRepository.create({
        name: userNames[i] || `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        phone: `+49 123 4567${String(i + 1).padStart(2, '0')}`,
        password: userPassword,
        roleId: userRole.id,
        isBlocked: i === 5 || i === 12, // Block 2 users for testing
        isSuspended: i === 8, // Suspend 1 user for testing
      });
      users.push(await userRepository.save(user));
    }

    // Create Categories (Only the 4 main categories)
    console.log('📂 Creating categories...');
    const savedCategories = [];
    for (const catDef of CATEGORY_DEFINITIONS) {
      const category = categoryRepository.create({
        name: { 
          fa: catDef.name.fa,
          de: catDef.name.de,
        },
        icon: catDef.icon,
        categoryType: catDef.id,
        parentId: null, // Main categories have no parent
      });
      savedCategories.push(await categoryRepository.save(category));
    }

    // Create Cities
    console.log('🏙️  Creating cities...');
    const cities = [
      { name: { en: 'Berlin', de: 'Berlin' } },
      { name: { en: 'Munich', de: 'München' } },
      { name: { en: 'Hamburg', de: 'Hamburg' } },
      { name: { en: 'Cologne', de: 'Köln' } },
      { name: { en: 'Frankfurt', de: 'Frankfurt' } },
      { name: { en: 'Stuttgart', de: 'Stuttgart' } },
      { name: { en: 'Düsseldorf', de: 'Düsseldorf' } },
      { name: { en: 'Dortmund', de: 'Dortmund' } },
    ];

    const savedCities = [];
    for (const city of cities) {
      const cityEntity = cityRepository.create(city);
      savedCities.push(await cityRepository.save(cityEntity));
    }

    // Create Ads (100 ads across all categories)
    console.log('📢 Creating ads...');
    const realEstateCategory = savedCategories.find(c => c.categoryType === MainCategoryType.REAL_ESTATE);
    const vehiclesCategory = savedCategories.find(c => c.categoryType === MainCategoryType.VEHICLES);
    const servicesCategory = savedCategories.find(c => c.categoryType === MainCategoryType.SERVICES);
    const jobsCategory = savedCategories.find(c => c.categoryType === MainCategoryType.JOBS);
    const personalHomeCategory = savedCategories.find(c => c.categoryType === MainCategoryType.PERSONAL_HOME);
    const miscCategory = savedCategories.find(c => c.categoryType === MainCategoryType.MISC);
    
    const ads = [];
    const statuses = [AdStatus.APPROVED, AdStatus.APPROVED, AdStatus.APPROVED, AdStatus.PENDING_APPROVAL, AdStatus.REJECTED];
    
    // Real Estate Ads (25 ads)
    if (realEstateCategory) {
      const propertyTypes = ['apartment', 'house', 'commercial', 'land', 'parking'];
      const offerTypes = ['rent', 'sale'];
      for (let i = 0; i < 25; i++) {
        const offerType = offerTypes[Math.floor(Math.random() * offerTypes.length)];
        const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
        ads.push({
          title: `${propertyType === 'apartment' ? 'آپارتمان' : propertyType === 'house' ? 'خانه' : propertyType} ${i + 1} خوابه`,
          description: `ملک زیبا و مدرن در موقعیت عالی. ${propertyType === 'apartment' ? 'آپارتمان' : propertyType} با امکانات کامل`,
          price: offerType === 'sale' ? Math.floor(Math.random() * 500000) + 100000 : 0,
          categoryId: realEstateCategory.id,
          cityId: savedCities[Math.floor(Math.random() * savedCities.length)].id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          views: Math.floor(Math.random() * 500),
          metadata: {
            offerType,
            propertyType,
            livingArea: Math.floor(Math.random() * 200) + 50,
            rooms: Math.floor(Math.random() * 5) + 1,
            floor: Math.floor(Math.random() * 10) + 1,
            totalFloors: Math.floor(Math.random() * 10) + 5,
            yearBuilt: 2000 + Math.floor(Math.random() * 24),
            furnished: Math.random() > 0.5,
            balcony: Math.random() > 0.5,
            elevator: Math.random() > 0.5,
            parkingIncluded: Math.random() > 0.5,
            postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
            ...(offerType === 'rent' ? { coldRent: Math.floor(Math.random() * 2000) + 500 } : {}),
          },
        });
      }
    }
    
    // Vehicle Ads (25 ads)
    if (vehiclesCategory) {
      const vehicleTypes = ['car', 'motorcycle', 'van', 'bike'];
      const brands = ['BMW', 'Mercedes', 'Audi', 'VW', 'Toyota', 'Honda', 'Yamaha', 'Kawasaki'];
      const models = ['320d', 'C-Class', 'A4', 'Golf', 'Corolla', 'Civic', 'R1', 'Ninja'];
      for (let i = 0; i < 25; i++) {
        const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const model = models[Math.floor(Math.random() * models.length)];
        const year = 2015 + Math.floor(Math.random() * 9);
        const metadata: any = {
          vehicleType,
          brand,
          model,
          year,
          condition: Math.random() > 0.3 ? 'used' : 'new',
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        };
        
        if (vehicleType !== 'bike') {
          metadata.mileage = Math.floor(Math.random() * 150000) + 10000;
          metadata.fuelType = ['diesel', 'petrol', 'electric', 'hybrid'][Math.floor(Math.random() * 4)];
          metadata.transmission = ['automatic', 'manual'][Math.floor(Math.random() * 2)];
          metadata.damageStatus = ['none', 'minor', 'major'][Math.floor(Math.random() * 3)];
          metadata.engineSize = vehicleType === 'car' ? Math.floor(Math.random() * 3000) + 1000 : Math.floor(Math.random() * 1000) + 250;
          if (vehicleType === 'car') {
            metadata.doors = [2, 4, 5][Math.floor(Math.random() * 3)];
            metadata.seats = Math.floor(Math.random() * 5) + 4;
          } else if (vehicleType === 'van') {
            metadata.loadCapacity = Math.floor(Math.random() * 2000) + 500;
          }
        } else {
          metadata.bikeType = ['normal', 'electric'][Math.floor(Math.random() * 2)];
          metadata.frameSize = ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)];
          metadata.gears = Math.floor(Math.random() * 21) + 1;
          metadata.brakeType = ['rim', 'disc'][Math.floor(Math.random() * 2)];
          metadata.wheelSize = ['26"', '27.5"', '29"'][Math.floor(Math.random() * 3)];
        }
        
        ads.push({
          title: `${brand} ${model} ${year}`,
          description: `${vehicleType === 'car' ? 'خودرو' : vehicleType === 'motorcycle' ? 'موتورسیکلت' : vehicleType === 'van' ? 'ون' : 'دوچرخه'} در وضعیت عالی`,
          price: vehicleType === 'bike' ? Math.floor(Math.random() * 2000) + 200 : Math.floor(Math.random() * 50000) + 5000,
          categoryId: vehiclesCategory.id,
          cityId: savedCities[Math.floor(Math.random() * savedCities.length)].id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          condition: metadata.condition === 'new' ? AdCondition.NEW : AdCondition.USED,
          views: Math.floor(Math.random() * 500),
          metadata,
        });
      }
    }
    
    // Service Ads (20 ads)
    if (servicesCategory) {
      const serviceCategories = ['construction', 'transport', 'repairs', 'education'];
      const pricingTypes = ['hourly', 'fixed', 'project'];
      for (let i = 0; i < 20; i++) {
        const serviceCategory = serviceCategories[Math.floor(Math.random() * serviceCategories.length)];
        const pricingType = pricingTypes[Math.floor(Math.random() * pricingTypes.length)];
        ads.push({
          title: `خدمات ${serviceCategory === 'construction' ? 'ساختمان' : serviceCategory === 'transport' ? 'حمل و نقل' : serviceCategory}`,
          description: `ارائه خدمات حرفه‌ای و با کیفیت در زمینه ${serviceCategory}`,
          price: pricingType === 'hourly' ? Math.floor(Math.random() * 100) + 20 : Math.floor(Math.random() * 1000) + 100,
          categoryId: servicesCategory.id,
          cityId: savedCities[Math.floor(Math.random() * savedCities.length)].id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          views: Math.floor(Math.random() * 300),
          metadata: {
            serviceCategory,
            pricingType,
            price: pricingType === 'hourly' ? Math.floor(Math.random() * 100) + 20 : Math.floor(Math.random() * 1000) + 100,
            serviceRadius: `${Math.floor(Math.random() * 50) + 10} km`,
            experienceYears: Math.floor(Math.random() * 20) + 1,
            postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          },
        });
      }
    }
    
    // Job Ads (15 ads)
    if (jobsCategory) {
      const jobTitles = ['برنامه‌نویس', 'طراح گرافیک', 'حسابدار', 'مهندس', 'معلم', 'پرستار', 'آشپز', 'منشی'];
      const employmentTypes = ['full_time', 'part_time', 'contract', 'internship'];
      const experienceLevels = ['junior', 'mid', 'senior'];
      for (let i = 0; i < 15; i++) {
        const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        ads.push({
          title: `فرصت شغلی: ${jobTitle}`,
          description: `ما به دنبال ${jobTitle} با تجربه و متعهد هستیم. حقوق و مزایای رقابتی`,
          price: 0,
          categoryId: jobsCategory.id,
          cityId: savedCities[Math.floor(Math.random() * savedCities.length)].id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          views: Math.floor(Math.random() * 200),
          metadata: {
            jobTitle,
            employmentType: employmentTypes[Math.floor(Math.random() * employmentTypes.length)],
            experienceLevel: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
            salary: Math.floor(Math.random() * 50000) + 30000,
            postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          },
        });
      }
    }

    // Personal & Home Ads (10 ads)
    if (personalHomeCategory) {
      const homeItems = ['مبلمان', 'تلویزیون', 'فرش', 'ماشین لباسشویی', 'یخچال', 'تخت خواب'];
      for (let i = 0; i < 10; i++) {
        const item = homeItems[Math.floor(Math.random() * homeItems.length)];
        ads.push({
          title: `${item} در حد نو`,
          description: `${item} بسیار تمیز و کم کارکرد. به علت جابجایی فروخته می‌شود.`,
          price: Math.floor(Math.random() * 1000) + 50,
          categoryId: personalHomeCategory.id,
          cityId: savedCities[Math.floor(Math.random() * savedCities.length)].id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          status: AdStatus.APPROVED,
          views: Math.floor(Math.random() * 150),
          metadata: {
            condition: 'like-new',
            postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          },
        });
      }
    }
    
    // Misc Ads (15 ads)
    if (miscCategory) {
      const miscTitles = ['مبلمان دست دوم', 'کتاب', 'اسباب بازی', 'لوازم خانگی', 'گوشی موبایل', 'لپ تاپ', 'دوربین', 'ساعت'];
      for (let i = 0; i < 15; i++) {
        const title = miscTitles[Math.floor(Math.random() * miscTitles.length)];
        ads.push({
          title: `${title} ${i + 1}`,
          description: `${title} در وضعیت عالی و قیمت مناسب`,
          price: Math.floor(Math.random() * 1000) + 50,
          categoryId: miscCategory.id,
          cityId: savedCities[Math.floor(Math.random() * savedCities.length)].id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          views: Math.floor(Math.random() * 150),
          metadata: {},
        });
      }
    }

    const savedAds = [];
    for (const ad of ads) {
      const adEntity = adRepository.create(ad);
      savedAds.push(await adRepository.save(adEntity));
    }

    console.log('✅ Seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`- ${users.length} regular users created`);
    console.log(`- ${savedCategories.length} categories created`);
    console.log(`- ${savedCities.length} cities created`);
    console.log(`- ${savedAds.length} ads created`);
    console.log('\n📋 Login Credentials:');
    console.log('Super Admin: superadmin@example.com / superadmin123');
    console.log('Admin 1: admin1@example.com / admin123');
    console.log('Admin 2: admin2@example.com / admin123');
    console.log('Users: user1@example.com to user30@example.com / user123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed();
