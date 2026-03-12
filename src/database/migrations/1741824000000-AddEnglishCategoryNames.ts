import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Production-safe migration: Adds English names to existing categories.
 * Merges 'en' into the name JSONB without overwriting fa/de.
 * Safe to run multiple times (idempotent).
 */
export class AddEnglishCategoryNames1741824000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const updates = [
      { type: 'real_estate', en: 'Real Estate' },
      { type: 'vehicles', en: 'Vehicles' },
      { type: 'services', en: 'Services' },
      { type: 'jobs', en: 'Jobs' },
      { type: 'personal_home', en: 'Personal Home' },
      { type: 'misc', en: 'Misc' },
    ];

    for (const { type, en } of updates) {
      await queryRunner.query(
        `UPDATE categories 
         SET name = name || $1::jsonb 
         WHERE category_type = $2`,
        [JSON.stringify({ en }), type],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove 'en' key from name JSONB for all categories
    await queryRunner.query(`
      UPDATE categories 
      SET name = name - 'en'
      WHERE name ? 'en'
    `);
  }
}
