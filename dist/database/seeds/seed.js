"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../entities/user.entity");
const role_entity_1 = require("../../entities/role.entity");
const permission_entity_1 = require("../../entities/permission.entity");
const admin_permission_entity_1 = require("../../entities/admin-permission.entity");
const category_entity_1 = require("../../entities/category.entity");
const city_entity_1 = require("../../entities/city.entity");
const ad_entity_1 = require("../../entities/ad.entity");
const image_entity_1 = require("../../entities/image.entity");
const message_entity_1 = require("../../entities/message.entity");
const report_entity_1 = require("../../entities/report.entity");
const audit_log_entity_1 = require("../../entities/audit-log.entity");
async function seed() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'classified_ads',
        entities: [user_entity_1.User, role_entity_1.Role, permission_entity_1.Permission, admin_permission_entity_1.AdminPermission, category_entity_1.Category, city_entity_1.City, ad_entity_1.Ad, image_entity_1.Image, message_entity_1.Message, report_entity_1.Report, audit_log_entity_1.AuditLog],
        synchronize: false,
    });
    try {
        await dataSource.initialize();
        console.log('📦 Database connected. Starting seed...');
        const roleRepository = dataSource.getRepository(role_entity_1.Role);
        const permissionRepository = dataSource.getRepository(permission_entity_1.Permission);
        const adminPermissionRepository = dataSource.getRepository(admin_permission_entity_1.AdminPermission);
        const userRepository = dataSource.getRepository(user_entity_1.User);
        const categoryRepository = dataSource.getRepository(category_entity_1.Category);
        const cityRepository = dataSource.getRepository(city_entity_1.City);
        const adRepository = dataSource.getRepository(ad_entity_1.Ad);
        const imageRepository = dataSource.getRepository(image_entity_1.Image);
        const messageRepository = dataSource.getRepository(message_entity_1.Message);
        const reportRepository = dataSource.getRepository(report_entity_1.Report);
        const auditLogRepository = dataSource.getRepository(audit_log_entity_1.AuditLog);
        console.log('🗑️  Clearing existing data...');
        await dataSource.query('TRUNCATE TABLE "reports" CASCADE');
        await dataSource.query('TRUNCATE TABLE "audit_logs" CASCADE');
        await dataSource.query('TRUNCATE TABLE "messages" CASCADE');
        await dataSource.query('TRUNCATE TABLE "ads" CASCADE');
        await dataSource.query('TRUNCATE TABLE "images" CASCADE');
        await dataSource.query('TRUNCATE TABLE "admin_permissions" CASCADE');
        await dataSource.query('TRUNCATE TABLE "permissions" CASCADE');
        await dataSource.query('TRUNCATE TABLE "users" CASCADE');
        await dataSource.query('TRUNCATE TABLE "categories" CASCADE');
        await dataSource.query('TRUNCATE TABLE "cities" CASCADE');
        await dataSource.query('TRUNCATE TABLE "roles" CASCADE');
        console.log('👥 Creating roles...');
        const superAdminRole = roleRepository.create({
            name: role_entity_1.RoleType.SUPER_ADMIN,
            description: 'Super Administrator with full system access',
        });
        const adminRole = roleRepository.create({
            name: role_entity_1.RoleType.ADMIN,
            description: 'Administrator with configurable permissions',
        });
        const userRole = roleRepository.create({
            name: role_entity_1.RoleType.USER,
            description: 'Regular user',
        });
        await roleRepository.save([superAdminRole, adminRole, userRole]);
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
        const savedPermissions = [];
        for (const perm of permissions) {
            const permission = permissionRepository.create({
                name: `${perm.resource}.${perm.action}`,
                resource: perm.resource,
                action: perm.action,
                description: perm.description,
            });
            savedPermissions.push(await permissionRepository.save(permission));
        }
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
        await adminPermissionRepository.save([
            adminPermissionRepository.create({
                adminId: admin1.id,
                permissionId: savedPermissions.find((p) => p.name === 'ads.approve').id,
            }),
            adminPermissionRepository.create({
                adminId: admin1.id,
                permissionId: savedPermissions.find((p) => p.name === 'ads.reject').id,
            }),
            adminPermissionRepository.create({
                adminId: admin1.id,
                permissionId: savedPermissions.find((p) => p.name === 'users.view').id,
            }),
            adminPermissionRepository.create({
                adminId: admin1.id,
                permissionId: savedPermissions.find((p) => p.name === 'users.block').id,
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
        await adminPermissionRepository.save([
            adminPermissionRepository.create({
                adminId: admin2.id,
                permissionId: savedPermissions.find((p) => p.name === 'messages.view').id,
            }),
            adminPermissionRepository.create({
                adminId: admin2.id,
                permissionId: savedPermissions.find((p) => p.name === 'reports.view').id,
            }),
            adminPermissionRepository.create({
                adminId: admin2.id,
                permissionId: savedPermissions.find((p) => p.name === 'reports.manage').id,
            }),
        ]);
        console.log('👤 Creating regular users...');
        const userPassword = await bcrypt.hash('user123', 10);
        const users = [];
        for (let i = 1; i <= 5; i++) {
            const user = userRepository.create({
                name: `User ${i}`,
                email: `user${i}@example.com`,
                phone: `+49 123 45679${i}`,
                password: userPassword,
                roleId: userRole.id,
                isBlocked: false,
                isSuspended: false,
            });
            users.push(await userRepository.save(user));
        }
        console.log('📂 Creating categories...');
        const categories = [
            { name: { en: 'Vehicles', de: 'Fahrzeuge' }, icon: '🚗' },
            { name: { en: 'Electronics', de: 'Elektronik' }, icon: '📱' },
            { name: { en: 'Furniture', de: 'Möbel' }, icon: '🪑' },
            { name: { en: 'Clothing', de: 'Kleidung' }, icon: '👕' },
            { name: { en: 'Services', de: 'Dienstleistungen' }, icon: '🔧' },
            { name: { en: 'Real Estate', de: 'Immobilien' }, icon: '🏠' },
        ];
        const savedCategories = [];
        for (const cat of categories) {
            const category = categoryRepository.create(cat);
            savedCategories.push(await categoryRepository.save(category));
        }
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
        console.log('📢 Creating ads...');
        const ads = [
            {
                title: 'BMW 320d 2020',
                description: 'Excellent condition, low mileage, full service history',
                price: 25000,
                categoryId: savedCategories[0].id,
                cityId: savedCities[0].id,
                userId: users[0].id,
                status: ad_entity_1.AdStatus.APPROVED,
                condition: ad_entity_1.AdCondition.USED,
                views: 150,
            },
            {
                title: 'iPhone 14 Pro Max',
                description: 'Brand new, sealed box, 256GB',
                price: 1200,
                categoryId: savedCategories[1].id,
                cityId: savedCities[1].id,
                userId: users[1].id,
                status: ad_entity_1.AdStatus.PENDING_APPROVAL,
                condition: ad_entity_1.AdCondition.NEW,
                views: 0,
            },
            {
                title: 'Modern Sofa Set',
                description: '3-seater sofa in excellent condition',
                price: 500,
                categoryId: savedCategories[2].id,
                cityId: savedCities[2].id,
                userId: users[2].id,
                status: ad_entity_1.AdStatus.REJECTED,
                rejectionReason: 'Inappropriate content',
                views: 0,
            },
            {
                title: 'Designer Jacket',
                description: 'Barely used, like new condition',
                price: 150,
                categoryId: savedCategories[3].id,
                cityId: savedCities[0].id,
                userId: users[3].id,
                status: ad_entity_1.AdStatus.DRAFT,
                condition: ad_entity_1.AdCondition.LIKE_NEW,
                views: 0,
            },
            {
                title: 'Plumbing Services',
                description: 'Professional plumbing services available',
                price: 0,
                categoryId: savedCategories[4].id,
                cityId: savedCities[3].id,
                userId: users[4].id,
                status: ad_entity_1.AdStatus.APPROVED,
                views: 75,
            },
        ];
        const savedAds = [];
        for (const ad of ads) {
            const adEntity = adRepository.create(ad);
            savedAds.push(await adRepository.save(adEntity));
        }
        console.log('✅ Seed completed successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('Super Admin: superadmin@example.com / superadmin123');
        console.log('Admin 1: admin1@example.com / admin123');
        console.log('Admin 2: admin2@example.com / admin123');
        console.log('User 1: user1@example.com / user123');
        console.log('User 2: user2@example.com / user123');
        console.log('... (user3-5 same password)');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
    finally {
        await dataSource.destroy();
    }
}
seed();
//# sourceMappingURL=seed.js.map