import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Email Verification Entity
 * 
 * Stores verification codes for email verification during signup
 */
@Entity('email_verifications')
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 4 })
  code: string; // 4-digit code

  @Column({ type: 'text', nullable: true })
  signupData: string; // JSON string of signup data (name, email, phone, password)

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}

