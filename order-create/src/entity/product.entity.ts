import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date = new Date();

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: UserEntity;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: UserEntity;

  @Column({ nullable: false, default: '' })
  name: string;

  @Column({ nullable: false, default: '' })
  description: string;

  @Column({ nullable: true })
  price: number;
}
