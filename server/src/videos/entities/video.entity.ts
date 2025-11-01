import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type VideoStatus = 'uploaded' | 'processing' | 'done' | 'failed';

const isSqlite = process.env.ENABLE_DB !== 'true';

@Entity('videos')
export class Video {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  filename!: string;

  @Column({ nullable: true })
  s3_key?: string;

  @Column({ nullable: true })
  output_key?: string;

  @Column({ type: 'varchar', default: 'uploaded' })
  status!: VideoStatus;

  @Column({ nullable: true })
  owner_email?: string;

  // Поддержка и SQLite, и Postgres
  @Column({ type: isSqlite ? 'simple-json' : 'jsonb', nullable: true })
  meta?: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
