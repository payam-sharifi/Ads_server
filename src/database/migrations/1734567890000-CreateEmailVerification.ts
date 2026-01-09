import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateEmailVerification1734567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'email_verifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '4',
          },
          {
            name: 'signup_data',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'email_verifications',
      new TableIndex({
        name: 'IDX_email_verifications_email',
        columnNames: ['email'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('email_verifications', 'IDX_email_verifications_email');
    await queryRunner.dropTable('email_verifications');
  }
}

