import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { OrderProductEntity } from './order-product.entity';
import { OrderStatus } from '../modules/order/dto';
@Entity('order')
export class OrderEntity {
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

  @Column({ nullable: true })
  number: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    nullable: true,
  })
  status: OrderStatus;

  @OneToMany(() => OrderProductEntity, (item) => item.order)
  products: OrderProductEntity[];
}
