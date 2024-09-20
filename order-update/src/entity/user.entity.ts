import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
@Unique(['login'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date = new Date();

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ nullable: true })
  surname: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  login: string;

  @Column({ nullable: false, length: 500 })
  hash: string;

  @Column({ nullable: false, length: 500 })
  key: string;
}
